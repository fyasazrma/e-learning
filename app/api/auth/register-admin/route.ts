import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { fullName, email, password, accessKey } = body;

    if (!fullName || !email || !password || !accessKey) {
      return Response.json(
        { success: false, message: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    if (accessKey !== process.env.ADMIN_REGISTER_KEY) {
      return Response.json(
        { success: false, message: "Admin key tidak valid" },
        { status: 403 }
      );
    }

    const existing = await User.findOne({ email });

    if (existing) {
      return Response.json(
        { success: false, message: "Email sudah digunakan" },
        { status: 409 }
      );
    }

    const admin = await User.create({
      fullName,
      email,
      password,
      role: "admin",
    });

    return Response.json(
      {
        success: true,
        message: "Admin berhasil dibuat",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER_ADMIN_ERROR", error);

    return Response.json(
      { success: false, message: "Gagal membuat admin" },
      { status: 500 }
    );
  }
}