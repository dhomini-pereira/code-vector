import TreeSitter, { type Language, type SyntaxNode } from 'tree-sitter';
import JavaParser from 'tree-sitter-java';
import JavaScriptParser from 'tree-sitter-javascript';
import JSONParser from 'tree-sitter-json';
import PythonParser from 'tree-sitter-python';
import RustParser from 'tree-sitter-rust';
import TypeScriptParser from 'tree-sitter-typescript';

interface LanguageConfig {
  extensions: string[];
  parser: Language;
  nodeTypes: string[];
  containerTypes?: string[];
}

interface CodeChunk {
  type: string;
  name: string;
  content: string;
  startLine: number;
  endLine: number;
  embedding?: number[];
}

interface TraversalContext {
  parentName?: string;
}

export type Extension = `.${string}`;

export const Languages: LanguageConfig[] = [
  {
    extensions: ['js', 'cjs', 'mjs'],
    parser: JavaScriptParser,
    nodeTypes: [
      'function_declaration',
      'method_definition',
      'lexical_declaration',
      'variable_declaration',
    ],
    containerTypes: ['class_declaration'],
  },
  {
    extensions: ['ts'],
    parser: TypeScriptParser.typescript,
    nodeTypes: [
      'function_declaration',
      'method_definition',
      'type_alias_declaration',
      'interface_declaration',
      'enum_declaration',
    ],
    containerTypes: ['class_declaration'],
  },
  {
    extensions: ['java'],
    parser: JavaParser,
    nodeTypes: ['method_declaration', 'constructor_declaration'],
    containerTypes: ['class_declaration', 'interface_declaration', 'enum_declaration'],
  },
  {
    extensions: ['json'],
    parser: JSONParser,
    nodeTypes: ['object', 'array'],
  },
  {
    extensions: ['py'],
    parser: PythonParser,
    nodeTypes: ['function_definition'],
    containerTypes: ['class_definition'],
  },
  {
    extensions: ['rs'],
    parser: RustParser,
    nodeTypes: ['function_item'],
    containerTypes: ['struct_item', 'enum_item', 'trait_item', 'impl_item'],
  },
];

export class CodeAnalysisService {
  private readonly parser: TreeSitter;
  private readonly nodeTypes: Set<string>;
  private readonly containerTypes: Set<string>;

  private readonly maxChunkSize = 4000;

  constructor(extension: Extension) {
    this.parser = new TreeSitter();

    const rawExtension = extension.slice(1).toLowerCase();

    const config = Languages.find((language) =>
      language.extensions.includes(rawExtension),
    );

    if (!config) {
      throw new Error(`Language not found for extension: ${extension}`);
    }

    this.nodeTypes = new Set(config.nodeTypes);
    this.containerTypes = new Set(config.containerTypes ?? []);

    this.parser.setLanguage(config.parser);
  }

  analyse(content: string): CodeChunk[] {
    const parsed = this.parser.parse(content);
    const chunks: CodeChunk[] = [];

    this.visit(parsed.rootNode, chunks);

    return chunks;
  }

  private visit(
    node: SyntaxNode,
    chunks: CodeChunk[],
    context: TraversalContext = {},
  ): void {
    const nodeName = this.getNodeName(node);

    const currentContext = this.containerTypes.has(node.type)
      ? { parentName: nodeName }
      : context;

    if (this.nodeTypes.has(node.type)) {
      const chunk = this.toChunk(node, currentContext);

      chunks.push(...this.splitChunk(chunk));

      return;
    }

    for (const child of node.namedChildren) {
      this.visit(child, chunks, currentContext);
    }
  }

  private splitChunk(chunk: CodeChunk): CodeChunk[] {
    if (chunk.content.length <= this.maxChunkSize) {
      return [chunk];
    }

    const lines = chunk.content.split('\n');

    const chunks: CodeChunk[] = [];
    let currentLines: string[] = [];
    let currentSize = 0;
    let currentStartLine = chunk.startLine;

    const flush = (): void => {
      if (currentLines.length === 0) return;

      const content = currentLines.join('\n');

      chunks.push({
        ...chunk,
        name: `${chunk.name}#${chunks.length + 1}`,
        content,
        startLine: currentStartLine,
        endLine: currentStartLine + currentLines.length - 1,
      });

      currentStartLine += currentLines.length;
      currentLines = [];
      currentSize = 0;
    };

    for (const line of lines) {
      if (currentSize + line.length > this.maxChunkSize && currentLines.length > 0) {
        flush();
      }

      // Handles an individual line exceeding the limit.
      if (line.length > this.maxChunkSize) {
        flush();

        const parts = this.splitLongLine(line, chunk);

        chunks.push(
          ...parts.map((part, index) => ({
            ...part,
            name: `${chunk.name}#${chunks.length + index + 1}`,
          })),
        );

        currentStartLine++;
        continue;
      }

      currentLines.push(line);
      currentSize += line.length + 1;
    }

    flush();

    return chunks;
  }

  private splitLongLine(line: string, chunk: CodeChunk): CodeChunk[] {
    const parts: CodeChunk[] = [];

    for (let i = 0; i < line.length; i += this.maxChunkSize) {
      const content = line.slice(i, i + this.maxChunkSize);

      parts.push({
        ...chunk,
        content,
      });
    }

    return parts;
  }

  private toChunk(node: SyntaxNode, context: TraversalContext): CodeChunk {
    const name = this.getNodeName(node);

    return {
      type: node.type,
      name: context.parentName ? `${context.parentName}.${name}` : name,
      content: node.text,
      startLine: node.startPosition.row + 1,
      endLine: node.endPosition.row + 1,
    };
  }

  private getNodeName(node: SyntaxNode): string {
    const nameNode = node.childForFieldName('name');

    if (nameNode) {
      return nameNode.text;
    }

    if (node.type === 'lexical_declaration' || node.type === 'variable_declaration') {
      return (
        node.namedChildren
          .map((child) => child.childForFieldName('name')?.text)
          .filter((name): name is string => Boolean(name))
          .join(', ') || node.type
      );
    }

    return node.type;
  }
}
