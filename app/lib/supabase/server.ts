import { ChunkInput, chunkSearchReturnType } from "@/app/type";
import { generateFileHash } from "@/app/utils";
// import { generateEmbedding } from "@/app/utils";
import { createClient } from "@supabase/supabase-js";

import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.NEXT_OPENAI_EMBEDDING_KEY,
});

export const generateEmbedding = async (chunkContent: string) => {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: chunkContent,
  });

  return response.data[0].embedding;
};

// Initialize a standard, unauthenticated client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function insertDocument(file: File) {
  const { name: fileName } = file;
  const fileHashId = await generateFileHash(file);
  const { data, error } = await supabase
    .from("documents")
    .insert([{ file_name: fileName, file_hash: fileHashId }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
export async function checkDocumentExist(documentId: string) {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("file_hash", documentId)
    .maybeSingle();

  if (error) {
    console.log("CHECK ERROR:", error.message);
  }
  console.log("******* ", { error, data });
  return data;
}

export async function insertChunks(chunks: ChunkInput[], documentId: string) {
  const chunkList = chunks.map(({ content, metadata, embedding }) => ({
    content,
    document_id: documentId,
    metadata,
    embedding,
  }));
  const { data, error } = await supabase
    .from("chunks")
    .insert(chunkList)
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function getDocuments() {
  const { data, error } = await supabase.from("documents").select("*").limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function searchChunks(
  query: string,
  documentId: string,
): Promise<chunkSearchReturnType[]> {
  const embedding = await generateEmbedding(query);
  const { data, error } = await supabase.rpc("match_chunks", {
    query_embedding: embedding,
    match_count: 3,
    document_id: documentId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
