import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';

interface FileEntry {
  name: string;
  extension: string;
  content: string;
  path: string;
}

export class FileDiscoveryService {
  async search(directory: string) {
    const files = await fg(
      ['**/*.ts', '**/*.js', '**/*.py', '**/*.rs', '**/*.cjs', '**/*.mjs', '**/*.java'],
      {
        cwd: directory,
        onlyFiles: true,
        dot: true,
        ignore: [
          '**/node_modules/**',
          '**/.git/**',
          '**/dist/**',
          '**/build/**',
          '**/target/**',
          '**/.venv/**',
          '**/venv/**',
          '**/package-lock.json',
        ],
      },
    );

    return Promise.all(
      files.map(async (file): Promise<FileEntry> => {
        const fullPath = path.join(directory, file);

        return {
          name: path.basename(file, path.extname(file)) + path.extname(file),
          extension: path.extname(file),
          path: file,
          content: await fs.readFile(fullPath, 'utf-8'),
        };
      }),
    );
  }
}
