import { connectDB } from "@/lib/mongodb";
import Exercise from "@/models/Exercise";
import ExerciseAttempt from "@/models/ExerciseAttempt";
import Feedback from "@/models/Feedback";
import Recommendation from "@/models/Recommendation";
import LearningProgress from "@/models/LearningProgress";
import Topic from "@/models/Topic";

type LevelType = "easy" | "medium" | "hard";

function normalizeAnswer(value: string) {
  return value.replace(/\s+/g, "").toUpperCase();
}

function detectErrors(
  submittedAnswer: string,
  correctAnswer: string
): string[] {
  const errors: string[] = [];

  const submitted = normalizeAnswer(submittedAnswer);
  const correct = normalizeAnswer(correctAnswer);

  if (!submitted.startsWith("=")) {
    errors.push("formula_syntax");
  }

  const submittedRange = submitted.match(/\(([A-Z0-9:]+)\)/);
  const correctRange = correct.match(/\(([A-Z0-9:]+)\)/);

  if (
    submittedRange &&
    correctRange &&
    submittedRange[1] !== correctRange[1]
  ) {
    errors.push("wrong_range");
  }

  const submittedFn = submitted.match(/^=([A-Z]+)/);
  const correctFn = correct.match(/^=([A-Z]+)/);

  if (submittedFn && correctFn && submittedFn[1] !== correctFn[1]) {
    errors.push("wrong_function");
  }

  if (submitted !== correct && errors.length === 0) {
    errors.push("wrong_answer");
  }

  return [...new Set(errors)];
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

function buildFeedback(errors: string[], topicSlug?: string) {
  const topic = (topicSlug || "").toLowerCase();

  if (topic.includes("sheet")) {
    if (errors.includes("formula_syntax")) {
      return {
        feedbackText: "Format rumus masih belum benar.",
        tipText:
          "Tambahkan tanda = di awal, lalu pastikan nama fungsi ditulis dengan benar.",
        quickFeedback: "Perbaiki format rumus terlebih dahulu.",
      };
    }

    if (errors.includes("wrong_range")) {
      return {
        feedbackText: "Range yang digunakan belum tepat.",
        tipText: "Periksa kembali sel awal dan sel akhir pada range rumus.",
        quickFeedback: "Range rumus masih belum sesuai.",
      };
    }

    if (errors.includes("wrong_function")) {
      return {
        feedbackText: "Fungsi yang dipakai belum sesuai instruksi.",
        tipText: "Gunakan fungsi yang diminta, misalnya SUM atau AVERAGE.",
        quickFeedback: "Fungsi rumus masih salah.",
      };
    }

    if (errors.includes("wrong_answer")) {
      return {
        feedbackText: "Jawaban rumus masih belum sesuai.",
        tipText: "Cek kembali fungsi, range, dan format rumusnya.",
        quickFeedback: "Jawaban rumus belum tepat.",
      };
    }
  }

  if (topic.includes("docs")) {
    return errors.length > 0
      ? {
          feedbackText: "Langkah pengolahan dokumen belum sesuai.",
          tipText:
            "Periksa kembali format teks, alignment, dan instruksi dokumen yang diminta.",
          quickFeedback: "Masih ada langkah dokumen yang belum tepat.",
        }
      : {
          feedbackText: "Jawaban kamu sudah benar.",
          tipText: "Bagus, lanjutkan ke latihan berikutnya.",
          quickFeedback: "Jawaban benar. Kamu bisa lanjut.",
        };
  }

  if (topic.includes("slide")) {
    return errors.length > 0
      ? {
          feedbackText: "Penyusunan slide belum sesuai instruksi.",
          tipText: "Periksa layout, elemen visual, dan struktur presentasi.",
          quickFeedback: "Masih ada bagian slide yang perlu diperbaiki.",
        }
      : {
          feedbackText: "Jawaban kamu sudah benar.",
          tipText: "Bagus, lanjutkan ke latihan berikutnya.",
          quickFeedback: "Jawaban benar. Kamu bisa lanjut.",
        };
  }

  if (errors.includes("formula_syntax")) {
    return {
      feedbackText: "Format jawaban masih belum benar.",
      tipText: "Gunakan format jawaban yang sesuai dengan instruksi.",
      quickFeedback: "Format jawaban masih salah.",
    };
  }

  if (errors.includes("wrong_range")) {
    return {
      feedbackText: "Bagian range atau cakupan jawaban belum tepat.",
      tipText: "Periksa kembali bagian awal dan akhir jawabanmu.",
      quickFeedback: "Range jawaban belum sesuai.",
    };
  }

  if (errors.includes("wrong_function")) {
    return {
      feedbackText: "Bagian fungsi atau metode yang dipilih belum tepat.",
      tipText: "Gunakan fungsi atau metode yang sesuai instruksi.",
      quickFeedback: "Metode yang dipakai masih salah.",
    };
  }

  if (errors.includes("wrong_answer")) {
    return {
      feedbackText: "Jawaban masih belum sesuai.",
      tipText: "Coba ulangi lagi dengan mengikuti instruksi latihan.",
      quickFeedback: "Jawaban belum sesuai instruksi.",
    };
  }

  return {
    feedbackText: "Jawaban kamu sudah benar.",
    tipText: "Bagus, lanjutkan ke latihan berikutnya.",
    quickFeedback: "Jawaban benar. Kamu bisa lanjut.",
  };
}

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

function getDominantError(recentAttempts: any[], currentErrors: string[]) {
  const errorMap: Record<string, number> = {};

  currentErrors.forEach((error) => {
    errorMap[error] = (errorMap[error] || 0) + 2;
  });

  recentAttempts.forEach((attempt) => {
    (attempt.detectedErrors || []).forEach((error: string) => {
      errorMap[error] = (errorMap[error] || 0) + 1;
    });
  });

  const sorted = Object.entries(errorMap).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0][0] : null;
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

function buildRecommendationReason(params: {
  isCorrect: boolean;
  dominantError: string | null;
  recommendedLevel: LevelType;
  topicTitle?: string;
}) {
  const { isCorrect, dominantError, recommendedLevel, topicTitle } = params;

  if (isCorrect) {
    return `Performa pada topik ${topicTitle || "ini"} mulai stabil. Sistem merekomendasikan latihan level ${recommendedLevel}.`;
  }

  if (dominantError === "formula_syntax") {
    return "Sistem mendeteksi kesalahan sintaks rumus yang dominan, jadi direkomendasikan latihan penguatan sintaks dasar pada topik yang sama.";
  }

  if (dominantError === "wrong_range") {
    return "Sistem mendeteksi kesalahan range yang dominan, jadi direkomendasikan latihan penguatan penggunaan range pada topik yang sama.";
  }

  if (dominantError === "wrong_function") {
    return "Sistem mendeteksi kesalahan pemilihan fungsi, jadi direkomendasikan latihan fungsi sejenis yang lebih mudah pada topik yang sama.";
  }

  if (dominantError === "wrong_answer") {
    return `Jawaban masih belum tepat, jadi direkomendasikan latihan level ${recommendedLevel} pada topik yang sama untuk penguatan.`;
  }

  return `Sistem merekomendasikan latihan level ${recommendedLevel} pada topik yang sama.`;
}

async function findRecommendedExercise(params: {
  topicId: string | null;
  recommendedLevel: LevelType;
  currentExerciseId: string;
  dominantError: string | null;
}) {
  const { topicId, recommendedLevel, currentExerciseId, dominantError } = params;

  const query: Record<string, any> = {
    isPublished: true,
    level: recommendedLevel,
    _id: { $ne: currentExerciseId },
  };

  if (topicId) {
    query.topicId = topicId;
  }

  let exercises: any[] = await Exercise.find(query).sort({ createdAt: 1 }).lean();

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

  if (dominantError === "formula_syntax") {
    const syntaxMatch =
      exercises.find(
        (item) =>
          item.title?.toLowerCase().includes("sum") ||
          item.instruction?.toLowerCase().includes("rumus")
      ) || exercises[0];
    return syntaxMatch;
  }

  if (dominantError === "wrong_range") {
    const rangeMatch =
      exercises.find((item) =>
        item.instruction?.toLowerCase().includes("a1") ||
        item.instruction?.toLowerCase().includes("b1") ||
        item.instruction?.toLowerCase().includes("range")
      ) || exercises[0];
    return rangeMatch;
  }

  if (dominantError === "wrong_function") {
    const functionMatch =
      exercises.find(
        (item) =>
          item.title?.toLowerCase().includes("sum") ||
          item.title?.toLowerCase().includes("average")
      ) || exercises[0];
    return functionMatch;
  }

  return exercises[0];
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

    const topicSlug = topicDoc?.slug || "";
    const topicTitle = topicDoc?.title || "topik ini";

    const submitted = normalizeAnswer(submittedAnswer);
    const correct = normalizeAnswer(exercise.correctAnswer);

    const isCorrect = submitted === correct;
    const detectedErrors = isCorrect
      ? []
      : detectErrors(submittedAnswer, exercise.correctAnswer);

    const recentAttempts = await getRecentAttemptsByTopic(
      studentId || null,
      exercise.topicId ? String(exercise.topicId) : null
    );

    const dominantError = getDominantError(recentAttempts, detectedErrors);

    const feedbackResult = buildFeedback(detectedErrors, topicSlug);
    const recommendedLevel = determineRecommendedLevel(
      exercise.level,
      isCorrect,
      recentAttempts
    );

    const recommendedExercise: any = await findRecommendedExercise({
      topicId: exercise.topicId ? String(exercise.topicId) : null,
      recommendedLevel,
      currentExerciseId: String(exercise._id),
      dominantError,
    });

    const score = isCorrect ? 100 : 50;

    const attempt = await ExerciseAttempt.create({
      studentId: studentId || null,
      exerciseId: String(exercise._id),
      topicId: exercise.topicId ? String(exercise.topicId) : null,
      submittedAnswer,
      isCorrect,
      score,
      detectedErrors,
      quickFeedback: feedbackResult.quickFeedback,
      recommendedLevel,
      recommendedExerciseId: recommendedExercise?._id
        ? String(recommendedExercise._id)
        : null,
    });

    const feedback = await Feedback.create({
      studentId: studentId || null,
      exerciseAttemptId: String(attempt._id),
      feedbackText: feedbackResult.feedbackText,
      tipText: feedbackResult.tipText,
      errorType: detectedErrors,
    });

    const recommendation = await Recommendation.create({
      studentId: studentId || null,
      basedOnAttemptId: String(attempt._id),
      recommendedExerciseId: recommendedExercise?._id
        ? String(recommendedExercise._id)
        : null,
      reason: buildRecommendationReason({
        isCorrect,
        dominantError,
        recommendedLevel,
        topicTitle,
      }),
      targetLevel: recommendedLevel,
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
        completedQuizzes: 0,
        currentLevel: recommendedLevel,
        averageScore: score,
        lastFeedback: feedbackResult.quickFeedback,
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
              allAttempts.reduce((sum: number, item: any) => sum + (item.score || 0), 0) /
                allAttempts.length
            )
          : score;

      progress.completedExercises = uniqueCompletedExercises;
      progress.averageScore = newAverageScore;
      progress.currentLevel = recommendedLevel;
      progress.lastFeedback = feedbackResult.quickFeedback;
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
        dominantError,
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