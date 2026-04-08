import { connectDB } from "@/lib/mongodb";
import { errorResponse, successResponse } from "@/lib/api-response";
import { comparePassword, signToken } from "@/lib/auth";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse("Email dan password wajib diisi", 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse("User tidak ditemukan", 404);
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return errorResponse("Password salah", 401);
    }

    const token = signToken({
  userId: user._id.toString(),
  fullName: user.fullName,
  email: user.email,
  role: user.role,
});

    return successResponse({
      token,
      user,
    });
  } catch (error) {
    console.error(error);
    return errorResponse("Login gagal", 500);
  }
}