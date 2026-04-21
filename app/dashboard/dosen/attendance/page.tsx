"use client";

import { useEffect, useMemo, useState } from "react";

type AttendanceType = {
  _id: string;
  studentId?: string | null;
  date: string;
  status: "present" | "late" | "absent";
  note?: string;
};

export default function DosenAttendancePage() {
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
      console.error("FETCH_DOSEN_ATTENDANCE_ERROR:", error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const totalPresent = useMemo(
    () => attendanceData.filter((item) => item.status === "present").length,
    [attendanceData]
  );

  return (
    <div className="page-stack fade-in">
      <div className="dashboard-card neu-card">
        <h2 style={{ marginBottom: 8 }}>Monitoring Absensi Mahasiswa</h2>
        <p style={{ color: "var(--text-soft)", lineHeight: 1.7 }}>
          Lihat seluruh data kehadiran mahasiswa.
        </p>

        <div style={{ marginTop: 14 }}>
          <span className="neu-pill">Total Present: {totalPresent}</span>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-card neu-card">Loading attendance...</div>
      ) : attendanceData.length === 0 ? (
        <div className="dashboard-card neu-card">
          <p style={{ color: "var(--text-soft)" }}>
            Belum ada data absensi mahasiswa.
          </p>
        </div>
      ) : (
        <div className="info-list">
          {attendanceData.map((item) => (
            <div key={item._id} className="info-row-card neu-card">
              <div className="info-row-left">
                <h3>Mahasiswa ID: {item.studentId || "-"}</h3>
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
          ))}
        </div>
      )}
    </div>
  );
}