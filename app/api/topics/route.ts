import { connectDB } from "@/lib/mongodb";
import Topic from "@/models/Topic";

export async function GET() {
  try {
    await connectDB();

    const topics = await Topic.find({})
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({
      success: true,
      message: "Berhasil mengambil data topic",
      data: topics,
    });
  } catch (error) {
    console.error("GET_TOPICS_ERROR", error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengambil data topic",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { title, slug, description, createdBy } = body;

    if (!title || !slug) {
      return Response.json(
        {
          success: false,
          message: "title dan slug wajib diisi",
        },
        { status: 400 }
      );
    }

    const existingTopic = await Topic.findOne({ slug: slug.toLowerCase() });

    if (existingTopic) {
      return Response.json(
        {
          success: false,
          message: "Slug topic sudah digunakan",
        },
        { status: 409 }
      );
    }

    const newTopic = await Topic.create({
      title,
      slug: slug.toLowerCase(),
      description: description || "",
      createdBy: createdBy || null,
    });

    return Response.json(
      {
        success: true,
        message: "Topic berhasil dibuat",
        data: newTopic,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST_TOPIC_ERROR", error);

    return Response.json(
      {
        success: false,
        message: "Gagal membuat topic",
      },
      { status: 500 }
    );
  }
}