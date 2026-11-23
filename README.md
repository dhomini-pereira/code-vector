# CodeVector

**Repository Embedding & Vector Indexing Engine**

O **CodeVector** é uma aplicação batch desenvolvida para realizar a indexação inteligente de repositórios de código-fonte. Sua responsabilidade é percorrer repositórios locais, identificar e processar arquivos, fragmentar o conteúdo em chunks, gerar embeddings utilizando modelos de inteligência artificial e armazenar as representações vetoriais em uma base PostgreSQL com extensão **pgvector**.

O objetivo é transformar código-fonte em uma base de conhecimento vetorial, permitindo consultas semânticas, recuperação de trechos relevantes e integração com soluções de RAG (*Retrieval-Augmented Generation*).

## Funcionalidades

- **Repository Scanning:** identificação e varredura de repositórios locais.
- **File Processing:** leitura e processamento de arquivos suportados.
- **Code Chunking:** fragmentação do código-fonte em unidades menores para processamento.
- **Embedding Generation:** geração de representações vetoriais utilizando modelos de embeddings.
- **Vector Storage:** persistência dos embeddings no PostgreSQL com pgvector.
- **Semantic Search Support:** preparação dos dados para recuperação de informações por similaridade semântica.
- **Batch Processing:** processamento automatizado de múltiplos arquivos e repositórios.
- **Concurrency Control:** controle de concorrência para otimizar o processamento.

## Arquitetura

```text
             Local Repositories
                     |
                     v
              Repository Scanner
                     |
                     v
               File Processor
                     |
                     v
                Code Chunker
                     |
                     v
              Embedding Generator
                     |
                     v
               Vector Storage
                     |
                     v
             PostgreSQL + pgvector
                     |
                     v
                Semantic Search
```

## Stack tecnológica

| Tecnologia | Responsabilidade |
|---|---|
| Node.js | Runtime de execução |
| TypeScript | Linguagem de desenvolvimento |
| PostgreSQL | Banco de dados |
| pgvector | Armazenamento e busca vetorial |
| Ollama | Execução local de modelos de IA |
| Embedding Models | Geração de embeddings |

## Fluxo de processamento

1. **Discovery:** localização dos repositórios e arquivos disponíveis para indexação.
2. **Extraction:** leitura e extração do conteúdo dos arquivos.
3. **Chunking:** divisão do conteúdo em fragmentos menores.
4. **Embedding:** transformação dos fragmentos em vetores numéricos.
5. **Persistence:** armazenamento dos vetores e metadados no PostgreSQL com pgvector.
6. **Retrieval:** disponibilização da base vetorial para consultas semânticas e aplicações externas.

## Configuração

Configure as variáveis de ambiente necessárias para execução:

```env
OLLAMA_MODEL_NAME="embeddinggemma-2:270m"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rag_db"
INPUT_FOLDER="C://repos"
```

As variáveis são ilustrativas e devem corresponder às configurações implementadas no projeto.

## Execução

Instale as dependências:

```bash
npm install
```

Execute o processamento:

```bash
npm run dev
```

Durante a execução, o CodeVector percorre os repositórios configurados, processa os arquivos elegíveis, gera embeddings e persiste os resultados na base vetorial.

## Aplicações

O CodeVector pode ser utilizado como componente de infraestrutura para:

- Assistentes de programação com IA.
- Sistemas de RAG especializados em código-fonte.
- Ferramentas de análise e compreensão de software.
- Recuperação semântica de implementações existentes.
- Integrações com MCP Servers e IDEs inteligentes.
- Sistemas de descoberta de código e reutilização de componentes.

## Objetivo

Construir uma infraestrutura reutilizável de indexação vetorial de código-fonte, permitindo que aplicações de inteligência artificial consultem e compreendam repositórios de software por meio de busca semântica.

---

**CodeVector — Turning source code into searchable knowledge.**
