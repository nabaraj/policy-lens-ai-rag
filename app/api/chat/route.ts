// searchChunks

import { connectLlm } from "@/app/lib/openaiconnect/connect";
import { searchChunks } from "@/app/lib/supabase/server";
import { chunkSearchReturnType, RequestBody } from "@/app/type";
import { buildPrompt } from "@/app/utils";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { question, documentId } = body as RequestBody;

  const result: chunkSearchReturnType[] = await searchChunks(
    question,
    documentId,
  );

  const context = result
    .slice(0, 3)
    .map((c) => c.content)
    .join("\n\n");

  console.log("CONTEXT >>>", context);

  const prompt = buildPrompt(question, context);

  const llmresponse = await connectLlm(prompt);

  return NextResponse.json({
    content: llmresponse,
  });
}
