import * as p from 'drizzle-orm/pg-core';
import { fileModel } from './file.model.js';

export const chunkModel = p.pgTable('chunks', {
  id: p.bigint({ mode: 'number' }).generatedByDefaultAsIdentity(),
  content: p.text().notNull(),
  embeddings: p.vector({ dimensions: 1024 }).notNull(),
  chunkIndex: p.smallint('chunk_index').notNull(),
  fileId: p
    .bigint('file_id', { mode: 'number' })
    .notNull()
    .references(() => fileModel.id),
  createdAt: p.timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
  updatedAt: p.timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow(),
});
