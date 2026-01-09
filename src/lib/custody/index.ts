import { APIClient } from "./apiClient";
import { login } from "./auth";
import { getWallets, getWalletByChain } from "./wallets";
import { register } from "./register";
import { createWallet } from "./createWallet";  
import { getSecret } from "./getSecret";
import { withdraw } from "./withdraw";
import type { WithdrawRequest } from "./types";

export class CustodyAPI {
  private client = new APIClient();

  setToken(token: string) {
    this.client.setToken(token);
  }

  login = (email: string, password: string) => login(this.client, email, password);
  register = (email: string, password: string) => register(this.client, email, password);
  getWallets = () => getWallets(this.client);
  getWalletByChain = (chain: string) => getWalletByChain(this.client, chain);
  createWallet = () => createWallet(this.client);
  getSecret = () => getSecret(this.client);
  withdraw = (payload: WithdrawRequest) => withdraw(this.client, payload);
}
