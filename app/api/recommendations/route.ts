import { connectDB } from "@/lib/mongodb";
import Recommendation from "@/models/Recommendation";

export async function GET() {
  try {
    await connectDB();

    const recommendations = await Recommendation.find({})
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({
      success: true,
      message: "Berhasil mengambil data rekomendasi",
      data: recommendations,
    });
  } catch (error) {
    console.error("GET_RECOMMENDATIONS_ERROR", error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengambil data rekomendasi",
      },
      { status: 500 }
    );
  }
}