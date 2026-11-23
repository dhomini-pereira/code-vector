import * as p from 'drizzle-orm/pg-core';
import { projectModel } from './project.model.js';

export const fileModel = p.pgTable(
  'files',
  {
    id: p.bigint({ mode: 'number' }).generatedByDefaultAsIdentity(),
    name: p.varchar({ length: 100 }).notNull(),
    path: p.varchar({ length: 500 }).notNull(),
    chunkSize: p.integer('chunk_size').notNull().default(0),
    projectId: p
      .bigint('project_id', { mode: 'number' })
      .notNull()
      .references(() => projectModel.id),
    createdAt: p
      .timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow(),
    updatedAt: p
      .timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow(),
  },
  (table) => [p.unique().on(table.name, table.path)],
);
