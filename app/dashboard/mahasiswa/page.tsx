"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getClientUser } from "@/lib/client-auth";
import {
  BookOpen,
  ClipboardList,
  BarChart3,
  Sparkles,
  MessageSquareMore,
  TrendingUp,
  CircleDashed,
  Clock3,
  ArrowRight,
} from "lucide-react";

type ProgressType = {
  _id: string;
  studentId?: string | null;
  topicId?: string | null;
  completedExercises: number;
  currentLevel: "easy" | "medium" | "hard";
  averageScore: number;
  lastFeedback: string;
  updatedAt?: string;
  createdAt?: string;
};

type RecommendationType = {
  _id: string;
  studentId?: string | null;
  reason: string;
  targetLevel: "easy" | "medium" | "hard";
  status: "pending" | "taken" | "done";
  createdAt?: string;
};

type FeedbackType = {
  _id: string;
  studentId?: string | null;
  feedbackText: string;
  tipText: string;
  errorType: string[];
  createdAt?: string;
};

type ExerciseType = {
  _id: string;
  title: string;
  topicId?: string | null;
  level: "easy" | "medium" | "hard";
};

type TopicType = {
  _id: string;
  title: string;
  slug: string;
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
              textTransform: "capitalize",
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

function ProgressBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
          gap: 12,
        }}
      >
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span style={{ color: "var(--text-soft)" }}>{value}%</span>
      </div>

      <div
        style={{
          width: "100%",
          height: 10,
          borderRadius: 999,
          background: "var(--surface)",
          boxShadow: "var(--shadow-inset)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            borderRadius: 999,
            background: "var(--accent)",
          }}
        />
      </div>
    </div>
  );
}

function CircleProgress({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const percentage = Math.max(0, Math.min(100, value));

  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        width: 180,
        height: 180,
        borderRadius: "50%",
        background: `conic-gradient(var(--accent) ${percentage * 3.6}deg, var(--surface) 0deg)`,
        padding: 14,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: "var(--bg)",
          boxShadow: "var(--shadow-inset)",
          display: "grid",
          placeItems: "center",
          textAlign: "center",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              color: "var(--accent)",
              lineHeight: 1,
              marginBottom: 6,
            }}
          >
            {percentage}%
          </div>
          <div style={{ color: "var(--text-soft)", fontSize: ".95rem" }}>{label}</div>
        </div>
      </div>
    </div>
  );
}

