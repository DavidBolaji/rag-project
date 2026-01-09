import { NextRequest, NextResponse } from "next/server";
import { translateText } from "@/lib/services/translate";
import { workflowRouter } from "@/lib/workflows/router";
import { evaluateResponse } from "@/lib/eval/evaluateResponse";
import { captureAIFeedback } from "@/lib/eval/feedback";


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, language, conversation } = body;

    // 1. Translate question to English if not already English
    let englishQuestion = question;
    if (language && language !== "en" && language !== "English") {
      englishQuestion = await translateText(question, "English");
    }

    // 2. Translate conversation history to English if exists
    let englishConversation = conversation;
    if (conversation && language && language !== "en" && language !== "English") {
      englishConversation = await Promise.all(
        conversation.map(async (turn: any) => ({
          question: await translateText(turn.question, "English"),
          answer: await translateText(turn.answer, "English"),
        }))
      );
    }

    // 3. Run RAG pipeline in English
    const answer = await workflowRouter(englishQuestion, englishConversation, "English");

    // 4. Translate response back to user language if not English
    let finalAnswer = answer.answer;
    if (language && language !== "en" && language !== "English") {
      const languageMap: { [key: string]: string } = {
        fr: "French",
        // yo: "Yoruba",
        // ar: "Arabic",
        // sw: "Swahili",
        // am: "Amharic",
      };
      const targetLanguage = languageMap[language] || language;
      finalAnswer = await translateText(answer.answer, targetLanguage);
    }

    // 5. Evaluate response quality and store feedback
    const evaluation = await evaluateResponse(
      { text: answer.answer, sources: answer.sources },
      question,
      language || "English"
    );
    captureAIFeedback(
      { text: finalAnswer, sources: answer.sources },
      question,
      evaluation.overallScore,
      evaluation.reasons.join("; "),
      language
    );

    return NextResponse.json({ answer: finalAnswer, intent: answer.intent });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}