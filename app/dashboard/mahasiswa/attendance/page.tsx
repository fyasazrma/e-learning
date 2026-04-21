"use client";

import { useEffect, useMemo, useState } from "react";
import { getClientUser } from "@/lib/client-auth";

type AttendanceType = {
  _id: string;
  studentId?: string | null;
  date: string;
  status: "present" | "late" | "absent";
  note?: string;
};

export default function MahasiswaAttendancePage() {
  const user = getClientUser();

  const [attendanceData, setAttendanceData] = useState<AttendanceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchAttendance = async () => {
    try {
      const res = await fetch(`/api/attendance?studentId=${user?.id}`, {
        cache: "no-store",
      });
      const result = await res.json();

      if (result.success) {
        setAttendanceData(result.data || []);
      } else {
        setAttendanceData([]);
      }
    } catch (error) {
      console.error("FETCH_MAHASISWA_ATTENDANCE_ERROR:", error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchAttendance();
    }
  }, [user?.id]);

  const handleAttendance = async () => {
    try {
      setSubmitting(true);

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: user?.id,
          status: "present",
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "Gagal melakukan absensi");
        return;
      }

      alert("Absensi berhasil dicatat.");
      fetchAttendance();
    } catch (error) {
      console.error("POST_MAHASISWA_ATTENDANCE_ERROR:", error);
      alert("Terjadi kesalahan saat absen");
    } finally {
      setSubmitting(false);
    }
  };

  const attendanceRate = useMemo(() => {
    if (attendanceData.length === 0) return 0;
    const presentCount = attendanceData.filter(
      (item) => item.status === "present"
    ).length;
    return Math.round((presentCount / attendanceData.length) * 100);
  }, [attendanceData]);

  return (
    <div className="page-stack fade-in">
      <div className="dashboard-card neu-card">
        <h2 style={{ marginBottom: 8 }}>Absensi Mahasiswa</h2>
        <p style={{ color: "var(--text-soft)", lineHeight: 1.7, marginBottom: 16 }}>
          Lakukan absensi harian dan lihat riwayat kehadiranmu.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            className="neu-button"
            onClick={handleAttendance}
            disabled={submitting}
          >
            {submitting ? "Memproses..." : "Absen Hari Ini"}
          </button>

          <div className="neu-pill">Attendance Rate: {attendanceRate}%</div>
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
          {attendanceData.map((item) => (
            <div key={item._id} className="info-row-card neu-card">
              <div className="info-row-left">
                <h3>
                  {new Date(item.date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
                <p>{item.note || "Absensi tercatat untuk hari ini."}</p>
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