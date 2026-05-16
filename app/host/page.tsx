"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useAccount,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { decodeEventLog } from "viem";
import {
  HOST_DRAFT_KEY,
  type HostDraft,
  initials,
  MODEL_BY_ID,
  ROOMS,
  ROOM_TO_BRAIN,
  type Room,
  ZG_COMPUTE_MODELS,
} from "@/lib/brains";
import { ZEROGCLAW_ABI, ZEROGCLAW_ADDRESS } from "@/lib/zerogclaw-abi";
import { zgGalileo } from "@/lib/wagmi";

type Step = 0 | 1 | 2 | 3;

const STEP_LABELS = ["ROOM", "PERSONA", "KNOWLEDGE", "MINT"] as const;

type MintStage = "idle" | "signing" | "confirming" | "done";

const STAGE_LABEL: Record<MintStage, string> = {
  idle: "READY TO MINT",
  signing: "AWAITING WALLET SIGNATURE…",
  confirming: "CONFIRMING ON 0G GALILEO…",
  done: "MINTED",
};

const ROOM_THEME: Record<Room, { bg: string; accent: string; ink: string }> = {
  fortune: { bg: "#3E3060", accent: "#CC88EE", ink: "#F4E2FF" },
  laundry: { bg: "#D4D8E0", accent: "#2244BB", ink: "#1B2030" },
  sushi: { bg: "#BFA070", accent: "#5A3010", ink: "#2A170A" },
  coffee: { bg: "#484858", accent: "#E4A949", ink: "#F0E2C2" },
};

const emptyDraft = (room: Room): HostDraft => ({
  room,
  name: "",
  kbLabel: "",
  model: "qwen-2.5-7b",
  domainTags: "",
  serviceOfferings: "",
  pricePerQueryTokens: 1,
});

const px = "var(--font-pixel), monospace";

