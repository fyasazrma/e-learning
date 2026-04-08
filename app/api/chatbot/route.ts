import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || "qwen/qwen3.6-plus:free";
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 4000);

export async function POST(req: NextRequest) {
  try {
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          message: "OPENROUTER_API_KEY belum diset di .env.local",
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const userMessage = body?.message;

    if (!userMessage || typeof userMessage !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "message wajib diisi",
        },
        { status: 400 }
      );
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AI Adaptive Learning",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        max_tokens: 80,
        temperature: 0.6,
        messages: [
          {
            role: "system",
            content: `
            Kamu AI tutor Office.
            Jawab singkat, jelas, maksimal 3 kalimat.
            Tanpa simbol markdown.
            `,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OPENROUTER_ERROR:", data);

      return NextResponse.json(
        {
          success: false,
          message:
            data?.error?.message ||
            data?.message ||
            "Provider returned error",
          raw: data,
        },
        { status: response.status }
      );
    }

    const reply =
      data?.choices?.[0]?.message?.content ||
      "Maaf, saya belum bisa menjawab pertanyaan itu.";

    return NextResponse.json({
      success: true,
      data: {
        reply,
      },
    });
  } catch (error: any) {
    console.error("CHATBOT_API_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada chatbot API",
        error: error.message,
      },
      { status: 500 }
    );
  }
}