export const CREDITS_ADDRESS =
  "0x36c4D178C8bF94c30CA8508FaB1FB4C20DB9d483" as const;

/// 1 MON = 10,000 tokens. Must match the on-chain constant.
export const TOKENS_PER_MON = BigInt(10000);

export const CREDITS_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "TOKENS_PER_MON",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "WEI_PER_TOKEN",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "topUp",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "consume",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenAmount", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenAmount", type: "uint256" }],
    outputs: [],
  },
  {
    type: "event",
    name: "ToppedUp",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "monAmount", type: "uint256", indexed: false },
      { name: "tokenAmount", type: "uint256", indexed: false },
      { name: "newBalance", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Consumed",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "tokenAmount", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Withdrawn",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "monAmount", type: "uint256", indexed: false },
      { name: "tokenAmount", type: "uint256", indexed: false },
      { name: "newBalance", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
] as const;
