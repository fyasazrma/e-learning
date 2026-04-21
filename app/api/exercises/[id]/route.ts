import { connectDB } from "@/lib/mongodb";
import Exercise from "@/models/Exercise";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;
    const exercise = await Exercise.findById(id).lean();

    if (!exercise) {
      return Response.json(
        {
          success: false,
          message: "Latihan tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Berhasil mengambil detail latihan",
      data: exercise,
    });
  } catch (error) {
    console.error("GET_EXERCISE_DETAIL_ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengambil detail latihan",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      topicId,
      instruction,
      level,
      questionType,
      options,
      correctAnswer,
      explanation,
      aiTip,
      recommendedLevel,
      isPublished,
    } = body;

    const existingExercise = await Exercise.findById(id);

    if (!existingExercise) {
      return Response.json(
        {
          success: false,
          message: "Latihan tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const updatedExercise = await Exercise.findByIdAndUpdate(
      id,
      {
        ...(title !== undefined && { title }),
        ...(topicId !== undefined && { topicId: topicId || null }),
        ...(instruction !== undefined && { instruction }),
        ...(level !== undefined && { level }),
        ...(questionType !== undefined && { questionType }),
        ...(options !== undefined && {
          options:
            questionType === "multiple_choice" || existingExercise.questionType === "multiple_choice"
              ? (options || []).filter(
                  (item: any) => item?.label?.trim() && item?.value?.trim()
                )
              : [],
        }),
        ...(correctAnswer !== undefined && { correctAnswer }),
        ...(explanation !== undefined && { explanation }),
        ...(aiTip !== undefined && { aiTip }),
        ...(recommendedLevel !== undefined && { recommendedLevel }),
        ...(isPublished !== undefined && { isPublished }),
      },
      { new: true }
    );

    return Response.json({
      success: true,
      message: "Latihan berhasil diupdate",
      data: updatedExercise,
    });
  } catch (error) {
    console.error("UPDATE_EXERCISE_ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal update latihan",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;
    const deletedExercise = await Exercise.findByIdAndDelete(id);

    if (!deletedExercise) {
      return Response.json(
        {
          success: false,
          message: "Latihan tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Latihan berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE_EXERCISE_ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal menghapus latihan",
      },
      { status: 500 }
    );
  }
}