import { connectDB } from "@/lib/mongodb";
import LearningProgress from "@/models/LearningProgress";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return Response.json(
        {
          success: false,
          message: "studentId wajib dikirim",
        },
        { status: 400 }
      );
    }

    const progress = await LearningProgress.find({ studentId })
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