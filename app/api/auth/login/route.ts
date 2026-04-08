import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        {
          success: false,
          message: "Email dan password wajib diisi",
        },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Akun tidak ditemukan",
        },
        { status: 404 }
      );
    }

    if (user.password !== password) {
      return Response.json(
        {
          success: false,
          message: "Password salah",
        },
        { status: 401 }
      );
    }

    return Response.json({
      success: true,
      message: "Login berhasil",
      data: {
        id: String(user._id),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        npm: user.npm || "",
      },
    });
  } catch (error) {
    console.error("LOGIN_ERROR", error);

    return Response.json(
      {
        success: false,
        message: "Gagal login",
      },
      { status: 500 }
    );
  }
}