import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { evaluateResponse } from "@/lib/eval/evaluateResponse";
import { captureAIFeedback } from "@/lib/eval/feedback";
import { speechToText } from "@/lib/services/speechToText";
import { translateText } from "@/lib/services/translate";
import { workflowRouter } from "@/lib/workflows/router";

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export async function POST(request: NextRequest) {
  let filePath: string | null = null;

  try {
    const formData = await request.formData();

    const audioFile = formData.get("audio") as File | null;
    const language = (formData.get("language") as string) || "en";

    if (!audioFile) {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 }
      );
    }

    // Validate audio file
    if (!audioFile.type.startsWith("audio/")) {
      return NextResponse.json(
        { error: "Only audio files are allowed" },
        { status: 400 }
      );
    }

    // Generate filename
    const extension = path.extname(audioFile.name) || ".webm";
    const filename = `audio-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${extension}`;
    filePath = path.join(uploadDir, filename);

    // Save file to disk
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    console.log("Audio file saved:", {
      filename,
      type: audioFile.type,
      size: audioFile.size,
      path: filePath,
    });

    // 1. Speech → Text
    const originalText = await speechToText(filePath, {
      language,
    });

    console.log("Transcribed text:", originalText);

    // 2. Translate to English for RAG
    const englishText =
      language === "en" || language === "English"
        ? originalText
        : await translateText(originalText, "English");

    // 3. Run RAG workflow
    const answer = await workflowRouter(englishText, undefined, "English");

    // 4. Translate response back if needed
    let finalAnswer = answer.answer;

    if (language !== "en" && language !== "English") {
      const languageMap: Record<string, string> = {
        fr: "French",
        // yo: "Yoruba",
        // ar: "Arabic",
        // sw: "Swahili",
        // am: "Amharic",
      };

      const targetLanguage = languageMap[language] || language;
      finalAnswer = await translateText(answer.answer, targetLanguage);
    }

    // 5. Evaluate & store feedback
    const evaluation = await evaluateResponse(
      { text: answer.answer, sources: answer.sources },
      originalText,
      language
    );

    await captureAIFeedback(
      { text: finalAnswer, sources: answer.sources },
      originalText,
      evaluation.overallScore,
      evaluation.reasons.join("; "),
      language
    );

    return NextResponse.json({
      answer: finalAnswer,
      intent: answer.intent,
    });
  } catch (error) {
    console.error("API Error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    // Cleanup uploaded file
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.warn("Failed to clean up file:", cleanupError);
      }
    }
  }
}
