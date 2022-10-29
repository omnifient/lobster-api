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

  async getCollectionAddresses(clientId: string | number): Promise<any[]> {
    const result = await this.pool.query(`SELECT * FROM collections WHERE client_id = ${clientId}`);
    return result.rows.map((row) => row.contract_address);
  }

  async insertCollection(clientId: string | number, contractAddress: string) {
    await this.pool.query(`INSERT INTO collections (client_id, contract_address) VALUES (${clientId}, '${contractAddress}')`);
  }
}
