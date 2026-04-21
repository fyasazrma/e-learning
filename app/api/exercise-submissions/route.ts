import { connectDB } from "@/lib/mongodb";
import ExerciseSubmission from "@/models/ExerciseSubmission";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const topicId = searchParams.get("topicId");

    const query: Record<string, any> = {};

    if (studentId) {
      query.studentId = studentId;
    }

    if (topicId) {
      query.topicId = topicId;
    }

    const submissions = await ExerciseSubmission.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({
      success: true,
      message: "Berhasil mengambil data exercise submissions",
      data: submissions,
    });
  } catch (error) {
    console.error("GET_EXERCISE_SUBMISSIONS_ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengambil data exercise submissions",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      studentId,
      exerciseId,
      topicId,
      questionTitle,
      submittedAnswer,
      isCorrect,
      score,
      detectedErrors,
      quickFeedback,
      feedbackText,
      tipText,
      reason,
      recommendedLevel,
      recommendedExerciseId,
    } = body;

    if (!exerciseId || !submittedAnswer) {
      return Response.json(
        {
          success: false,
          message: "exerciseId dan submittedAnswer wajib diisi",
        },
        { status: 400 }
      );
    }

    const submission = await ExerciseSubmission.create({
      studentId: studentId || null,
      exerciseId,
      topicId: topicId || null,
      questionTitle: questionTitle || "",
      submittedAnswer,
      isCorrect: Boolean(isCorrect),
      score: Number(score || 0),
      detectedErrors: Array.isArray(detectedErrors) ? detectedErrors : [],
      quickFeedback: quickFeedback || "",
      feedbackText: feedbackText || "",
      tipText: tipText || "",
      reason: reason || "",
      recommendedLevel: recommendedLevel || "easy",
      recommendedExerciseId: recommendedExerciseId || null,
    });

    return Response.json(
      {
        success: true,
        message: "Exercise submission berhasil disimpan",
        data: submission,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST_EXERCISE_SUBMISSIONS_ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal menyimpan exercise submission",
      },
      { status: 500 }
    );
  }
}