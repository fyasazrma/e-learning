"use client";

import { useEffect, useMemo, useState } from "react";
import SectionTitle from "@/components/common/SectionTitle";

type UserType = {
  _id: string;
  fullName?: string;
  email?: string;
  role?: string;
  npm?: string;
};

type ProgressType = {
  _id: string;
  studentId?: string | null;
  completedExercises: number;
  currentLevel: "easy" | "medium" | "hard";
  averageScore: number;
  lastFeedback: string;
};

export default function DosenStudentsPage() {
  const [students, setStudents] = useState<UserType[]>([]);
  const [progressData, setProgressData] = useState<ProgressType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentsData = async () => {
      try {
        const [usersRes, progressRes] = await Promise.all([
          fetch("/api/users", { cache: "no-store" }),
          fetch("/api/learning-progress", { cache: "no-store" }),
        ]);

        const [usersJson, progressJson] = await Promise.all([
          usersRes.json(),
          progressRes.json(),
        ]);

        if (usersJson.success) {
          const mahasiswa = (usersJson.data || []).filter(
            (user: UserType) => user.role === "mahasiswa"
          );
          setStudents(mahasiswa);
        }

        if (progressJson.success) {
          setProgressData(progressJson.data || []);
        }
      } catch (error) {
        console.error("FETCH_DOSEN_STUDENTS_ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsData();
  }, []);

  const studentCards = useMemo(() => {
    return students.map((student) => {
      const studentProgress = progressData.filter(
        (item) => String(item.studentId) === String(student._id)
      );

      const avgScore =
        studentProgress.length > 0
          ? Math.round(
              studentProgress.reduce((sum, item) => sum + (item.averageScore || 0), 0) /
                studentProgress.length
            )
          : 0;

      const latestProgress = studentProgress[0];

      return {
        ...student,
        currentLevel: latestProgress?.currentLevel || "-",
        averageScore: avgScore,
      };
    });
  }, [students, progressData]);

  return (
    <div className="page-stack fade-in">
      <SectionTitle
        title="Data Mahasiswa"
        subtitle="Pantau mahasiswa aktif, level belajar, dan rata-rata skor mereka."
      />

      {loading ? (
        <div className="dashboard-card neu-card">Loading students...</div>
      ) : studentCards.length === 0 ? (
        <div className="dashboard-card neu-card">
          <p style={{ color: "var(--text-soft)" }}>Belum ada data mahasiswa.</p>
        </div>
      ) : (
        <div className="info-list">
          {studentCards.map((student) => (
            <div key={student._id} className="info-row-card neu-card">
              <div className="info-row-left">
                <h3>{student.fullName || "Mahasiswa"}</h3>
                <p>NPM: {student.npm || "-"}</p>
                <p>Email: {student.email || "-"}</p>
              </div>

              <div className="info-row-meta">
                <span className="neu-pill" style={{ textTransform: "capitalize" }}>
                  Level: {student.currentLevel}
                </span>
                <span className="neu-pill">Score: {student.averageScore}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}