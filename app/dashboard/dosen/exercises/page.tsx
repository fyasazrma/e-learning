"use client";

import { useEffect, useState } from "react";
import SectionTitle from "@/components/common/SectionTitle";

type ExerciseType = {
  _id: string;
  title: string;
  level: "easy" | "medium" | "hard";
  createdAt?: string;
};

export default function DosenExercisesPage() {
  const [exercises, setExercises] = useState<ExerciseType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await fetch("/api/exercises", { cache: "no-store" });
        const result = await res.json();

        if (result.success) {
          setExercises(result.data || []);
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

    fetchExercises();
  }, []);

  return (
    <div className="page-stack fade-in">
      <SectionTitle
        title="Kelola Latihan"
        subtitle="Atur latihan berdasarkan topik dan level kesulitan."
      />

      {loading ? (
        <div className="dashboard-card neu-card">Loading exercises...</div>
      ) : exercises.length === 0 ? (
        <div className="dashboard-card neu-card">
          <p style={{ color: "var(--text-soft)" }}>Belum ada latihan yang tersedia.</p>
        </div>
      ) : (
        <div className="info-list">
          {exercises.map((item) => (
            <div key={item._id} className="info-row-card neu-card">
              <div className="info-row-left">
                <h3>{item.title}</h3>
                <p>Latihan adaptif untuk mahasiswa.</p>
              </div>

              <div className="info-row-meta">
                <span className="neu-pill" style={{ textTransform: "capitalize" }}>
                  {item.level}
                </span>
                <span className="neu-pill">
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString("id-ID")
                    : "-"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}