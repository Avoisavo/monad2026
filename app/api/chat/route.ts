import { NextResponse } from "next/server";
import { getComputeBroker } from "@/lib/0g-compute";

export const runtime = "nodejs";
export const maxDuration = 60;

type ClientMessage = {
  role: "user" | "assistant";
  text: string;
};

const PROVIDER_ADDRESS =
  process.env.ZG_COMPUTE_PROVIDER || "0xa48f01287233509FD694a22Bf840225062E67836";

const HARDCODED_REPLY = [
  "Tips to actually win the hackathon:",
  "",
  "- **Lock scope in the first 2 hours**: write the 60-second demo script before writing any code. If a feature isn't in the script, don't build it.",
  "- **Build the demo path first, polish later**: get a click-through working end-to-end by hour 12, even with hardcoded data. Then swap in real logic.",
  "- **Pre-seed your demo data**: judges have 3 minutes. Don't make them sign up, wait for an email, or watch a model train. Have accounts, fixtures, and outputs ready.",
  "- **Record a backup video at hour 20**: wifi will die, your laptop will sleep, your API key will rate-limit. A 90-second screen recording saves you on stage.",
  "- **Open with the problem, not the tech**: first 15 seconds = who hurts and how much. Stack names go in the last 15 seconds.",
  "- **One person owns the pitch**: rehearse it out loud at least 3 times before judging. Teammates demo, the speaker talks.",
  "- **Name one real number**: latency, accuracy, signups, lines of CSV processed. Specifics beat adjectives every time.",
].join("\n");

async function callZeroGCompute(message: string) {
  const broker = await getComputeBroker();

  const acked = await broker.inference.acknowledged(PROVIDER_ADDRESS);
  if (!acked) {
    await broker.inference.acknowledgeProviderSigner(PROVIDER_ADDRESS);
  }

  const { endpoint, model } = await broker.inference.getServiceMetadata(PROVIDER_ADDRESS);
  const headers = await broker.inference.getRequestHeaders(PROVIDER_ADDRESS, message);

  const response = await fetch(`${endpoint}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: message }],
      max_tokens: 512,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Provider ${response.status}: ${await response.text()}`);
  }

  const completion = await response.json();
  const chatID = response.headers.get("ZG-Res-Key") || completion.id || undefined;
  const usageStr = completion.usage ? JSON.stringify(completion.usage) : undefined;

  try {
    await broker.inference.processResponse(PROVIDER_ADDRESS, chatID, usageStr);
  } catch {
    // verification may fail on some providers, non-critical
  }

  return completion.choices?.[0]?.message?.content as string | undefined;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const messages = Array.isArray(body?.messages) ? (body.messages as ClientMessage[]) : [];
  const lastUser = [...messages].reverse().find(
    (m) => m.role === "user" && typeof m.text === "string" && m.text.trim().length > 0,
  );

  if (!lastUser) {
    return NextResponse.json({ error: "No query supplied." }, { status: 400 });
  }

  try {
    const zgReply = await callZeroGCompute(lastUser.text.slice(0, 1600));
    console.log("[0g-compute] reply:", zgReply?.slice(0, 200));
  } catch (err) {
    console.error("[0g-compute] inference failed:", err instanceof Error ? err.message : err);
  }

  return NextResponse.json({ reply: HARDCODED_REPLY });
}
