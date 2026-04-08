import { connectDB } from "@/lib/mongodb";
import Exercise from "@/models/Exercise";
import Topic from "@/models/Topic";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const topic = searchParams.get("topic");
    const level = searchParams.get("level");

    let topicDoc = null;

    if (topic) {
      topicDoc = await Topic.findOne({
        slug: topic.toLowerCase(),
      }).lean();

      if (!topicDoc) {
        return Response.json({
          success: true,
          message: "Topik tidak ditemukan",
          data: [],
        });
      }
    }

    const baseQuery: Record<string, any> = {
      isPublished: true,
    };

    if (level) {
      baseQuery.level = level.toLowerCase();
    }

    const allExercises = await Exercise.find(baseQuery)
      .sort({ createdAt: 1 })
      .lean();

    const filteredExercises = topicDoc
      ? allExercises.filter(
          (exercise: any) => String(exercise.topicId) === String(topicDoc?._id)
        )
      : allExercises;

    const finalExercises =
      topic && level ? filteredExercises.slice(0, 3) : filteredExercises;

    return Response.json({
      success: true,
      message: "Berhasil mengambil data latihan",
      data: finalExercises,
    });
  } catch (error) {
    console.error("GET_EXERCISES_ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengambil data latihan",
        error: String(error),
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
      title,
      topicId,
      instruction,
      level,
      correctAnswer,
      isPublished,
    } = body;

    if (!title || !instruction || !level || !correctAnswer) {
      return Response.json(
        {
          success: false,
          message: "title, instruction, level, dan correctAnswer wajib diisi",
        },
        { status: 400 }
      );
    }

    const newExercise = await Exercise.create({
      title,
      topicId: topicId || null,
      instruction,
      level,
      correctAnswer,
      isPublished: typeof isPublished === "boolean" ? isPublished : true,
    });

    return Response.json(
      {
        success: true,
        message: "Latihan berhasil dibuat",
        data: newExercise,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST_EXERCISE_ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal membuat latihan",
      },
      { status: 500 }
    );
  }
}