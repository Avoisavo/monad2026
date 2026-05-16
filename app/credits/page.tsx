"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useBalance,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatEther, parseEther } from "viem";
import {
  CREDITS_ABI,
  CREDITS_ADDRESS,
  TOKENS_PER_MON,
} from "@/lib/credits-contract";
import { monadTestnet } from "@/lib/wagmi";

const inputClass =
  "rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-sm font-mono text-zinc-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        {title}
      </h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function ActionButton({
  onClick,
  loading,
  disabled,
  children,
  variant = "primary",
}: {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  const styles =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-500 disabled:bg-blue-900"
      : "bg-zinc-200 text-zinc-900 hover:bg-zinc-300 disabled:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700";
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`rounded-md px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed ${styles}`}
    >
      {loading ? "Working…" : children}
    </button>
  );
}

type Activity = {
  kind: "topUp" | "consume" | "withdraw";
  hash: `0x${string}`;
  detail: string;
  at: number;
};

// Format an integer-only number with thousand separators.
const fmtTokens = (n: bigint | undefined) =>
  n === undefined ? "—" : n.toLocaleString();

// MON → tokens conversion. 1 MON = 10,000 tokens.
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

// tokens → MON (string)
function tokensToMon(tokens: bigint): string {
  const weiPerToken = parseEther("1") / TOKENS_PER_MON;
  return formatEther(tokens * weiPerToken);
}

