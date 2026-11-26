import { and, cosineDistance, desc, eq, gt, sql } from 'drizzle-orm';
import type { Database } from '../../infra/database/connection/index.js';
import { chunkModel } from '../../infra/database/models/chunk.model.js';
import { fileModel } from '../../infra/database/models/file.model.js';
import { projectModel } from '../../infra/database/models/project.model.js';

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

  async searchKnowledge(embedding: number[]) {
    const similarity = sql<number>`1 - (${cosineDistance(chunkModel.embeddings, embedding)})`;
    const results = await this.database.db
      .select({
        id: chunkModel.id,
        content: chunkModel.content,
        similarity: similarity,
        project: {
          name: projectModel.name,
          path: projectModel.path,
          language: projectModel.language,
        },
        file: {
          name: fileModel.name,
          path: fileModel.path,
        },
      })
      .from(chunkModel)
      .innerJoin(fileModel, eq(chunkModel.fileId, fileModel.id))
      .innerJoin(projectModel, eq(fileModel.projectId, projectModel.id))
      .where(gt(similarity, 0.5))
      .orderBy((t) => desc(t.similarity))
      .limit(10);

    return results ?? [];
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
