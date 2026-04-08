"use client";

import { useEffect, useMemo, useState } from "react";
import SectionTitle from "@/components/common/SectionTitle";

type UserType = {
  _id: string;
  role?: string;
};

type MaterialType = {
  _id: string;
};

type ExerciseType = {
  _id: string;
};

type ProgressType = {
  _id: string;
  averageScore: number;
};

type FeedbackType = {
  _id: string;
  errorType: string[];
};

export default function DosenAnalyticsPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [exercises, setExercises] = useState<ExerciseType[]>([]);
  const [progress, setProgress] = useState<ProgressType[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [usersRes, materialsRes, exercisesRes, progressRes, feedbacksRes] =
          await Promise.all([
            fetch("/api/users", { cache: "no-store" }),
            fetch("/api/materials", { cache: "no-store" }),
            fetch("/api/exercises", { cache: "no-store" }),
            fetch("/api/learning-progress", { cache: "no-store" }),
            fetch("/api/feedbacks", { cache: "no-store" }),
          ]);

        const [usersJson, materialsJson, exercisesJson, progressJson, feedbacksJson] =
          await Promise.all([
            usersRes.json(),
            materialsRes.json(),
            exercisesRes.json(),
            progressRes.json(),
            feedbacksRes.json(),
          ]);

        if (usersJson.success) setUsers(usersJson.data || []);
        if (materialsJson.success) setMaterials(materialsJson.data || []);
        if (exercisesJson.success) setExercises(exercisesJson.data || []);
        if (progressJson.success) setProgress(progressJson.data || []);
        if (feedbacksJson.success) setFeedbacks(feedbacksJson.data || []);
      } catch (error) {
        console.error("FETCH_DOSEN_ANALYTICS_ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const totalStudents = users.filter((item) => item.role === "mahasiswa").length;

  const averageScore =
    progress.length > 0
      ? Math.round(
          progress.reduce((sum, item) => sum + (item.averageScore || 0), 0) /
            progress.length
        )
      : 0;

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

  const learningGain =
    averageScore >= 80 ? "Tinggi" : averageScore >= 60 ? "Sedang" : "Rendah";

  if (loading) {
    return <div className="dashboard-card neu-card">Loading analytics...</div>;
  }

  return (
    <div className="page-stack fade-in">
      <SectionTitle
        title="Analytics Sederhana"
        subtitle="Ringkasan performa belajar mahasiswa dan aktivitas pembelajaran."
      />

      <div className="analytics-grid">
        <div className="analytics-card neu-card">
          <strong>{totalStudents}</strong>
          <h3>Total Students</h3>
          <p>Jumlah mahasiswa aktif yang terdaftar dalam pembelajaran.</p>
        </div>

        <div className="analytics-card neu-card">
          <strong>{materials.length}</strong>
          <h3>Active Materials</h3>
          <p>Total materi aktif yang dapat diakses mahasiswa.</p>
        </div>

        <div className="analytics-card neu-card">
          <strong>{exercises.length}</strong>
          <h3>Active Exercises</h3>
          <p>Total latihan yang tersedia untuk pembelajaran adaptif.</p>
        </div>

        <div className="analytics-card neu-card">
          <strong>{averageScore}</strong>
          <h3>Average Score</h3>
          <p>Rata-rata skor mahasiswa dari latihan dan evaluasi.</p>
        </div>

        <div className="analytics-card neu-card">
          <strong>{mostCommonError}</strong>
          <h3>Most Common Error</h3>
          <p>Jenis kesalahan yang paling sering muncul pada latihan.</p>
        </div>

        <div className="analytics-card neu-card">
          <strong>{learningGain}</strong>
          <h3>Learning Gain</h3>
          <p>Peningkatan hasil belajar setelah remedial dan latihan adaptif.</p>
        </div>
      </div>
    </div>
  );
}