import { ethers } from "ethers";
import { Pool } from "pg";

export default class UserService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async storeWallet(userId: number, clientId: string | number, mnemonicPhrase: string, mnemonicPath: string) {
    await this.pool.query(`
      INSERT INTO users (
        client_id,
        user_id,
        mnemonic_phrase,
        mnemonic_path) VALUES ($1, $2, $3, $4)`,
      [
        clientId, 
        userId, 
        mnemonicPhrase, 
        mnemonicPath]);
  }

  async getUserAddress(userId: number, clientId: string | number): Promise<string> {
    const result = await this.pool.query(`
      SELECT * FROM users WHERE user_id = ${userId} AND client_id = ${clientId}`);
    const mnemonic = result.rows[0].mnemonic_phrase;
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    return wallet.address;
  }

  async getUserPrivateKey(userId: number, clientId: string | number): Promise<string> {
    const result = await this.pool.query(`
      SELECT * FROM users WHERE user_id = ${userId} AND client_id = ${clientId}`);
    const mnemonic = result.rows[0].mnemonic_phrase;
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    return wallet.privateKey;
  }
}