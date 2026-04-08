import { connectDB } from "@/lib/mongodb";
import Feedback from "@/models/Feedback";

export async function GET() {
  try {
    await connectDB();

    const feedbacks = await Feedback.find({})
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({
      success: true,
      message: "Berhasil mengambil data feedback",
      data: feedbacks,
    });
  } catch (error) {
    console.error("GET_FEEDBACKS_ERROR", error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengambil data feedback",
      },
      { status: 500 }
    );
  }
}