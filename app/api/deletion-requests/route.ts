import { connectDB } from "@/lib/mongodb";
import DeletionRequest from "@/models/DeletionRequest";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const requestedBy = searchParams.get("requestedBy");
    const status = searchParams.get("status");

    const query: Record<string, any> = {};

    if (requestedBy) {
      query.requestedBy = requestedBy;
    }

    if (status) {
      query.status = status;
    }

    const requests = await DeletionRequest.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({
      success: true,
      message: "Berhasil mengambil data request penghapusan",
      data: requests,
    });
  } catch (error) {
    console.error("GET_DELETION_REQUESTS_ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengambil data request penghapusan",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { itemType, itemId, itemTitle, requestedBy, reason } = body;

    if (!itemType || !itemId || !requestedBy) {
      return Response.json(
        {
          success: false,
          message: "itemType, itemId, dan requestedBy wajib diisi",
        },
        { status: 400 }
      );
    }

    const existingPending = await DeletionRequest.findOne({
      itemType,
      itemId,
      requestedBy,
      status: "pending",
    });

    if (existingPending) {
      return Response.json(
        {
          success: false,
          message: "Request penghapusan untuk item ini masih pending",
        },
        { status: 409 }
      );
    }

    const newRequest = await DeletionRequest.create({
      itemType,
      itemId,
      itemTitle: itemTitle || "",
      requestedBy,
      reason: reason || "",
    });

    return Response.json(
      {
        success: true,
        message: "Request penghapusan berhasil diajukan",
        data: newRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST_DELETION_REQUEST_ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal membuat request penghapusan",
      },
      { status: 500 }
    );
  }
}