export default function HostPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [draft, setDraft] = useState<HostDraft>(() => emptyDraft("coffee"));
  const [mintStage, setMintStage] = useState<MintStage>("idle");
  const [mintedTokenId, setMintedTokenId] = useState<number | null>(null);
  const [mintError, setMintError] = useState<string | null>(null);
  const [mintTx, setMintTx] = useState<`0x${string}` | null>(null);

  const { address, chainId, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { data: receipt } = useWaitForTransactionReceipt({
    hash: mintTx ?? undefined,
    chainId: zgGalileo.id,
  });

  function setField<K extends keyof HostDraft>(key: K, value: HostDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  const canContinue = useMemo(() => {
    if (step === 0) return !!draft.room;
    if (step === 1) return draft.name.trim().length > 0;
    if (step === 2)
      return draft.kbLabel.trim().length > 0 && !!draft.knowledgePdfName;
    return true;
  }, [step, draft]);

  function handleBack() {
    if (step === 0) {
      router.push("/chat");
      return;
    }
    setStep((s) => (s - 1) as Step);
  }

  function handleContinue() {
    if (!canContinue) return;
    if (step < 3) setStep((s) => (s + 1) as Step);
  }

  // Decode tokenId from the mint receipt once it confirms.
  useEffect(() => {
    if (!receipt || mintStage !== "confirming") return;
    try {
      let tokenId: bigint | null = null;
      for (const log of receipt.logs) {
        if (log.address.toLowerCase() !== ZEROGCLAW_ADDRESS.toLowerCase()) continue;
        try {
          const decoded = decodeEventLog({
            abi: ZEROGCLAW_ABI,
            data: log.data,
            topics: log.topics,
          });
          if (decoded.eventName === "AgentMinted") {
            tokenId = (decoded.args as { tokenId: bigint }).tokenId;
            break;
          }
        } catch {
          // not an event we care about
        }
      }
      if (tokenId === null) {
        throw new Error("Mint confirmed but AgentMinted event missing from receipt");
      }
      const id = Number(tokenId);
      const stored: HostDraft = { ...draft, tokenId: id, mintTx: mintTx!, mintedAt: Date.now() };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(HOST_DRAFT_KEY(draft.room), JSON.stringify(stored));
      }
      setMintedTokenId(id);
      setMintStage("done");
    } catch (err) {
      setMintError(err instanceof Error ? err.message : String(err));
      setMintStage("idle");
    }
  }, [receipt, mintStage, draft, mintTx]);

  async function handleMint(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mintStage !== "idle") return;
    setMintError(null);

    if (!isConnected || !address) {
      setMintError("Connect your wallet first.");
      return;
    }

    if (chainId !== zgGalileo.id) {
      try {
        await switchChainAsync({ chainId: zgGalileo.id });
      } catch (err) {
        setMintError(
          err instanceof Error
            ? `Switch to 0G Galileo to mint: ${err.message.split("\n")[0]}`
            : "Switch to 0G Galileo to mint.",
        );
        return;
      }
    }

    const botId = `${draft.room}-${slug(draft.name)}-${Date.now()}`;

    setMintStage("signing");
    let hash: `0x${string}`;
    try {
      hash = await writeContractAsync({
        address: ZEROGCLAW_ADDRESS,
        abi: ZEROGCLAW_ABI,
        functionName: "mintAgent",
        args: [
          address,
          botId,
          draft.domainTags,
          draft.serviceOfferings,
          [],
        ],
        chainId: zgGalileo.id,
      });
    } catch (err) {
      setMintError(err instanceof Error ? err.message.split("\n")[0] : String(err));
      setMintStage("idle");
      return;
    }
    setMintTx(hash);
    setMintStage("confirming");
  }

  function handleVisit() {
    router.push(`/chat?room=${draft.room}`);
  }

  return (
    <div style={{
      minHeight: "calc(100dvh - 46px)",
      background: "radial-gradient(circle at 30% 10%, #1B1722 0%, #0A0807 55%, #060503 100%)",
      padding: "32px 20px 56px",
      display: "flex",
      justifyContent: "center",
    }}>
      <div style={{
        width: "min(880px, 100%)",
        position: "relative",
        background: [
          "linear-gradient(145deg, rgba(61,37,21,0.96), rgba(24,14,9,0.98))",
          "repeating-linear-gradient(0deg, rgba(255,224,143,0.035) 0px, rgba(255,224,143,0.035) 1px, transparent 1px, transparent 10px)",
          "repeating-linear-gradient(90deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 1px, transparent 1px, transparent 14px)",
        ].join(", "),
        border: "4px solid #8A5A28",
        boxShadow: "0 30px 80px rgba(7,4,2,0.72), inset 0 0 0 4px rgba(214,156,75,0.2)",
        color: "#F7E4B5",
        padding: 22,
      }}>
        <div style={{
          position: "absolute",
          top: -16,
          left: "50%",
          transform: "translateX(-50%)",
          padding: "8px 22px",
          background: "linear-gradient(180deg, #F2C969 0%, #B6862B 100%)",
          border: "3px solid #5B3D14",
          fontFamily: px,
          fontSize: 11,
          letterSpacing: 4,
          color: "#2B1A07",
          boxShadow: "0 6px 0 rgba(0,0,0,0.35)",
        }}>
          FRONT DESK
        </div>

        <header style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginTop: 12 }}>
          <h1 style={{ margin: 0, fontSize: "clamp(28px, 3.5vw, 44px)", lineHeight: 1, fontWeight: 900 }}>
            List a resident
          </h1>
          <div style={{ fontFamily: px, fontSize: 9, letterSpacing: 2, color: "#D8B160" }}>
            STEP {step + 1} / 4 · {STEP_LABELS[step]}
          </div>
        </header>

        <p style={{ margin: "8px 0 16px", color: "#D7BC83", fontSize: 13, lineHeight: 1.5, maxWidth: 540 }}>
          Each room in Brain Hotel houses a specialist resident — an ERC-7857 iNFT minted on 0G Galileo,
          served by 0G Compute, paid per query in your TOKENS.
        </p>

        <ProgressBar step={step} />

        <div style={{ marginTop: 18 }}>
          {step === 0 && <StepRoom draft={draft} setField={setField} />}
          {step === 1 && <StepPersona draft={draft} setField={setField} />}
          {step === 2 && <StepKnowledge draft={draft} setField={setField} setMintError={setMintError} />}
          {step === 3 && (
            <StepMint
              draft={draft}
              mintStage={mintStage}
              mintedTokenId={mintedTokenId}
              mintError={mintError}
              mintTx={mintTx}
              onMint={handleMint}
              onVisit={handleVisit}
              isConnected={isConnected}
              onCorrectChain={chainId === zgGalileo.id}
            />
          )}
        </div>

        {mintStage !== "done" && (
          <footer style={{
            marginTop: 22,
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            paddingTop: 14,
            borderTop: "2px dashed rgba(216,177,96,0.35)",
          }}>
            <button onClick={handleBack} style={secondaryBtn}>
              ← {step === 0 ? "BACK TO HOTEL" : "BACK"}
            </button>
            {step < 3 ? (
              <button
                onClick={handleContinue}
                disabled={!canContinue}
                style={{ ...primaryBtn, opacity: canContinue ? 1 : 0.45, cursor: canContinue ? "pointer" : "not-allowed" }}
              >
                CONTINUE →
              </button>
            ) : (
              <div style={{ fontFamily: px, fontSize: 8, color: "#A88B47", alignSelf: "center", letterSpacing: 1.5 }}>
                ← REVIEW THEN MINT →
              </div>
            )}
          </footer>
        )}
      </div>
    </div>
  );
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24) || "resident";
}

