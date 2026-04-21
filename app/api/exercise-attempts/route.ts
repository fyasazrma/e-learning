import { connectDB } from "@/lib/mongodb";
import Exercise from "@/models/Exercise";
import ExerciseAttempt from "@/models/ExerciseAttempt";
import ExerciseSubmission from "@/models/ExerciseSubmission";
import Feedback from "@/models/Feedback";
import Recommendation from "@/models/Recommendation";
import LearningProgress from "@/models/LearningProgress";
import Topic from "@/models/Topic";

type LevelType = "easy" | "medium" | "hard";

async function getRecentAttemptsByTopic(
  studentId: string | null,
  topicId: string | null
) {
  if (!studentId || !topicId) return [];

  const recentAttempts = await ExerciseAttempt.find({
    studentId,
    topicId,
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return recentAttempts;
}

function getNextLevel(currentLevel: LevelType): LevelType {
  if (currentLevel === "easy") return "medium";
  if (currentLevel === "medium") return "hard";
  return "hard";
}

function getLowerLevel(currentLevel: LevelType): LevelType {
  if (currentLevel === "hard") return "medium";
  if (currentLevel === "medium") return "easy";
  return "easy";
}

function determineRecommendedLevel(
  currentLevel: LevelType,
  isCorrect: boolean,
  recentAttempts: any[]
): LevelType {
  const recentTwo = recentAttempts.slice(0, 2);

  const correctStreak =
    isCorrect &&
    recentTwo.length >= 2 &&
    recentTwo.every((attempt) => attempt.isCorrect === true);

  const wrongStreak =
    !isCorrect &&
    recentTwo.length >= 2 &&
    recentTwo.every((attempt) => attempt.isCorrect === false);

  if (correctStreak) {
    return getNextLevel(currentLevel);
  }

  if (wrongStreak) {
    return getLowerLevel(currentLevel);
  }

  if (isCorrect) {
    return currentLevel;
  }

  return getLowerLevel(currentLevel);
}

async function calculateUniqueCompletedExercises(
  studentId: string | null,
  topicId: string | null
) {
  if (!studentId || !topicId) return 0;

  const attempts = await ExerciseAttempt.find({
    studentId,
    topicId,
  })
    .select("exerciseId")
    .lean();

  const uniqueIds = new Set(
    attempts.map((item: any) => String(item.exerciseId)).filter(Boolean)
  );

  return uniqueIds.size;
}

async function callAdaptiveAI(params: {
  title?: string;
  instruction: string;
  questionType?: string;
  level: LevelType;
  options?: any[];
  correctAnswer: string;
  explanation?: string;
  aiTip?: string;
  recommendedLevel?: string;
  studentAnswer: string;
  topicTitle?: string;
}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_AI_MODEL || "openrouter/free";
  const baseUrl =
    process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY belum diset");
  }

  const prompt = `
Kamu adalah AI tutor untuk sistem Adaptive Learning.
Analisis jawaban mahasiswa dan balas HANYA dalam JSON valid.

Konteks:
- Judul soal: ${params.title || "-"}
- Topik: ${params.topicTitle || "-"}
- Pertanyaan: ${params.instruction}
- Tipe soal: ${params.questionType || "essay"}
- Level saat ini: ${params.level}
- Opsi jawaban: ${Array.isArray(params.options) ? JSON.stringify(params.options) : "[]"}
- Jawaban benar / referensi: ${params.correctAnswer}
- Explanation dosen: ${params.explanation || "-"}
- Tips dosen: ${params.aiTip || "-"}
- Recommended level dosen: ${params.recommendedLevel || params.level}

Jawaban mahasiswa:
${params.studentAnswer}

Keluarkan JSON persis dengan format:
{
  "isCorrect": true,
  "score": 0,
  "detectedErrors": ["string"],
  "quickFeedback": "string",
  "feedbackText": "string",
  "tipText": "string",
  "dominantError": "string",
  "reason": "string",
  "recommendedLevel": "easy"
}

Aturan:
- Gunakan bahasa Indonesia.
- "score" antara 0 sampai 100.
- Jika jawaban benar, detectedErrors boleh [].
- Jika salah, isi detectedErrors dengan 1-3 error ringkas.
- "quickFeedback" harus singkat.
- "feedbackText" lebih detail.
- "tipText" berisi saran praktis.
- "reason" menjelaskan kenapa level berikutnya direkomendasikan.
- "recommendedLevel" harus salah satu: easy, medium, hard.
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
      temperature: 0.2,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.error?.message || "Gagal mengambil feedback AI");
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
    throw new Error("Output AI tidak valid JSON");
  }

  return parsed as {
    isCorrect: boolean;
    score: number;
    detectedErrors: string[];
    quickFeedback: string;
    feedbackText: string;
    tipText: string;
    dominantError: string;
    reason: string;
    recommendedLevel: LevelType;
  };
}

async function findRecommendedExercise(params: {
  topicId: string | null;
  recommendedLevel: LevelType;
  currentExerciseId: string;
}) {
  const { topicId, recommendedLevel, currentExerciseId } = params;

  const query: Record<string, any> = {
    isPublished: true,
    level: recommendedLevel,
    _id: { $ne: currentExerciseId },
  };

  if (topicId) {
    query.topicId = topicId;
  }

  let exercises: any[] = await Exercise.find(query)
    .sort({ createdAt: 1 })
    .lean();

  if (!exercises.length && topicId) {
    exercises = await Exercise.find({
      isPublished: true,
      topicId,
      _id: { $ne: currentExerciseId },
    })
      .sort({ createdAt: 1 })
      .lean();
  }

  if (!exercises.length) return null;

  return exercises[0];
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { studentId, exerciseId, submittedAnswer } = body;

    if (!exerciseId || !submittedAnswer) {
      return Response.json(
        {
          success: false,
          message: "exerciseId dan submittedAnswer wajib diisi",
        },
        { status: 400 }
      );
    }

    const exercise: any = await Exercise.findById(exerciseId).lean();

    if (!exercise) {
      return Response.json(
        {
          success: false,
          message: "Latihan tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const topicDoc: any = exercise.topicId
      ? await Topic.findById(exercise.topicId).lean()
      : null;

    const topicTitle = topicDoc?.title || "topik ini";

    const recentAttempts = await getRecentAttemptsByTopic(
      studentId || null,
      exercise.topicId ? String(exercise.topicId) : null
    );

    const aiResult = await callAdaptiveAI({
      title: exercise.title,
      instruction: exercise.instruction,
      questionType: exercise.questionType || "essay",
      level: exercise.level,
      options: exercise.options || [],
      correctAnswer: exercise.correctAnswer,
      explanation: exercise.explanation || "",
      aiTip: exercise.aiTip || "",
      recommendedLevel: exercise.recommendedLevel || exercise.level,
      studentAnswer: submittedAnswer,
      topicTitle,
    });

    const fallbackRecommendedLevel = determineRecommendedLevel(
      exercise.level,
      Boolean(aiResult.isCorrect),
      recentAttempts
    );

    const finalRecommendedLevel =
      aiResult.recommendedLevel &&
      ["easy", "medium", "hard"].includes(aiResult.recommendedLevel)
        ? (aiResult.recommendedLevel as LevelType)
        : fallbackRecommendedLevel;

    const recommendedExercise: any = await findRecommendedExercise({
      topicId: exercise.topicId ? String(exercise.topicId) : null,
      recommendedLevel: finalRecommendedLevel,
      currentExerciseId: String(exercise._id),
    });

    const detectedErrors = Array.isArray(aiResult.detectedErrors)
      ? aiResult.detectedErrors
      : [];

    const score = Number(aiResult.score || 0);

    const attempt = await ExerciseAttempt.create({
      studentId: studentId || null,
      exerciseId: String(exercise._id),
      topicId: exercise.topicId ? String(exercise.topicId) : null,
      submittedAnswer,
      isCorrect: Boolean(aiResult.isCorrect),
      score,
      detectedErrors,
      quickFeedback: aiResult.quickFeedback || "",
      recommendedLevel: finalRecommendedLevel,
      recommendedExerciseId: recommendedExercise?._id
        ? String(recommendedExercise._id)
        : null,
    });

    await ExerciseSubmission.create({
      studentId: studentId || null,
      exerciseId: String(exercise._id),
      topicId: exercise.topicId ? String(exercise.topicId) : null,
      questionTitle: exercise.title || "",
      submittedAnswer,
      isCorrect: Boolean(aiResult.isCorrect),
      score,
      detectedErrors,
      quickFeedback: aiResult.quickFeedback || "",
      feedbackText: aiResult.feedbackText || "",
      tipText: aiResult.tipText || "",
      reason: aiResult.reason || "",
      recommendedLevel: finalRecommendedLevel,
      recommendedExerciseId: recommendedExercise?._id
        ? String(recommendedExercise._id)
        : null,
    });

    const feedback = await Feedback.create({
      studentId: studentId || null,
      exerciseAttemptId: String(attempt._id),
      feedbackText: aiResult.feedbackText || "",
      tipText: aiResult.tipText || "",
      errorType: detectedErrors,
    });

    const recommendation = await Recommendation.create({
      studentId: studentId || null,
      basedOnAttemptId: String(attempt._id),
      recommendedExerciseId: recommendedExercise?._id
        ? String(recommendedExercise._id)
        : null,
      reason:
        aiResult.reason ||
        `Sistem merekomendasikan latihan level ${finalRecommendedLevel} pada topik yang sama.`,
      targetLevel: finalRecommendedLevel,
      status: "pending",
    });

    let progress: any = await LearningProgress.findOne({
      studentId: studentId || null,
      topicId: exercise.topicId ? String(exercise.topicId) : null,
    });

    const uniqueCompletedExercises = await calculateUniqueCompletedExercises(
      studentId || null,
      exercise.topicId ? String(exercise.topicId) : null
    );

    if (!progress) {
      progress = await LearningProgress.create({
        studentId: studentId || null,
        topicId: exercise.topicId ? String(exercise.topicId) : null,
        completedMaterials: 0,
        completedExercises: uniqueCompletedExercises,
        completedQuizzes: uniqueCompletedExercises,
        currentLevel: finalRecommendedLevel,
        averageScore: score,
        lastFeedback: aiResult.quickFeedback || "",
      });
    } else {
      const totalAttempts = await ExerciseAttempt.countDocuments({
        studentId: studentId || null,
        topicId: exercise.topicId ? String(exercise.topicId) : null,
      });

      const allAttempts = await ExerciseAttempt.find({
        studentId: studentId || null,
        topicId: exercise.topicId ? String(exercise.topicId) : null,
      })
        .select("score")
        .lean();

      const newAverageScore =
        allAttempts.length > 0
          ? Math.round(
              allAttempts.reduce(
                (sum: number, item: any) => sum + (item.score || 0),
                0
              ) / allAttempts.length
            )
          : score;

      progress.completedExercises = uniqueCompletedExercises;
      progress.completedQuizzes = uniqueCompletedExercises;
      progress.averageScore = newAverageScore;
      progress.currentLevel = finalRecommendedLevel;
      progress.lastFeedback = aiResult.quickFeedback || "";
      progress.totalAttempts = totalAttempts;
      await progress.save();
    }

    return Response.json({
      success: true,
      message: "Jawaban berhasil diproses",
      data: {
        attempt,
        feedback,
        recommendation,
        progress,
        recommendedExercise,
        dominantError: aiResult.dominantError || null,
      },
    });
  } catch (error) {
    console.error("POST_EXERCISE_ATTEMPT_ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memproses jawaban latihan",
        error: String(error),
      },
      { status: 500 }
    );
  }
}