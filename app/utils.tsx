export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const validateExtractedText = (text: string): boolean => {
  // you implement
  if (text.length === 0) {
    return false;
  }
  return true;
};

export function isInsuranceDocument(text: string): boolean {
  const healthKeywords = [
    "hospitalization",
    "icu",
    "room rent",
    "medical expenses",
    "pre-existing disease",
    "cashless treatment",
    "network hospital",
    "day care treatment",
    "surgery",
    "inpatient",
    "outpatient",
    "ambulance charges",
    "doctor fees",
    "nursing charges",
  ];
  const insuranceKeywords = [
    "policy",
    "sum insured",
    "premium",
    "claim",
    "coverage",
    "exclusion",
    "insured",
    "policyholder",
  ];

  let healthScore = 0;
  let insuranceScore = 0;

  for (const word of healthKeywords) {
    if (text.toLowerCase().includes(word)) {
      healthScore++;
    }
  }
  for (const word of insuranceKeywords) {
    if (text.toLowerCase().includes(word)) {
      insuranceScore++;
    }
  }

  const hasInsurance = insuranceScore >= 2;
  const hasHealth = healthScore >= 2;

  return hasInsurance && hasHealth; // threshold
}

export const buildPrompt = (question: string, context: string) => {
  const prompt = `
You are an expert in health insurance.

Use ONLY the context.

Rules:
- Do NOT guess
- Do NOT combine unrelated lines
- DO NOT change or shorten numbers
- Always return exact values as written in document
- Pick only the value directly related to the question

If not found, say:
"Not found in document"

Context:
${context}

Question:
${question}

Answer in bullet points:
`;
  return prompt;
};

export const formatAnswer = (text: string) => {
  if (!text) return "";

  // remove markdown **
  let cleaned = text.replace(/\*\*/g, "");

  // convert numbered list to bullet
  cleaned = cleaned.replace(/^\d+\.\s/gm, "• ");

  return cleaned;
};

export const highlightText = (text: string) => {
  const parts = text.split(/(₹?\s?\d+[,\d]*%?)/g);

  return parts.map((part, i) => {
    if (part.match(/₹?\s?\d+[,\d]*%?/)) {
      return (
        <span key={i} className="font-semibold text-blue-600">
          {part}
        </span>
      );
    }
    return part;
  });
};

export const renderFormattedText = (text: string) => {
  const formatted = formatAnswer(text);
  return highlightText(formatted);
};
export const infoBoxColor = [
  "border-[#10b981]",
  "border-yellow-400",
  "border-red-400",
];

import crypto from "crypto";

export const generateFileHash = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const hash = crypto
    .createHash("sha256")
    .update(Buffer.from(buffer))
    .digest("hex");

  return hash;
};
export const buildSearchQuery = (question: string) => {
  const q = question.toLowerCase();

  if (q.includes("sum insured")) {
    return `${question} sum insured coverage amount`;
  }

  if (q.includes("exclusion")) {
    return `${question} exclusions not covered limitations`;
  }

  if (q.includes("room rent")) {
    return `${question} room rent hospital limit`;
  }

  return question;
};
