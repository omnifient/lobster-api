import { Pool } from "pg";

export default class ClientService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

}
