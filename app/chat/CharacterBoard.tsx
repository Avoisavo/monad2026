"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { CREDITS_ABI, CREDITS_ADDRESS } from "@/lib/credits-contract";
import { monadTestnet } from "@/lib/wagmi";

export const TOKENS_REFETCH_EVENT = "tokens:refetch";

const selectedResident = {
  name: "TungTungTung Sahur",
  room: "Hackathon Critic AI",
  kb: "Pitch & Demo Judge",
  tone: "critiques ideas, demos, technical proof, and judge appeal",
  face: "AI",
};

const boardNotes = [
  { label: "pitch", text: "Sharpens your one-liner, problem, and user story" },
  { label: "demo", text: "Reviews the flow judges see in the first minute" },
  { label: "build", text: "Checks tech depth, weak spots, and proof points" },
];

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    return part;
  });
}

function MarkdownMessage({ text }: { text: string }) {
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);

  return (
    <div className="markdown-message">
      {lines.map((line, index) => {
        const bullet = line.match(/^[-*]\s+(.+)/);
        const numbered = line.match(/^\d+[.)]\s+(.+)/);

        if (bullet || numbered) {
          return (
            <div className="markdown-list-row" key={`${line}-${index}`}>
              <span>{numbered ? `${line.match(/^\d+/)?.[0]}.` : "•"}</span>
              <p>{renderInlineMarkdown((bullet || numbered)?.[1] || line)}</p>
            </div>
          );
        }

        return <p key={`${line}-${index}`}>{renderInlineMarkdown(line)}</p>;
      })}
    </div>
  );
}