export default function CreditsPage() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  const onCorrectChain = chainId === monadTestnet.id;

  const { data: walletBal } = useBalance({
    address,
    chainId: monadTestnet.id,
    query: { enabled: !!address && onCorrectChain, refetchInterval: 8000 },
  });

  const { data: creditBal, refetch: refetchCredits } = useReadContract({
    abi: CREDITS_ABI,
    address: CREDITS_ADDRESS,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: monadTestnet.id,
    query: { enabled: !!address && onCorrectChain, refetchInterval: 8000 },
  });

  const { writeContractAsync, isPending } = useWriteContract();

  // Inputs: top up & withdraw take MON; consume takes tokens.
  const [topUpMon, setTopUpMon] = useState("0.01"); // 100 tokens
  const [consumeTokens, setConsumeTokens] = useState("1");
  const [withdrawTokens, setWithdrawTokens] = useState("50");
  const [busy, setBusy] = useState<Activity["kind"] | null>(null);
  const [lastTx, setLastTx] = useState<`0x${string}` | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { isLoading: confirming, isSuccess: confirmed } =
    useWaitForTransactionReceipt({
      hash: lastTx ?? undefined,
      chainId: monadTestnet.id,
    });

  useEffect(() => {
    if (confirmed) {
      refetchCredits();
      setBusy(null);
    }
  }, [confirmed, refetchCredits]);

  const topUpTokensPreview = monToTokens(topUpMon);
  const withdrawMonPreview = (() => {
    try {
      const t = BigInt(withdrawTokens || "0");
      return t > BigInt(0) ? tokensToMon(t) : null;
    } catch {
      return null;
    }
  })();

  async function handleTopUp() {
    setError(null);
    if (!address || !onCorrectChain) {
      setError("Connect wallet on Monad testnet first.");
      return;
    }
    let wei: bigint;
    try {
      wei = parseEther(topUpMon || "0");
    } catch {
      setError("Invalid MON amount");
      return;
    }
    if (wei <= BigInt(0)) {
      setError("Amount must be > 0");
      return;
    }
    const tokens = monToTokens(topUpMon);
    if (tokens === null) {
      setError("Amount must be a multiple of 0.0001 MON");
      return;
    }
    setBusy("topUp");
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
      setActivity((a) => [
        {
          kind: "topUp",
          hash,
          detail: `${topUpMon} MON → ${tokens.toLocaleString()} tokens`,
          at: Date.now(),
        },
        ...a,
      ]);
    } catch (err) {
      setBusy(null);
      setError(err instanceof Error ? err.message.split("\n")[0] : String(err));
    }
  }

  async function handleTokenAction(
    kind: "consume" | "withdraw",
    tokensStr: string
  ) {
    setError(null);
    if (!address || !onCorrectChain) {
      setError("Connect wallet on Monad testnet first.");
      return;
    }
    let tokens: bigint;
    try {
      tokens = BigInt(tokensStr || "0");
    } catch {
      setError("Invalid token amount");
      return;
    }
    if (tokens <= BigInt(0)) {
      setError("Amount must be > 0");
      return;
    }
    setBusy(kind);
    try {
      const hash = await writeContractAsync({
        abi: CREDITS_ABI,
        address: CREDITS_ADDRESS,
        functionName: kind,
        args: [tokens],
        chainId: monadTestnet.id,
      });
      setLastTx(hash);
      setActivity((a) => [
        {
          kind,
          hash,
          detail:
            kind === "withdraw"
              ? `${tokens.toLocaleString()} tokens → ${tokensToMon(tokens)} MON`
              : `${tokens.toLocaleString()} tokens`,
          at: Date.now(),
        },
        ...a,
      ]);
    } catch (err) {
      setBusy(null);
      setError(err instanceof Error ? err.message.split("\n")[0] : String(err));
    }
  }

  return (
    <div className="min-h-full flex-1 bg-zinc-50 px-6 py-10 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">
            AI Query Credits
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Rate: <span className="font-mono">1 MON = 10,000 tokens</span>.
            Permissionless — every function is callable by anyone but only
            affects your own balance. Deployed at{" "}
            <a
              href={`${monadTestnet.blockExplorers.default.url}/address/${CREDITS_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
            >
              {CREDITS_ADDRESS.slice(0, 10)}…{CREDITS_ADDRESS.slice(-4)}
            </a>{" "}
            on Monad Testnet.
          </p>
        </header>

        {isConnected && !onCorrectChain && (
          <div className="flex items-center justify-between rounded-md bg-amber-50 p-3 text-xs text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900">
            <span>Wrong network. Switch to Monad Testnet ({monadTestnet.id}).</span>
            <button
              onClick={() => switchChain({ chainId: monadTestnet.id })}
              className="rounded bg-amber-600 px-2 py-1 text-white"
            >
              Switch
            </button>
          </div>
        )}

        {address && onCorrectChain && (
          <Section
            title="Balances"
            description="Auto-refreshes every 8 seconds and after each confirmed tx."
          >
            <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                  Wallet MON
                </dt>
                <dd className="font-mono">
                  {walletBal ? formatEther(walletBal.value) : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                  Tokens
                </dt>
                <dd className="font-mono">
                  {fmtTokens(creditBal as bigint | undefined)}
                </dd>
              </div>
            </dl>
          </Section>
        )}

        <Section
          title="Top up"
          description="Send MON, receive tokens at the fixed rate (1 MON = 10,000)."
        >
          <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Amount (MON; must be a multiple of 0.0001)
            <input
              value={topUpMon}
              onChange={(e) => setTopUpMon(e.target.value)}
              className={inputClass}
            />
          </label>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            →{" "}
            <span className="font-mono">
              {topUpTokensPreview === null
                ? "invalid amount"
                : `${topUpTokensPreview.toLocaleString()} tokens`}
            </span>
          </p>
          <ActionButton
            onClick={handleTopUp}
            loading={busy === "topUp"}
            disabled={!isConnected || !onCorrectChain}
          >
            Top up
          </ActionButton>
        </Section>

        <Section
          title="Consume tokens"
          description="Emit a Consumed event signalling an AI query. No state change — your backend reads the event."
        >
          <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Tokens
            <input
              value={consumeTokens}
              onChange={(e) => setConsumeTokens(e.target.value)}
              className={inputClass}
            />
          </label>
          <ActionButton
            onClick={() => handleTokenAction("consume", consumeTokens)}
            loading={busy === "consume"}
            disabled={!isConnected || !onCorrectChain}
            variant="secondary"
          >
            Consume
          </ActionButton>
        </Section>

        <Section
          title="Withdraw"
          description="Burn tokens, receive the equivalent MON back."
        >
          <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Tokens
            <input
              value={withdrawTokens}
              onChange={(e) => setWithdrawTokens(e.target.value)}
              className={inputClass}
            />
          </label>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            →{" "}
            <span className="font-mono">
              {withdrawMonPreview === null
                ? "invalid amount"
                : `${withdrawMonPreview} MON`}
            </span>
          </p>
          <ActionButton
            onClick={() => handleTokenAction("withdraw", withdrawTokens)}
            loading={busy === "withdraw"}
            disabled={!isConnected || !onCorrectChain}
            variant="secondary"
          >
            Withdraw
          </ActionButton>
        </Section>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-xs text-red-700 ring-1 ring-red-200 dark:bg-red-950 dark:text-red-300 dark:ring-red-900">
            {error}
          </div>
        )}

        {activity.length > 0 && (
          <Section
            title="Recent activity"
            description="Transactions sent in this session."
          >
            <ul className="divide-y divide-zinc-200 text-xs dark:divide-zinc-800">
              {activity.map((a) => (
                <li
                  key={a.hash}
                  className="flex items-center justify-between py-2"
                >
                  <span className="font-mono">
                    {a.kind} · {a.detail}
                    {lastTx === a.hash && confirming && (
                      <span className="ml-2 text-amber-500">confirming…</span>
                    )}
                    {lastTx === a.hash && confirmed && (
                      <span className="ml-2 text-green-500">confirmed</span>
                    )}
                  </span>
                  <a
                    href={`${monadTestnet.blockExplorers.default.url}/tx/${a.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {a.hash.slice(0, 10)}…{a.hash.slice(-4)}
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* isPending may briefly flicker before busy is set; surface it subtly */}
        {isPending && busy === null && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Waiting for wallet…
          </p>
        )}
      </div>
    </div>
  );
}
