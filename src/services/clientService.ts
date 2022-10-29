import { ethers, Wallet } from "ethers";
import { Pool } from "pg";

export default class ClientService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async getClientPrivateKey(clientId: string | number): Promise<string> {
    const result = await this.pool.query(`SELECT * FROM clients WHERE id = ${clientId}`);
    const mnemonic = result.rows[0].mnemonic_phrase;
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    return wallet.privateKey;
  }

}
