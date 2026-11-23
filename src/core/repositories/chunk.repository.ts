import { and, eq } from 'drizzle-orm';
import type { Database } from '../../infra/database/connection/index.js';
import { chunkModel } from '../../infra/database/models/chunk.model.js';

export class ChunkRepository {
  constructor(private readonly database: Database) {}

  async findChunk(fileId: number, index?: number) {
    const [chunk] = await this.database.db
      .select()
      .from(chunkModel)
      .where(
        and(
          eq(chunkModel.fileId, fileId),
          index ? eq(chunkModel.chunkIndex, index) : undefined,
        ),
      );

    return chunk ?? null;
  }

  async createChunk(data: typeof chunkModel.$inferInsert) {
    const [chunk] = await this.database.db
      .insert(chunkModel)
      .values(data)
      .returning()
      .onConflictDoNothing();

    return chunk ?? null;
  }
}
