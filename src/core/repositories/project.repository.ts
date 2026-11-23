import { like, or } from 'drizzle-orm';
import type { Database } from '../../infra/database/connection/index.js';
import { projectModel } from '../../infra/database/models/project.model.js';

export class ProjectRepository {
  constructor(private readonly database: Database) {}

  async findProject(nameOrPath: string) {
    const [project] = await this.database.db
      .select()
      .from(projectModel)
      .where(
        or(
          like(projectModel.name, `%${nameOrPath}%`),
          like(projectModel.path, `%${nameOrPath}%`),
        ),
      );

    return project ?? null;
  }

  async createProject(data: typeof projectModel.$inferInsert) {
    const [project] = await this.database.db
      .insert(projectModel)
      .values(data)
      .returning()
      .onConflictDoNothing();

    return project ?? null;
  }
}
