import * as p from 'drizzle-orm/pg-core';
import { languageEnum } from './enum.model.js';

export const projectModel = p.pgTable(
  'projects',
  {
    id: p.bigint({ mode: 'number' }).generatedByDefaultAsIdentity(),
    name: p.varchar({ length: 255 }).notNull().unique(),
    path: p.varchar({ length: 500 }).notNull().unique(),
    language: languageEnum().default('unknown'),
    createdAt: p
      .timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow(),
    updatedAt: p
      .timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow(),
  },
  (table) => [p.unique().on(table.name, table.path)],
);
