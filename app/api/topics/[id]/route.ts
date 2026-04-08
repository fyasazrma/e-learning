import { connectDB } from "@/lib/mongodb";
import Topic from "@/models/Topic";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;
    const topic = await Topic.findById(id).lean();

    if (!topic) {
      return Response.json(
        {
          success: false,
          message: "Topic tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Berhasil mengambil detail topic",
      data: topic,
    });
  } catch (error) {
    console.error("GET_TOPIC_BY_ID_ERROR", error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengambil detail topic",
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
    const { title, slug, description, createdBy } = body;

    const existingTopic = await Topic.findById(id);

    if (!existingTopic) {
      return Response.json(
        {
          success: false,
          message: "Topic tidak ditemukan",
        },
        { status: 404 }
      );
    }

    if (slug && slug !== existingTopic.slug) {
      const slugUsed = await Topic.findOne({
        slug: slug.toLowerCase(),
        _id: { $ne: id },
      });

      if (slugUsed) {
        return Response.json(
          {
            success: false,
            message: "Slug topic sudah digunakan",
          },
          { status: 409 }
        );
      }
    }

    const updatedTopic = await Topic.findByIdAndUpdate(
      id,
      {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug: slug.toLowerCase() }),
        ...(description !== undefined && { description }),
        ...(createdBy !== undefined && { createdBy }),
      },
      { new: true }
    );

    return Response.json({
      success: true,
      message: "Topic berhasil diupdate",
      data: updatedTopic,
    });
  } catch (error) {
    console.error("PUT_TOPIC_ERROR", error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengupdate topic",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;
    const deletedTopic = await Topic.findByIdAndDelete(id);

    if (!deletedTopic) {
      return Response.json(
        {
          success: false,
          message: "Topic tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Topic berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE_TOPIC_ERROR", error);

    return Response.json(
      {
        success: false,
        message: "Gagal menghapus topic",
      },
      { status: 500 }
    );
  }
}