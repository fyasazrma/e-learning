"use client";

import { useEffect, useMemo, useState } from "react";
import { getClientUser } from "@/lib/client-auth";

type ProgressType = {
  _id: string;
  studentId?: string | null;
  topicId?: string | null;
  completedMaterials: number;
  completedExercises: number;
  completedQuizzes: number;
  currentLevel: "easy" | "medium" | "hard";
  averageScore: number;
  lastFeedback: string;
  updatedAt?: string;
  createdAt?: string;
};

type FilterType = "today" | "yesterday" | "all";

function getProgressDate(item: ProgressType) {
  return new Date(item.updatedAt || item.createdAt || 0);
}

function isToday(dateString?: string) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isYesterday(dateString?: string) {
  if (!dateString) return false;
  const date = new Date(dateString);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return date.toDateString() === yesterday.toDateString();
}

function getLevelProgress(level?: "easy" | "medium" | "hard") {
  if (level === "easy") return 33;
  if (level === "medium") return 66;
  if (level === "hard") return 100;
  return 0;
}

function StatCard({
  value,
  title,
  subtitle,
}: {
  value: string | number;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="dashboard-card neu-card">
      <div
        style={{
          fontSize: "2rem",
          fontWeight: 800,
          color: "var(--accent)",
          marginBottom: 10,
          textTransform: "capitalize",
        }}
      >
        {value}
      </div>
      <h3 style={{ marginBottom: 8 }}>{title}</h3>
      <p style={{ color: "var(--text-soft)", lineHeight: 1.7 }}>{subtitle}</p>
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
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 6,
        }}
      >
        <span style={{ fontWeight: 700 }}>{label}</span>
        <span style={{ color: "var(--text-soft)" }}>{value}%</span>
      </div>

      <div
        style={{
          width: "100%",
          height: 12,
          borderRadius: 999,
          overflow: "hidden",
          background: "var(--surface)",
          boxShadow: "var(--shadow-inset)",
        }}
      >
        <div
          style={{
            width: `${Math.max(0, Math.min(100, value))}%`,
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
          <div style={{ color: "var(--text-soft)", fontSize: ".95rem" }}>
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MahasiswaProgressPage() {
  const [progressData, setProgressData] = useState<ProgressType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const user = getClientUser();

        if (!user?.id) {
          setProgressData([]);
          setLoading(false);
          return;
        }

        const res = await fetch(
          `/api/learning-progress?studentId=${user.id}`,
          {
            cache: "no-store",
          }
        );

        const result = await res.json();

        if (result.success) {
          const sorted = (result.data || []).sort(
            (a: ProgressType, b: ProgressType) => {
              const dateA = getProgressDate(a).getTime();
              const dateB = getProgressDate(b).getTime();
              return dateB - dateA;
            }
          );

          setProgressData(sorted);
        } else {
          setProgressData([]);
        }
      } catch (error) {
        console.error("FETCH_PROGRESS_ERROR:", error);
        setProgressData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const filteredProgress = useMemo(() => {
    if (filter === "today") {
      return progressData.filter((item) =>
        isToday(item.updatedAt || item.createdAt)
      );
    }

    if (filter === "yesterday") {
      return progressData.filter((item) =>
        isYesterday(item.updatedAt || item.createdAt)
      );
    }

    return progressData;
  }, [progressData, filter]);

  const latestProgress = useMemo(() => {
    return filteredProgress.length > 0 ? filteredProgress[0] : null;
  }, [filteredProgress]);

  const totalExercises = useMemo(() => {
    return latestProgress?.completedExercises || 0;
  }, [latestProgress]);

  const totalQuizzes = useMemo(() => {
    return latestProgress?.completedQuizzes || 0;
  }, [latestProgress]);

  const totalMaterials = useMemo(() => {
    return latestProgress?.completedMaterials || 0;
  }, [latestProgress]);

  const overallAverageScore = useMemo(() => {
    if (!filteredProgress.length) return 0;
    return Math.round(
      filteredProgress.reduce((sum, item) => sum + (item.averageScore || 0), 0) /
        filteredProgress.length
    );
  }, [filteredProgress]);

  const levelVisual = useMemo(() => {
    return getLevelProgress(latestProgress?.currentLevel);
  }, [latestProgress]);

  const activityCount = filteredProgress.length;

  if (loading) {
    return <div className="dashboard-card neu-card">Loading progress...</div>;
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
        <h2 style={{ marginBottom: "12px" }}>Progress Belajar</h2>
        <p style={{ color: "var(--text-soft)", lineHeight: 1.8 }}>
          Pantau perkembangan latihanmu, skor rata-rata, level belajar, dan
          feedback terbaru berdasarkan aktivitas yang sudah tersimpan.
        </p>
      </div>

      <div
        className="dashboard-card neu-card"
        style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
      >
        <button className="neu-button" onClick={() => setFilter("today")}>
          Hari Ini
        </button>
        <button className="neu-button" onClick={() => setFilter("yesterday")}>
          Kemarin
        </button>
        <button className="neu-button" onClick={() => setFilter("all")}>
          Semua Riwayat
        </button>
      </div>

      <div className="dashboard-grid">
        <StatCard
          value={totalExercises}
          title="Total Latihan Selesai"
          subtitle="Jumlah latihan selesai berdasarkan progress terbaru."
        />

        <StatCard
          value={overallAverageScore}
          title="Rata-rata Skor"
          subtitle="Rata-rata skor berdasarkan data progress pada filter ini."
        />

        <StatCard
          value={latestProgress?.currentLevel || "-"}
          title="Level Saat Ini"
          subtitle="Level terbaru berdasarkan progress yang tercatat."
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.15fr .85fr",
          gap: 20,
        }}
      >
        <div className="dashboard-card neu-card">
          <h3 style={{ marginBottom: 18 }}>Visual Progress</h3>

          {!latestProgress ? (
            <p style={{ color: "var(--text-soft)" }}>
              Belum ada progress untuk divisualisasikan.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "220px 1fr",
                gap: 24,
                alignItems: "center",
              }}
            >
              <CircleProgress value={overallAverageScore} label="Overall Score" />

              <div>
                <ProgressBar label="Progress Level" value={levelVisual} />
                <ProgressBar
                  label="Exercises"
                  value={Math.min(100, totalExercises * 10)}
                />
                <ProgressBar
                  label="Quizzes"
                  value={Math.min(100, totalQuizzes * 10)}
                />
                <ProgressBar
                  label="Materials"
                  value={Math.min(100, totalMaterials * 10)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="dashboard-card neu-card">
          <h3 style={{ marginBottom: 18 }}>Ringkasan Aktivitas</h3>

          <div style={{ display: "grid", gap: 14 }}>
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "var(--surface)",
                boxShadow: "var(--shadow-inset)",
              }}
            >
              <strong>Jumlah Record Progress:</strong> {activityCount}
            </div>

            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "var(--surface)",
                boxShadow: "var(--shadow-inset)",
              }}
            >
              <strong>Update Terakhir:</strong>{" "}
              {latestProgress?.updatedAt || latestProgress?.createdAt
                ? new Date(
                    latestProgress.updatedAt || latestProgress.createdAt || ""
                  ).toLocaleString("id-ID")
                : "-"}
            </div>

            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "var(--surface)",
                boxShadow: "var(--shadow-inset)",
              }}
            >
              <strong>Feedback Terakhir:</strong>{" "}
              {latestProgress?.lastFeedback || "Belum ada feedback terbaru."}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-card neu-card">
        <h3 style={{ marginBottom: "12px" }}>Feedback Terakhir</h3>
        <p style={{ lineHeight: 1.8 }}>
          {latestProgress?.lastFeedback || "Belum ada feedback terbaru."}
        </p>
      </div>

      <div className="dashboard-card neu-card">
        <h3 style={{ marginBottom: "12px" }}>Progress Terbaru</h3>

        {!latestProgress ? (
          <p style={{ color: "var(--text-soft)" }}>
            Belum ada progress untuk filter ini.
          </p>
        ) : (
          <div
            style={{
              padding: 14,
              borderRadius: 16,
              background: "var(--surface)",
              boxShadow: "var(--shadow-inset)",
            }}
          >
            <p style={{ marginBottom: 6 }}>
              <strong>Completed Materials:</strong>{" "}
              {latestProgress.completedMaterials}
            </p>
            <p style={{ marginBottom: 6 }}>
              <strong>Completed Exercises:</strong>{" "}
              {latestProgress.completedExercises}
            </p>
            <p style={{ marginBottom: 6 }}>
              <strong>Completed Quizzes:</strong>{" "}
              {latestProgress.completedQuizzes}
            </p>
            <p style={{ marginBottom: 6 }}>
              <strong>Average Score:</strong> {latestProgress.averageScore}
            </p>
            <p style={{ marginBottom: 6, textTransform: "capitalize" }}>
              <strong>Current Level:</strong> {latestProgress.currentLevel}
            </p>
            <p style={{ marginBottom: 6 }}>
              <strong>Last Feedback:</strong> {latestProgress.lastFeedback}
            </p>
            {(latestProgress.updatedAt || latestProgress.createdAt) && (
              <p style={{ color: "var(--text-soft)" }}>
                <strong>Update Terakhir:</strong>{" "}
                {new Date(
                  latestProgress.updatedAt || latestProgress.createdAt || ""
                ).toLocaleString("id-ID")}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="dashboard-card neu-card">
        <h3 style={{ marginBottom: "12px" }}>Riwayat Progress</h3>

        {filteredProgress.length === 0 ? (
          <p style={{ color: "var(--text-soft)" }}>
            Tidak ada riwayat progress untuk filter ini.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {filteredProgress.map((item) => (
              <div
                key={item._id}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  background: "var(--surface)",
                  boxShadow: "var(--shadow-inset)",
                }}
              >
                <p style={{ marginBottom: 6 }}>
                  <strong>Completed Materials:</strong> {item.completedMaterials}
                </p>
                <p style={{ marginBottom: 6 }}>
                  <strong>Completed Exercises:</strong> {item.completedExercises}
                </p>
                <p style={{ marginBottom: 6 }}>
                  <strong>Completed Quizzes:</strong> {item.completedQuizzes}
                </p>
                <p style={{ marginBottom: 6 }}>
                  <strong>Average Score:</strong> {item.averageScore}
                </p>
                <p style={{ marginBottom: 6, textTransform: "capitalize" }}>
                  <strong>Current Level:</strong> {item.currentLevel}
                </p>
                <p style={{ marginBottom: 6 }}>
                  <strong>Last Feedback:</strong> {item.lastFeedback}
                </p>
                {(item.updatedAt || item.createdAt) && (
                  <p style={{ color: "var(--text-soft)" }}>
                    <strong>Updated:</strong>{" "}
                    {new Date(
                      item.updatedAt || item.createdAt || ""
                    ).toLocaleString("id-ID")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}