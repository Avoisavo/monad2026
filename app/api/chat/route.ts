import { NextResponse } from "next/server";

type ClientMessage = {
  role: "user" | "assistant";
  text: string;
};

const SYSTEM_PROMPT = [
  "You are a hackathon connoisseur living inside a pixel condo knowledge base.",
  "Give sharp advice on what hackathon projects can win, why judges care, what to cut, what to demo, and how to make the project feel fundable.",
  "Be practical, opinionated, and concise. Use the Coffee House dossier vibe, but do not roleplay so hard that the advice gets unclear.",
  "Prefer concrete project angles, judging criteria, demo flow, technical risks, and quick validation steps.",
].join(" ");

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY in .env." }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const messages = Array.isArray(body?.messages) ? (body.messages as ClientMessage[]) : [];
  const safeMessages = messages
    .filter((message) => (message.role === "user" || message.role === "assistant") && typeof message.text === "string")
    .slice(-10)
    .map((message) => ({
      role: message.role,
      content: message.text.slice(0, 1600),
    }));

  if (!safeMessages.length) {
    return NextResponse.json({ error: "No query supplied." }, { status: 400 });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-nano",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...safeMessages,
      ],
      temperature: 0.7,
      max_tokens: 420,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = data?.error?.code || data?.error?.type || `status_${response.status}`;
    return NextResponse.json(
      { error: `OpenAI request failed (${detail}). Check API key or billing.` },
      { status: response.status },
    );
  }

  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    return NextResponse.json({ error: "OpenAI returned no reply." }, { status: 502 });
  }

  return NextResponse.json({ reply });
}
