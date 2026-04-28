export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_AI_MODEL || "openrouter/auto";
    const baseUrl =
      process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

    if (!apiKey) {
      return Response.json(
        {
          success: false,
          message: "OPENROUTER_API_KEY belum diset di environment",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const {
      title,
      instruction,
      questionType,
      level,
      options,
      correctAnswer,
      explanation,
      aiTip,
      recommendedLevel,
      studentAnswer,
    } = body;

    if (!instruction || !correctAnswer || !studentAnswer) {
      return Response.json(
        {
          success: false,
          message: "instruction, correctAnswer, dan studentAnswer wajib diisi",
        },
        { status: 400 }
      );
    }

    const prompt = `
Kamu adalah AI tutor untuk sistem Adaptive Learning.

Nilai jawaban mahasiswa berdasarkan data berikut.

DATA SOAL:
Judul: ${title || "-"}
Pertanyaan: ${instruction}
Tipe soal: ${questionType || "essay"}
Level soal: ${level || "easy"}
Opsi jawaban: ${Array.isArray(options) ? JSON.stringify(options) : "[]"}
Jawaban benar / referensi: ${correctAnswer}
Explanation dosen: ${explanation || "-"}
Tips dosen: ${aiTip || "-"}
Recommended level dosen: ${recommendedLevel || level || "easy"}

JAWABAN MAHASISWA:
${studentAnswer}

Balas HANYA JSON valid. Jangan pakai markdown. Jangan pakai penjelasan di luar JSON.

Format JSON:
{
  "isCorrect": boolean,
  "score": number,
  "detectedError": string,
  "feedback": string,
  "aiTip": string,
  "nextRecommendation": string,
  "recommendedLevel": "easy" | "medium" | "hard"
}

Aturan penilaian:
- score harus 0 sampai 100.
- Jika jawaban benar, isCorrect true dan score minimal 75.
- Jika jawaban salah, isCorrect false dan jelaskan kesalahan utama di detectedError.
- feedback harus singkat, jelas, dan dalam bahasa Indonesia.
- aiTip harus berupa tips praktis.
- nextRecommendation berisi saran latihan/materi berikutnya.
- recommendedLevel boleh naik jika jawaban sangat baik, tetap jika cukup, turun jika salah.
`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "Kamu adalah AI tutor adaptive learning. Selalu balas JSON valid tanpa markdown.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 300,
      }),
    });

    clearTimeout(timeout);

    const result = await response.json();

    if (!response.ok) {
      console.error("OPENROUTER_AI_ERROR:", result);

      return Response.json(
        {
          success: false,
          message: result?.error?.message || "Gagal mengambil feedback AI",
        },
        { status: 500 }
      );
    }

    let content =
      result?.choices?.[0]?.message?.content ||
      result?.choices?.[0]?.text ||
      "";

    content = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(content);
    } catch (error) {
      console.error("AI_JSON_PARSE_ERROR:", error, content);

      return Response.json(
        {
          success: false,
          message: "Output AI tidak valid JSON",
          raw: content,
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: "AI feedback berhasil dibuat",
      data: {
        isCorrect: Boolean(parsed.isCorrect),
        score: Number(parsed.score) || 0,
        detectedError: parsed.detectedError || "-",
        feedback: parsed.feedback || "-",
        aiTip: parsed.aiTip || "-",
        nextRecommendation: parsed.nextRecommendation || "-",
        recommendedLevel: parsed.recommendedLevel || level || "easy",
      },
    });
  } catch (error: any) {
    console.error("AI_FEEDBACK_ERROR:", error);

    if (error?.name === "AbortError") {
      return Response.json(
        {
          success: false,
          message: "AI terlalu lama merespons. Coba lagi sebentar.",
        },
        { status: 504 }
      );
    }

    return Response.json(
      {
        success: false,
        message: "Terjadi kesalahan saat membuat AI feedback",
      },
      { status: 500 }
    );
  }
}