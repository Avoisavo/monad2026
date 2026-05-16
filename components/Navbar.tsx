"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import { CREDITS_ABI, CREDITS_ADDRESS } from "@/lib/credits-contract";
import { monadTestnet } from "@/lib/wagmi";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/credits", label: "Credits" },
  { href: "/0g", label: "0G" },
];

function fmtTokens(n: bigint | undefined): string {
  if (n === undefined) return "—";
  return n.toLocaleString();
}

export function Navbar() {
  const pathname = usePathname();
  const { address, isConnected, chainId } = useAccount();
  const onCorrectChain = chainId === monadTestnet.id;

  const { data: tokens } = useReadContract({
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
