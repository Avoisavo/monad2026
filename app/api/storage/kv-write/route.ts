import { NextRequest, NextResponse } from "next/server";
import { Indexer, ZgFile } from "@0gfoundation/0g-ts-sdk";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import os from "os";

export const runtime = "nodejs";
export const maxDuration = 180;

const RPC_URL = "https://evmrpc-testnet.0g.ai";
const INDEXER_RPC = "https://indexer-storage-testnet-turbo.0g.ai";

export async function POST(req: NextRequest) {
  const privateKey = process.env.ZG_STORAGE_PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json(
      { success: false, error: "Missing ZG_STORAGE_PRIVATE_KEY in .env.local" },
      { status: 500 }
    );
  }

  const { key, value } = await req.json();
  if (!key || !value) {
    return NextResponse.json(
      { success: false, error: "Provide 'key' and 'value' in the request body" },
      { status: 400 }
    );
  }

  const tmpFile = path.join(os.tmpdir(), `0g-kv-${Date.now()}.json`);

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(privateKey, provider);
    const indexer = new Indexer(INDEXER_RPC);

    const content = JSON.stringify({
      sparkKey: key,
      sparkValue: value,
      timestamp: new Date().toISOString(),
      type: "knowledge-item",
    });

    fs.writeFileSync(tmpFile, content, "utf-8");

    const zgFile = await ZgFile.fromFilePath(tmpFile);
    const [merkleTree, treeErr] = await zgFile.merkleTree();

    if (treeErr || !merkleTree) {
      return NextResponse.json(
        { success: false, error: "Merkle tree generation failed: " + String(treeErr) },
        { status: 500 }
      );
    }

    const rootHash = merkleTree.rootHash();
    const [uploadResult, uploadErr] = await indexer.upload(zgFile, RPC_URL, signer);

    if (uploadErr) {
      return NextResponse.json(
        { success: false, error: "KV upload failed: " + String(uploadErr) },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      key,
      rootHash,
      txHash:
        "txHash" in uploadResult ? uploadResult.txHash : uploadResult.txHashes[0],
      message: "Key-value pair stored on 0G Storage",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  } finally {
    try {
      fs.unlinkSync(tmpFile);
    } catch {
      // ignore cleanup errors
    }
  }
}