export default function CharacterBoard({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [query, setQuery] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const chatLogRef = useRef<HTMLElement>(null);

  const { address, isConnected, chainId } = useAccount();
  const onCorrectChain = chainId === monadTestnet.id;
  const { data: tokenBalance } = useReadContract({
    abi: CREDITS_ABI,
    address: CREDITS_ADDRESS,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: monadTestnet.id,
    query: {
      enabled: !!address && onCorrectChain,
      refetchInterval: 8000,
    },
  });
  const { writeContractAsync } = useWriteContract();
  const [consumeTx, setConsumeTx] = useState<`0x${string}` | null>(null);
  const { isSuccess: consumeConfirmed } = useWaitForTransactionReceipt({
    hash: consumeTx ?? undefined,
    chainId: monadTestnet.id,
  });

  useEffect(() => {
    const chatLog = chatLogRef.current;
    if (!chatLog) return;
    chatLog.scrollTop = chatLog.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    if (consumeConfirmed) {
      // Plain event = "refetch only" — the optimistic offset stays until the
      // on-chain balance actually drops, which is what this refetch will pick up.
      window.dispatchEvent(new Event(TOKENS_REFETCH_EVENT));
      setConsumeTx(null);
    }
  }, [consumeConfirmed]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = query.trim();
    if (!question || isSending) return;

    if (!isConnected || !onCorrectChain) {
      setError("Connect on Monad testnet to query.");
      return;
    }
    if (tokenBalance === undefined || (tokenBalance as bigint) < BigInt(1)) {
      setError("Not enough tokens. Top up first.");
      return;
    }

    const nextMessages = [...messages, { role: "user" as const, text: question }];
    setMessages(nextMessages);
    setQuery("");
    setError("");
    setIsSending(true);

    try {
      const hash = await writeContractAsync({
        abi: CREDITS_ABI,
        address: CREDITS_ADDRESS,
        functionName: "consume",
        args: [BigInt(1)],
        chainId: monadTestnet.id,
      });
      setConsumeTx(hash);
      window.dispatchEvent(
        new CustomEvent(TOKENS_REFETCH_EVENT, { detail: { consumed: 1 } }),
      );

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "The resident stayed quiet.");
      }
      setMessages((current) => [...current, { role: "assistant", text: data.reply }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message.split("\n")[0] : "The resident stayed quiet.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <aside
      className="character-board"
      aria-hidden={!open}
      style={{
        position: "fixed",
        top: 8,
        right: 12,
        bottom: 12,
        width: "clamp(760px, 66vw, 1080px)",
        minWidth: 0,
        zIndex: 20,
        transform: open ? "translateX(0) rotate(-0.4deg)" : "translateX(calc(100% + 42px)) rotate(1.2deg)",
        opacity: open ? 1 : 0,
        transition: "transform 1120ms cubic-bezier(0.4, 0, 0.2, 1), opacity 820ms ease",
        pointerEvents: open ? "auto" : "none",
        color: "#F7E4B5",
      }}
    >
      <div className="board-shell" style={{
        height: "100%",
        display: "grid",
        gridTemplateRows: "auto auto minmax(0, 1fr) auto",
        gap: 12,
        padding: 16,
        position: "relative",
        overflow: "hidden",
        background: [
          "linear-gradient(145deg, rgba(61,37,21,0.96), rgba(24,14,9,0.98))",
          "repeating-linear-gradient(0deg, rgba(255,224,143,0.035) 0px, rgba(255,224,143,0.035) 1px, transparent 1px, transparent 10px)",
          "repeating-linear-gradient(90deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 1px, transparent 1px, transparent 14px)",
        ].join(", "),
        border: "4px solid #8A5A28",
        boxShadow: "0 30px 80px rgba(7,4,2,0.72), inset 0 0 0 4px rgba(214,156,75,0.2), inset 0 -12px 0 rgba(0,0,0,0.16)",
      }}>
        <div style={{
          position: "absolute",
          top: 10,
          left: 14,
          right: 14,
          height: 7,
          background: "linear-gradient(90deg, #C58A3E, #F0C15F, #7A4A1F)",
          opacity: 0.72,
        }} />

        <div style={{
          position: "absolute",
          top: 70,
          right: -28,
          width: 110,
          height: 34,
          background: "#D8B160",
          transform: "rotate(9deg)",
          opacity: 0.42,
        }} />

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 12,
          alignItems: "start",
          padding: "18px 14px 10px",
          position: "relative",
        }}>
          <h1 style={{
            margin: "0",
            fontSize: "clamp(32px, 3.8vw, 56px)",
            lineHeight: 0.92,
            letterSpacing: -0.7,
            textWrap: "balance",
            textShadow: "2px 2px 0 rgba(0,0,0,0.28)",
          }}>
            {selectedResident.name}
          </h1>
          <button
            type="button"
            onClick={onToggle}
            aria-label="Close character board"
            style={{
              width: 42,
              height: 42,
              borderRadius: 0,
              border: "3px solid #E8BE64",
              background: "#2A1B10",
              color: "#F7D477",
              fontSize: 24,
              lineHeight: "34px",
              cursor: "pointer",
              boxShadow: "inset 0 -5px 0 rgba(0,0,0,0.24)",
              transition: "transform 180ms ease, background 180ms ease",
            }}
          >
            X
          </button>
        </div>

        <section className="resident-row" style={{
          display: "grid",
          gridTemplateColumns: "minmax(300px, 1.35fr) minmax(210px, 0.85fr)",
          gap: 12,
          alignItems: "stretch",
          margin: "0 10px",
        }}>
          <div className="coffee-card" style={{
            display: "grid",
            gridTemplateColumns: "138px 1fr",
            gap: 14,
            alignItems: "center",
            padding: 12,
            background: "#E3C777",
            color: "#25170C",
            border: "3px solid #6F461E",
            boxShadow: "8px 8px 0 rgba(0,0,0,0.24), inset 0 -8px 0 rgba(101,65,29,0.12)",
            transform: "rotate(0.35deg)",
          }}>
            <div style={{
              position: "relative",
              display: "grid",
              placeItems: "center",
              minHeight: 124,
              fontWeight: 900,
              color: "#2A170A",
              background: "linear-gradient(180deg, #FFD864 0%, #E7A93D 52%, #7FA640 100%)",
              border: "4px solid #211108",
              boxShadow: "inset 0 -12px 0 rgba(0,0,0,0.18), 0 7px 0 rgba(72,43,16,0.45)",
            }}>
              <Image
                src="/tung1.png"
                alt={selectedResident.name}
                width={112}
                height={112}
                style={{
                  width: 112,
                  height: 112,
                  objectFit: "contain",
                  objectPosition: "center bottom",
                  filter: "drop-shadow(4px 6px 0 rgba(42,23,10,0.28))",
                }}
              />
              <span style={{
                position: "absolute",
                right: 8,
                bottom: 8,
                width: 14,
                height: 14,
                background: "#8FD96C",
                border: "2px solid #213515",
                boxShadow: "0 0 0 3px rgba(143,217,108,0.18)",
              }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                display: "inline-block",
                padding: "5px 7px",
                color: "#27190E",
                background: "#F3D164",
                border: "2px solid rgba(42,23,10,0.28)",
                fontFamily: "var(--font-pixel), monospace",
                fontSize: 8,
                letterSpacing: 1.4,
              }}>
                {selectedResident.room}
              </div>
              <div style={{ marginTop: 10, fontSize: "clamp(22px, 2.2vw, 34px)", lineHeight: 1.02, fontWeight: 900 }}>
                {selectedResident.kb}
              </div>
              <p style={{ margin: "8px 0 0", color: "#5B3D1F", fontSize: 13, lineHeight: 1.38, maxWidth: "31ch", fontWeight: 650 }}>
                {selectedResident.tone}
              </p>
            </div>
          </div>

          <div style={{
            position: "relative",
            padding: "18px 14px 14px",
            background: "#F0D78F",
            color: "#2A1A10",
            border: "3px solid #7A4D22",
            boxShadow: "6px 7px 0 rgba(0,0,0,0.22), inset 0 -6px 0 rgba(91,59,25,0.12)",
            transform: "rotate(-1.2deg)",
          }}>
            <div style={{
              position: "absolute",
              top: -11,
              left: "50%",
              width: 86,
              height: 22,
              transform: "translateX(-50%) rotate(1.8deg)",
              background: "rgba(230,191,104,0.72)",
              border: "1px solid rgba(87,57,24,0.2)",
            }} />
            <div style={{ fontFamily: "var(--font-pixel), monospace", fontSize: 8, letterSpacing: 1.4, color: "#6D451D", position: "relative" }}>
              KNOWLEDGE OFFERS
            </div>
            <div style={{ marginTop: 8, display: "grid", gap: 7 }}>
              {boardNotes.map((note, index) => (
                <div key={note.text} style={{ display: "grid", gridTemplateColumns: "26px 1fr", gap: 7, alignItems: "start" }}>
                  <span style={{
                    display: "grid",
                    placeItems: "center",
                    height: 22,
                    background: index === 1 ? "#31513B" : "#7B3E29",
                    color: "#F8EED2",
                    fontFamily: "var(--font-geist-mono), monospace",
                    fontSize: 10,
                  }}>
                    {index + 1}
                  </span>
                  <span style={{ fontSize: 12, lineHeight: 1.28, fontWeight: 750 }}>
                    {note.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section ref={chatLogRef} style={{
          minHeight: 0,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          margin: "0 10px",
          padding: 12,
          background: "#100B08",
          border: "3px solid #4B3018",
          boxShadow: "inset 0 0 0 2px rgba(226,175,89,0.07)",
        }}>
          {messages.map((message, index) => {
            const isAgent = message.role === "assistant";
            return (
              <article key={`${message.role}-${index}-${message.text}`} style={{
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                flexDirection: isAgent ? "row" : "row-reverse",
                opacity: 0,
                transform: "translateY(8px)",
                animation: "dossierEntry 460ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
                animationDelay: `${index * 80}ms`,
              }}>
                <div style={{
                  flex: "0 0 auto",
                  display: "grid",
                  placeItems: "center",
                  width: 34,
                  height: 34,
                  background: isAgent ? "#E4A949" : "#2E5B77",
                  color: isAgent ? "#29190E" : "#DFF1FF",
                  border: isAgent ? "2px solid #171007" : "2px solid #91C4DF",
                  fontFamily: "var(--font-geist-mono), monospace",
                  fontSize: 11,
                  fontWeight: 900,
                  boxShadow: "0 4px 0 rgba(0,0,0,0.2)",
                }}>
                  {isAgent ? selectedResident.face : "Y"}
                </div>
                <div style={{
                  width: "min(100%, 640px)",
                  background: isAgent ? "#F1DEAD" : "#203F34",
                  color: isAgent ? "#27190E" : "#EAF4D6",
                  border: isAgent ? "2px solid #7D5527" : "2px solid #6E9C78",
                  boxShadow: isAgent ? "inset 0 -5px 0 rgba(91,59,25,0.18)" : "inset 0 -5px 0 rgba(0,0,0,0.18)",
                  padding: 11,
                  transform: isAgent ? "rotate(-0.35deg)" : "rotate(0.35deg)",
                }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    color: isAgent ? "#835621" : "#BFE8A7",
                    fontFamily: "var(--font-geist-mono), monospace",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    marginBottom: 7,
                  }}>
                    <span>{isAgent ? selectedResident.name : "You"}</span>
                    <span>log 0{index + 1}</span>
                  </div>
                  <MarkdownMessage text={message.text} />
                </div>
              </article>
            );
          })}
          {isSending && (
            <article style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <div style={{
                flex: "0 0 auto",
                display: "grid",
                placeItems: "center",
                width: 34,
                height: 34,
                background: "#E4A949",
                color: "#29190E",
                border: "2px solid #171007",
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: 11,
                fontWeight: 900,
                boxShadow: "0 4px 0 rgba(0,0,0,0.2)",
              }}>
                {selectedResident.face}
              </div>
              <div style={{
                background: "#F1DEAD",
                color: "#27190E",
                border: "2px solid #7D5527",
                boxShadow: "inset 0 -5px 0 rgba(91,59,25,0.18)",
                padding: 11,
                fontSize: 14,
              }}>
                thinking...
              </div>
            </article>
          )}
        </section>

        <form onSubmit={handleSubmit} style={{
          display: "grid",
          gridTemplateColumns: "1fr 84px",
          gap: 8,
          alignItems: "end",
          margin: "0 10px",
          padding: 10,
          background: "#160F0A",
          border: "3px solid #4B3018",
          position: "relative",
          zIndex: 2,
        }}>
          <label style={{ display: "grid", gap: 6, minWidth: 0 }}>
            <input
              aria-label="Query selected resident"
              placeholder="Ask this agent to critique your hackathon idea..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              style={{
                minWidth: 0,
                height: 44,
                padding: "0 12px",
                color: "#F8EED2",
                background: "#15100C",
                border: "2px solid rgba(233, 196, 106, 0.55)",
                outline: "none",
                fontSize: 14,
                boxShadow: "inset 0 2px 0 rgba(255,255,255,0.04)",
              }}
            />
            {error && (
              <span style={{
                color: "#F1A36E",
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: 10,
              }}>
                {error}
              </span>
            )}
          </label>
          <button
            type="submit"
            disabled={isSending}
            style={{
              height: 44,
              background: "#E9C46A",
              color: "#24160D",
              border: "2px solid #F7D98D",
              fontFamily: "var(--font-pixel), monospace",
              fontSize: 10,
              cursor: isSending ? "wait" : "pointer",
              opacity: isSending ? 0.68 : 1,
              boxShadow: "inset 0 -5px 0 rgba(103,72,39,0.28)",
              transition: "transform 160ms ease, filter 160ms ease",
            }}
          >
            {isSending ? "..." : "ENTER"}
          </button>
        </form>
      </div>

      <style jsx>{`
        aside button:hover {
          filter: brightness(1.08);
        }

        aside button:active {
          transform: translateY(1px) scale(0.98);
        }

        aside input:focus {
          border-color: #f7d98d;
          box-shadow: 0 0 0 3px rgba(233, 196, 106, 0.16), inset 0 2px 0 rgba(255, 255, 255, 0.04);
        }

        .markdown-message {
          display: grid;
          gap: 8px;
          font-size: 14px;
          line-height: 1.44;
        }

        .markdown-message p {
          margin: 0;
        }

        .markdown-message strong {
          font-weight: 900;
        }

        .markdown-list-row {
          display: grid;
          grid-template-columns: 18px 1fr;
          gap: 7px;
          align-items: baseline;
        }

        .markdown-list-row > span {
          color: #835621;
          font-family: var(--font-geist-mono), monospace;
          font-size: 14px;
          font-weight: 900;
          line-height: 1.44;
        }

        @media (max-width: 640px) {
          .character-board {
            width: calc(100vw - 28px) !important;
            top: 14px !important;
            right: 14px !important;
            bottom: 14px !important;
          }

          .board-shell {
            padding: 12px !important;
          }

          .resident-row,
          .coffee-card {
            grid-template-columns: 1fr !important;
          }
        }

        @keyframes dossierEntry {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </aside>
  );
}
