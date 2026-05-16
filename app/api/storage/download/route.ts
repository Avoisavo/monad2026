import { NextRequest, NextResponse } from "next/server";
import { Indexer } from "@0gfoundation/0g-ts-sdk";
import fs from "fs";
import path from "path";
import os from "os";
import { decrypt } from "@/lib/encrypt";

export const runtime = "nodejs";
export const maxDuration = 180;

const INDEXER_RPC = "https://indexer-storage-testnet-turbo.0g.ai";

export async function POST(req: NextRequest) {
  const { rootHash, decrypt: shouldDecrypt } = await req.json();

  if (!rootHash || typeof rootHash !== "string") {
    return NextResponse.json(
      { success: false, error: "Provide 'rootHash' as a string in the request body" },
      { status: 400 }
    );
  }

  const tmpFile = path.join(os.tmpdir(), `0g-download-${Date.now()}.txt`);

  try {
    const indexer = new Indexer(INDEXER_RPC);
    const err = await indexer.download(rootHash, tmpFile, true);

    if (err) {
      return NextResponse.json(
        { success: false, error: "Download failed: " + String(err) },
        { status: 500 }
      );
    }

    const rawContent = fs.readFileSync(tmpFile, "utf-8");

    let content = rawContent;
    let decrypted = false;
    if (shouldDecrypt) {
      try {
        content = decrypt(rawContent);
        decrypted = true;
      } catch {
        return NextResponse.json(
          {
            success: false,
            error: "Decryption failed. Content may not be encrypted or key mismatch.",
            rawContent,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      rootHash,
      content,
      contentLength: content.length,
      verified: true,
      decrypted,
      message: decrypted
        ? "Encrypted content downloaded and decrypted from 0G Storage"
        : "Content downloaded from 0G Storage with Merkle proof verification",
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
