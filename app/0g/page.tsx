"use client";

import { useState } from "react";

type Json = Record<string, unknown> | null;

type Service = {
  provider: string;
  model: string;
  serviceType: string;
  url: string;
  inputPrice: string;
  outputPrice: string;
  verifiability: string;
};

function ResultBox({ data }: { data: Json }) {
  if (!data) return null;
  return (
    <pre className="mt-3 max-h-80 overflow-auto rounded-md bg-zinc-950 p-3 text-xs leading-relaxed text-green-300 ring-1 ring-zinc-800">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

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
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Button({
  onClick,
  loading,
  children,
  variant = "primary",
}: {
  onClick: () => void;
  loading?: boolean;
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
      disabled={loading}
      className={`rounded-md px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed ${styles}`}
    >
      {loading ? "Working…" : children}
    </button>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
      {label}
      {children}
    </label>
  );
}

const inputClass =
  "rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";

export default function ZeroGTestPage() {
  // Storage: upload
  const [uploadContent, setUploadContent] = useState(
    '{"type":"knowledge-item","domain":"0g-storage","content":"Hello from monad2026"}'
  );
  const [uploadEncrypt, setUploadEncrypt] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<Json>(null);

  // Storage: download
  const [rootHash, setRootHash] = useState("");
  const [downloadDecrypt, setDownloadDecrypt] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadResult, setDownloadResult] = useState<Json>(null);

  // Storage: KV
  const [kvKey, setKvKey] = useState("monad2026:test-key");
  const [kvValue, setKvValue] = useState("Hello, 0G KV!");
  const [kvLoading, setKvLoading] = useState(false);
  const [kvResult, setKvResult] = useState<Json>(null);

  // Compute: services
  const [services, setServices] = useState<Service[] | null>(null);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);

  // Compute: account
  const [ledgerAmount, setLedgerAmount] = useState("0.05");
  const [transferAmount, setTransferAmount] = useState("0.01");
  const [transferProvider, setTransferProvider] = useState(
    "0xa48f01287233509FD694a22Bf840225062E67836"
  );
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountResult, setAccountResult] = useState<Json>(null);

  // Compute: inference
  const [inferProvider, setInferProvider] = useState(
    "0xa48f01287233509FD694a22Bf840225062E67836"
  );
  const [inferMessage, setInferMessage] = useState(
    "What is the capital of France? Reply in one sentence."
  );
  const [inferLoading, setInferLoading] = useState(false);
  const [inferResult, setInferResult] = useState<Json>(null);

  async function post(endpoint: string, body: unknown): Promise<Json> {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async function handleUpload() {
    setUploadLoading(true);
    setUploadResult(null);
    try {
      const r = (await post("/api/storage/upload", {
        content: uploadContent,
        encrypted: uploadEncrypt,
      })) as Record<string, unknown>;
      setUploadResult(r);
      if (r.success && typeof r.rootHash === "string") {
        setRootHash(r.rootHash);
      }
    } catch (err) {
      setUploadResult({ success: false, error: String(err) });
    }
    setUploadLoading(false);
  }

  async function handleDownload() {
    if (!rootHash) {
      setDownloadResult({ success: false, error: "Enter a root hash first" });
      return;
    }
    setDownloadLoading(true);
    setDownloadResult(null);
    try {
      const r = await post("/api/storage/download", {
        rootHash,
        decrypt: downloadDecrypt,
      });
      setDownloadResult(r);
    } catch (err) {
      setDownloadResult({ success: false, error: String(err) });
    }
    setDownloadLoading(false);
  }

  async function handleKvWrite() {
    setKvLoading(true);
    setKvResult(null);
    try {
      const r = await post("/api/storage/kv-write", { key: kvKey, value: kvValue });
      setKvResult(r);
    } catch (err) {
      setKvResult({ success: false, error: String(err) });
    }
    setKvLoading(false);
  }

  async function handleListServices() {
    setServicesLoading(true);
    setServicesError(null);
    try {
      const r = (await post("/api/compute/list-services", {})) as Record<
        string,
        unknown
      >;
      if (r.success) {
        setServices((r.services as Service[]) ?? []);
      } else {
        setServicesError(String(r.error ?? "Failed to list services"));
        setServices(null);
      }
    } catch (err) {
      setServicesError(String(err));
      setServices(null);
    }
    setServicesLoading(false);
  }

  async function handleAccountAction(action: string) {
    setAccountLoading(true);
    setAccountResult(null);
    try {
      const body: Record<string, unknown> = { action };
      if (action === "create-ledger" || action === "deposit") {
        body.amount = ledgerAmount;
      }
      if (action === "transfer") {
        body.amount = transferAmount;
        body.provider = transferProvider;
        body.service = "inference";
      }
      const r = await post("/api/compute/setup-account", body);
      setAccountResult(r);
    } catch (err) {
      setAccountResult({ success: false, error: String(err) });
    }
    setAccountLoading(false);
  }

  async function handleInference() {
    setInferLoading(true);
    setInferResult(null);
    try {
      const r = await post("/api/compute/inference", {
        provider: inferProvider,
        message: inferMessage,
      });
      setInferResult(r);
    } catch (err) {
      setInferResult({ success: false, error: String(err) });
    }
    setInferLoading(false);
  }

  return (
    <div className="min-h-full flex-1 bg-zinc-50 px-6 py-10 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">0G Network Playground</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Test 0G Storage (upload / download / KV) and 0G Compute (services /
            ledger / inference). Requires{" "}
            <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs dark:bg-zinc-800">
              ZG_STORAGE_PRIVATE_KEY
            </code>{" "}
            in <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs dark:bg-zinc-800">.env.local</code>.
          </p>
        </header>

        {/* Storage upload */}
        <Section
          title="Storage — Upload"
          description="Write content to 0G Storage (content-addressed, Merkle-verified). Optional AES-256-GCM encryption."
        >
          <Field label="Content">
            <textarea
              value={uploadContent}
              onChange={(e) => setUploadContent(e.target.value)}
              rows={4}
              className={`${inputClass} font-mono`}
            />
          </Field>
          <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <input
              type="checkbox"
              checked={uploadEncrypt}
              onChange={(e) => setUploadEncrypt(e.target.checked)}
            />
            Encrypt before upload
          </label>
          <Button onClick={handleUpload} loading={uploadLoading}>
            Upload to 0G Storage
          </Button>
          <ResultBox data={uploadResult} />
        </Section>

        {/* Storage download */}
        <Section
          title="Storage — Download"
          description="Fetch content by root hash. The latest upload's hash auto-fills."
        >
          <Field label="Root hash">
            <input
              value={rootHash}
              onChange={(e) => setRootHash(e.target.value)}
              placeholder="0x..."
              className={`${inputClass} font-mono`}
            />
          </Field>
          <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <input
              type="checkbox"
              checked={downloadDecrypt}
              onChange={(e) => setDownloadDecrypt(e.target.checked)}
            />
            Decrypt after download
          </label>
          <Button onClick={handleDownload} loading={downloadLoading}>
            Download from 0G Storage
          </Button>
          <ResultBox data={downloadResult} />
        </Section>

        {/* Storage KV */}
        <Section
          title="Storage — KV Write"
          description="Store a key-value pair as a JSON blob on 0G Storage."
        >
          <Field label="Key">
            <input
              value={kvKey}
              onChange={(e) => setKvKey(e.target.value)}
              className={`${inputClass} font-mono`}
            />
          </Field>
          <Field label="Value">
            <textarea
              value={kvValue}
              onChange={(e) => setKvValue(e.target.value)}
              rows={3}
              className={`${inputClass} font-mono`}
            />
          </Field>
          <Button onClick={handleKvWrite} loading={kvLoading}>
            Write KV pair
          </Button>
          <ResultBox data={kvResult} />
        </Section>

        {/* Compute services */}
        <Section
          title="Compute — List services"
          description="Discover GPU inference providers on 0G Compute."
        >
          <Button onClick={handleListServices} loading={servicesLoading}>
            List services
          </Button>
          {servicesError && (
            <p className="text-xs text-red-500">{servicesError}</p>
          )}
          {services && (
            <div className="overflow-x-auto rounded-md ring-1 ring-zinc-200 dark:ring-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                  <tr>
                    <th className="px-2 py-1">Model</th>
                    <th className="px-2 py-1">Provider</th>
                    <th className="px-2 py-1">In/Out</th>
                    <th className="px-2 py-1">Verifiable</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s) => (
                    <tr
                      key={s.provider}
                      className="border-t border-zinc-200 dark:border-zinc-800"
                    >
                      <td className="px-2 py-1 font-mono">{s.model}</td>
                      <td className="px-2 py-1 font-mono">
                        <button
                          className="text-blue-600 hover:underline dark:text-blue-400"
                          onClick={() => {
                            setInferProvider(s.provider);
                            setTransferProvider(s.provider);
                          }}
                          title="Use this provider in inference + transfer below"
                        >
                          {s.provider.slice(0, 10)}…{s.provider.slice(-4)}
                        </button>
                      </td>
                      <td className="px-2 py-1 font-mono">
                        {s.inputPrice} / {s.outputPrice}
                      </td>
                      <td className="px-2 py-1">{s.verifiability || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* Compute account */}
        <Section
          title="Compute — Ledger account"
          description="Create the on-chain ledger, deposit A0GI, and transfer to a provider sub-account."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Ledger amount (A0GI)">
              <input
                value={ledgerAmount}
                onChange={(e) => setLedgerAmount(e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </Field>
            <Field label="Transfer amount (A0GI)">
              <input
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </Field>
          </div>
          <Field label="Transfer provider address">
            <input
              value={transferProvider}
              onChange={(e) => setTransferProvider(e.target.value)}
              className={`${inputClass} font-mono`}
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => handleAccountAction("create-ledger")}
              loading={accountLoading}
            >
              Create ledger
            </Button>
            <Button
              onClick={() => handleAccountAction("deposit")}
              loading={accountLoading}
              variant="secondary"
            >
              Deposit
            </Button>
            <Button
              onClick={() => handleAccountAction("transfer")}
              loading={accountLoading}
              variant="secondary"
            >
              Transfer to provider
            </Button>
            <Button
              onClick={() => handleAccountAction("get-balance")}
              loading={accountLoading}
              variant="secondary"
            >
              Get balance
            </Button>
          </div>
          <ResultBox data={accountResult} />
        </Section>

        {/* Compute inference */}
        <Section
          title="Compute — Inference"
          description="Send a chat message to a 0G Compute provider. Requires balance transferred to that provider above."
        >
          <Field label="Provider address">
            <input
              value={inferProvider}
              onChange={(e) => setInferProvider(e.target.value)}
              className={`${inputClass} font-mono`}
            />
          </Field>
          <Field label="Message">
            <textarea
              value={inferMessage}
              onChange={(e) => setInferMessage(e.target.value)}
              rows={3}
              className={`${inputClass} font-mono`}
            />
          </Field>
          <Button onClick={handleInference} loading={inferLoading}>
            Send to 0G Compute
          </Button>
          <ResultBox data={inferResult} />
        </Section>
      </div>
    </div>
  );
}
