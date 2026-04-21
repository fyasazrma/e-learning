"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SectionTitle from "@/components/common/SectionTitle";
import { getClientUser } from "@/lib/client-auth";

type ExerciseOption = {
  label: string;
  value: string;
};

type ExerciseDetail = {
  _id: string;
  title: string;
  instruction: string;
  level: "easy" | "medium" | "hard";
  questionType?: "multiple_choice" | "essay";
  options?: ExerciseOption[];
  correctAnswer: string;
  explanation?: string;
  aiTip?: string;
  recommendedLevel?: "easy" | "medium" | "hard";
  isPublished?: boolean;
};

type AiFeedbackResult = {
  isCorrect: boolean;
  score: number;
  detectedError: string;
  feedback: string;
  aiTip: string;
  nextRecommendation: string;
  recommendedLevel: "easy" | "medium" | "hard";
};

export default function MahasiswaExerciseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const user = getClientUser();

  const exerciseId = params?.id;

  const [exercise, setExercise] = useState<ExerciseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [studentAnswer, setStudentAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [aiResult, setAiResult] = useState<AiFeedbackResult | null>(null);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const res = await fetch(`/api/exercises/${exerciseId}`, {
          cache: "no-store",
        });
        const result = await res.json();

        if (result.success) {
          setExercise(result.data || null);
        } else {
          setExercise(null);
        }
      } catch (error) {
        console.error("FETCH_EXERCISE_DETAIL_ERROR:", error);
        setExercise(null);
      } finally {
        setLoading(false);
      }
    };

    if (exerciseId) {
      fetchExercise();
    }
  }, [exerciseId]);

  const finalStudentAnswer = useMemo(() => {
    if (!exercise) return "";
    return exercise.questionType === "multiple_choice"
      ? selectedOption
      : studentAnswer.trim();
  }, [exercise, selectedOption, studentAnswer]);

  const handleSubmitToAI = async () => {
    if (!exercise) return;

    if (!finalStudentAnswer) {
      alert("Jawaban belum diisi.");
      return;
    }

    try {
      setSubmitting(true);
      setAiResult(null);

      const res = await fetch("/api/ai-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: exercise.title,
          instruction: exercise.instruction,
          questionType: exercise.questionType || "essay",
          level: exercise.level,
          options: exercise.options || [],
          correctAnswer: exercise.correctAnswer,
          explanation: exercise.explanation || "",
          aiTip: exercise.aiTip || "",
          recommendedLevel: exercise.recommendedLevel || exercise.level,
          studentAnswer: finalStudentAnswer,
          studentId: user?.id || null,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        alert(result.message || "Gagal memproses AI feedback");
        return;
      }

      setAiResult(result.data);
    } catch (error) {
      console.error("SUBMIT_AI_FEEDBACK_ERROR:", error);
      alert("Terjadi kesalahan saat memproses AI feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="dashboard-card neu-card">Memuat detail latihan...</div>;
  }

  if (!exercise) {
    return (
      <div className="dashboard-card neu-card">
        <p style={{ color: "var(--text-soft)" }}>Latihan tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="page-stack fade-in">
      <SectionTitle
        title={exercise.title}
        subtitle="Kerjakan soal di bawah ini lalu submit untuk mendapatkan AI feedback adaptif."
      />

      <div className="dashboard-card neu-card" style={{ display: "grid", gap: 18 }}>
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <span className="neu-pill" style={{ textTransform: "capitalize" }}>
            {exercise.level}
          </span>
          <span className="neu-pill">
            {exercise.questionType === "multiple_choice"
              ? "Pilihan Ganda"
              : "Essay"}
          </span>
          <span className="neu-pill">
            {exercise.isPublished ? "Published" : "Draft"}
          </span>
        </div>

        <div>
          <h3 style={{ marginBottom: 8 }}>Soal</h3>
          <p style={{ color: "var(--text-soft)", lineHeight: 1.8 }}>
            {exercise.instruction}
          </p>
        </div>

        {exercise.questionType === "multiple_choice" ? (
          <div style={{ display: "grid", gap: 12 }}>
            <h3>Pilih jawaban</h3>
            {(exercise.options || []).map((option, index) => (
              <label
                key={`${option.label}-${index}`}
                className="dashboard-card neu-card"
                style={{
                  padding: 14,
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="student-answer"
                  value={option.label}
                  checked={selectedOption === option.label}
                  onChange={(e) => setSelectedOption(e.target.value)}
                />
                <div>
                  <strong>{option.label}</strong>
                  <p style={{ color: "var(--text-soft)", marginTop: 4 }}>
                    {option.value}
                  </p>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <div className="auth-field">
            <label>Jawaban Kamu</label>
            <textarea
              className="auth-input"
              rows={6}
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder="Tulis jawaban kamu di sini..."
            />
          </div>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            type="button"
            className="neu-button"
            onClick={() => router.push("/dashboard/mahasiswa/exercises")}
          >
            Kembali
          </button>

          <button
            type="button"
            className="neu-button"
            onClick={handleSubmitToAI}
            disabled={submitting}
          >
            {submitting ? "Memproses AI..." : "Submit Jawaban"}
          </button>
        </div>
      </div>

      {aiResult && (
        <div className="dashboard-card neu-card" style={{ display: "grid", gap: 14 }}>
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <span className="neu-pill">
              {aiResult.isCorrect ? "Benar" : "Salah"}
            </span>
            <span className="neu-pill">Score: {aiResult.score}</span>
            <span className="neu-pill" style={{ textTransform: "capitalize" }}>
              Next Level: {aiResult.recommendedLevel}
            </span>
          </div>

          <div className="dashboard-card neu-card" style={{ padding: 16 }}>
            <h3 style={{ marginBottom: 6 }}>Deteksi Kesalahan</h3>
            <p style={{ color: "var(--text-soft)", lineHeight: 1.8 }}>
              {aiResult.detectedError}
            </p>
          </div>

          <div className="dashboard-card neu-card" style={{ padding: 16 }}>
            <h3 style={{ marginBottom: 6 }}>Feedback AI</h3>
            <p style={{ color: "var(--text-soft)", lineHeight: 1.8 }}>
              {aiResult.feedback}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            <div className="dashboard-card neu-card" style={{ padding: 16 }}>
              <h3 style={{ marginBottom: 6 }}>Tips AI</h3>
              <p style={{ color: "var(--text-soft)", lineHeight: 1.8 }}>
                {aiResult.aiTip}
              </p>
            </div>

            <div className="dashboard-card neu-card" style={{ padding: 16 }}>
              <h3 style={{ marginBottom: 6 }}>Rekomendasi Berikutnya</h3>
              <p style={{ color: "var(--text-soft)", lineHeight: 1.8 }}>
                {aiResult.nextRecommendation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}