async function sha256Hex(file: File): Promise<`0x${string}`> {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `0x${hex}` as `0x${string}`;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

const primaryBtn: React.CSSProperties = {
  fontFamily: px,
  fontSize: 10,
  letterSpacing: 2,
  padding: "11px 18px",
  background: "#E9C46A",
  color: "#24160D",
  border: "2px solid #F7D98D",
  boxShadow: "inset 0 -5px 0 rgba(103,72,39,0.32)",
  cursor: "pointer",
};

const secondaryBtn: React.CSSProperties = {
  fontFamily: px,
  fontSize: 10,
  letterSpacing: 2,
  padding: "11px 18px",
  background: "transparent",
  color: "#D8B160",
  border: "2px solid #6F461E",
  cursor: "pointer",
};

const fieldLabel: React.CSSProperties = {
  display: "block",
  fontFamily: px,
  fontSize: 8,
  letterSpacing: 1.6,
  color: "#A88B47",
  marginBottom: 6,
};

const fieldInput: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  background: "#15100C",
  color: "#F8EED2",
  border: "2px solid rgba(233, 196, 106, 0.45)",
  outline: "none",
  fontSize: 14,
  fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
};

const sectionTitle: React.CSSProperties = {
  margin: "0 0 6px",
  fontSize: "clamp(20px, 2.4vw, 28px)",
  fontWeight: 900,
  letterSpacing: -0.3,
};

const sectionHint: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  lineHeight: 1.5,
  color: "#C9A965",
  maxWidth: 620,
};

