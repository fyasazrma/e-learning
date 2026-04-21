"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SectionTitle from "@/components/common/SectionTitle";

type TopicType = {
  _id: string;
  title: string;
};

type OptionType = {
  label: string;
  value: string;
};

export default function EditDosenExercisePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const exerciseId = params?.id;

  const [topics, setTopics] = useState<TopicType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [topicId, setTopicId] = useState("");
  const [instruction, setInstruction] = useState("");
  const [level, setLevel] = useState<"easy" | "medium" | "hard">("easy");
  const [questionType, setQuestionType] = useState<"multiple_choice" | "essay">(
    "multiple_choice"
  );
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [aiTip, setAiTip] = useState("");
  const [recommendedLevel, setRecommendedLevel] = useState<
    "easy" | "medium" | "hard"
  >("easy");
  const [isPublished, setIsPublished] = useState(true);
  const [options, setOptions] = useState<OptionType[]>([
    { label: "A", value: "" },
    { label: "B", value: "" },
    { label: "C", value: "" },
    { label: "D", value: "" },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [exerciseRes, topicsRes] = await Promise.all([
          fetch(`/api/exercises/${exerciseId}`, { cache: "no-store" }),
          fetch("/api/topics", { cache: "no-store" }),
        ]);

        const [exerciseResult, topicsResult] = await Promise.all([
          exerciseRes.json(),
          topicsRes.json(),
        ]);

        const exercise = exerciseResult?.data;

        if (exercise) {
          setTitle(exercise.title || "");
          setTopicId(exercise.topicId || "");
          setInstruction(exercise.instruction || "");
          setLevel(exercise.level || "easy");
          setQuestionType(exercise.questionType || "multiple_choice");
          setCorrectAnswer(exercise.correctAnswer || "");
          setExplanation(exercise.explanation || "");
          setAiTip(exercise.aiTip || "");
          setRecommendedLevel(exercise.recommendedLevel || "easy");
          setIsPublished(
            typeof exercise.isPublished === "boolean"
              ? exercise.isPublished
              : true
          );

          if (
            Array.isArray(exercise.options) &&
            exercise.options.length > 0
          ) {
            setOptions(exercise.options);
          }
        }

        setTopics(Array.isArray(topicsResult?.data) ? topicsResult.data : []);
      } catch (error) {
        console.error("FETCH_EDIT_EXERCISE_ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    if (exerciseId) {
      fetchData();
    }
  }, [exerciseId]);

  const handleOptionChange = (index: number, value: string) => {
    setOptions((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, value } : item
      )
    );
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      const payload = {
        title,
        topicId: topicId || null,
        instruction,
        level,
        questionType,
        options,
        correctAnswer,
        explanation,
        aiTip,
        recommendedLevel,
        isPublished,
      };

      const res = await fetch(`/api/exercises/${exerciseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Gagal update latihan");
      }

      alert("Exercise berhasil diupdate.");
      router.push("/dashboard/dosen/exercises");
    } catch (error) {
      console.error("UPDATE_EXERCISE_ERROR:", error);
      alert("Gagal update exercise.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="dashboard-card neu-card">Memuat data exercise...</div>;
  }

  return (
    <div className="page-stack fade-in">
      <SectionTitle
        title="Edit Exercise / Quiz"
        subtitle="Perbarui soal, tipe, jawaban, dan feedback adaptif."
      />

      <div className="dashboard-card neu-card" style={{ display: "grid", gap: 16 }}>
        <div className="auth-field">
          <label>Judul Soal</label>
          <input
            className="auth-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Masukkan judul soal"
          />
        </div>

        <div className="auth-field">
          <label>Topic</label>
          <select
            className="auth-input"
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
          >
            <option value="">Pilih topic</option>
            {topics.map((topic) => (
              <option key={topic._id} value={topic._id}>
                {topic.title}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12,
          }}
        >
          <div className="auth-field">
            <label>Level</label>
            <select
              className="auth-input"
              value={level}
              onChange={(e) =>
                setLevel(e.target.value as "easy" | "medium" | "hard")
              }
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="auth-field">
            <label>Tipe Soal</label>
            <select
              className="auth-input"
              value={questionType}
              onChange={(e) =>
                setQuestionType(
                  e.target.value as "multiple_choice" | "essay"
                )
              }
            >
              <option value="multiple_choice">Pilihan Ganda</option>
              <option value="essay">Essay</option>
            </select>
          </div>

          <div className="auth-field">
            <label>Recommended Level</label>
            <select
              className="auth-input"
              value={recommendedLevel}
              onChange={(e) =>
                setRecommendedLevel(
                  e.target.value as "easy" | "medium" | "hard"
                )
              }
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="auth-field">
          <label>Pertanyaan / Instruction</label>
          <textarea
            className="auth-input"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            rows={4}
          />
        </div>

        {questionType === "multiple_choice" && (
          <div className="dashboard-card neu-card" style={{ display: "grid", gap: 12 }}>
            <h3>Opsi Jawaban</h3>
            {options.map((item, index) => (
              <div key={`${item.label}-${index}`} className="auth-field">
                <label>Opsi {item.label}</label>
                <input
                  className="auth-input"
                  value={item.value}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
              </div>
            ))}
            <div className="auth-field">
              <label>Correct Answer</label>
              <select
                className="auth-input"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
              >
                <option value="">Pilih jawaban benar</option>
                {options.map((item, index) => (
                  <option key={`${item.label}-${index}`} value={item.label}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {questionType === "essay" && (
          <div className="auth-field">
            <label>Jawaban Referensi</label>
            <textarea
              className="auth-input"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              rows={4}
            />
          </div>
        )}

        <div className="auth-field">
          <label>Explanation</label>
          <textarea
            className="auth-input"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            rows={3}
          />
        </div>

        <div className="auth-field">
          <label>Tips AI / Adaptive Tip</label>
          <textarea
            className="auth-input"
            value={aiTip}
            onChange={(e) => setAiTip(e.target.value)}
            rows={3}
          />
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          Publish sekarang
        </label>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            className="neu-button"
            type="button"
            onClick={() => router.push("/dashboard/dosen/exercises")}
          >
            Batal
          </button>
          <button className="neu-button" type="button" onClick={handleSubmit} disabled={saving}>
            {saving ? "Menyimpan..." : "Update Exercise"}
          </button>
        </div>
      </div>
    </div>
  );
}