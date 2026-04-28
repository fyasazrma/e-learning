import { connectDB } from "@/lib/mongodb";
import Attendance from "@/models/Attendance";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    const query: Record<string, any> = {};

    if (studentId) {
      query.studentId = studentId;
    }

    const data = await Attendance.find(query)
      .populate("studentId", "name fullName email npm role")
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({
      success: true,
      message: "Berhasil mengambil data absensi",
      data,
    });
  } catch (error) {
    console.error("GET_ATTENDANCE_ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengambil data absensi",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { studentId, status, note } = body;

    if (!studentId) {
      return Response.json(
        {
          success: false,
          message: "studentId wajib diisi",
        },
        { status: 400 }
      );
    }

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAttendance = await Attendance.findOne({
      studentId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (existingAttendance) {
      return Response.json(
        {
          success: false,
          message: "Kamu sudah absen hari ini",
        },
        { status: 409 }
      );
    }

    const newAttendance = await Attendance.create({
      studentId,
      status: status || "present",
      note: note || "",
      date: new Date(),
    });

    return Response.json(
      {
        success: true,
        message: "Absensi berhasil dicatat",
        data: newAttendance,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST_ATTENDANCE_ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal menyimpan absensi",
      },
      { status: 500 }
    );
  }
}