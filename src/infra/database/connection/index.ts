import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../../../configs/env.config.js';

export class Database {
  public readonly db: NodePgDatabase<Record<string, never>> & { $client: Pool };

  constructor() {
    const pool = new Pool({
      connectionString: env.DATABASE_URL,
    });
    this.db = drizzle(pool);
  }
}
