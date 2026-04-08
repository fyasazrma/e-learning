import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;
    const user = await User.findById(id).select("-password").lean();

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Berhasil mengambil detail user",
      data: user,
    });
  } catch (error) {
    console.error("GET_USER_BY_ID_ERROR", error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengambil detail user",
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
    const { fullName, email, role, npm, nipd } = body;

    const existingUser = await User.findById(id);

    if (!existingUser) {
      return Response.json(
        {
          success: false,
          message: "User tidak ditemukan",
        },
        { status: 404 }
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

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        ...(fullName !== undefined && { fullName }),
        ...(email !== undefined && { email }),
        ...(role !== undefined && { role }),
        npm: role === "mahasiswa" ? npm || "" : "",
        nipd: role === "dosen" ? nipd || "" : "",
      },
      { new: true }
    ).select("-password");

    return Response.json({
      success: true,
      message: "User berhasil diupdate",
      data: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE_USER_ERROR", error);

    return Response.json(
      {
        success: false,
        message: "Gagal update user",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return Response.json(
        {
          success: false,
          message: "User tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "User berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE_USER_ERROR", error);

    return Response.json(
      {
        success: false,
        message: "Gagal menghapus user",
      },
      { status: 500 }
    );
  }
}