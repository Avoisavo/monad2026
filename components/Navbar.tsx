"use client";

import { useEffect, useRef, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { parseEther } from "viem";
import {
  CREDITS_ABI,
  CREDITS_ADDRESS,
  TOKENS_PER_MON,
} from "@/lib/credits-contract";
import { monadTestnet } from "@/lib/wagmi";

function fmtTokens(n: bigint | undefined): string {
  if (n === undefined) return "—";
  return n.toLocaleString();
}

function monToTokens(monStr: string): bigint | null {
  try {
    const wei = parseEther(monStr || "0");
    if (wei <= BigInt(0)) return null;
    const weiPerToken = parseEther("1") / TOKENS_PER_MON;
    if (wei % weiPerToken !== BigInt(0)) return null;
    return wei / weiPerToken;
  } catch {
    return null;
  }
}

export function Navbar() {
  const { address, isConnected, chainId } = useAccount();
  const onCorrectChain = chainId === monadTestnet.id;

  const { data: tokens, refetch: refetchTokens } = useReadContract({
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

  const { writeContractAsync, isPending } = useWriteContract();
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpMon, setTopUpMon] = useState("0.01");
  const [lastTx, setLastTx] = useState<`0x${string}` | null>(null);
  const [topUpError, setTopUpError] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const { isLoading: confirming, isSuccess: confirmed } =
    useWaitForTransactionReceipt({
      hash: lastTx ?? undefined,
      chainId: monadTestnet.id,
    });

  // Close on outside click + Esc, refetch after confirm.
  useEffect(() => {
    if (!topUpOpen) return;
    const onMouse = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setTopUpOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTopUpOpen(false);
    };
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, [topUpOpen]);

  useEffect(() => {
    if (confirmed) {
      refetchTokens();
      setTopUpOpen(false);
      setLastTx(null);
    }
  }, [confirmed, refetchTokens]);

  const previewTokens = monToTokens(topUpMon);

  async function handleTopUp() {
    setTopUpError(null);
    if (!address || !onCorrectChain) {
      setTopUpError("Connect on Monad testnet first.");
      return;
    }
    let wei: bigint;
    try {
      wei = parseEther(topUpMon || "0");
    } catch {
      setTopUpError("Invalid MON amount");
      return;
    }
    if (wei <= BigInt(0)) {
      setTopUpError("Amount must be > 0");
      return;
    }
    if (previewTokens === null) {
      setTopUpError("Must be a multiple of 0.0001 MON");
      return;
    }
    try {
      const hash = await writeContractAsync({
        abi: CREDITS_ABI,
        address: CREDITS_ADDRESS,
        functionName: "topUp",
        args: [],
        value: wei,
        chainId: monadTestnet.id,
      });
      setLastTx(hash);
    } catch (err) {
      setTopUpError(
        err instanceof Error ? err.message.split("\n")[0] : String(err)
      );
    }
  }

  const px = "var(--font-pixel), monospace";

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 30, width: "100%",
      background: "linear-gradient(180deg, #222244 0%, #111133 100%)",
      borderBottom: "3px solid #334466",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 20px", height: 46,
    }}>
      {/* Left: LIVE */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF4444", border: "2px solid #AA0000", boxShadow: "0 0 6px #FF000088" }} />
        <span style={{ fontFamily: px, fontSize: 9, color: "#FF6666", letterSpacing: 1 }}>LIVE</span>
      </div>

      {/* Center: BRAIN HOTEL */}
      <span style={{ fontFamily: px, fontSize: 11, color: "#EEDDFF", letterSpacing: 3, textShadow: "0 0 10px #AA88FF" }}>
        BRAIN HOTEL
      </span>

      {/* Right: floors + active + tokens + connect */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontFamily: px, fontSize: 8, color: "#AAAACC" }}>4 FLOORS</span>
        <div style={{ width: 1, height: 14, background: "#334466" }} />
        <span style={{ fontFamily: px, fontSize: 8, color: "#AAAACC" }}>6 ACTIVE</span>
        {isConnected && onCorrectChain && (
          <>
            <div style={{ width: 1, height: 14, background: "#334466" }} />
            <span
              style={{
                fontFamily: px,
                fontSize: 8,
                color: "#FFD566",
                textShadow: "0 0 6px #FFB04488",
              }}
              title="On-chain token balance from AIQueryCredits"
            >
              {fmtTokens(tokens as bigint | undefined)} TOKENS
            </span>
            <div ref={popoverRef} style={{ position: "relative" }}>
              <button
                onClick={() => setTopUpOpen((o) => !o)}
                title="Top up tokens"
                aria-label="Top up tokens"
                style={{
                  fontFamily: px,
                  fontSize: 10,
                  width: 20,
                  height: 20,
                  lineHeight: 1,
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#FFD566",
                  color: "#222244",
                  border: "2px solid #AA8844",
                  cursor: "pointer",
                  boxShadow: topUpOpen ? "inset 0 0 0 1px #222244" : "0 0 6px #FFB04488",
                }}
              >
                +
              </button>
              {topUpOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: 30,
                    right: 0,
                    minWidth: 240,
                    padding: 14,
                    background: "linear-gradient(180deg, #222244 0%, #111133 100%)",
                    border: "3px solid #334466",
                    boxShadow: "0 6px 30px rgba(0,0,0,0.6)",
                    fontFamily: px,
                    color: "#EEDDFF",
                    zIndex: 40,
                  }}
                >
                  <div style={{ fontSize: 9, letterSpacing: 2, marginBottom: 10, color: "#AA88FF" }}>
                    BUY TOKENS
                  </div>
                  <label style={{ fontSize: 7, color: "#AAAACC", display: "block", marginBottom: 4 }}>
                    AMOUNT (MON)
                  </label>
                  <input
                    value={topUpMon}
                    onChange={(e) => setTopUpMon(e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      background: "#0A0A1F",
                      color: "#EEDDFF",
                      border: "2px solid #334466",
                      padding: "6px 8px",
                      fontFamily: px,
                      fontSize: 10,
                      outline: "none",
                    }}
                  />
                  <div style={{ fontSize: 7, color: "#AAAACC", marginTop: 6 }}>
                    →{" "}
                    <span style={{ color: previewTokens === null ? "#FF6666" : "#FFD566" }}>
                      {previewTokens === null
                        ? "INVALID"
                        : `${previewTokens.toLocaleString()} TOKENS`}
                    </span>
                  </div>
                  {topUpError && (
                    <div style={{ fontSize: 7, color: "#FF6666", marginTop: 6 }}>
                      {topUpError}
                    </div>
                  )}
                  <button
                    onClick={handleTopUp}
                    disabled={isPending || confirming || previewTokens === null}
                    style={{
                      marginTop: 12,
                      width: "100%",
                      fontFamily: px,
                      fontSize: 9,
                      letterSpacing: 2,
                      padding: "8px 0",
                      background:
                        isPending || confirming || previewTokens === null
                          ? "#555577"
                          : "#FFD566",
                      color: "#222244",
                      border: "2px solid #AA8844",
                      cursor:
                        isPending || confirming || previewTokens === null
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {isPending
                      ? "CONFIRM IN WALLET…"
                      : confirming
                      ? "CONFIRMING…"
                      : "TOP UP"}
                  </button>
                  <div style={{ fontSize: 6, color: "#666688", marginTop: 8, letterSpacing: 1 }}>
                    1 MON = 10,000 TOKENS · MIN 0.0001
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        <div style={{ width: 1, height: 14, background: "#334466", marginLeft: 4 }} />
        <ConnectButton
          showBalance={false}
          accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
          chainStatus={{ smallScreen: "icon", largeScreen: "full" }}
        />
      </div>
    </header>
  );
}
