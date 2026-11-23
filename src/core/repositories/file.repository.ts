import { and, eq } from 'drizzle-orm';
import type { Database } from '../../infra/database/connection/index.js';
import { fileModel } from '../../infra/database/models/file.model.js';

export class FileRepository {
  constructor(private readonly database: Database) {}

  async findFile(projectId: number, fileName: string) {
    const [file] = await this.database.db
      .select()
      .from(fileModel)
      .where(and(eq(fileModel.name, fileName), eq(fileModel.projectId, projectId)));

    return file ?? null;
  }

  async createFile(data: typeof fileModel.$inferInsert) {
    const [file] = await this.database.db
      .insert(fileModel)
      .values(data)
      .returning()
      .onConflictDoNothing();

    return file ?? null;
  }
}
