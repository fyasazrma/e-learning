import fs from "fs";
import path from "path";
import { connectDB } from "@/lib/mongodb";
import Material from "@/models/Material";

export async function GET() {
  try {
    await connectDB();

    const materials = await Material.find({})
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({
      success: true,
      message: "Berhasil mengambil data materi",
      data: materials,
    });
  } catch (error) {
    console.error("GET_MATERIALS_ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengambil data materi",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const formData = await request.formData();

    const title = (formData.get("title") as string) || "";
    const description = (formData.get("description") as string) || "";
    const content = (formData.get("content") as string) || "";
    const topicId = (formData.get("topicId") as string) || "";
    const isPublished = formData.get("isPublished") === "true";
    const file = formData.get("file") as File | null;

    if (!title.trim()) {
      return Response.json(
        {
          success: false,
          message: "Title wajib diisi",
        },
        { status: 400 }
      );
    }

    let fileName = "";
    let fileUrl = "";
    let fileType = "";
    let fileSize = 0;
    let contentType: "text" | "file" = "text";

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

      fileName = file.name;
      fileUrl = `/uploads/materials/${safeName}`;
      fileType = file.type;
      fileSize = file.size;
      contentType = "file";
    }

    const newMaterial = await Material.create({
      title,
      description,
      content: contentType === "text" ? content : "",
      topicId: topicId || null,
      isPublished,
      fileName,
      fileUrl,
      fileType,
      fileSize,
      contentType,
    });

    return Response.json(
      {
        success: true,
        message: "Materi berhasil ditambahkan",
        data: newMaterial,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST_MATERIAL_ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal menambahkan materi",
      },
      { status: 500 }
    );
  }
}