"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FileText,
  ClipboardList,
  GraduationCap,
  BarChart3,
  MessageSquareMore,
  ArrowRight,
  Clock3,
} from "lucide-react";

type MaterialType = {
  _id: string;
  title: string;
  description?: string;
};

type ExerciseType = {
  _id: string;
  title: string;
  level: "easy" | "medium" | "hard";
};

type ProgressType = {
  _id: string;
  studentId?: string | null;
  completedExercises: number;
  currentLevel: "easy" | "medium" | "hard";
  averageScore: number;
  lastFeedback: string;
};

type FeedbackType = {
  _id: string;
  studentId?: string | null;
  feedbackText: string;
  tipText: string;
  errorType: string[];
  createdAt?: string;
};

type UserType = {
  _id: string;
  fullName?: string;
  email?: string;
  role?: string;
  npm?: string;
};

type AttendanceType = {
  _id: string;
  studentId?: string | null;
  date: string;
  status: "present" | "late" | "absent";
};

function StatCard({
  icon,
  value,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  value: string | number;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="dashboard-card neu-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              color: "var(--accent)",
              marginBottom: 6,
            }}
          >
            {value}
          </div>
          <h3 style={{ marginBottom: 6 }}>{title}</h3>
          <p style={{ color: "var(--text-soft)", lineHeight: 1.7 }}>{subtitle}</p>
        </div>

        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 18,
            display: "grid",
            placeItems: "center",
            background: "var(--surface)",
            boxShadow: "var(--shadow-inset)",
            color: "var(--accent)",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function SectionPanel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-card neu-card">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            display: "grid",
            placeItems: "center",
            background: "var(--surface)",
            boxShadow: "var(--shadow-inset)",
            color: "var(--accent)",
          }}
        >
          {icon}
        </div>
        <h3>{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function DosenDashboardPage() {
  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [exercises, setExercises] = useState<ExerciseType[]>([]);
  const [progress, setProgress] = useState<ProgressType[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [attendance, setAttendance] = useState<AttendanceType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          materialsRes,
          exercisesRes,
          progressRes,
          feedbacksRes,
          usersRes,
          attendanceRes,
        ] = await Promise.all([
          fetch("/api/materials", { cache: "no-store" }),
          fetch("/api/exercises", { cache: "no-store" }),
          fetch("/api/learning-progress", { cache: "no-store" }),
          fetch("/api/feedbacks", { cache: "no-store" }),
          fetch("/api/users", { cache: "no-store" }),
          fetch("/api/attendance", { cache: "no-store" }),
        ]);

        const [
          materialsJson,
          exercisesJson,
          progressJson,
          feedbacksJson,
          usersJson,
          attendanceJson,
        ] = await Promise.all([
          materialsRes.json(),
          exercisesRes.json(),
          progressRes.json(),
          feedbacksRes.json(),
          usersRes.json(),
          attendanceRes.json(),
        ]);

        if (materialsJson.success) setMaterials(materialsJson.data || []);
        if (exercisesJson.success) setExercises(exercisesJson.data || []);
        if (progressJson.success) setProgress(progressJson.data || []);
        if (feedbacksJson.success) setFeedbacks(feedbacksJson.data || []);
        if (usersJson.success) setUsers(usersJson.data || []);
        if (attendanceJson.success) setAttendance(attendanceJson.data || []);
      } catch (error) {
        console.error("FETCH_DOSEN_DASHBOARD_ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const mahasiswa = useMemo(
    () => users.filter((user) => user.role === "mahasiswa"),
    [users]
  );

  const avgStudentScore = useMemo(() => {
    if (progress.length === 0) return 0;
    return Math.round(
      progress.reduce((sum, item) => sum + (item.averageScore || 0), 0) /
        progress.length
    );
  }, [progress]);

  const latestFeedback = feedbacks[0];

  const mostCommonError = useMemo(() => {
    const errorMap: Record<string, number> = {};

    feedbacks.forEach((item) => {
      (item.errorType || []).forEach((error) => {
        errorMap[error] = (errorMap[error] || 0) + 1;
      });
    });

    const sorted = Object.entries(errorMap).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : "-";
  }, [feedbacks]);

  const totalPresent = useMemo(
    () => attendance.filter((item) => item.status === "present").length,
    [attendance]
  );

  if (loading) {
    return <div className="dashboard-card neu-card">Loading dashboard dosen...</div>;
  }

  return (
    <div className="page-stack fade-in">
      <div
        className="dashboard-card neu-card"
        style={{
          padding: 28,
          background:
            "linear-gradient(135deg, rgba(90,120,255,.10), rgba(90,120,255,.03))",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ flex: 1, minWidth: 280 }}>
            <div className="neu-pill" style={{ marginBottom: 14 }}>
              Instructor Dashboard
            </div>
            <h2 style={{ marginBottom: 10 }}>Dashboard Dosen</h2>
            <p style={{ color: "var(--text-soft)", lineHeight: 1.8, marginBottom: 18 }}>
              Pantau materi, latihan, performa mahasiswa, error yang sering
              muncul, dan absensi mahasiswa.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/dashboard/dosen/materials" className="neu-button">
                Kelola Materials
              </Link>

              <Link href="/dashboard/dosen/exercises" className="neu-button">
                Kelola Exercises
              </Link>

              <Link href="/dashboard/dosen/exercises/create" className="neu-button">
                + Tambah Exercise
              </Link>

              <Link href="/dashboard/dosen/attendance" className="neu-button">
                Lihat Attendance
              </Link>
            </div>
          </div>

          <div
            style={{
              minWidth: 240,
              maxWidth: 280,
              width: "100%",
              padding: 20,
              borderRadius: 24,
              background: "var(--surface)",
              boxShadow: "var(--shadow-inset)",
            }}
          >
            <div style={{ marginBottom: 10, color: "var(--text-soft)" }}>
              Monitoring Mahasiswa
            </div>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                color: "var(--accent)",
                marginBottom: 8,
              }}
            >
              {mahasiswa.length}
            </div>
            <p style={{ color: "var(--text-soft)", lineHeight: 1.7 }}>
              Total mahasiswa yang terdata di sistem pembelajaran.
            </p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <StatCard
          icon={<FileText size={20} />}
          value={materials.length}
          title="Materi Aktif"
          subtitle="Jumlah materi yang tersedia untuk mahasiswa."
        />

        <StatCard
          icon={<ClipboardList size={20} />}
          value={exercises.length}
          title="Latihan Aktif"
          subtitle="Jumlah latihan yang bisa dikerjakan mahasiswa."
        />

        <StatCard
          icon={<GraduationCap size={20} />}
          value={mahasiswa.length}
          title="Mahasiswa"
          subtitle="Mahasiswa yang terhubung ke sistem."
        />

        <StatCard
          icon={<Clock3 size={20} />}
          value={totalPresent}
          title="Total Attendance"
          subtitle="Jumlah absensi hadir yang tercatat."
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
        }}
      >
        <SectionPanel title="Insight Kelas" icon={<BarChart3 size={20} />}>
          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "var(--surface)",
                boxShadow: "var(--shadow-inset)",
              }}
            >
              <strong>Average Student Score:</strong> {avgStudentScore}
            </div>
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "var(--surface)",
                boxShadow: "var(--shadow-inset)",
              }}
            >
              <strong>Most Common Error:</strong> {mostCommonError}
            </div>
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "var(--surface)",
                boxShadow: "var(--shadow-inset)",
              }}
            >
              <strong>Total Present Attendance:</strong> {totalPresent}
            </div>
          </div>
        </SectionPanel>

        <SectionPanel title="Feedback Terbaru" icon={<MessageSquareMore size={20} />}>
          {latestFeedback ? (
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "var(--surface)",
                boxShadow: "var(--shadow-inset)",
              }}
            >
              <p style={{ marginBottom: 8 }}>{latestFeedback.feedbackText}</p>
              <p style={{ color: "var(--accent)", fontWeight: 700 }}>
                Tip: {latestFeedback.tipText}
              </p>
            </div>
          ) : (
            <p style={{ color: "var(--text-soft)" }}>Belum ada feedback terbaru.</p>
          )}
        </SectionPanel>
      </div>

      <SectionPanel title="Akses Cepat" icon={<ArrowRight size={20} />}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 14,
          }}
        >
          <Link href="/dashboard/dosen/materials" className="neu-button">
            Materials
          </Link>
          <Link href="/dashboard/dosen/exercises" className="neu-button">
            Exercises
          </Link>
          <Link href="/dashboard/dosen/exercises/create" className="neu-button">
            Tambah Exercise
          </Link>
          <Link href="/dashboard/dosen/students" className="neu-button">
            Students
          </Link>
          <Link href="/dashboard/dosen/analytics" className="neu-button">
            Analytics
          </Link>
          <Link href="/dashboard/dosen/feedback" className="neu-button">
            Feedback
          </Link>
          <Link href="/dashboard/dosen/attendance" className="neu-button">
            Attendance
          </Link>
        </div>
      </SectionPanel>
    </div>
  );
}