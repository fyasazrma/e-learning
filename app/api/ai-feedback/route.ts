export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_AI_MODEL || "openrouter/free";
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
          message:
            "instruction, correctAnswer, dan studentAnswer wajib diisi",
        },
        { status: 400 }
      );
    }

    const prompt = `
Kamu adalah AI tutor untuk sistem Adaptive Learning.
Tugasmu menganalisis jawaban mahasiswa dan memberi feedback personal dalam bahasa Indonesia.

Data soal:
- Judul: ${title || "-"}
- Pertanyaan: ${instruction}
- Tipe soal: ${questionType || "essay"}
- Level soal: ${level || "easy"}
- Opsi jawaban: ${Array.isArray(options) ? JSON.stringify(options) : "[]"}
- Jawaban benar / referensi: ${correctAnswer}
- Explanation dosen: ${explanation || "-"}
- Tips dosen: ${aiTip || "-"}
- Recommended level dosen: ${recommendedLevel || level || "easy"}

Jawaban mahasiswa:
${studentAnswer}

Balas HANYA dalam JSON valid dengan format:
{
  "isCorrect": true/false,
  "score": 0-100,
  "detectedError": "string",
  "feedback": "string",
  "aiTip": "string",
  "nextRecommendation": "string",
  "recommendedLevel": "easy|medium|hard"
}

Aturan:
- Jika jawaban mahasiswa sesuai, beri feedback positif dan rekomendasi naik level bila cocok.
- Jika salah, jelaskan kesalahan inti secara singkat.
- "detectedError" harus menjelaskan kesalahan konsep, bukan kosong.
- "aiTip" harus praktis dan singkat.
- Jangan tulis markdown.
`;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
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
              "Kamu adalah AI tutor untuk adaptive learning. Selalu balas JSON valid tanpa markdown.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
      }),
    });

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

    const content =
      result?.choices?.[0]?.message?.content ||
      result?.choices?.[0]?.text ||
      "";

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
      data: parsed,
    });
  } catch (error) {
    console.error("AI_FEEDBACK_ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Terjadi kesalahan saat membuat AI feedback",
      },
      { status: 500 }
    );
  }
}