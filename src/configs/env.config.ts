import { envSchema } from '../shared/schemas/env.schema.js';

export const env = envSchema.parse(process.env);
