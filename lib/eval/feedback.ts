import { put } from "@vercel/blob";
import { LLMAnswer } from "../rag/generateAnswer";

export interface FeedbackEntry {
  question: string;
  answer: string;
  sources: string[];
  ai_score: number;
  ai_reason: string;
  user_rating?: number;
  timestamp: string;
  language?: string;
}

/**
 * Store automatic AI feedback for every response
 */
export async function captureAIFeedback(
  answer: LLMAnswer,
  question: string,
  aiScore: number,
  aiReason: string,
  language?: string
) {
  try {
    const entry: FeedbackEntry = {
      question,
      answer: answer.text,
      sources: answer.sources,
      ai_score: aiScore,
      ai_reason: aiReason,
      timestamp: new Date().toISOString(),
      language,
    };

    const filename = `feedback/ai/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.json`;

    await put(filename, JSON.stringify(entry, null, 2), {
      access: "public",
      contentType: "application/json",
    });

    console.log(
      `[feedback] AI evaluation stored (Blob) - Score: ${aiScore}, Question: ${question.substring(
        0,
        50
      )}...`
    );
  } catch (error) {
    console.error("[feedback] Failed to store AI feedback:", error);
  }
}

/**
 * Store user feedback (manual ratings)
 */
export async function captureUserFeedback(
  answer: LLMAnswer,
  question: string,
  user_rating: number
) {
  try {
    const entry: FeedbackEntry = {
      question,
      answer: answer.text,
      sources: answer.sources,
      ai_score: -1,
      ai_reason: "user_feedback",
      user_rating,
      timestamp: new Date().toISOString(),
    };

    const filename = `feedback/user/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.json`;

    await put(filename, JSON.stringify(entry, null, 2), {
      access: "public",
      contentType: "application/json",
    });

    console.log("[feedback] User rating stored (Blob)");
  } catch (error) {
    console.error("[feedback] Failed to store user feedback:", error);
  }
}
