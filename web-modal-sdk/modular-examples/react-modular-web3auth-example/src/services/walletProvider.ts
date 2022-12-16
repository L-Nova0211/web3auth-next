import { SafeEventEmitterProvider } from "@web3auth/base";
import ethProvider from "./ethProvider";
import solanaProvider from "./solanaProvider";
import tezosProvider  from "./tezosProvider";

export interface IWalletProvider {
  getAccounts: () => Promise<any>;
  getBalance: () => Promise<any>;
  signAndSendTransaction: () => Promise<void>;
  signTransaction: () => Promise<void>;
  signMessage: () => Promise<void>;
}

export const getWalletProvider = (chain: string, provider: SafeEventEmitterProvider, uiConsole: any): IWalletProvider => {
  if (chain === "solana") {
    return solanaProvider(provider, uiConsole);
  } else if (chain === "tezos") {
    return tezosProvider(provider, uiConsole);
  }
  return ethProvider(provider, uiConsole);
};
