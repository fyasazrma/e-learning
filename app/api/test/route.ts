import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();

    return Response.json({
      success: true,
      message: "MongoDB connected",
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "MongoDB failed",
      },
      { status: 500 }
    );
  }
}