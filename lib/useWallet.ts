"use client";
import { useState, useCallback } from "react";
import { ethers } from "ethers";

const MONAD_TESTNET = {
  chainId: "0x279F", // 10143
  chainName: "Monad Testnet",
  rpcUrls: ["https://testnet-rpc.monad.xyz"],
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  blockExplorerUrls: ["https://testnet.monadexplorer.com"],
};

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [connecting, setConnecting] = useState(false);

  const connect = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eth = (window as any).ethereum;
    if (!eth) {
      alert("Please install MetaMask to connect your wallet.");
      return;
    }
    setConnecting(true);
    try {
      const prov = new ethers.BrowserProvider(eth);
      const accounts: string[] = await prov.send("eth_requestAccounts", []);
      setAddress(accounts[0]);
      setProvider(prov);

      // Switch to Monad Testnet
      try {
        await eth.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: MONAD_TESTNET.chainId }],
        });
      } catch (switchError: unknown) {
        // Chain not added yet — add it
        if ((switchError as { code?: number }).code === 4902) {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [MONAD_TESTNET],
          });
        }
      }
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setProvider(null);
  }, []);

  return { address, provider, connecting, connect, disconnect };
}
