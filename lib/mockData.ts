export interface Memory {
  id: number;
  title: string;
  category: string;
  preview: string;
  content: string;
  price: string; // in MON, "0" = free
  seller: string;
  purchaseCount: number;
  tags: string[];
  contentHash: string;
  createdAt: string;
}

export const MOCK_MEMORIES: Memory[] = [
  {
    id: 1,
    title: "Winning Monad Hackathon Patterns",
    category: "hackathon",
    preview: "Analysis of previous Monad-winning projects: what they built, how they demoed, and what judges rewarded...",
    content: `Monad hackathon winners consistently share these patterns:

1. VISUAL SPEED DEMO — Show Monad's TPS advantage visually. A counter ticking up at 10,000 tx/s on screen beats any slide.

2. AI AGENT INTEGRATION — Agents that autonomously execute transactions score extra points. Judges love autonomous action.

3. MICRO-PAYMENT RAILS — Tipping, per-second billing, streaming payments. Low fees make previously uneconomical use cases viable.

4. SMART ACCOUNT UX — Gasless transactions, social login, passkey wallets. Hide the crypto complexity.

5. TRANSPARENT COORDINATION — Escrow, DAO voting, group agreements. On-chain trust primitives.

DEMO TIP: Spend 70% of build time on the demo flow. Peer voting rewards WOW moments, not elegant code.

PITCH TIP: Open with a 20-second story. "Sarah is a freelancer in KL. Her client in Tokyo owes her RM500. A bank wire takes 5 days and costs RM80 in fees. With this app..." — judges vote with their hearts first.`,
    price: "0.01",
    seller: "0x1234...abcd",
    purchaseCount: 47,
    tags: ["monad", "hackathon", "strategy"],
    contentHash: "0xabc123def456789",
    createdAt: "2026-05-14",
  },
  {
    id: 2,
    title: "Solidity Gas Optimization Playbook",
    category: "engineering",
    preview: "12 battle-tested patterns to cut your contract gas costs by 40–70%...",
    content: `Gas Optimization Patterns (Solidity 0.8+):

1. PACK STRUCTS — Put uint8, bool, uint16 together. They share a 32-byte slot.
   Bad:  bool a; uint256 b; bool c; // 3 slots
   Good: bool a; bool c; uint256 b; // 2 slots

2. CALLDATA OVER MEMORY — For read-only function params, use calldata.
   Saves ~200 gas per call on arrays.

3. CACHE STORAGE READS — Never read storage twice in a loop.
   uint256 len = array.length; // cache it

4. EVENTS > STORAGE — For historical data you only need to query, emit events.
   10x cheaper than storage writes.

5. IMMUTABLE FOR CONSTANTS — Set in constructor, never changes. Free to read.

6. UNCHECKED ARITHMETIC — Use unchecked{} in loops where overflow is impossible.
   Saves ~30 gas per operation.

7. SHORT-CIRCUIT BOOLEANS — Put cheap checks before expensive ones in &&/||.

8. BATCH WITH MULTICALL — One tx for many calls. Amortize base tx cost.

9. MINIMAL PROXY (EIP-1167) — For cloning contracts. 10x cheaper deployment.

10. AVOID ZERO-TO-NONZERO WRITES — 20,000 gas vs 5,000 for nonzero-to-nonzero.
    Initialize storage to 1 instead of 0 if you'll toggle it.`,
    price: "0.005",
    seller: "0xabcd...ef01",
    purchaseCount: 134,
    tags: ["solidity", "gas", "evm"],
    contentHash: "0xdef789abc012345",
    createdAt: "2026-05-10",
  },
  {
    id: 3,
    title: "Claude API Prompt Engineering for Agents",
    category: "ai",
    preview: "Prompts that make AI agents effective at crypto and onchain reasoning tasks...",
    content: `Effective Claude prompts for crypto AI agents:

SYSTEM PROMPT TEMPLATE FOR TRADING AGENTS:
"You are a DeFi analyst with access to real-time on-chain data. When analyzing opportunities: 1) Check liquidity depth before size, 2) Flag unusual volume (>3x 7-day average), 3) Never recommend positions >2% of pool TVL. Format findings as JSON with fields: opportunity, confidence (0-1), risks[], recommended_action."

CONTRACT REVIEW PROMPT:
"Review this Solidity contract. For each finding output: severity (critical/high/medium/low), location (function name + line), description, recommendation. Focus on: reentrancy, access control, integer operations, and economic attacks."

MEMORY INJECTION PATTERN:
Wrap purchased memories like this:
---TRUSTED CONTEXT START---
Source: Memory Market #[id], verified on Monad
[memory content here]
---TRUSTED CONTEXT END---
Use this context as ground truth for the following question:

TOKEN SENTIMENT SUMMARY PROMPT:
"Summarize the last 24h of [TOKEN] in exactly 3 bullets: price action, on-chain signals, and sentiment. Each bullet max 15 words. Target audience: non-technical investor."`,
    price: "0.015",
    seller: "0x2468...1357",
    purchaseCount: 201,
    tags: ["ai", "claude", "prompts", "agents"],
    contentHash: "0xmno901pqr234567",
    createdAt: "2026-05-15",
  },
  {
    id: 4,
    title: "Monad Testnet Developer Quick-Start",
    category: "devtools",
    preview: "Everything you need to start building on Monad testnet: RPC, faucet, config, gotchas...",
    content: `Monad Testnet Config:

Chain ID: 10143
RPC URL: https://testnet-rpc.monad.xyz
Explorer: https://testnet.monadexplorer.com
Faucet: https://faucet.monad.xyz

HARDHAT CONFIG (hardhat.config.ts):
networks: {
  monadTestnet: {
    url: "https://testnet-rpc.monad.xyz",
    chainId: 10143,
    accounts: [process.env.PRIVATE_KEY!],
  }
}

METAMASK SETUP:
Network Name: Monad Testnet
RPC URL: https://testnet-rpc.monad.xyz
Chain ID: 10143
Currency Symbol: MON
Block Explorer: https://testnet.monadexplorer.com

VIEM / WAGMI CONFIG:
import { defineChain } from 'viem'
export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz'] } },
  blockExplorers: { default: { name: 'MonadExplorer', url: 'https://testnet.monadexplorer.com' } },
})

GOTCHAS:
- Block time ~0.5s, much faster than Ethereum. Don't wait 15s for confirmation.
- Use ethers.parseEther() for MON amounts like ETH.
- Gas price: auto works. Don't hardcode.`,
    price: "0",
    seller: "0x1111...2222",
    purchaseCount: 612,
    tags: ["monad", "devtools", "setup", "testnet"],
    contentHash: "0xstu567vwx890123",
    createdAt: "2026-05-01",
  },
  {
    id: 5,
    title: "DeFi Protocol Security Checklist",
    category: "security",
    preview: "15-point audit checklist before launching any DeFi protocol to mainnet...",
    content: `Pre-Launch DeFi Security Checklist:

CRITICAL (must fix before launch):
☐ 1. Reentrancy guards on all external calls (use ReentrancyGuard or CEI pattern)
☐ 2. Access control — every privileged function has require(msg.sender == owner)
☐ 3. Integer overflow — using Solidity 0.8+ or SafeMath
☐ 4. Flash loan attack vectors reviewed (especially price manipulation via AMM)
☐ 5. Emergency pause mechanism (OpenZeppelin Pausable)

HIGH (fix before launch):
☐ 6. Oracle manipulation resistance — use TWAP, not spot price
☐ 7. Front-running protection on sensitive operations
☐ 8. Upgrade proxy risks — if upgradeable, timelocked admin
☐ 9. All state changes emit events

MEDIUM:
☐ 10. Time-lock on admin functions (min 48h)
☐ 11. Max input validation (prevent dust attacks)
☐ 12. Slippage protection on swaps

PRE-DEPLOY:
☐ 13. Fuzzing tests (Foundry: forge fuzz)
☐ 14. Invariant tests
☐ 15. Mainnet fork test with realistic amounts

TOOLS: Slither (static analysis), Echidna (fuzzing), Foundry (testing)`,
    price: "0.02",
    seller: "0x9876...5432",
    purchaseCount: 89,
    tags: ["security", "defi", "audit", "checklist"],
    contentHash: "0xghi345jkl678901",
    createdAt: "2026-05-08",
  },
  {
    id: 6,
    title: "KL Web3 Builder Community Map",
    category: "networking",
    preview: "Active communities, key people, and events in the Kuala Lumpur Web3 ecosystem...",
    content: `KL Web3 Builder Ecosystem (May 2026):

ACTIVE COMMUNITIES:
- Malaysia Web3 Builders (Telegram, ~2.4k members) — most active
- ETH Malaysia (Discord) — monthly meetups, Mid Valley area
- Solana KL (Twitter/X @SolanaKL) — quarterly hackathons
- Taylor's University Blockchain Club — weekly sessions on campus

KEY EVENTS:
- Monthly ETH KL Meetup (usually 3rd Thursday, Bangsar/KL Sentral area)
- Monad Blitz KL — you are HERE (Taylor's, May 16)
- KL Tech Week — annual, usually August

ACCELERATORS / GRANTS:
- Cradle Fund — Malaysian gov-backed, crypto-friendly since 2024
- Atom+ Accelerator — early stage, accepts crypto/Web3 projects
- Monad Foundation grants — for ecosystem builders post-hackathon

UNIVERSITIES WITH ACTIVE BLOCKCHAIN CLUBS:
- Taylor's (you are here)
- Monash Malaysia
- UTAR
- Multimedia University (MMU)

PRO TIP: Post your project on the Malaysia Web3 Builders Telegram after the hackathon. The community actively shares and amplifies.`,
    price: "0.008",
    seller: "0x3333...4444",
    purchaseCount: 34,
    tags: ["networking", "malaysia", "kl", "community"],
    contentHash: "0xyza123bcd456789",
    createdAt: "2026-05-13",
  },
];

export const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "hackathon", label: "Hackathon" },
  { id: "engineering", label: "Engineering" },
  { id: "ai", label: "AI" },
  { id: "security", label: "Security" },
  { id: "devtools", label: "Dev Tools" },
  { id: "networking", label: "Networking" },
];

export const CATEGORY_STYLES: Record<string, string> = {
  hackathon: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  engineering: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  ai: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  security: "text-red-400 bg-red-400/10 border-red-400/20",
  devtools: "text-green-400 bg-green-400/10 border-green-400/20",
  networking: "text-pink-400 bg-pink-400/10 border-pink-400/20",
};
