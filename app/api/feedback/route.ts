import { captureUserFeedback } from "@/lib/eval/feedback";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { question, answer, sources, rating } = body;
        captureUserFeedback({ text: answer, sources }, question, rating);

        return NextResponse.json({ status: "ok" });
    } catch (err) {
        console.error(err);

        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}