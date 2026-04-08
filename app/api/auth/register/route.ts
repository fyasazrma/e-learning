import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { fullName, email, npm, password } = body;

    if (!fullName || !email || !npm || !password) {
      return Response.json(
        {
          success: false,
          message: "Nama, email, npm, dan password wajib diisi",
        },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return Response.json(
        {
          success: false,
          message: "Email sudah digunakan",
        },
        { status: 409 }
      );
    }

    const newUser = await User.create({
      fullName,
      email,
      npm,
      password,
      role: "mahasiswa",
    });

    return Response.json(
      {
        success: true,
        message: "Registrasi mahasiswa berhasil",
        data: {
          id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER_STUDENT_ERROR", error);

    return Response.json(
      {
        success: false,
        message: "Gagal registrasi mahasiswa",
      },
      { status: 500 }
    );
  }
}