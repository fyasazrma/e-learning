import fs from "fs";
import path from "path";
import { connectDB } from "@/lib/mongodb";
import DeletionRequest from "@/models/DeletionRequest";
import Material from "@/models/Material";
import Exercise from "@/models/Exercise";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: Request, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { status, reviewedBy, adminNote } = body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return Response.json(
        {
          success: false,
          message: "status harus approved atau rejected",
        },
        { status: 400 }
      );
    }

    const existingRequest = await DeletionRequest.findById(id);

    if (!existingRequest) {
      return Response.json(
        {
          success: false,
          message: "Request tidak ditemukan",
        },
        { status: 404 }
      );
    }

    if (existingRequest.status !== "pending") {
      return Response.json(
        {
          success: false,
          message: "Request ini sudah diproses",
        },
        { status: 409 }
      );
    }

    if (status === "approved") {
      if (existingRequest.itemType === "exercise") {
        await Exercise.findByIdAndDelete(existingRequest.itemId);
      }

      if (existingRequest.itemType === "material") {
        const deletedMaterial = await Material.findByIdAndDelete(
          existingRequest.itemId
        );

        if (deletedMaterial?.fileUrl) {
          const filePath = path.join(
            process.cwd(),
            "public",
            deletedMaterial.fileUrl
          );

          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
            } catch (e) {
              console.error("DELETE_MATERIAL_FILE_ERROR:", e);
            }
          }
        }
      }
    }

    const updatedRequest = await DeletionRequest.findByIdAndUpdate(
      id,
      {
        status,
        reviewedBy: reviewedBy || null,
        reviewedAt: new Date(),
        adminNote: adminNote || "",
      },
      { new: true }
    );

    return Response.json({
      success: true,
      message:
        status === "approved"
          ? "Request disetujui dan item berhasil dihapus"
          : "Request penghapusan ditolak",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("UPDATE_DELETION_REQUEST_ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal memproses request penghapusan",
      },
      { status: 500 }
    );
  }
}