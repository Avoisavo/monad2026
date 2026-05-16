import { NextRequest, NextResponse } from "next/server";
import { getComputeBroker } from "@/lib/0g-compute";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { provider: providerAddress, message } = await req.json();

  if (!providerAddress || !message) {
    return NextResponse.json(
      { error: "provider and message are required" },
      { status: 400 }
    );
  }

  try {
    const broker = await getComputeBroker();

    const acked = await broker.inference.acknowledged(providerAddress);
    if (!acked) {
      await broker.inference.acknowledgeProviderSigner(providerAddress);
    }

    const { endpoint, model } = await broker.inference.getServiceMetadata(
      providerAddress
    );

    const headers = await broker.inference.getRequestHeaders(
      providerAddress,
      message
    );

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: message }],
        max_tokens: 512,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        {
          success: false,
          error: `Provider returned ${response.status}: ${errText}`,
        },
        { status: 502 }
      );
    }

    const completion = await response.json();

    const chatID =
      response.headers.get("ZG-Res-Key") || completion.id || undefined;
    const usageStr = completion.usage
      ? JSON.stringify(completion.usage)
      : undefined;

    let verified: boolean | null = null;
    try {
      verified = await broker.inference.processResponse(
        providerAddress,
        chatID,
        usageStr
      );
    } catch {
      // verification may fail on some providers, non-critical
    }

    const reply =
      completion.choices?.[0]?.message?.content || "No response content";

    return NextResponse.json({
      success: true,
      provider: providerAddress,
      model,
      endpoint,
      response: reply,
      chatID,
      verified,
      usage: completion.usage || null,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
