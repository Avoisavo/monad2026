import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 0G SDK + ethers must NOT be bundled by Turbopack — they use dynamic
  // requires and a custom HTTP transport that breaks when bundled.
  serverExternalPackages: [
    "@0gfoundation/0g-ts-sdk",
    "@0glabs/0g-serving-broker",
    "ethers",
  ],
};

export default nextConfig;
