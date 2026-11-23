import * as p from 'drizzle-orm/pg-core';

export enum LanguageEnum {
  python = 'python',
  java = 'java',
  typescript = 'typescript',
  javascript = 'javascript',
  rust = 'rust',
  unknown = 'unknown',
}

export const languageEnum = p.pgEnum('language', LanguageEnum);