// ── Progress bar ─────────────────────────────────────────────────
function ProgressBar({ step }: { step: Step }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
      {STEP_LABELS.map((label, i) => (
        <div key={label} style={{ display: "grid", gap: 4 }}>
          <div style={{
            height: 6,
            background: i <= step ? "linear-gradient(90deg, #F2C969, #B6862B)" : "rgba(120,82,32,0.35)",
            boxShadow: i <= step ? "0 0 8px rgba(242,201,105,0.45)" : "none",
          }} />
          <div style={{
            fontFamily: px,
            fontSize: 7,
            letterSpacing: 1.4,
            color: i <= step ? "#F2C969" : "#7A5827",
          }}>
            {i + 1}. {label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Step 0: Pick a room ──────────────────────────────────────────
function StepRoom({
  draft,
  setField,
}: {
  draft: HostDraft;
  setField: <K extends keyof HostDraft>(k: K, v: HostDraft[K]) => void;
}) {
  return (
    <section>
      <h2 style={sectionTitle}>Pick a room</h2>
      <p style={sectionHint}>
        Each room is a slot for one resident. The current placeholder will be replaced
        by your draft once you mint.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 14 }}>
        {ROOMS.map((room) => {
          const theme = ROOM_THEME[room];
          const current = ROOM_TO_BRAIN[room];
          const face = initials(current.name);
          const selected = draft.room === room;
          return (
            <button
              key={room}
              type="button"
              onClick={() => setField("room", room)}
              style={{
                position: "relative",
                padding: 0,
                cursor: "pointer",
                background: "transparent",
                border: selected ? "3px solid #F2C969" : "3px solid rgba(216,177,96,0.25)",
                boxShadow: selected ? "0 0 0 4px rgba(242,201,105,0.18), 0 8px 0 rgba(0,0,0,0.3)" : "0 6px 0 rgba(0,0,0,0.24)",
                transform: selected ? "translateY(-2px)" : "none",
                transition: "transform 160ms ease, box-shadow 160ms ease",
                overflow: "hidden",
                textAlign: "left",
              }}
            >
              <div style={{
                height: 90,
                background: theme.bg,
                position: "relative",
                borderBottom: "2px solid rgba(0,0,0,0.4)",
              }}>
                <div style={{
                  position: "absolute",
                  left: "50%",
                  bottom: 8,
                  transform: "translateX(-50%)",
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: theme.accent,
                  border: `3px solid ${theme.ink}`,
                  boxShadow: `0 0 14px ${theme.accent}88`,
                  display: "grid",
                  placeItems: "center",
                  color: theme.ink,
                  fontFamily: px,
                  fontSize: 11,
                  fontWeight: 900,
                }}>
                  {face}
                </div>
                <div style={{
                  position: "absolute",
                  top: 6,
                  left: 6,
                  padding: "3px 6px",
                  background: "rgba(0,0,0,0.4)",
                  color: theme.accent,
                  fontFamily: px,
                  fontSize: 7,
                  letterSpacing: 1.3,
                }}>
                  #{current.tokenId}
                </div>
              </div>
              <div style={{ padding: 10, background: "#23170D", color: "#F0DDAB" }}>
                <div style={{ fontFamily: px, fontSize: 8, letterSpacing: 1.6, color: "#D8B160" }}>
                  {current.roomLabel}
                </div>
                <div style={{ marginTop: 4, fontWeight: 900, fontSize: 13, lineHeight: 1.2 }}>
                  {current.name}
                </div>
                <div style={{ marginTop: 4, fontSize: 11, color: "#A88B47", lineHeight: 1.3 }}>
                  {current.pricePerQueryTokens} TOKEN{current.pricePerQueryTokens > 1 ? "S" : ""} / QUERY
                </div>
                {selected && (
                  <div style={{
                    marginTop: 8,
                    display: "inline-block",
                    padding: "3px 6px",
                    background: "#F2C969",
                    color: "#2B1A07",
                    fontFamily: px,
                    fontSize: 7,
                    letterSpacing: 1.6,
                  }}>
                    MOVING IN
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ── Step 1: Persona (name, model) ────────────────────────────────
function StepPersona({
  draft,
  setField,
}: {
  draft: HostDraft;
  setField: <K extends keyof HostDraft>(k: K, v: HostDraft[K]) => void;
}) {
  return (
    <section>
      <h2 style={sectionTitle}>Give them a name & a model</h2>
      <p style={sectionHint}>
        The model decides which 0G Compute provider serves this resident&apos;s inference.
        You can change it later by re-minting.
      </p>

      <div style={{ marginTop: 14 }}>
        <label style={fieldLabel}>NAME</label>
        <input
          value={draft.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="e.g. Banana Barista"
          style={fieldInput}
        />
        {draft.name.trim() && (
          <div style={{ marginTop: 6, fontFamily: px, fontSize: 8, color: "#7A5827", letterSpacing: 1.4 }}>
            AVATAR · {initials(draft.name)}
          </div>
        )}
      </div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label style={fieldLabel}>KNOWLEDGE BASE LABEL</label>
          <input
            value={draft.kbLabel}
            onChange={(e) => setField("kbLabel", e.target.value)}
            placeholder="e.g. Cafe Launch Notes"
            style={fieldInput}
          />
        </div>
        <div>
          <label style={fieldLabel}>PRICE (TOKENS / QUERY)</label>
          <input
            type="number"
            min={1}
            max={20}
            value={draft.pricePerQueryTokens}
            onChange={(e) => setField("pricePerQueryTokens", Math.max(1, Number(e.target.value) || 1))}
            style={fieldInput}
          />
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <label style={fieldLabel}>0G COMPUTE MODEL</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
          {ZG_COMPUTE_MODELS.map((m) => {
            const selected = draft.model === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setField("model", m.id)}
                style={{
                  textAlign: "left",
                  padding: 11,
                  cursor: "pointer",
                  background: selected ? "#22170C" : "#15100C",
                  color: "#F0DDAB",
                  border: selected ? "3px solid #F2C969" : "2px solid rgba(216,177,96,0.28)",
                  boxShadow: selected ? "0 0 0 3px rgba(242,201,105,0.15)" : "none",
                }}
              >
                <div style={{ fontFamily: px, fontSize: 9, letterSpacing: 1.6, color: selected ? "#F2C969" : "#A88B47" }}>
                  {selected ? "✓ " : ""}{m.label}
                </div>
                <div style={{ marginTop: 6, fontSize: 12, lineHeight: 1.35, color: "#D7BC83" }}>
                  {m.description}
                </div>
                <div style={{ marginTop: 6, fontFamily: "var(--font-geist-mono), ui-monospace, monospace", fontSize: 10, color: "#7A5827", wordBreak: "break-all" }}>
                  {m.provider.slice(0, 10)}…{m.provider.slice(-6)}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Step 2: Knowledge (PDF picker) ───────────────────────────────
function StepKnowledge({
  draft,
  setField,
  setMintError,
}: {
  draft: HostDraft;
  setField: <K extends keyof HostDraft>(k: K, v: HostDraft[K]) => void;
  setMintError: (err: string | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [hashing, setHashing] = useState(false);

  async function acceptFile(file: File | undefined) {
    if (!file) return;
    if (file.type && file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return;
    }
    setMintError(null);
    setHashing(true);
    try {
      const sha = await sha256Hex(file);
      setField("knowledgePdfName", file.name);
      setField("knowledgePdfSize", file.size);
      setField("knowledgePdfSha256", sha);
    } catch (err) {
      setMintError(err instanceof Error ? err.message : String(err));
    } finally {
      setHashing(false);
    }
  }

  function clearFile() {
    setField("knowledgePdfName", undefined);
    setField("knowledgePdfSize", undefined);
    setField("knowledgePdfSha256", undefined);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <section>
      <h2 style={sectionTitle}>Upload the knowledge base</h2>
      <p style={sectionHint}>
        Drop a PDF (whitepaper, manual, ops handbook, transcript pack…). For now this is
        kept local — the iNFT records the room + persona on-chain, the KB pipeline wires in next.
      </p>

      <div style={{ marginTop: 14 }}>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf,.pdf"
          style={{ display: "none" }}
          onChange={(e) => acceptFile(e.target.files?.[0])}
        />

        {!draft.knowledgePdfName ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => !hashing && fileRef.current?.click()}
            onKeyDown={(e) => {
              if (!hashing && (e.key === "Enter" || e.key === " ")) fileRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              acceptFile(e.dataTransfer.files?.[0]);
            }}
            style={{
              padding: "32px 18px",
              textAlign: "center",
              cursor: hashing ? "wait" : "pointer",
              background: dragOver ? "#22170C" : "#15100C",
              border: dragOver ? "3px dashed #F2C969" : "3px dashed rgba(216,177,96,0.4)",
              transition: "background 140ms ease, border-color 140ms ease",
            }}
          >
            <div style={{ fontFamily: px, fontSize: 10, letterSpacing: 2.4, color: "#F2C969" }}>
              {hashing ? "HASHING…" : "DROP PDF"}
            </div>
            <div style={{ marginTop: 8, fontSize: 13, color: "#D7BC83" }}>
              {hashing ? "computing sha-256 in your browser…" : "or click to browse · only .pdf · single file"}
            </div>
          </div>
        ) : (
          <div style={{
            padding: 14,
            background: "#1A130C",
            border: "2px solid rgba(216,177,96,0.32)",
            display: "grid",
            gridTemplateColumns: "44px 1fr auto",
            gap: 12,
            alignItems: "center",
          }}>
            <div style={{
              width: 44,
              height: 52,
              background: "#7B3E29",
              color: "#F8EED2",
              border: "2px solid #4C2415",
              display: "grid",
              placeItems: "center",
              fontFamily: px,
              fontSize: 9,
              letterSpacing: 1,
              boxShadow: "3px 3px 0 rgba(0,0,0,0.35)",
            }}>
              PDF
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#F0DDAB", wordBreak: "break-word" }}>
                {draft.knowledgePdfName}
              </div>
              <div style={{ marginTop: 4, fontFamily: "var(--font-geist-mono), ui-monospace, monospace", fontSize: 11, color: "#A88B47" }}>
                {draft.knowledgePdfSize !== undefined ? formatBytes(draft.knowledgePdfSize) : "—"}
                {draft.knowledgePdfSha256 && (
                  <span> · sha256 {draft.knowledgePdfSha256.slice(0, 10)}…{draft.knowledgePdfSha256.slice(-6)}</span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={clearFile}
              style={{
                fontFamily: px,
                fontSize: 8,
                letterSpacing: 1.6,
                padding: "8px 10px",
                background: "transparent",
                color: "#D88040",
                border: "2px solid #6F461E",
                cursor: "pointer",
              }}
            >
              REPLACE
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label style={fieldLabel}>DOMAIN TAGS (COMMA SEP)</label>
          <input
            value={draft.domainTags}
            onChange={(e) => setField("domainTags", e.target.value)}
            placeholder="cafe-ops, retail, beverages"
            style={fieldInput}
          />
        </div>
        <div>
          <label style={fieldLabel}>SERVICE OFFERINGS (COMMA SEP)</label>
          <input
            value={draft.serviceOfferings}
            onChange={(e) => setField("serviceOfferings", e.target.value)}
            placeholder="menu-design, queue-analysis, supplier-routing"
            style={fieldInput}
          />
        </div>
      </div>
    </section>
  );
}

// ── Step 3: Review & mint ────────────────────────────────────────
function StepMint({
  draft,
  mintStage,
  mintedTokenId,
  mintError,
  mintTx,
  onMint,
  onVisit,
  isConnected,
  onCorrectChain,
}: {
  draft: HostDraft;
  mintStage: MintStage;
  mintedTokenId: number | null;
  mintError: string | null;
  mintTx: `0x${string}` | null;
  onMint: (e: FormEvent<HTMLFormElement>) => void;
  onVisit: () => void;
  isConnected: boolean;
  onCorrectChain: boolean;
}) {
  const room = ROOM_TO_BRAIN[draft.room];
  const model = MODEL_BY_ID[draft.model];

  if (mintStage === "done" && mintedTokenId !== null) {
    return (
      <section style={{ display: "grid", gap: 14, justifyItems: "center", padding: "8px 0 4px" }}>
        <div style={{
          fontFamily: px,
          fontSize: 10,
          letterSpacing: 3,
          color: "#7AA86A",
          padding: "5px 10px",
          background: "rgba(122,168,106,0.12)",
          border: "2px solid #4F7A3F",
        }}>
          ✓ RESIDENT MINTED
        </div>
        <div style={{ fontSize: "clamp(26px, 3vw, 36px)", fontWeight: 900, textAlign: "center" }}>
          {draft.name || "Your resident"} moves into {room.roomLabel}
        </div>
        <div style={{ fontFamily: px, fontSize: 9, color: "#D8B160", letterSpacing: 2, textAlign: "center" }}>
          TOKEN #{mintedTokenId} · {model.label} · {draft.pricePerQueryTokens} TOKEN{draft.pricePerQueryTokens > 1 ? "S" : ""} / QUERY
        </div>
        {mintTx && (
          <a
            href={`https://chainscan-galileo.0g.ai/tx/${mintTx}`}
            target="_blank"
            rel="noreferrer"
            style={{
              fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
              fontSize: 11,
              color: "#88BBDD",
              textDecoration: "underline",
              wordBreak: "break-all",
            }}
          >
            {mintTx.slice(0, 14)}…{mintTx.slice(-10)} ↗
          </a>
        )}
        <button onClick={onVisit} style={{ ...primaryBtn, padding: "13px 26px", fontSize: 11 }}>
          VISIT YOUR ROOM →
        </button>
        <div style={{ fontFamily: px, fontSize: 7, color: "#7A5827", letterSpacing: 1.3, textAlign: "center" }}>
          NOTE · SWITCH WALLET BACK TO MONAD TESTNET TO QUERY THE ROOM
        </div>
      </section>
    );
  }

  const busy = mintStage !== "idle";
  return (
    <form onSubmit={onMint}>
      <h2 style={sectionTitle}>Review & mint</h2>
      <p style={sectionHint}>
        Mints a new ERC-7857 iNFT directly via <code style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace", fontSize: 12, color: "#F2C969" }}>ZeroGClaw.mintAgent</code>
        on 0G Galileo. The persona (botId, domain tags, service offerings) is written on-chain;
        your wallet signs once.
      </p>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Row k="ROOM" v={room.roomLabel} />
        <Row k="PRICE" v={`${draft.pricePerQueryTokens} TOKEN${draft.pricePerQueryTokens > 1 ? "S" : ""} / QUERY`} />
        <Row k="NAME" v={draft.name || "—"} />
        <Row k="AVATAR" v={draft.name ? initials(draft.name) : "—"} />
        <Row k="KB LABEL" v={draft.kbLabel || "—"} />
        <Row k="PDF" v={draft.knowledgePdfName ? `${draft.knowledgePdfName} · ${draft.knowledgePdfSize !== undefined ? formatBytes(draft.knowledgePdfSize) : ""}` : "—"} />
        <Row k="MODEL" v={model.label} />
        <Row k="PROVIDER" v={`${model.provider.slice(0, 10)}…${model.provider.slice(-6)}`} />
        <Row k="DOMAIN TAGS" v={draft.domainTags || "—"} />
        <Row k="SERVICES" v={draft.serviceOfferings || "—"} />
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <ChainPill
          ok={isConnected}
          okLabel="WALLET CONNECTED"
          warnLabel="WALLET NOT CONNECTED"
        />
        <ChainPill
          ok={onCorrectChain}
          okLabel="ON 0G GALILEO"
          warnLabel="ON WRONG CHAIN · WILL SWITCH"
        />
      </div>

      {mintError && (
        <div style={{
          marginTop: 12,
          padding: "8px 10px",
          background: "rgba(216,128,64,0.12)",
          border: "2px solid #8A4A20",
          color: "#F1A36E",
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          fontSize: 11,
          lineHeight: 1.4,
        }}>
          {mintError}
        </div>
      )}

      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr auto", gap: 14, alignItems: "center" }}>
        <StageReadout stage={mintStage} label={STAGE_LABEL[mintStage]} />
        <button
          type="submit"
          disabled={busy || !isConnected}
          style={{
            ...primaryBtn,
            padding: "13px 22px",
            fontSize: 11,
            opacity: busy || !isConnected ? 0.6 : 1,
            cursor: busy ? "wait" : !isConnected ? "not-allowed" : "pointer",
          }}
        >
          {busy ? "MINTING…" : "MINT RESIDENT"}
        </button>
      </div>
    </form>
  );
}

function ChainPill({ ok, okLabel, warnLabel }: { ok: boolean; okLabel: string; warnLabel: string }) {
  return (
    <span style={{
      fontFamily: px,
      fontSize: 8,
      letterSpacing: 1.4,
      padding: "5px 8px",
      background: ok ? "rgba(122,168,106,0.12)" : "rgba(216,128,64,0.12)",
      color: ok ? "#7AA86A" : "#F1A36E",
      border: ok ? "2px solid #4F7A3F" : "2px solid #8A4A20",
    }}>
      {ok ? `✓ ${okLabel}` : `! ${warnLabel}`}
    </span>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{
      padding: "8px 10px",
      background: "#1A130C",
      border: "2px solid rgba(216,177,96,0.18)",
      display: "grid",
      gap: 3,
    }}>
      <div style={{ fontFamily: px, fontSize: 7, letterSpacing: 1.6, color: "#A88B47" }}>{k}</div>
      <div style={{ fontSize: 13, color: "#F0DDAB", wordBreak: "break-word" }}>{v}</div>
    </div>
  );
}

function StageReadout({
  stage,
  label,
}: {
  stage: MintStage;
  label: string;
}) {
  const active = stage !== "idle" && stage !== "done";
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 12px",
      background: "#1A130C",
      border: "2px solid rgba(216,177,96,0.22)",
    }}>
      <span style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: active ? "#F2C969" : stage === "done" ? "#7AA86A" : "#5E4A1F",
        boxShadow: active ? "0 0 10px #F2C96988" : "none",
        animation: active ? "pulse 900ms infinite alternate" : undefined,
      }} />
      <span style={{ fontFamily: px, fontSize: 9, letterSpacing: 1.8, color: "#D8B160" }}>{label}</span>
      <style jsx>{`
        @keyframes pulse {
          from { transform: scale(0.85); opacity: 0.6; }
          to { transform: scale(1.15); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
