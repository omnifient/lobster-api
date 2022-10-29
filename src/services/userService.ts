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
}