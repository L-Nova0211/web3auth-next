import type { SafeEventEmitterProvider } from "@web3auth/base";
import { AptosAccount , FaucetClient, AptosClient } from "aptos";

export default class EthereumRpc {
  private provider: SafeEventEmitterProvider;
  NODE_URL ="https://fullnode.devnet.aptoslabs.com";
  FAUCET_URL ="https://faucet.devnet.aptoslabs.com";
  aptosCoinStore = "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>";
  dummyAddress = "0xb87ff513c4fd655ab3b52d789f32fa840e0ece8450d6a227e55ca7d7e16bb6be";


  constructor(provider: SafeEventEmitterProvider) {
    this.provider = provider;
  }

  async getPrivateKey(): Promise<any> {
    try {
      const privateKey = await this.provider.request({
        method: "private_key",
      });

      return privateKey;
    } catch (error) {
      return error as string;
    }
  }



  async getAptosAccount(): Promise<any> {
    try {
      const privateKey = await this.getPrivateKey();
      // convert private key to uint8array
      const privateKeyUint8Array = new Uint8Array(privateKey.split(',').map(Number));
      console.log(privateKeyUint8Array)
      const aptosAccount = new AptosAccount();
      return aptosAccount;
    } catch (error) {
      return error;
    }
  }

  async getAccounts(): Promise<any> {
    try {
      const aptosAccount = await this.getAptosAccount();
      const address = aptosAccount.address();
      return address;
    } catch (error) {
      return error;
    }
  }

  async getAirdrop(): Promise<any> {
    const address = await this.getAccounts();
    const faucetClient = new FaucetClient(this.NODE_URL, this.FAUCET_URL);
    const response = await faucetClient.fundAccount(address, 100_000_000);
    return response;

  }

  async getBalance(): Promise<any> {
    try {
      const aptosAccount = await this.getAptosAccount();
      const client = new AptosClient(this.NODE_URL);
      let resources = await client.getAccountResources(aptosAccount.address());
      let accountResource = resources.find((r) => r.type === this.aptosCoinStore);
      let balance = parseInt((accountResource?.data as any).coin.value);
      return balance;
    } catch (error) {
      return error as string;
    }
  }

  async sendTransaction(): Promise<any> {
    try {
      const aptosAccount = await this.getAptosAccount();
      const client = new AptosClient(this.NODE_URL);
      const payload = {
      type: "entry_function_payload",
      function: "0x1::coin::transfer",
      type_arguments: ["0x1::aptos_coin::AptosCoin"],
      arguments: [aptosAccount.address().hex(), 717], // sending funds to self
    };
    const txnRequest = await client.generateTransaction(aptosAccount.address(), payload);
    const signedTxn = await client.signTransaction(aptosAccount, txnRequest);
    const transactionRes = await client.submitTransaction(signedTxn);
    const hash = await client.waitForTransaction(transactionRes.hash);
    return hash;
    } catch (error) {
      return error as string;
    }

  }




}