import type { OllamaProvider } from '../../infra/providers/ollama.provider.js';
import type { ChunkRepository } from '../repositories/chunk.repository.js';
import type { FileRepository } from '../repositories/file.repository.js';
import { CodeAnalysisService, type Extension } from './code-analysis.service.js';
import type { FileDiscoveryService } from './file-discovery.service.js';
import type { ProjectDiscoveryService } from './project-discovery.service.js';

export class CodebaseIndexerService {
  constructor(
    private readonly fileDiscovery: FileDiscoveryService,
    private readonly projectDiscovery: ProjectDiscoveryService,
    private readonly ollama: OllamaProvider,
    private readonly fileRepo: FileRepository,
    private readonly chunkRepo: ChunkRepository,
  ) {}

  async execute(directory: string) {
    const projects = await this.projectDiscovery.search(directory);
    const files = await this.fileDiscovery.search(directory);
    for (const file of files) {
      const project = projects.find((p) => file.path.includes(p.path));
      if (!project) continue;
      const codeAnalysis = new CodeAnalysisService(file.extension as Extension);
      const chunks = codeAnalysis.analyse(file.content);

      let fileExisting = await this.fileRepo.findFile(project.id, file.name);

      if (!fileExisting) {
        fileExisting = await this.fileRepo.createFile({
          name: file.name,
          path: file.path,
          projectId: project.id,
          chunkSize: chunks.length,
        });
      }

      for (let i = 0; i < chunks.length; i++) {
        const chunkExisting = await this.chunkRepo.findChunk(fileExisting.id, i);
        if (!chunkExisting) {
          const embedding = await this.ollama.call(chunks[i].content as string);
          await this.chunkRepo.createChunk({
            chunkIndex: i,
            content: chunks[i].content,
            embeddings: embedding,
            fileId: fileExisting.id,
          });
          console.log('Finish Chunking');
        }
      }
    }
  }
}
