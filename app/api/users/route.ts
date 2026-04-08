import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({
      success: true,
      message: "Berhasil mengambil data users",
      data: users,
    });
  } catch (error) {
    console.error("GET_USERS_ERROR", error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengambil data users",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { fullName, email, password, role, npm, nipd } = body;

    if (!fullName || !email || !password || !role) {
      return Response.json(
        {
          success: false,
          message: "fullName, email, password, dan role wajib diisi",
        },
        { status: 400 }
      );
    }

    if (role === "mahasiswa" && !npm) {
      return Response.json(
        {
          success: false,
          message: "NPM wajib diisi untuk mahasiswa",
        },
        { status: 400 }
      );
    }

    if (role === "dosen" && !nipd) {
      return Response.json(
        {
          success: false,
          message: "NIPD wajib diisi untuk dosen",
        },
        { status: 400 }
      );
    }

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
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
      password,
      role,
      npm: role === "mahasiswa" ? npm || "" : "",
      nipd: role === "dosen" ? nipd || "" : "",
    });

    const userSafe = await User.findById(newUser._id).select("-password").lean();

    return Response.json(
      {
        success: true,
        message: "User berhasil dibuat",
        data: userSafe,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST_USERS_ERROR", error);

    return Response.json(
      {
        success: false,
        message: "Gagal membuat user",
      },
      { status: 500 }
    );
  }
}