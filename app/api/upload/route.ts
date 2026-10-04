import { NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { extractText, getDocumentProxy } from "unpdf";

import {
  generateFileHash,
  isInsuranceDocument,
  validateExtractedText,
} from "@/app/utils";
import {
  checkDocumentExist,
  insertChunks,
  insertDocument,
} from "@/app/lib/supabase/server";

// //file → arrayBuffer → extractText → chunk
// export async function GET() {
//   const dbResponse = await getDocuments();
//   console.log({ dbResponse });
//   return NextResponse.json({ dbResponse });
// }

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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid file",
          data: null,
          errors: { code: "INVALID_FILE" },
        },
        { status: 400 },
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        {
          success: false,
          message: "File type not supported",
          data: null,
          errors: { code: "INVALID_FILE_TYPE" },
        },
        { status: 400 },
      );
    }
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { totalPages, text: extractedText } = await extractText(pdf, {
      mergePages: true,
    });

    if (!validateExtractedText(extractedText)) {
      //   return NextResponse.json({ error: "No content found" }, { status: 400 });
      return NextResponse.json(
        {
          success: false,
          message: "No content found in document",
          data: null,
          errors: { code: "EMPTY_DOCUMENT" },
        },
        { status: 400 },
      );
    }

    if (!isInsuranceDocument(extractedText)) {
      return NextResponse.json(
        {
          success: false,
          message: "Not a valid insurance document",
          data: null,
          errors: { code: "INVALID_FILE_TYPE" },
        },
        { status: 400 },
      );
    }

    const documentId = await generateFileHash(file);
    // Checking database for existing document
    const existingDocument = await checkDocumentExist(documentId);

    if (existingDocument) {
      return NextResponse.json({
        success: true,
        message: "Document already exists",
        data: {
          documentId: existingDocument.id,
          fileName: existingDocument.file_name,
          isDuplicate: true,
        },
        errors: null,
      });
    }

    const savedDocument = await insertDocument(file, documentId);
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 800, // Maximum characters per chunk
      chunkOverlap: 100, // Overlap to keep semantic context between chunks
    });

    const chunks = await splitter.createDocuments(
      [extractedText],
      [
        {
          fileName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      ],
    );

    const chunksToInsert = await Promise.all(
      chunks.map(async (chunk) => {
        const embedding = await generateEmbedding(chunk.pageContent);
        return {
          content: chunk.pageContent,
          metadata: chunk.metadata,
          embedding,
        };
      }),
    );

    await insertChunks(chunksToInsert, savedDocument.id);

    return NextResponse.json({
      success: true,
      message: "File uploaded and processed successfully",
      data: {
        documentId: savedDocument.id,
        fileName: file.name,
        fileType: file.type,
        totalPages,
        totalChunks: chunksToInsert.length,
        isInsuranceDocument: true,
        preview: extractedText.slice(0, 200),
        uploadedAt: new Date().toISOString(),
      },
      errors: null,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to process upload",
        data: null,
        errors: { code: "INTERNAL_SERVER_ERROR" },
      },
      { status: 500 },
    );
  }
}
