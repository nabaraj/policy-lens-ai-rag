export interface DocumentChunk {
  id: string;
  text: string;
  metadata?: Record<string, any>;
}

export interface Embedding {
  id: string;
  vector: number[];
}

export interface SearchResult {
  chunk: DocumentChunk;
  score: number;
}

export type ChunkInput = {
  content: string;
  metadata: Record<string, any>;
  embedding: number[];
};

export type RequestBody = {
  question: string;
  documentId: string;
};

export type chunkSearchReturnType = {
  content: string;
  id: string;
  similarity: number;
};
