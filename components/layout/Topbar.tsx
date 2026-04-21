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

type TopicItem = {
  _id?: string;
  title?: string;
  slug?: string;
  description?: string;
  createdBy?: string | null;
};

type MaterialItem = {
  _id?: string;
  title?: string;
  topicId?: string | null;
  createdBy?: string | null;
  isPublished?: boolean;
};

type ExerciseItem = {
  _id?: string;
  title?: string;
  topicId?: string | null;
  level?: "easy" | "medium" | "hard";
  isPublished?: boolean;
};

export default function Topbar({ user }: { user: ClientUser | null }) {
  const router = useRouter();

  const [openDropdown, setOpenDropdown] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [name, setName] = useState(user?.fullName || "");
  const [saving, setSaving] = useState(false);

  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);

  const [loadingProgress, setLoadingProgress] = useState(false);
  const [loadingExtraData, setLoadingExtraData] = useState(false);

  const role = user?.role || "mahasiswa";
  const email = user?.email || "-";

  const handleLogout = () => {
    clearClientAuth();
    router.push("/login");
  };

  useEffect(() => {
    if (!openProfile || !user?.id) return;

    const fetchAllProfileData = async () => {
      try {
        if (user.role === "mahasiswa") {
          setLoadingProgress(true);

          const progressRes = await fetch(
            `/api/learning-progress?studentId=${user.id}`,
            {
              cache: "no-store",
            }
          );

          const progressResult = await progressRes.json();

          setProgress(
            Array.isArray(progressResult?.data) ? progressResult.data : []
          );
          setTopics([]);
          setMaterials([]);
          setExercises([]);
          return;
        }

        if (user.role === "dosen" || user.role === "admin") {
          setLoadingExtraData(true);

          const [topicsRes, materialsRes, exercisesRes] = await Promise.all([
            fetch("/api/topics", { cache: "no-store" }),
            fetch("/api/materials", { cache: "no-store" }),
            fetch("/api/exercises", { cache: "no-store" }),
          ]);

          const [topicsResult, materialsResult, exercisesResult] =
            await Promise.all([
              topicsRes.json(),
              materialsRes.json(),
              exercisesRes.json(),
            ]);

          setTopics(Array.isArray(topicsResult?.data) ? topicsResult.data : []);
          setMaterials(
            Array.isArray(materialsResult?.data) ? materialsResult.data : []
          );
          setExercises(
            Array.isArray(exercisesResult?.data) ? exercisesResult.data : []
          );
          setProgress([]);
        }
      } catch (error) {
        console.error("FETCH_PROFILE_DATA_ERROR", error);
        setProgress([]);
        setTopics([]);
        setMaterials([]);
        setExercises([]);
      } finally {
        setLoadingProgress(false);
        setLoadingExtraData(false);
      }
    };

    fetchAllProfileData();
  }, [openProfile, user?.id, user?.role]);

  const mahasiswaSummary = useMemo(() => {
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
      nextAction =
        "Coba kerjakan lebih banyak latihan untuk menyeimbangkan teori.";
    } else if (overallProgress >= 80) {
      nextAction = "Kamu hampir selesai. Lanjutkan topik terakhir.";
    }

    let adaptiveInsight = "Performa belajar kamu masih berkembang stabil.";
    if (avgScore >= 80) {
      adaptiveInsight =
        "Kamu kuat di pemahaman materi. Cocok naik ke level berikutnya.";
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

  const dosenSummary = useMemo(() => {
    if (!user || user.role !== "dosen") return null;

    const myTopics = topics.filter((item) => item.createdBy === user.id);

    const myMaterials = materials.filter(
      (item) => String(item.createdBy) === String(user.id)
    );

    return {
      totalTopics: myTopics.length,
      totalMaterials: myMaterials.length,
      totalExercises: exercises.length,
      teachingInsight:
        myMaterials.length > 0
          ? "Materi yang kamu buat sudah tersedia untuk mahasiswa."
          : "Mulai buat materi agar aktivitas mengajarmu lebih terlihat.",
      nextAction:
        myTopics.length === 0
          ? "Buat topic baru untuk mulai menyusun materi."
          : "Lanjutkan menambah materi dan latihan pada topic yang sudah ada.",
    };
  }, [user, topics, materials, exercises]);

  const adminSummary = useMemo(() => {
    if (!user || user.role !== "admin") return null;

    const publishedMaterials = materials.filter(
      (item) => item.isPublished
    ).length;

    const publishedExercises = exercises.filter(
      (item) => item.isPublished
    ).length;

    return {
      totalTopics: topics.length,
      totalMaterials: materials.length,
      totalExercises: exercises.length,
      publishedMaterials,
      publishedExercises,
      systemInsight:
        topics.length > 0
          ? "Konten sistem sudah aktif dan dapat terus dikembangkan."
          : "Sistem masih minim konten. Tambahkan topic dan materi awal.",
      nextAction:
        materials.length === 0
          ? "Tambahkan materi pertama agar sistem siap digunakan."
          : "Pantau pertumbuhan topic, materi, dan latihan secara berkala.",
    };
  }, [user, topics, materials, exercises]);

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);

      const payload: Record<string, string> = {
        fullName: name,
        role: user.role,
        email: user.email,
      };

      if (user.role === "mahasiswa") {
        payload.npm = user.npm || "";
      }

      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
                {user?.role === "mahasiswa"
                  ? `Level ${mahasiswaSummary.currentLevel}`
                  : user?.role === "dosen"
                    ? "Instructor"
                    : "Administrator"}
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

            {user?.role === "mahasiswa" && (
              <>
                <div className="profile-grid-summary">
                  <div className="profile-mini-card">
                    <span>Materials</span>
                    <strong>{mahasiswaSummary.totalMaterials}</strong>
                  </div>

                  <div className="profile-mini-card">
                    <span>Exercises</span>
                    <strong>{mahasiswaSummary.totalExercises}</strong>
                  </div>

                  <div className="profile-mini-card">
                    <span>Quizzes</span>
                    <strong>{mahasiswaSummary.totalQuizzes}</strong>
                  </div>

                  <div className="profile-mini-card">
                    <span>Avg Score</span>
                    <strong>{mahasiswaSummary.avgScore}%</strong>
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
                      <strong>{mahasiswaSummary.overallProgress}%</strong>
                    </div>

                    <div className="profile-progress-bar">
                      <div
                        className="profile-progress-fill"
                        style={{ width: `${mahasiswaSummary.overallProgress}%` }}
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
                    <p>{mahasiswaSummary.nextAction}</p>
                  </div>

                  <div className="profile-info-card">
                    <div className="profile-section-title small">
                      <span>🤖</span>
                      <h3>Adaptive Insight</h3>
                    </div>
                    <p>{mahasiswaSummary.adaptiveInsight}</p>
                  </div>

                  <div className="profile-info-card full">
                    <div className="profile-section-title small">
                      <span>📝</span>
                      <h3>Feedback Terakhir</h3>
                    </div>
                    <p>{mahasiswaSummary.lastFeedback}</p>
                  </div>
                </div>
              </>
            )}

            {user?.role === "dosen" && (
              <>
                <div className="profile-grid-summary">
                  <div className="profile-mini-card">
                    <span>Topics</span>
                    <strong>{dosenSummary?.totalTopics || 0}</strong>
                  </div>

                  <div className="profile-mini-card">
                    <span>Materials</span>
                    <strong>{dosenSummary?.totalMaterials || 0}</strong>
                  </div>

                  <div className="profile-mini-card">
                    <span>Exercises</span>
                    <strong>{dosenSummary?.totalExercises || 0}</strong>
                  </div>

                  <div className="profile-mini-card">
                    <span>Role</span>
                    <strong>Dosen</strong>
                  </div>
                </div>

                <div className="profile-insight-grid">
                  <div className="profile-info-card">
                    <div className="profile-section-title small">
                      <span>📘</span>
                      <h3>Teaching Summary</h3>
                    </div>
                    <p>
                      Kamu memiliki {dosenSummary?.totalTopics || 0} topic dan{" "}
                      {dosenSummary?.totalMaterials || 0} materi yang mendukung
                      proses belajar.
                    </p>
                  </div>

                  <div className="profile-info-card">
                    <div className="profile-section-title small">
                      <span>🎯</span>
                      <h3>Next Step</h3>
                    </div>
                    <p>{dosenSummary?.nextAction || "-"}</p>
                  </div>

                  <div className="profile-info-card full">
                    <div className="profile-section-title small">
                      <span>🧠</span>
                      <h3>Instructor Insight</h3>
                    </div>
                    <p>{dosenSummary?.teachingInsight || "-"}</p>
                  </div>
                </div>
              </>
            )}

            {user?.role === "admin" && (
              <>
                <div className="profile-grid-summary">
                  <div className="profile-mini-card">
                    <span>Total Topics</span>
                    <strong>{adminSummary?.totalTopics || 0}</strong>
                  </div>

                  <div className="profile-mini-card">
                    <span>Total Materials</span>
                    <strong>{adminSummary?.totalMaterials || 0}</strong>
                  </div>

                  <div className="profile-mini-card">
                    <span>Total Exercises</span>
                    <strong>{adminSummary?.totalExercises || 0}</strong>
                  </div>

                  <div className="profile-mini-card">
                    <span>Status</span>
                    <strong>Active</strong>
                  </div>
                </div>

                <div className="profile-insight-grid">
                  <div className="profile-info-card">
                    <div className="profile-section-title small">
                      <span>⚙️</span>
                      <h3>System Overview</h3>
                    </div>
                    <p>
                      Saat ini tersedia {adminSummary?.publishedMaterials || 0}{" "}
                      materi published dan {adminSummary?.publishedExercises || 0}{" "}
                      latihan published.
                    </p>
                  </div>

                  <div className="profile-info-card">
                    <div className="profile-section-title small">
                      <span>🎯</span>
                      <h3>Next Step</h3>
                    </div>
                    <p>{adminSummary?.nextAction || "-"}</p>
                  </div>

                  <div className="profile-info-card full">
                    <div className="profile-section-title small">
                      <span>🛡️</span>
                      <h3>Admin Insight</h3>
                    </div>
                    <p>{adminSummary?.systemInsight || "-"}</p>
                  </div>
                </div>
              </>
            )}

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
                disabled={saving || loadingExtraData}
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