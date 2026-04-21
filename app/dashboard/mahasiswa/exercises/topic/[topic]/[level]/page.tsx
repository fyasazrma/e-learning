"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getClientUser } from "@/lib/client-auth";

type ExerciseType = {
  _id: string;
  title: string;
  instruction: string;
  level: "easy" | "medium" | "hard";
};

type SubmitResultType = {
  attempt?: {
    isCorrect: boolean;
    score: number;
    detectedErrors: string[];
    quickFeedback: string;
  };
  feedback?: {
    feedbackText: string;
    tipText: string;
  };
  recommendation?: {
    reason: string;
    targetLevel: string;
  };
  progress?: {
    currentLevel: string;
    averageScore: number;
    lastFeedback: string;
  };
  recommendedExercise?: {
    _id: string;
    title: string;
    instruction: string;
    level: string;
  } | null;
};

type AnswerHistoryType = {
  exerciseId: string;
  title: string;
  isCorrect: boolean;
  score: number;
  quickFeedback: string;
};

export default function ExerciseSessionPage() {
  const params = useParams();
  const router = useRouter();

  const topic = params.topic as string;
  const level = params.level as string;

  const [exercises, setExercises] = useState<ExerciseType[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const [result, setResult] = useState<SubmitResultType | null>(null);
  const [lastResult, setLastResult] = useState<SubmitResultType | null>(null);
  const [sessionFinished, setSessionFinished] = useState(false);

  const [answerHistory, setAnswerHistory] = useState<AnswerHistoryType[]>([]);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await fetch(
          `/api/exercises?topic=${topic}&level=${level}`,
          { cache: "no-store" }
        );
        const response = await res.json();

        if (response.success) {
          setExercises(response.data || []);
        } else {
          setExercises([]);
        }
      } catch (error) {
        console.error("FETCH_SESSION_EXERCISES_ERROR:", error);
        setExercises([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [topic, level]);

  const currentExercise = useMemo(() => {
    return exercises[currentIndex] || null;
  }, [exercises, currentIndex]);

  const topicTitle =
    topic === "sheets" ? "Sheets" : topic === "docs" ? "Docs" : "Slides";

  const totalCorrect = answerHistory.filter((item) => item.isCorrect).length;
  const totalWrong = answerHistory.filter((item) => !item.isCorrect).length;
  const averageScore =
    answerHistory.length > 0
      ? Math.round(
          answerHistory.reduce((sum, item) => sum + item.score, 0) /
            answerHistory.length
        )
      : 0;

  const handleSubmit = async () => {
    if (!currentExercise || !answer.trim()) return;

    const user = getClientUser();
    setSubmitLoading(true);

    try {
      const res = await fetch("/api/exercise-attempts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: user?.id || null,
          exerciseId: currentExercise._id,
          submittedAnswer: answer,
        }),
      });

      const response = await res.json();

      if (!response.success) {
        alert(response.message || "Gagal memproses jawaban");
        return;
      }

      setResult(response.data);
      setLastResult(response.data);

      setAnswerHistory((prev) => [
        ...prev,
        {
          exerciseId: currentExercise._id,
          title: currentExercise.title,
          isCorrect: response.data?.attempt?.isCorrect ?? false,
          score: response.data?.attempt?.score ?? 0,
          quickFeedback: response.data?.attempt?.quickFeedback || "-",
        },
      ]);
    } catch (error) {
      console.error("SUBMIT_EXERCISE_ERROR:", error);
      alert("Terjadi kesalahan saat submit jawaban");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleNextQuestion = () => {
    const isLastQuestion = currentIndex === exercises.length - 1;

    if (isLastQuestion) {
      setSessionFinished(true);
      return;
    }

    setAnswer("");
    setResult(null);
    setCurrentIndex((prev) => prev + 1);
  };

  if (loading) {
    return <div className="dashboard-card neu-card">Loading sesi latihan...</div>;
  }

  if (exercises.length === 0) {
    return (
      <div className="dashboard-card neu-card">
        Belum ada soal untuk topic <strong>{topic}</strong> level{" "}
        <strong>{level}</strong>.
      </div>
    );
  }

  if (sessionFinished) {
    return (
      <div className="page-stack fade-in">
        <div className="dashboard-card neu-card">
          <h2 style={{ marginBottom: "12px" }}>Sesi Level Selesai</h2>
          <p style={{ color: "var(--text-soft)", lineHeight: 1.8 }}>
            Kamu sudah menyelesaikan semua soal pada topic{" "}
            <strong>{topicTitle}</strong> level <strong>{level}</strong>.
          </p>
        </div>

        <div className="dashboard-card neu-card">
          <h3 style={{ marginBottom: "12px" }}>Ringkasan Hasil</h3>
          <p style={{ marginBottom: "8px" }}>
            Total Soal: <strong>{answerHistory.length}</strong>
          </p>
          <p style={{ marginBottom: "8px" }}>
            Benar: <strong style={{ color: "limegreen" }}>{totalCorrect}</strong>
          </p>
          <p style={{ marginBottom: "8px" }}>
            Salah: <strong style={{ color: "crimson" }}>{totalWrong}</strong>
          </p>
          <p>
            Rata-rata Skor: <strong>{averageScore}</strong>
          </p>
        </div>

        <div className="dashboard-card neu-card">
          <h3 style={{ marginBottom: "12px" }}>Riwayat Jawaban</h3>

          <div style={{ display: "grid", gap: 12 }}>
            {answerHistory.map((item, index) => (
              <div
                key={`${item.exerciseId}-${index}`}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  background: "var(--surface)",
                  boxShadow: "var(--shadow-inset)",
                }}
              >
                <p style={{ marginBottom: 6 }}>
                  <strong>{item.title}</strong>
                </p>
                <p style={{ marginBottom: 6 }}>
                  Status:{" "}
                  <strong
                    style={{
                      color: item.isCorrect ? "limegreen" : "crimson",
                    }}
                  >
                    {item.isCorrect ? "Benar" : "Salah"}
                  </strong>
                </p>
                <p style={{ marginBottom: 6 }}>Skor: {item.score}</p>
                <p>Quick Feedback: {item.quickFeedback}</p>
              </div>
            ))}
          </div>
        </div>

        {lastResult && (
          <>
            <div className="dashboard-card neu-card">
              <h3 style={{ marginBottom: "12px" }}>Rekomendasi Akhir</h3>
              <p style={{ marginBottom: "10px" }}>
                {lastResult.recommendation?.reason || "-"}
              </p>
              <p style={{ marginBottom: "10px" }}>
                Target Level Berikutnya:{" "}
                <strong style={{ color: "var(--accent)" }}>
                  {lastResult.recommendation?.targetLevel || "-"}
                </strong>
              </p>

              {lastResult.recommendedExercise ? (
                <div
                  style={{
                    marginTop: 14,
                    padding: 16,
                    borderRadius: 18,
                    background: "var(--surface)",
                    boxShadow: "var(--shadow-inset)",
                  }}
                >
                  <h4 style={{ marginBottom: 8 }}>
                    {lastResult.recommendedExercise.title}
                  </h4>
                  <p style={{ marginBottom: 8 }}>
                    {lastResult.recommendedExercise.instruction}
                  </p>
                  <p>
                    Level:{" "}
                    <strong style={{ color: "var(--accent)" }}>
                      {lastResult.recommendedExercise.level}
                    </strong>
                  </p>
                </div>
              ) : (
                <p style={{ color: "var(--text-soft)" }}>
                  Belum ada latihan rekomendasi spesifik.
                </p>
              )}
            </div>

            <div className="dashboard-card neu-card">
              <h3 style={{ marginBottom: "12px" }}>Progress Terbaru</h3>
              <p style={{ marginBottom: "8px" }}>
                Level Saat Ini:{" "}
                <strong>{lastResult.progress?.currentLevel || "-"}</strong>
              </p>
              <p style={{ marginBottom: "8px" }}>
                Rata-rata Skor: {lastResult.progress?.averageScore ?? "-"}
              </p>
              <p>
                Last Feedback: {lastResult.progress?.lastFeedback || "-"}
              </p>
            </div>
          </>
        )}

        <div
          className="dashboard-card neu-card"
          style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
        >
          <button
            className="neu-button"
            onClick={() => router.push("/dashboard/mahasiswa/progress")}
          >
            Lihat Progress
          </button>

          <button
            className="neu-button"
            onClick={() => router.push("/dashboard/mahasiswa/recommendations")}
          >
            Lihat Recommendations
          </button>

          <button
            className="neu-button"
            onClick={() => router.push("/dashboard/mahasiswa/exercises")}
          >
            Kembali ke Exercises
          </button>
        </div>
      </div>
    );
  }

  if (!currentExercise) {
    return <div className="dashboard-card neu-card">Soal tidak ditemukan.</div>;
  }

  return (
    <div className="page-stack fade-in">
      <div className="dashboard-card neu-card">
        <h2 style={{ marginBottom: "10px" }}>{currentExercise.title}</h2>

        <p style={{ color: "var(--text-soft)", marginBottom: "10px" }}>
          Topik: <strong>{topicTitle}</strong> | Level: <strong>{level}</strong>
        </p>

        <p style={{ color: "var(--text-soft)", marginBottom: "12px" }}>
          Soal {currentIndex + 1} dari {exercises.length}
        </p>

        <p style={{ lineHeight: 1.8 }}>{currentExercise.instruction}</p>
      </div>

      <div className="dashboard-card neu-card">
        <h3 style={{ marginBottom: "14px" }}>Jawaban</h3>

        <input
          type="text"
          className="neu-input"
          placeholder="Masukkan jawaban"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={!!result}
          style={{ marginBottom: "16px" }}
        />

        {!result ? (
          <button
            className="neu-button"
            onClick={handleSubmit}
            disabled={!answer.trim() || submitLoading}
          >
            {submitLoading ? "Memproses..." : "Submit Jawaban"}
          </button>
        ) : (
          <button className="neu-button" onClick={handleNextQuestion}>
            {currentIndex === exercises.length - 1
              ? "Selesaikan Level"
              : "Lanjut ke Soal Berikutnya"}
          </button>
        )}
      </div>

      {result && (
        <>
          <div className="dashboard-card neu-card">
            <h3 style={{ marginBottom: "12px" }}>Hasil Evaluasi</h3>

            <p style={{ marginBottom: "8px" }}>
              Status:{" "}
              <strong
                style={{
                  color: result.attempt?.isCorrect ? "limegreen" : "crimson",
                }}
              >
                {result.attempt?.isCorrect ? "Benar" : "Salah"}
              </strong>
            </p>

            <p style={{ marginBottom: "8px" }}>
              Skor: {result.attempt?.score ?? "-"}
            </p>

            <p style={{ marginBottom: "8px" }}>
              Quick Feedback: {result.attempt?.quickFeedback || "-"}
            </p>

            <p>
              Error Terdeteksi:{" "}
              {result.attempt?.detectedErrors?.length
                ? result.attempt.detectedErrors.join(", ")
                : "Tidak ada"}
            </p>
          </div>

          <div className="dashboard-card neu-card">
            <h3 style={{ marginBottom: "12px" }}>Feedback & Tips</h3>
            <p style={{ marginBottom: "10px" }}>
              {result.feedback?.feedbackText || "-"}
            </p>
            <p style={{ color: "var(--accent)", fontWeight: 700 }}>
              Tip: {result.feedback?.tipText || "-"}
            </p>
          </div>

          <div className="dashboard-card neu-card">
            <h3 style={{ marginBottom: "12px" }}>Rekomendasi Adaptif</h3>
            <p style={{ marginBottom: "10px" }}>
              {result.recommendation?.reason || "-"}
            </p>
            <p style={{ marginBottom: "10px" }}>
              Target Level:{" "}
              <strong style={{ color: "var(--accent)" }}>
                {result.recommendation?.targetLevel || "-"}
              </strong>
            </p>

            {result.recommendedExercise ? (
              <div
                style={{
                  marginTop: 14,
                  padding: 16,
                  borderRadius: 18,
                  background: "var(--surface)",
                  boxShadow: "var(--shadow-inset)",
                }}
              >
                <h4 style={{ marginBottom: 8 }}>
                  {result.recommendedExercise.title}
                </h4>
                <p style={{ marginBottom: 8 }}>
                  {result.recommendedExercise.instruction}
                </p>
                <p>
                  Level:{" "}
                  <strong style={{ color: "var(--accent)" }}>
                    {result.recommendedExercise.level}
                  </strong>
                </p>
              </div>
            ) : (
              <p style={{ color: "var(--text-soft)" }}>
                Belum ada latihan rekomendasi spesifik.
              </p>
            )}
          </div>

          <div className="dashboard-card neu-card">
            <h3 style={{ marginBottom: "12px" }}>Update Progress</h3>
            <p style={{ marginBottom: "8px" }}>
              Level Saat Ini:{" "}
              <strong>{result.progress?.currentLevel || "-"}</strong>
            </p>
            <p style={{ marginBottom: "8px" }}>
              Rata-rata Skor: {result.progress?.averageScore ?? "-"}
            </p>
            <p>Last Feedback: {result.progress?.lastFeedback || "-"}</p>
          </div>
        </>
      )}
    </div>
  );
}