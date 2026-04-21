import { connectDB } from "@/lib/mongodb";
import Exercise from "@/models/Exercise";
import ExerciseAttempt from "@/models/ExerciseAttempt";
import ExerciseSubmission from "@/models/ExerciseSubmission";
import Feedback from "@/models/Feedback";
import Recommendation from "@/models/Recommendation";
import LearningProgress from "@/models/LearningProgress";
import Topic from "@/models/Topic";
import Attendance from "@/models/Attendance";

type LevelType = "easy" | "medium" | "hard";

function normalizeAnswer(value: string) {
  return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function evaluateMCQ(correctAnswer: string, submittedAnswer: string) {
  const isCorrect =
    normalizeAnswer(correctAnswer) === normalizeAnswer(submittedAnswer);

  return {
    isCorrect,
    score: isCorrect ? 100 : 0,
    detectedErrors: isCorrect ? [] : ["wrong_option"],
    dominantError: isCorrect ? "" : "wrong_option",
    quickFeedback: isCorrect ? "Jawaban benar." : "Jawaban masih salah.",
    feedbackText: isCorrect
      ? "Kamu sudah memilih jawaban yang tepat."
      : "Pilihan jawabanmu belum sesuai dengan jawaban yang benar.",
    tipText: isCorrect
      ? "Bagus, lanjutkan ke soal berikutnya."
      : "Periksa kembali konsep utama pada soal lalu coba lagi.",
  };
}

async function evaluateEssayWithAI(params: {
  instruction: string;
  correctAnswer: string;
  studentAnswer: string;
  level: LevelType;
  attendanceRate: number;
  attendanceLabel: string;
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
Kamu adalah AI evaluator untuk sistem pembelajaran.

Tugasmu adalah MENILAI PEMAHAMAN, bukan mencocokkan kata.

Soal:
${params.instruction}

Jawaban referensi (untuk pemahaman konsep):
${params.correctAnswer}

Jawaban mahasiswa:
${params.studentAnswer}

Context:
- Level: ${params.level}
- Attendance: ${params.attendanceRate}%

INSTRUKSI PENTING:
- Jangan menilai berdasarkan kesamaan kata.
- Fokus pada apakah MAKNA jawaban mahasiswa benar.
- Gunakan toleransi:
  - sinonim
  - parafrase
  - susunan kalimat berbeda
- Huruf besar/kecil TIDAK boleh mempengaruhi penilaian.

Penilaian:
- 100 = benar sepenuhnya
- 70 = sebagian benar
- 40 = kurang tepat
- 0 = salah total

Balas HANYA JSON:
{
  "isCorrect": true,
  "score": 0,
  "detectedErrors": ["string"],
  "dominantError": "string",
  "quickFeedback": "string",
  "feedbackText": "string",
  "tipText": "string",
  "reason": "string",
  "recommendedLevel": "easy"
}

Tambahan:
- Jika jawaban benar tapi berbeda kata → tetap dianggap benar
- Jika sebagian benar → jelaskan bagian yang kurang
- Feedback harus terasa seperti tutor manusia
`;
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "Balas hanya JSON valid tanpa markdown.",
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
    throw new Error(result?.error?.message || "Gagal menilai essay dengan AI");
  }

  const content =
    result?.choices?.[0]?.message?.content ||
    result?.choices?.[0]?.text ||
    "";

  try {
    return JSON.parse(content) as {
      isCorrect: boolean;
      score: number;
      detectedErrors: string[];
      dominantError: string;
      quickFeedback: string;
      feedbackText: string;
      tipText: string;
      reason: string;
      recommendedLevel: LevelType;
    };
  } catch (error) {
    console.error("ESSAY_AI_PARSE_ERROR:", error, content);
    throw new Error("Output AI essay tidak valid JSON");
  }
}

async function getRecentAttemptsByTopic(
  studentId: string | null,
  topicId: string | null
) {
  if (!studentId || !topicId) return [];

  return ExerciseAttempt.find({
    studentId,
    topicId,
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
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
  recentAttempts: any[],
  attendanceRate: number
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

  if (attendanceRate < 50 && !isCorrect) {
    return getLowerLevel(currentLevel);
  }

  if (correctStreak) {
    return getNextLevel(currentLevel);
  }

  if (wrongStreak) {
    return getLowerLevel(currentLevel);
  }

  if (isCorrect && attendanceRate >= 80) {
    return currentLevel === "hard" ? "hard" : getNextLevel(currentLevel);
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

async function getAttendanceSummary(studentId: string | null) {
  if (!studentId) {
    return {
      totalAttendance: 0,
      presentCount: 0,
      lateCount: 0,
      absentCount: 0,
      attendanceRate: 0,
      attendanceLabel: "unknown",
    };
  }

  const attendanceRecords = await Attendance.find({ studentId }).lean();

  const totalAttendance = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(
    (item: any) => item.status === "present"
  ).length;
  const lateCount = attendanceRecords.filter(
    (item: any) => item.status === "late"
  ).length;
  const absentCount = attendanceRecords.filter(
    (item: any) => item.status === "absent"
  ).length;

  const attendanceRate =
    totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

  let attendanceLabel = "low";
  if (attendanceRate >= 80) attendanceLabel = "high";
  else if (attendanceRate >= 60) attendanceLabel = "medium";

  return {
    totalAttendance,
    presentCount,
    lateCount,
    absentCount,
    attendanceRate,
    attendanceLabel,
  };
}

async function buildNarrativeForMCQ(params: {
  instruction: string;
  level: LevelType;
  studentAnswer: string;
  isCorrect: boolean;
  score: number;
  detectedErrors: string[];
  dominantError: string;
  topicTitle?: string;
  attendanceRate: number;
  attendanceLabel: string;
  recommendedLevel: LevelType;
}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_AI_MODEL || "openrouter/free";
  const baseUrl =
    process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

  if (!apiKey) {
    return {
      quickFeedback: params.isCorrect ? "Jawaban benar." : "Jawaban masih salah.",
      feedbackText: params.isCorrect
        ? "Kamu sudah menjawab dengan tepat."
        : "Pilihan jawabanmu belum tepat.",
      tipText:
        params.attendanceRate < 60
          ? "Tingkatkan konsistensi kehadiran dan ulangi materi dasar."
          : "Pelajari kembali konsep inti lalu coba soal serupa.",
      reason: `Sistem merekomendasikan latihan level ${params.recommendedLevel}.`,
    };
  }

  const prompt = `
Kamu adalah AI tutor untuk adaptive learning.
Sistem sudah menghitung hasil soal pilihan ganda. Tugasmu hanya membuat narasi singkat.

Data:
- Topik: ${params.topicTitle || "-"}
- Soal: ${params.instruction}
- Level: ${params.level}
- Jawaban mahasiswa: ${params.studentAnswer}
- Is Correct: ${params.isCorrect}
- Score: ${params.score}
- Detected Errors: ${JSON.stringify(params.detectedErrors)}
- Dominant Error: ${params.dominantError || "-"}
- Attendance Rate: ${params.attendanceRate}%
- Attendance Label: ${params.attendanceLabel}
- Recommended Level: ${params.recommendedLevel}

Balas HANYA JSON valid:
{
  "quickFeedback": "string",
  "feedbackText": "string",
  "tipText": "string",
  "reason": "string"
}

Aturan:
- Bahasa Indonesia.
- Ringkas.
- Jika attendance rendah, sertakan saran konsistensi belajar.
- Jangan tulis markdown.
`;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "Balas hanya JSON valid tanpa markdown.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    return {
      quickFeedback: params.isCorrect ? "Jawaban benar." : "Jawaban masih salah.",
      feedbackText: params.isCorrect
        ? "Kamu sudah menjawab dengan tepat."
        : "Pilihan jawabanmu belum tepat.",
      tipText:
        params.attendanceRate < 60
          ? "Tingkatkan konsistensi kehadiran dan ulangi materi dasar."
          : "Pelajari kembali konsep inti lalu coba soal serupa.",
      reason: `Sistem merekomendasikan latihan level ${params.recommendedLevel}.`,
    };
  }

  const content =
    result?.choices?.[0]?.message?.content ||
    result?.choices?.[0]?.text ||
    "";

  try {
    return JSON.parse(content) as {
      quickFeedback: string;
      feedbackText: string;
      tipText: string;
      reason: string;
    };
  } catch (error) {
    console.error("MCQ_AI_PARSE_ERROR:", error, content);
    return {
      quickFeedback: params.isCorrect ? "Jawaban benar." : "Jawaban masih salah.",
      feedbackText: params.isCorrect
        ? "Kamu sudah menjawab dengan tepat."
        : "Pilihan jawabanmu belum tepat.",
      tipText:
        params.attendanceRate < 60
          ? "Tingkatkan konsistensi kehadiran dan ulangi materi dasar."
          : "Pelajari kembali konsep inti lalu coba soal serupa.",
      reason: `Sistem merekomendasikan latihan level ${params.recommendedLevel}.`,
    };
  }
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

  return exercises.length ? exercises[0] : null;
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

    const [recentAttempts, attendanceSummary] = await Promise.all([
      getRecentAttemptsByTopic(
        studentId || null,
        exercise.topicId ? String(exercise.topicId) : null
      ),
      getAttendanceSummary(studentId || null),
    ]);

    let evaluation: {
      isCorrect: boolean;
      score: number;
      detectedErrors: string[];
      dominantError: string;
      quickFeedback: string;
      feedbackText: string;
      tipText: string;
      reason?: string;
      recommendedLevel?: LevelType;
    };

    let finalRecommendedLevel: LevelType;

    if (exercise.questionType === "multiple_choice") {
      const local = evaluateMCQ(exercise.correctAnswer, submittedAnswer);

      finalRecommendedLevel = determineRecommendedLevel(
        exercise.level,
        local.isCorrect,
        recentAttempts,
        attendanceSummary.attendanceRate
      );

      const narrative = await buildNarrativeForMCQ({
        instruction: exercise.instruction,
        level: exercise.level,
        studentAnswer: submittedAnswer,
        isCorrect: local.isCorrect,
        score: local.score,
        detectedErrors: local.detectedErrors,
        dominantError: local.dominantError,
        topicTitle,
        attendanceRate: attendanceSummary.attendanceRate,
        attendanceLabel: attendanceSummary.attendanceLabel,
        recommendedLevel: finalRecommendedLevel,
      });

      evaluation = {
        ...local,
        quickFeedback: narrative.quickFeedback || local.quickFeedback,
        feedbackText: narrative.feedbackText || local.feedbackText,
        tipText: narrative.tipText || local.tipText,
        reason:
          narrative.reason ||
          `Sistem merekomendasikan latihan level ${finalRecommendedLevel}.`,
        recommendedLevel: finalRecommendedLevel,
      };
    } else {
      const essayAI = await evaluateEssayWithAI({
        instruction: exercise.instruction,
        correctAnswer: exercise.correctAnswer,
        studentAnswer: submittedAnswer,
        level: exercise.level,
        attendanceRate: attendanceSummary.attendanceRate,
        attendanceLabel: attendanceSummary.attendanceLabel,
        topicTitle,
      });

      const fallbackRecommendedLevel = determineRecommendedLevel(
        exercise.level,
        Boolean(essayAI.isCorrect),
        recentAttempts,
        attendanceSummary.attendanceRate
      );

      finalRecommendedLevel =
        essayAI.recommendedLevel &&
        ["easy", "medium", "hard"].includes(essayAI.recommendedLevel)
          ? (essayAI.recommendedLevel as LevelType)
          : fallbackRecommendedLevel;

      evaluation = {
        isCorrect: Boolean(essayAI.isCorrect),
        score: Number(essayAI.score || 0),
        detectedErrors: Array.isArray(essayAI.detectedErrors)
          ? essayAI.detectedErrors
          : [],
        dominantError: essayAI.dominantError || "",
        quickFeedback: essayAI.quickFeedback || "",
        feedbackText: essayAI.feedbackText || "",
        tipText: essayAI.tipText || "",
        reason:
          essayAI.reason ||
          `Sistem merekomendasikan latihan level ${finalRecommendedLevel}.`,
        recommendedLevel: finalRecommendedLevel,
      };
    }

    const recommendedExercise = await findRecommendedExercise({
      topicId: exercise.topicId ? String(exercise.topicId) : null,
      recommendedLevel: finalRecommendedLevel,
      currentExerciseId: String(exercise._id),
    });

    const attendanceAwareQuickFeedback =
      attendanceSummary.attendanceRate < 60
        ? `${evaluation.quickFeedback} Jaga konsistensi kehadiranmu agar progres belajar lebih stabil.`
        : evaluation.quickFeedback;

    const attempt = await ExerciseAttempt.create({
      studentId: studentId || null,
      exerciseId: String(exercise._id),
      topicId: exercise.topicId ? String(exercise.topicId) : null,
      submittedAnswer,
      isCorrect: evaluation.isCorrect,
      score: evaluation.score,
      detectedErrors: evaluation.detectedErrors,
      quickFeedback: attendanceAwareQuickFeedback,
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
      isCorrect: evaluation.isCorrect,
      score: evaluation.score,
      detectedErrors: evaluation.detectedErrors,
      quickFeedback: attendanceAwareQuickFeedback,
      feedbackText: evaluation.feedbackText || "",
      tipText: evaluation.tipText || "",
      reason: evaluation.reason || "",
      recommendedLevel: finalRecommendedLevel,
      recommendedExerciseId: recommendedExercise?._id
        ? String(recommendedExercise._id)
        : null,
    });

    const feedback = await Feedback.create({
      studentId: studentId || null,
      exerciseAttemptId: String(attempt._id),
      feedbackText: evaluation.feedbackText || "",
      tipText: evaluation.tipText || "",
      errorType: evaluation.detectedErrors,
    });

    const recommendation = await Recommendation.create({
      studentId: studentId || null,
      basedOnAttemptId: String(attempt._id),
      recommendedExerciseId: recommendedExercise?._id
        ? String(recommendedExercise._id)
        : null,
      reason:
        evaluation.reason ||
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
        averageScore: evaluation.score,
        lastFeedback: attendanceAwareQuickFeedback,
      });
    } else {
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
          : evaluation.score;

      progress.completedExercises = uniqueCompletedExercises;
      progress.completedQuizzes = uniqueCompletedExercises;
      progress.averageScore = newAverageScore;
      progress.currentLevel = finalRecommendedLevel;
      progress.lastFeedback = attendanceAwareQuickFeedback;
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
        dominantError: evaluation.dominantError || null,
        attendance: attendanceSummary,
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