export default function MahasiswaDashboardPage() {
  const currentUser = getClientUser();

  const [progressData, setProgressData] = useState<ProgressType[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationType[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackType[]>([]);
  const [exercises, setExercises] = useState<ExerciseType[]>([]);
  const [topics, setTopics] = useState<TopicType[]>([]);
  const [attendance, setAttendance] = useState<AttendanceType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!currentUser?.id) {
          setLoading(false);
          return;
        }

        const [
          progressRes,
          recommendationRes,
          feedbackRes,
          exercisesRes,
          topicsRes,
          attendanceRes,
        ] = await Promise.all([
          fetch(`/api/learning-progress?studentId=${currentUser.id}`, {
            cache: "no-store",
          }),
          fetch(`/api/recommendations?studentId=${currentUser.id}`, {
            cache: "no-store",
          }),
          fetch(`/api/feedbacks?studentId=${currentUser.id}`, {
            cache: "no-store",
          }),
          fetch("/api/exercises", { cache: "no-store" }),
          fetch("/api/topics", { cache: "no-store" }),
          fetch(`/api/attendance?studentId=${currentUser.id}`, {
            cache: "no-store",
          }),
        ]);

        const [
          progressJson,
          recommendationJson,
          feedbackJson,
          exercisesJson,
          topicsJson,
          attendanceJson,
        ] = await Promise.all([
          progressRes.json(),
          recommendationRes.json(),
          feedbackRes.json(),
          exercisesRes.json(),
          topicsRes.json(),
          attendanceRes.json(),
        ]);

        if (progressJson.success) {
          const filtered = (progressJson.data || []).sort(
            (a: ProgressType, b: ProgressType) => {
              const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
              const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
              return dateB - dateA;
            }
          );
          setProgressData(filtered);
        }

        if (recommendationJson.success) {
          const filtered = (recommendationJson.data || []).sort(
            (a: RecommendationType, b: RecommendationType) => {
              const dateA = new Date(a.createdAt || 0).getTime();
              const dateB = new Date(b.createdAt || 0).getTime();
              return dateB - dateA;
            }
          );
          setRecommendations(filtered);
        }

        if (feedbackJson.success) {
          const filtered = (feedbackJson.data || []).sort(
            (a: FeedbackType, b: FeedbackType) => {
              const dateA = new Date(a.createdAt || 0).getTime();
              const dateB = new Date(b.createdAt || 0).getTime();
              return dateB - dateA;
            }
          );
          setFeedbacks(filtered);
        }

        if (exercisesJson.success) {
          setExercises(exercisesJson.data || []);
        }

        if (topicsJson.success) {
          setTopics(topicsJson.data || []);
        }

        if (attendanceJson.success) {
          setAttendance(attendanceJson.data || []);
        }
      } catch (error) {
        console.error("FETCH_MAHASISWA_DASHBOARD_ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser?.id]);

  const latestProgress = useMemo(() => {
    return progressData.length > 0 ? progressData[0] : null;
  }, [progressData]);

  const latestRecommendation = useMemo(() => {
    return recommendations.length > 0 ? recommendations[0] : null;
  }, [recommendations]);

  const latestFeedback = useMemo(() => {
    return feedbacks.length > 0 ? feedbacks[0] : null;
  }, [feedbacks]);

  const totalExercisesDone = useMemo(() => {
    return progressData.reduce((sum, item) => sum + (item.completedExercises || 0), 0);
  }, [progressData]);

  const averageScore = useMemo(() => {
    if (progressData.length === 0) return 0;
    return Math.round(
      progressData.reduce((sum, item) => sum + (item.averageScore || 0), 0) /
        progressData.length
    );
  }, [progressData]);

  const targetLevel =
    latestRecommendation?.targetLevel || latestProgress?.currentLevel || "-";

  const topicProgressMap = useMemo(() => {
    const result: Record<string, number> = {};

    topics.forEach((topic) => {
      const totalTopicExercises = exercises.filter(
        (exercise) => String(exercise.topicId) === String(topic._id)
      ).length;

      const topicProgress = progressData.find(
        (progress) => String(progress.topicId) === String(topic._id)
      );

      const completed = topicProgress?.completedExercises || 0;
      const safeCompleted = Math.min(completed, totalTopicExercises);

      result[topic.slug] =
        totalTopicExercises > 0
          ? Math.min(100, Math.round((safeCompleted / totalTopicExercises) * 100))
          : 0;
    });

    return result;
  }, [topics, exercises, progressData]);

  const attendanceRate = useMemo(() => {
    if (attendance.length === 0) return 0;
    const presentCount = attendance.filter((item) => item.status === "present").length;
    return Math.round((presentCount / attendance.length) * 100);
  }, [attendance]);

  const latestAttendance = useMemo(() => {
    return attendance.length > 0 ? attendance[0] : null;
  }, [attendance]);

  const sheetProgress = topicProgressMap["sheets"] || 0;
  const docsProgress = topicProgressMap["docs"] || 0;
  const slidesProgress = topicProgressMap["slides"] || 0;

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat pagi";
    if (hour < 15) return "Selamat siang";
    if (hour < 18) return "Selamat sore";
    return "Selamat malam";
  })();

  if (loading) {
    return <div className="dashboard-card neu-card">Loading dashboard...</div>;
  }

  return (
    <div className="page-stack fade-in">
      <div
        className="dashboard-card neu-card"
        style={{
          padding: 28,
          overflow: "hidden",
          position: "relative",
          background:
            "linear-gradient(135deg, rgba(90,120,255,.10), rgba(90,120,255,.03))",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ flex: 1, minWidth: 280 }}>
            <div className="neu-pill" style={{ marginBottom: 14 }}>
              Adaptive Learning Dashboard
            </div>
            <h2 style={{ marginBottom: 10 }}>
              {greeting}, {currentUser?.fullName || "Mahasiswa"} 👋
            </h2>
            <p style={{ color: "var(--text-soft)", lineHeight: 1.8, marginBottom: 18 }}>
              Kamu sedang berada di level{" "}
              <strong style={{ textTransform: "capitalize", color: "var(--accent)" }}>
                {latestProgress?.currentLevel || "-"}
              </strong>
              . Lanjutkan latihan untuk meningkatkan skor dan mendapatkan
              rekomendasi adaptif yang lebih tepat.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/dashboard/mahasiswa/exercises" className="neu-button">
                Lanjutkan Latihan
              </Link>
              <Link href="/dashboard/mahasiswa/materials" className="neu-button">
                Buka Materi
              </Link>
              <Link href="/dashboard/mahasiswa/attendance" className="neu-button">
                Lihat Absensi
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
              Status Belajar
            </div>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                color: "var(--accent)",
                textTransform: "capitalize",
                marginBottom: 8,
              }}
            >
              {targetLevel}
            </div>
            <p style={{ color: "var(--text-soft)", lineHeight: 1.7 }}>
              {latestRecommendation?.reason ||
                "Kerjakan latihan untuk mendapatkan rekomendasi terbaru."}
            </p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <StatCard
          icon={<ClipboardList size={20} />}
          value={totalExercisesDone}
          title="Total Latihan"
          subtitle="Jumlah latihan yang benar-benar sudah kamu selesaikan."
        />

        <StatCard
          icon={<BarChart3 size={20} />}
          value={averageScore}
          title="Rata-rata Skor"
          subtitle="Nilai rata-rata dari hasil latihan terakhirmu."
        />

        <StatCard
          icon={<TrendingUp size={20} />}
          value={latestProgress?.currentLevel || "-"}
          title="Level Saat Ini"
          subtitle="Level adaptif terbaru berdasarkan performa latihanmu."
        />

        <StatCard
          icon={<Clock3 size={20} />}
          value={`${attendanceRate}%`}
          title="Attendance Rate"
          subtitle="Persentase kehadiranmu berdasarkan absensi yang tercatat."
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.15fr .85fr",
          gap: 20,
        }}
      >
        <SectionPanel title="Learning Progress" icon={<CircleDashed size={20} />}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "220px 1fr",
              gap: 24,
              alignItems: "center",
            }}
          >
            <CircleProgress value={averageScore} label="Overall Score" />

            <div>
              <ProgressBar label="Sheets" value={sheetProgress} />
              <ProgressBar label="Docs" value={docsProgress} />
              <ProgressBar label="Slides" value={slidesProgress} />
            </div>
          </div>
        </SectionPanel>

        <SectionPanel title="Aktivitas Terakhir" icon={<Clock3 size={20} />}>
          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "var(--surface)",
                boxShadow: "var(--shadow-inset)",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Feedback Terbaru</div>
              <p style={{ color: "var(--text-soft)", lineHeight: 1.7 }}>
                {latestFeedback?.feedbackText || "Belum ada feedback terbaru."}
              </p>
            </div>

            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "var(--surface)",
                boxShadow: "var(--shadow-inset)",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Tips Terakhir</div>
              <p style={{ color: "var(--text-soft)", lineHeight: 1.7 }}>
                {latestFeedback?.tipText || "Kerjakan latihan untuk mendapatkan tips."}
              </p>
            </div>

            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "var(--surface)",
                boxShadow: "var(--shadow-inset)",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Absensi Terakhir</div>
              <p style={{ color: "var(--text-soft)", lineHeight: 1.7 }}>
                {latestAttendance
                  ? `${new Date(latestAttendance.date).toLocaleDateString("id-ID")} - ${latestAttendance.status}`
                  : "Belum ada absensi terbaru."}
              </p>
            </div>
          </div>
        </SectionPanel>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
        }}
      >
        <SectionPanel title="Feedback Terbaru" icon={<MessageSquareMore size={20} />}>
          <p style={{ marginBottom: 12, lineHeight: 1.8 }}>
            {latestFeedback?.feedbackText || "Belum ada feedback terbaru."}
          </p>
          <div
            style={{
              padding: 14,
              borderRadius: 16,
              background: "var(--surface)",
              boxShadow: "var(--shadow-inset)",
              color: "var(--accent)",
              fontWeight: 700,
              lineHeight: 1.7,
            }}
          >
            {latestFeedback?.tipText || "Tips akan muncul setelah kamu mengerjakan latihan."}
          </div>
        </SectionPanel>

        <SectionPanel title="Rekomendasi AI Terbaru" icon={<Sparkles size={20} />}>
          <p style={{ marginBottom: 12, lineHeight: 1.8 }}>
            {latestRecommendation?.reason || "Belum ada rekomendasi terbaru."}
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
              padding: 14,
              borderRadius: 16,
              background: "var(--surface)",
              boxShadow: "var(--shadow-inset)",
            }}
          >
            <div>
              <div style={{ color: "var(--text-soft)", marginBottom: 4 }}>
                Target Level
              </div>
              <div
                style={{
                  fontWeight: 800,
                  color: "var(--accent)",
                  textTransform: "capitalize",
                }}
              >
                {latestRecommendation?.targetLevel || "-"}
              </div>
            </div>

            <Link href="/dashboard/mahasiswa/recommendations" className="neu-button">
              <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                Detail
                <ArrowRight size={16} />
              </span>
            </Link>
          </div>
        </SectionPanel>
      </div>

      <SectionPanel title="Akses Cepat" icon={<BookOpen size={20} />}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 14,
          }}
        >
          <Link href="/dashboard/mahasiswa/materials" className="neu-button">
            Buka Materials
          </Link>
          <Link href="/dashboard/mahasiswa/exercises" className="neu-button">
            Lanjut Exercises
          </Link>
          <Link href="/dashboard/mahasiswa/progress" className="neu-button">
            Lihat Progress
          </Link>
          <Link href="/dashboard/mahasiswa/feedback" className="neu-button">
            Lihat Feedback
          </Link>
          <Link href="/dashboard/mahasiswa/attendance" className="neu-button">
            Lihat Attendance
          </Link>
        </div>
      </SectionPanel>
    </div>
  );
}