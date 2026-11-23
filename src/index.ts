import { CronJob } from 'cron';
import { env } from './configs/env.config.js';
import { ChunkRepository } from './core/repositories/chunk.repository.js';
import { FileRepository } from './core/repositories/file.repository.js';
import { ProjectRepository } from './core/repositories/project.repository.js';
import { CodebaseIndexerService } from './core/services/codebase-indexer.service.js';
import { FileDiscoveryService } from './core/services/file-discovery.service.js';
import { ProjectDiscoveryService } from './core/services/project-discovery.service.js';
import { Database } from './infra/database/connection/index.js';
import { OllamaProvider } from './infra/providers/ollama.provider.js';

const database = new Database();
const projectRepo = new ProjectRepository(database);
const fileRepo = new FileRepository(database);
const chunkRepo = new ChunkRepository(database);
const projectDiscovery = new ProjectDiscoveryService(projectRepo);
const fileDiscovery = new FileDiscoveryService();
const ollama = new OllamaProvider();
const codebaseIndexer = new CodebaseIndexerService(
  fileDiscovery,
  projectDiscovery,
  ollama,
  fileRepo,
  chunkRepo,
);

async function main() {
  await codebaseIndexer.execute(env.INPUT_FOLDER);
}

new CronJob('0 0 1 * * *', main, null, true, 'America/Sao_Paulo');
