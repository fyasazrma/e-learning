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

function isToday(dateString?: string) {
  if (!dateString) return false;

  const date = new Date(dateString);
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function isYesterday(dateString?: string) {
  if (!dateString) return false;

  const date = new Date(dateString);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
}

export default function MahasiswaProgressPage() {
  const [progressData, setProgressData] = useState<ProgressType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("today");

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const user = getClientUser();

        const res = await fetch("/api/learning-progress", {
          cache: "no-store",
        });

        const result = await res.json();

        if (result.success) {
          const filtered = (result.data || [])
            .filter(
              (item: ProgressType) =>
                user?.id && String(item.studentId) === String(user.id)
            )
            .sort((a: ProgressType, b: ProgressType) => {
              const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
              const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
              return dateB - dateA;
            });

          setProgressData(filtered);
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
    if (!filteredProgress.length) return 0;
    return filteredProgress.reduce(
      (sum, item) => sum + (item.completedExercises || 0),
      0
    );
  }, [filteredProgress]);

  const overallAverageScore = useMemo(() => {
    if (!filteredProgress.length) return 0;
    return Math.round(
      filteredProgress.reduce((sum, item) => sum + (item.averageScore || 0), 0) /
        filteredProgress.length
    );
  }, [filteredProgress]);

  if (loading) {
    return <div className="dashboard-card neu-card">Loading progress...</div>;
  }

  return (
    <div className="page-stack fade-in">
      <div className="dashboard-card neu-card">
        <h2 style={{ marginBottom: "12px" }}>Progress Belajar</h2>
        <p style={{ color: "var(--text-soft)", lineHeight: 1.8 }}>
          Pantau perkembangan latihanmu berdasarkan waktu pengerjaan dan hasil
          latihan terbaru.
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
        <div className="dashboard-card neu-card">
          <div className="dashboard-number">{totalExercises}</div>
          <h3>Total Latihan Selesai</h3>
          <p>Akumulasi latihan selesai sesuai filter waktu yang dipilih.</p>
        </div>

        <div className="dashboard-card neu-card">
          <div className="dashboard-number">{overallAverageScore}</div>
          <h3>Rata-rata Skor</h3>
          <p>Rata-rata skor berdasarkan progress pada periode yang dipilih.</p>
        </div>

        <div className="dashboard-card neu-card">
          <div className="dashboard-number" style={{ textTransform: "capitalize" }}>
            {latestProgress?.currentLevel || "-"}
          </div>
          <h3>Level Saat Ini</h3>
          <p>Level terbaru berdasarkan progress dalam filter yang dipilih.</p>
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
              <strong>Completed Exercises:</strong>{" "}
              {latestProgress.completedExercises}
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
                  <strong>Completed Exercises:</strong> {item.completedExercises}
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