"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SectionTitle from "@/components/common/SectionTitle";
import { getClientUser } from "@/lib/client-auth";

type ExerciseType = {
  _id: string;
  title: string;
  level: "easy" | "medium" | "hard";
  questionType?: "multiple_choice" | "essay";
  createdAt?: string;
  createdBy?: string | null;
};

export default function DosenExercisesPage() {
  const user = getClientUser();

  const [exercises, setExercises] = useState<ExerciseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"mine" | "all">("mine");

  const fetchExercises = async () => {
    try {
      if (user?.id) {
        const mineRes = await fetch(
          `/api/exercises?includeAll=true&createdBy=${user.id}`,
          { cache: "no-store" }
        );
        const mineResult = await mineRes.json();

        const mineExercises = mineResult.success ? mineResult.data || [] : [];

        if (mineExercises.length > 0) {
          setExercises(mineExercises);
          setViewMode("mine");
          return;
        }
      }

      const allRes = await fetch(`/api/exercises?includeAll=true`, {
        cache: "no-store",
      });
      const allResult = await allRes.json();

      if (allResult.success) {
        setExercises(allResult.data || []);
        setViewMode("all");
      } else {
        setExercises([]);
      }
    } catch (error) {
      console.error("FETCH_DOSEN_EXERCISES_ERROR:", error);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const handleDeleteRequest = async (item: ExerciseType) => {
    const reason = window.prompt(
      `Tulis alasan penghapusan untuk "${item.title}":`,
      "Soal perlu diperbarui"
    );

    if (reason === null) return;

    try {
      setRequestingId(item._id);

      const res = await fetch("/api/deletion-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemType: "exercise",
          itemId: item._id,
          itemTitle: item.title,
          requestedBy: user?.id,
          reason,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Gagal mengajukan penghapusan");
      }

      alert("Request penghapusan exercise berhasil diajukan ke admin.");
    } catch (error) {
      console.error("REQUEST_DELETE_EXERCISE_ERROR:", error);
      alert("Gagal mengajukan penghapusan exercise.");
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <div className="page-stack fade-in">
      <SectionTitle
        title="Kelola Exercise / Quiz"
        subtitle="Dosen dapat membuat, mengedit, dan mengajukan hapus soal."
      />

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <div className="dashboard-card neu-card" style={{ padding: 14 }}>
          <strong style={{ display: "block", marginBottom: 4 }}>
            {viewMode === "mine" ? "Menampilkan soal milik dosen ini" : "Menampilkan semua soal"}
          </strong>
          <p style={{ color: "var(--text-soft)", margin: 0 }}>
            {viewMode === "mine"
              ? "Data difilter berdasarkan akun dosen yang sedang login."
              : "Soal lama belum punya createdBy, jadi sistem menampilkan semua soal sebagai fallback."}
          </p>
        </div>

        <Link href="/dashboard/dosen/exercises/create" className="neu-button">
          + Tambah Exercise
        </Link>
      </div>

      {loading ? (
        <div className="dashboard-card neu-card">Loading exercises...</div>
      ) : exercises.length === 0 ? (
        <div className="dashboard-card neu-card">
          <p style={{ color: "var(--text-soft)" }}>
            Belum ada exercise yang tersedia.
          </p>
        </div>
      ) : (
        <div className="info-list">
          {exercises.map((item) => (
            <div key={item._id} className="info-row-card neu-card">
              <div className="info-row-left">
                <h3>{item.title}</h3>
                <p>
                  Tipe:{" "}
                  {item.questionType === "essay" ? "Essay" : "Pilihan Ganda"} •
                  Level: {item.level}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <span className="neu-pill" style={{ textTransform: "capitalize" }}>
                  {item.level}
                </span>

                <span className="neu-pill">
                  {item.questionType === "essay" ? "Essay" : "Pilihan Ganda"}
                </span>

                <span className="neu-pill">
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString("id-ID")
                    : "-"}
                </span>

                <Link
                  href={`/dashboard/dosen/exercises/edit/${item._id}`}
                  className="neu-button"
                >
                  Edit
                </Link>

                <button
                  className="neu-button"
                  onClick={() => handleDeleteRequest(item)}
                  disabled={requestingId === item._id}
                >
                  {requestingId === item._id ? "Mengajukan..." : "Ajukan Hapus"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}