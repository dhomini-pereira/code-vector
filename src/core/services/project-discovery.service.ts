import path from 'node:path';
import fg from 'fast-glob';
import { LanguageEnum } from '../../infra/database/models/enum.model.js';
import type { ProjectRepository } from '../repositories/project.repository.js';

interface Project {
  id: number;
  name: string;
  path: string;
  languages: string[];
  identifiers: string[];
}

const LANGUAGE_IDENTIFIERS: Record<LanguageEnum, string[]> = {
  javascript: ['package.json', 'jsconfig.json'],
  typescript: ['tsconfig.json'],
  java: ['pom.xml', 'build.gradle', 'build.gradle.kts'],
  rust: ['Cargo.toml'],
  python: ['pyproject.toml', 'setup.py', 'requirements.txt'],
  unknown: [],
};

export class ProjectDiscoveryService {
  constructor(private readonly projectRepo: ProjectRepository) {}

  async search(directory: string): Promise<Project[]> {
    const identifiers = Object.values(LANGUAGE_IDENTIFIERS).flat();

    const files = await fg(`**/{${identifiers.join(',')}}`, {
      cwd: directory,
      ignore: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/target/**',
        '**/.venv/**',
        '**/venv/**',
      ],
    });

    const projects = new Map<string, Project>();

    for (const file of files) {
      const projectPath = path.dirname(file);

      const languages = Object.entries(LANGUAGE_IDENTIFIERS)
        .filter(([, markers]) => markers.includes(path.basename(file)))
        .map(([language]) => language) as LanguageEnum[];

      const existing = projects.get(projectPath);

      if (existing) {
        existing.languages = [...new Set([...existing.languages, ...languages])];
        existing.identifiers.push(path.basename(file));
        continue;
      }

      let id: number;
      const foundProject = await this.projectRepo.findProject(
        path.basename(projectPath) || path.basename(directory) || projectPath,
      );

      if (!foundProject) {
        const p = await this.projectRepo.createProject({
          name: path.basename(projectPath) || path.basename(directory),
          path: projectPath,
          language: languages.length > 0 ? languages[0] : LanguageEnum.unknown,
        });
        id = p.id;
      } else id = foundProject.id;

      projects.set(projectPath, {
        name: path.basename(projectPath) || path.basename(directory),
        path: projectPath,
        languages,
        identifiers: [path.basename(file)],
        id: id,
      });
    }

    return [...projects.values()];
  }
}
