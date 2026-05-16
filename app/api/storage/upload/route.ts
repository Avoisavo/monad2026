import { NextRequest, NextResponse } from "next/server";
import { Indexer, ZgFile } from "@0gfoundation/0g-ts-sdk";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import os from "os";
import { encrypt } from "@/lib/encrypt";

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

  const { content, encrypted: shouldEncrypt } = await req.json();
  if (!content || typeof content !== "string") {
    return NextResponse.json(
      { success: false, error: "Provide 'content' as a string in the request body" },
      { status: 400 }
    );
  }

  const finalContent = shouldEncrypt ? encrypt(content) : content;
  const tmpFile = path.join(os.tmpdir(), `0g-upload-${Date.now()}.txt`);

  try {
    fs.writeFileSync(tmpFile, finalContent, "utf-8");

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(privateKey, provider);

    const zgFile = await ZgFile.fromFilePath(tmpFile);
    const [merkleTree, treeErr] = await zgFile.merkleTree();

    if (treeErr || !merkleTree) {
      return NextResponse.json(
        { success: false, error: "Failed to generate merkle tree: " + String(treeErr) },
        { status: 500 }
      );
    }

    const rootHash = merkleTree.rootHash();

    const indexer = new Indexer(INDEXER_RPC);
    const [uploadResult, uploadErr] = await indexer.upload(zgFile, RPC_URL, signer);

    if (uploadErr) {
      return NextResponse.json(
        { success: false, error: "Upload failed: " + String(uploadErr) },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      rootHash,
      txHash:
        "txHash" in uploadResult ? uploadResult.txHash : uploadResult.txHashes[0],
      encrypted: !!shouldEncrypt,
      contentLength: content.length,
      message: shouldEncrypt
        ? "Encrypted content uploaded to 0G Storage (AES-256-GCM)"
        : "Content uploaded to 0G Storage (immutable, content-addressed)",
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
