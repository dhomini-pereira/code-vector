import ollama from 'ollama';
import { env } from '../../configs/env.config.js';

export class OllamaProvider {
  async call(prompt: string) {
    const request = await ollama.embeddings({
      model: env.OLLAMA_MODEL_NAME,
      prompt,
      options: {
        embedding_only: true,
      },
    });

    const response = request.embedding;

    return response;
  }
}
