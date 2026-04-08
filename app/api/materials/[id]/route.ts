import fs from "fs";
import path from "path";
import { connectDB } from "@/lib/mongodb";
import Material from "@/models/Material";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;
    const material = await Material.findById(id).lean();

    if (!material) {
      return Response.json(
        {
          success: false,
          message: "Materi tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Berhasil mengambil detail materi",
      data: material,
    });
  } catch (error) {
    console.error("GET_MATERIAL_DETAIL_ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengambil detail materi",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;
    const existingMaterial = await Material.findById(id);

    if (!existingMaterial) {
      return Response.json(
        {
          success: false,
          message: "Materi tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const formData = await request.formData();

    const title = (formData.get("title") as string) || "";
    const description = (formData.get("description") as string) || "";
    const content = (formData.get("content") as string) || "";
    const topicId = (formData.get("topicId") as string) || "";
    const isPublished = formData.get("isPublished") === "true";
    const file = formData.get("file") as File | null;

    let updateData: Record<string, any> = {
      title,
      description,
      topicId: topicId || null,
      isPublished,
    };

    if (file && file.size > 0) {
      const allowedTypes = [
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/pdf",
      ];

      if (!allowedTypes.includes(file.type)) {
        return Response.json(
          {
            success: false,
            message: "File harus berupa DOC, DOCX, atau PDF",
          },
          { status: 400 }
        );
      }

      const uploadDir = path.join(process.cwd(), "public", "uploads", "materials");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const safeName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const filePath = path.join(uploadDir, safeName);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      fs.writeFileSync(filePath, buffer);

      if (existingMaterial.fileUrl) {
        const oldPath = path.join(process.cwd(), "public", existingMaterial.fileUrl);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (e) {
            console.error("DELETE_OLD_FILE_ERROR:", e);
          }
        }
      }

      updateData = {
        ...updateData,
        content: "",
        fileName: file.name,
        fileUrl: `/uploads/materials/${safeName}`,
        fileType: file.type,
        fileSize: file.size,
        contentType: "file",
      };
    } else {
      updateData = {
        ...updateData,
        content,
      };
    }

    const updatedMaterial = await Material.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return Response.json({
      success: true,
      message: "Materi berhasil diupdate",
      data: updatedMaterial,
    });
  } catch (error) {
    console.error("UPDATE_MATERIAL_ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal update materi",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;
    const deletedMaterial = await Material.findByIdAndDelete(id);

    if (!deletedMaterial) {
      return Response.json(
        {
          success: false,
          message: "Materi tidak ditemukan",
        },
        { status: 404 }
      );
    }

    if (deletedMaterial.fileUrl) {
      const filePath = path.join(process.cwd(), "public", deletedMaterial.fileUrl);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error("DELETE_FILE_ERROR:", e);
        }
      }
    }

    return Response.json({
      success: true,
      message: "Materi berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE_MATERIAL_ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal menghapus materi",
      },
      { status: 500 }
    );
  }
}