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

  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
          >
            monad2026
          </Link>
          <nav className="hidden items-center gap-4 text-xs font-medium sm:flex">
            {NAV_LINKS.map((l) => {
              const active =
                l.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={
                    active
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isConnected && onCorrectChain && (
            <div
              className="hidden items-center gap-1.5 rounded-md bg-zinc-100 px-2.5 py-1.5 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200 sm:flex dark:bg-zinc-900 dark:text-zinc-200 dark:ring-zinc-800"
              title="On-chain token balance from AIQueryCredits"
            >
              <span className="font-mono">{fmtTokens(tokens as bigint | undefined)}</span>
              <span className="text-zinc-500 dark:text-zinc-400">tokens</span>
            </div>
          )}
          <ConnectButton
            showBalance={false}
            accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
            chainStatus={{ smallScreen: "icon", largeScreen: "full" }}
          />
        </div>
      </div>
    </header>
  );
}
