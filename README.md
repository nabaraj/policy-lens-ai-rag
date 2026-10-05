# PolicyLens AI

PolicyLens AI is a domain-focused application that uses Retrieval Augmented Generation (RAG) to analyze health insurance documents.

It allows users to upload a policy PDF and ask questions like coverage limits, room rent rules, and exclusions overall related to the uploaded document. The system retrieves only relevant parts of the document and generates answers strictly based on that content.

The goal is simple: Help users understand complex insurance documents without reading everything.

---

## Problem

Health insurance documents are long and difficult to understand. Most users are not interested in reading the full policy. They just want clear answers to a few important questions.

This creates a gap between what the document contains and what the user actually needs.

---

## Solution

PolicyLens AI solves this by combining document processing with RAG.

- The user uploads a PDF
- The system extracts and validates the content
- The document is split into smaller chunks
- Each chunk is converted into embeddings and stored
- When a question is asked, only relevant chunks are retrieved
- The LLM generates an answer using only that context

This avoids sending the full document to the model and improves both cost and accuracy.

---

## Features

- Upload and process PDF documents
- Detect if the document is a health insurance policy
- Prevent duplicate uploads using file hashing
- Store and search document chunks using vector similarity
- Expand queries to improve retrieval quality
- Generate answers using strict grounding rules
- Show predefined answers for common questions
- Support free-form chat based on the document

---

## How it Works

1. **Upload and Deduplication**  
   A SHA-256 hash is generated for the file. If the same document already exists, processing is skipped.
2. **Text Extraction and Validation**  
   The PDF is parsed and checked against insurance-related keywords.
3. **Chunking and Embedding**  
   The text is split into chunks and converted into vector embeddings.
4. **Storage**  
   Chunks and embeddings are stored in Supabase using pgvector.
5. **Query Processing**  
   User questions are expanded with domain keywords to improve search results.
6. **Retrieval**  
   The most relevant chunks are fetched using cosine similarity.
7. **Answer Generation**  
   The LLM generates an answer using only the retrieved context.

---

## Tech Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS

### Backend

- Next.js API routes

### AI

- OpenAI (LLM and embeddings)
- LangChain (text splitting)

### Database

- Supabase (PostgreSQL with pgvector)

---

## Database Setup

Run the following SQL in Supabase:

```sql
create extension if not exists vector;

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_hash text unique not null,
  created_at timestamp with time zone default timezone('utc', now()) not null
);

create table if not exists chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null,
  content text not null,
  metadata jsonb,
  embedding vector(1536),
  created_at timestamp with time zone default timezone('utc', now()) not null
);

create or replace function match_chunks (
  query_embedding vector(1536),
  match_count int,
  document_id uuid
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    chunks.id,
    chunks.content,
    chunks.metadata,
    1 - (chunks.embedding <=> query_embedding) as similarity
  from chunks
  where chunks.document_id = match_chunks.document_id
  order by chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

---

## Setup

Clone the repository:

Install dependencies:

```bash
npm install
```

Create a `.env.local` file:

```text
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
NEXT_OPENAI_EMBEDDING_KEY=
```

Run the project:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```text
app/
  api/
    upload/
    chat/
  lib/
    supabase/
    openai/
  utils/
  components/
```

---

## Key Challenges Solved

- Avoiding incorrect number extraction (for example 500 vs 500,000)
- Preventing hallucination using strict prompts
- Improving retrieval with query expansion
- Handling duplicate documents using hashing
- Cleaning extracted text for better accuracy

---

## Limitations

- Document validation is keyword-based
- Performance depends on PDF quality
- No reranking layer yet
- Supports only one document at a time

---

## Future Improvements

- Add reranking for better retrieval accuracy
- Support multiple documents
- Add chat history and session tracking
- Add confidence scoring for answers
- Improve UI and overall user experience

---

## Why this Project Matters

This project shows how to build a practical RAG system for real-world use.

It demonstrates:

- How retrieval affects accuracy
- Why clean data matters more than prompts
- How to control LLM output using constraints

---

## Final Note

This system is not just about using an LLM.

The main value comes from:

- Good chunking
- Correct retrieval
- Clean context
- Strong prompt control

If any of these fail, the output will be wrong. That is the core idea behind this project.
