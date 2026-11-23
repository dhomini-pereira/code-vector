import { z } from 'zod';

export const envSchema = z.object({
  OLLAMA_MODEL_NAME: z.string(),
  DATABASE_URL: z.string(),
  INPUT_FOLDER: z.string(),
});
