import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || "qwen/qwen3.6-plus:free";

function getOpenRouterErrorMessage(data: unknown, status: number) {
  const errorData =
    typeof data === "object" && data !== null
      ? (data as {
          error?: {
            message?: string;
            metadata?: {
              raw?: string;
              provider_name?: string;
            };
          };
          message?: string;
        })
      : undefined;

  const rawMessage = errorData?.error?.metadata?.raw;
  const providerMessage = errorData?.error?.message;
  const fallbackMessage = errorData?.message;
  const normalizedMessage = `${rawMessage || ""} ${providerMessage || ""} ${
    fallbackMessage || ""
  }`.toLowerCase();

  if (
    status === 429 ||
    normalizedMessage.includes("rate-limit") ||
    normalizedMessage.includes("rate limit") ||
    normalizedMessage.includes("temporarily rate-limited")
  ) {
    return "AI Tutor sedang ramai dipakai, jadi balasan belum bisa diproses sekarang. Coba kirim lagi dalam beberapa detik.";
  }

  if (
    normalizedMessage.includes("timeout") ||
    normalizedMessage.includes("aborted")
  ) {
    return "AI Tutor butuh waktu lebih lama dari biasanya. Coba ulangi pertanyaan Anda.";
  }

  return (
    providerMessage ||
    fallbackMessage ||
    "AI Tutor sedang mengalami gangguan. Coba lagi sebentar lagi."
  );
}

export async function POST(req: NextRequest) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

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
      signal: controller.signal,
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
            Kamu adalah teman belajar yang asyik dan suportif untuk materi Office.
            Jawab maksimal 3 kalimat saja. 
            Berikan semangat di akhir jawaban.
            Jangan pakai format kaku atau bahasa formal yang membosankan.
            pakai bahasa indonesia 
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
      const message = getOpenRouterErrorMessage(data, response.status);

      return NextResponse.json(
        {
          success: false,
          message,
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
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("CHATBOT_API_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada chatbot API",
        error: message,
      },
      { status: 500 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
