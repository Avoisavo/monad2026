export type Room = "fortune" | "laundry" | "sushi" | "coffee";

export type PinnedFinding = {
  label: string;
  text: string;
};

// ── 0G Compute models ────────────────────────────────────────────
// Provider addresses match the cannes2026 reference project (chainId 16602).
// Each Brain picks one model — it's per-iNFT, not global.

export type ZGModelId = "qwen-2.5-7b" | "gpt-oss-20b" | "gemma-3-27b";

export type ZGModel = {
  id: ZGModelId;
  label: string;
  modelName: string;
  provider: `0x${string}`;
  description: string;
};

export const ZG_COMPUTE_MODELS: ZGModel[] = [
  {
    id: "qwen-2.5-7b",
    label: "Qwen 2.5 7B Instruct",
    modelName: "qwen/qwen-2.5-7b-instruct",
    provider: "0xa48f01287233509FD694a22Bf840225062E67836",
    description: "Balanced general-purpose. Fast & cheap.",
  },
  {
    id: "gpt-oss-20b",
    label: "GPT-OSS 20B",
    modelName: "openai/gpt-oss-20b",
    provider: "0x8e60d466FD16798Bec4868aa4CE38586D5590049",
    description: "Strong reasoning, longer context.",
  },
  {
    id: "gemma-3-27b",
    label: "Gemma 3 27B IT",
    modelName: "google/gemma-3-27b-it",
    provider: "0x69Eb5a0BD7d0f4bF39eD5CE9Bd3376c61863aE08",
    description: "Multilingual, instruction-tuned.",
  },
];

export const MODEL_BY_ID: Record<ZGModelId, ZGModel> = ZG_COMPUTE_MODELS.reduce(
  (acc, m) => {
    acc[m.id] = m;
    return acc;
  },
  {} as Record<ZGModelId, ZGModel>,
);

// ── Brain config ─────────────────────────────────────────────────

export type BrainConfig = {
  room: Room;
  roomLabel: string;

  // on-chain identity (premint values for Mode A)
  tokenId: number;
  owner: `0x${string}`;
  rootHash: `0x${string}`;

  // persona
  name: string;
  kbLabel: string;

  // discovery / routing
  domainTags: string;
  serviceOfferings: string;

  // runtime
  model: ZGModelId;
  pricePerQueryTokens: number;

  pinned: PinnedFinding[];
};

export const ROOMS: Room[] = ["fortune", "laundry", "sushi", "coffee"];

export const ROOM_TO_BRAIN: Record<Room, BrainConfig> = {
  fortune: {
    room: "fortune",
    roomLabel: "FORTUNE TELLER",
    tokenId: 17,
    owner: "0xCe4D12c8E6f8c4b3A9f0D7E1b8A2C5d6e7F8A9b0",
    rootHash: "0xa1f2e3d4c5b6a7988889abcde1f2e3d4c5b6a7988889abcde1f2e3d4c5b6a798",
    name: "Madame Cipher",
    kbLabel: "Strategy Almanac",
    domainTags: "strategy,forecasting,creative-direction",
    serviceOfferings: "trend-reads,investor-pattern-analysis,narrative-framing",
    model: "gemma-3-27b",
    pricePerQueryTokens: 3,
    pinned: [
      { label: "pattern", text: "Q3 retail beats correlated with weather inversions" },
      { label: "lead", text: "Same investor footprint across 3 niche launches" },
      { label: "warning", text: "Press cycle on cohort exits next month" },
    ],
  },
  laundry: {
    room: "laundry",
    roomLabel: "LAUNDROMAT",
    tokenId: 23,
    owner: "0xA1B2C3D4E5F60718293A4b5C6D7E8f9012345678",
    rootHash: "0xb2e3f4d5c6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3",
    name: "Suds Suzuki",
    kbLabel: "Ops Post-Mortems",
    domainTags: "operations,maintenance,incident-response",
    serviceOfferings: "rca,process-tuning,downtime-analysis",
    model: "qwen-2.5-7b",
    pricePerQueryTokens: 1,
    pinned: [
      { label: "incident", text: "14:22 outage root-caused to staging migration" },
      { label: "process", text: "Weekly drum-and-rinse rotation cut machine wear 22%" },
      { label: "lead", text: "Same wallet appears in laundromat receipts" },
    ],
  },
  sushi: {
    room: "sushi",
    roomLabel: "SUSHI BAR",
    tokenId: 31,
    owner: "0xF3e8D7c6B5a4938271605F4e3D2c1b0a9988776e",
    rootHash: "0xc3a4b5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192",
    name: "Chef Toro",
    kbLabel: "Omakase Service Book",
    domainTags: "hospitality,menus,supply-chain",
    serviceOfferings: "menu-design,supplier-routing,service-flow",
    model: "gpt-oss-20b",
    pricePerQueryTokens: 2,
    pinned: [
      { label: "menu", text: "Bluefin loin holds 4 days vacuum-sealed at -1°C" },
      { label: "service", text: "Pour first, plate second" },
      { label: "supplier", text: "New Tsukiji broker Mondays only" },
    ],
  },
  coffee: {
    room: "coffee",
    roomLabel: "COFFEE HOUSE",
    tokenId: 42,
    owner: "0xb4C5d6e7f8091a2B3c4D5E6F708192A3b4C5d6e7",
    rootHash: "0xd4b5c6d7e8f9091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192",
    name: "Banana Barista",
    kbLabel: "Cafe Launch Notes",
    domainTags: "cafe-ops,retail,beverages",
    serviceOfferings: "menu-design,queue-analysis,supplier-routing",
    model: "qwen-2.5-7b",
    pricePerQueryTokens: 1,
    pinned: [
      { label: "pattern", text: "Morning queue spikes after 8:40" },
      { label: "margin", text: "Croissant loss tracked against refill drinks" },
      { label: "lead", text: "Same wallet appears in laundromat receipts" },
    ],
  },
};

export function getBrain(room: Room): BrainConfig {
  return ROOM_TO_BRAIN[room];
}

export const ALL_BRAINS: BrainConfig[] = ROOMS.map((r) => ROOM_TO_BRAIN[r]);

// localStorage key used by the front-desk fake mint flow to stash a draft
// persona keyed by room.
export const HOST_DRAFT_KEY = (room: Room) => `brain:draft:${room}`;

export type HostDraft = {
  room: Room;
  name: string;
  kbLabel: string;
  model: ZGModelId;
  domainTags: string;
  serviceOfferings: string;
  pricePerQueryTokens: number;
  knowledgePdfName?: string;
  knowledgePdfSize?: number;
  knowledgePdfSha256?: `0x${string}`;
  // populated after the on-chain mint
  tokenId?: number;
  mintTx?: `0x${string}`;
  mintedAt?: number;
};

// Derive a 2-letter face avatar from a display name (first letters of the
// first two words; falls back to the first 2 chars).
export function initials(name: string): string {
  if (!name) return "??";
  const trimmed = name.trim();
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}
