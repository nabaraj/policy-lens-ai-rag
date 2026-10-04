import OpenAI from "openai";

// Initialize the client with Gemini's compatibility endpoint
// const openai = new OpenAI({
//   apiKey: process.env.GEMINI_API_KEY,
//   baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
// });

const openai = new OpenAI({
  apiKey: process.env.NEXT_OPENAI_EMBEDDING_KEY,
});

export async function connectLlm(prompt: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert in health insurance policies.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const message = response.choices?.[0]?.message;

    if (!message || !message.content) {
      return "No response from model";
    }

    return message.content;
  } catch (error) {
    console.error("LLM ERROR:", error);
    return "Error from LLM";
  }
}
