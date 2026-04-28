"use client";

import { useEffect, useMemo, useState } from "react";

type StudentType = {
  _id: string;
  name?: string;
  fullName?: string;
  email?: string;
  npm?: string;
};

type AttendanceType = {
  _id: string;
  studentId?: StudentType | string | null;
  date: string;
  status: "present" | "late" | "absent";
  note?: string;
};

function getStudentName(studentId: AttendanceType["studentId"]) {
  if (!studentId || typeof studentId === "string") return "-";

  return (
    studentId.name ||
    studentId.fullName ||
    studentId.email ||
    "-"
  );
}

function getStudentNpm(studentId: AttendanceType["studentId"]) {
  if (!studentId || typeof studentId === "string") return null;

  return studentId.npm || null;
}

export default function AdminAttendancePage() {
  const [attendanceData, setAttendanceData] = useState<AttendanceType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      const res = await fetch("/api/attendance", { cache: "no-store" });
      const result = await res.json();

      if (result.success) {
        setAttendanceData(result.data || []);
      } else {
        setAttendanceData([]);
      }
    } catch (error) {
      console.error("FETCH_ADMIN_ATTENDANCE_ERROR:", error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const summary = useMemo(() => {
    const present = attendanceData.filter((item) => item.status === "present").length;
    const late = attendanceData.filter((item) => item.status === "late").length;
    const absent = attendanceData.filter((item) => item.status === "absent").length;

    return { present, late, absent };
  }, [attendanceData]);

  return (
    <div className="page-stack fade-in">
      <div className="dashboard-card neu-card">
        <h2 style={{ marginBottom: 8 }}>Monitoring Absensi Sistem</h2>
        <p style={{ color: "var(--text-soft)", lineHeight: 1.7, marginBottom: 16 }}>
          Admin dapat memantau keseluruhan absensi mahasiswa dalam sistem.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <span className="neu-pill">Present: {summary.present}</span>
          <span className="neu-pill">Late: {summary.late}</span>
          <span className="neu-pill">Absent: {summary.absent}</span>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-card neu-card">Loading attendance...</div>
      ) : attendanceData.length === 0 ? (
        <div className="dashboard-card neu-card">
          <p style={{ color: "var(--text-soft)" }}>
            Belum ada data absensi.
          </p>
        </div>
      ) : (
        <div className="info-list">
          {attendanceData.map((item) => {
            const studentName = getStudentName(item.studentId);
            const studentNpm = getStudentNpm(item.studentId);

            return (
              <div key={item._id} className="info-row-card neu-card">
                <div className="info-row-left">
                  <h3>Mahasiswa: {studentName}</h3>

                  {studentNpm && (
                    <p>NPM: {studentNpm}</p>
                  )}

                  <p>
                    {new Date(item.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="info-row-meta">
                  <span className="neu-pill" style={{ textTransform: "capitalize" }}>
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}