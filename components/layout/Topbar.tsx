"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/common/ThemeToggle";
import {
  ClientUser,
  clearClientAuth,
  setClientUser,
} from "@/lib/client-auth";

type ProgressItem = {
  _id?: string;
  studentId?: string;
  topicId?: string;
  completedMaterials?: number;
  completedExercises?: number;
  completedQuizzes?: number;
  currentLevel?: "easy" | "medium" | "hard";
  averageScore?: number;
  lastFeedback?: string;
};

export default function Topbar({ user }: { user: ClientUser | null }) {
  const router = useRouter();

  const [openDropdown, setOpenDropdown] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [name, setName] = useState(user?.fullName || "");
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);

  const role = user?.role || "mahasiswa";
  const email = user?.email || "-";

  const handleLogout = () => {
    clearClientAuth();
    router.push("/login");
  };

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user?.id) return;

      try {
        setLoadingProgress(true);

        const res = await fetch(
          `/api/learning-progress?studentId=${user.id}`,
          {
            cache: "no-store",
          }
        );

        const result = await res.json();
        setProgress(Array.isArray(result.data) ? result.data : []);
      } catch (error) {
        console.error("FETCH_PROGRESS_ERROR", error);
        setProgress([]);
      } finally {
        setLoadingProgress(false);
      }
    };

    if (openProfile) {
      fetchProgress();
    }
  }, [openProfile, user?.id]);

  const summary = useMemo(() => {
    const totalMaterials = progress.reduce(
      (sum, item) => sum + (item.completedMaterials || 0),
      0
    );

    const totalExercises = progress.reduce(
      (sum, item) => sum + (item.completedExercises || 0),
      0
    );

    const totalQuizzes = progress.reduce(
      (sum, item) => sum + (item.completedQuizzes || 0),
      0
    );

    const avgScore =
      progress.length > 0
        ? Math.round(
            progress.reduce((sum, item) => sum + (item.averageScore || 0), 0) /
              progress.length
          )
        : 0;

    const levelWeight = {
      easy: 1,
      medium: 2,
      hard: 3,
    } as const;

    const avgLevelValue =
      progress.length > 0
        ? Math.round(
            progress.reduce(
              (sum, item) => sum + levelWeight[item.currentLevel || "easy"],
              0
            ) / progress.length
          )
        : 1;

    const currentLevel =
      avgLevelValue >= 3 ? "Hard" : avgLevelValue >= 2 ? "Medium" : "Easy";

    const totalActivity = totalMaterials + totalExercises + totalQuizzes;
    const overallProgress = Math.min(totalActivity * 5, 100);

    const lastFeedback =
      progress.find((item) => item.lastFeedback && item.lastFeedback.trim())
        ?.lastFeedback || "Belum ada insight terbaru.";

    let nextAction = "Mulai lanjutkan materi berikutnya.";
    if (avgScore < 60) {
      nextAction = "Fokus ulangi quiz dan latihan untuk meningkatkan skor.";
    } else if (totalExercises < totalMaterials) {
      nextAction = "Coba kerjakan lebih banyak latihan untuk menyeimbangkan teori.";
    } else if (overallProgress >= 80) {
      nextAction = "Kamu hampir selesai. Lanjutkan topik terakhir.";
    }

    let adaptiveInsight = "Performa belajar kamu masih berkembang stabil.";
    if (avgScore >= 80) {
      adaptiveInsight = "Kamu kuat di pemahaman materi. Cocok naik ke level berikutnya.";
    } else if (avgScore >= 60) {
      adaptiveInsight =
        "Pemahamanmu cukup baik, tapi masih perlu konsistensi di latihan.";
    } else if (progress.length > 0) {
      adaptiveInsight =
        "Kamu butuh lebih banyak latihan dan quiz agar rekomendasi adaptif makin akurat.";
    }

    return {
      totalMaterials,
      totalExercises,
      totalQuizzes,
      avgScore,
      currentLevel,
      overallProgress,
      lastFeedback,
      nextAction,
      adaptiveInsight,
    };
  }, [progress]);

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);

      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: name,
          role: user.role,
          email: user.email,
          npm: user.npm || "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal update user");
      }

      setClientUser({
        ...user,
        fullName: name,
      });

      alert("Nama berhasil diupdate.");
      setOpenProfile(false);
      router.refresh();
    } catch (error) {
      console.error("UPDATE_PROFILE_ERROR", error);
      alert("Gagal update nama.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="dashboard-topbar neu-card slide-up">
        <div className="topbar-title">
          <h1>Dashboard</h1>
          <p>Selamat datang kembali di AI Adaptive Learning</p>
        </div>

        <div
          className="topbar-profile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            position: "relative",
            cursor: "pointer",
          }}
          onClick={() => setOpenDropdown((prev) => !prev)}
        >
          <ThemeToggle />

          <div className="profile-avatar">
            {name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div className="profile-info">
            <strong>{name}</strong>
            <span style={{ textTransform: "capitalize" }}>{role}</span>
          </div>

          {openDropdown && (
            <div className="profile-dropdown-menu neu-card">
              <button
                type="button"
                className="profile-dropdown-item"
                onClick={() => {
                  setOpenProfile(true);
                  setOpenDropdown(false);
                }}
              >
                Lihat Profil
              </button>

              <button
                type="button"
                className="profile-dropdown-item danger"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {openProfile && (
        <div className="profile-modal-overlay">
          <div className="profile-modal-card neu-card">
            <div className="profile-modal-header">
              <div className="profile-modal-title-wrap">
                <span className="profile-modal-icon">👤</span>
                <h2>Profile</h2>
              </div>

              <button
                type="button"
                className="profile-close-x"
                onClick={() => setOpenProfile(false)}
              >
                ✕
              </button>
            </div>

            <div className="profile-hero">
              <div className="profile-hero-avatar">
                {name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div className="profile-hero-info">
                <strong>{name}</strong>
                <span>{role}</span>
                <small>{email}</small>
              </div>

              <div className="profile-level-badge">
                Level {summary.currentLevel}
              </div>
            </div>

            <div className="profile-section">
              <label className="profile-label">Nama</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="profile-input"
                placeholder="Masukkan nama"
              />
            </div>

            <div className="profile-grid-summary">
              <div className="profile-mini-card">
                <span>Materials</span>
                <strong>{summary.totalMaterials}</strong>
              </div>

              <div className="profile-mini-card">
                <span>Exercises</span>
                <strong>{summary.totalExercises}</strong>
              </div>

              <div className="profile-mini-card">
                <span>Quizzes</span>
                <strong>{summary.totalQuizzes}</strong>
              </div>

              <div className="profile-mini-card">
                <span>Avg Score</span>
                <strong>{summary.avgScore}%</strong>
              </div>
            </div>

            <div className="profile-section">
              <div className="profile-section-title">
                <span>📈</span>
                <h3>Overall Progress</h3>
              </div>

              <div className="profile-overall-wrap">
                <div className="profile-progress-meta">
                  <span>Kemajuan belajar keseluruhan</span>
                  <strong>{summary.overallProgress}%</strong>
                </div>

                <div className="profile-progress-bar">
                  <div
                    className="profile-progress-fill"
                    style={{ width: `${summary.overallProgress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="profile-section">
              <div className="profile-section-title">
                <span>📚</span>
                <h3>Progress per Topik</h3>
              </div>

              {loadingProgress ? (
                <div className="profile-empty-state">Memuat progress...</div>
              ) : progress.length === 0 ? (
                <div className="profile-empty-state">
                  Belum ada progress yang tersimpan.
                </div>
              ) : (
                <div className="profile-topic-list">
                  {progress.map((item, index) => {
                    const totalTopicActivity =
                      (item.completedMaterials || 0) +
                      (item.completedExercises || 0) +
                      (item.completedQuizzes || 0);

                    const topicPercent = Math.min(totalTopicActivity * 5, 100);

                    return (
                      <div className="profile-topic-item" key={item._id || index}>
                        <div className="profile-topic-head">
                          <div>
                            <strong>Topik {index + 1}</strong>
                            <p>
                              Materi {item.completedMaterials || 0} • Latihan{" "}
                              {item.completedExercises || 0} • Quiz{" "}
                              {item.completedQuizzes || 0}
                            </p>
                          </div>

                          <span className="profile-topic-percent">
                            {topicPercent}%
                          </span>
                        </div>

                        <div className="profile-progress-bar">
                          <div
                            className="profile-progress-fill"
                            style={{ width: `${topicPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="profile-insight-grid">
              <div className="profile-info-card">
                <div className="profile-section-title small">
                  <span>🎯</span>
                  <h3>Next Step</h3>
                </div>
                <p>{summary.nextAction}</p>
              </div>

              <div className="profile-info-card">
                <div className="profile-section-title small">
                  <span>🤖</span>
                  <h3>Adaptive Insight</h3>
                </div>
                <p>{summary.adaptiveInsight}</p>
              </div>

              <div className="profile-info-card full">
                <div className="profile-section-title small">
                  <span>📝</span>
                  <h3>Feedback Terakhir</h3>
                </div>
                <p>{summary.lastFeedback}</p>
              </div>
            </div>

            <div className="profile-modal-actions">
              <button
                type="button"
                onClick={() => setOpenProfile(false)}
                className="neu-button"
              >
                Close
              </button>

              <button
                type="button"
                className="neu-button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}