import { connectDB } from "@/lib/mongodb";
import LearningProgress from "@/models/LearningProgress";

export async function GET() {
  try {
    await connectDB();

    const progress = await LearningProgress.find({})
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({
      success: true,
      message: "Berhasil mengambil data learning progress",
      data: progress,
    });
  } catch (error) {
    console.error("GET_LEARNING_PROGRESS_ERROR", error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengambil data learning progress",
      },
      { status: 500 }
    );
  }
}