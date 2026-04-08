"use client";

import { useEffect, useState } from "react";
import SectionTitle from "@/components/common/SectionTitle";

type ExerciseType = {
  _id: string;
  title: string;
  topicId?: string | null;
  instruction: string;
  level: "easy" | "medium" | "hard";
  correctAnswer: string;
  isPublished?: boolean;
};

type TopicType = {
  _id: string;
  title: string;
};

export default function AdminExercisesPage() {
  const [exercises, setExercises] = useState<ExerciseType[]>([]);
  const [topics, setTopics] = useState<TopicType[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    topicId: "",
    instruction: "",
    level: "easy",
    correctAnswer: "",
    isPublished: true,
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      const [exercisesRes, topicsRes] = await Promise.all([
        fetch("/api/exercises", { cache: "no-store" }),
        fetch("/api/topics", { cache: "no-store" }),
      ]);

      const [exercisesJson, topicsJson] = await Promise.all([
        exercisesRes.json(),
        topicsRes.json(),
      ]);

      if (exercisesJson.success) setExercises(exercisesJson.data || []);
      if (topicsJson.success) setTopics(topicsJson.data || []);
    } catch (error) {
      console.error("FETCH_ADMIN_EXERCISES_ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      topicId: "",
      instruction: "",
      level: "easy",
      correctAnswer: "",
      isPublished: true,
    });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/exercises/${editingId}` : "/api/exercises";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          topicId: form.topicId || null,
        }),
      });

      const result = await res.json();

      if (!result.success) {
        alert(result.message || "Gagal menyimpan latihan");
        return;
      }

      resetForm();
      fetchAll();
    } catch (error) {
      console.error("SUBMIT_EXERCISE_ERROR:", error);
      alert("Terjadi kesalahan saat menyimpan latihan");
    }
  };

  const handleEdit = (exercise: ExerciseType) => {
    setEditingId(exercise._id);
    setForm({
      title: exercise.title,
      topicId: exercise.topicId || "",
      instruction: exercise.instruction,
      level: exercise.level,
      correctAnswer: exercise.correctAnswer,
      isPublished: exercise.isPublished ?? true,
    });
  };

  const handleDelete = async (id: string) => {
    const ok = confirm("Yakin ingin menghapus latihan ini?");
    if (!ok) return;

    try {
      const res = await fetch(`/api/exercises/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!result.success) {
        alert(result.message || "Gagal menghapus latihan");
        return;
      }

      fetchAll();
    } catch (error) {
      console.error("DELETE_EXERCISE_ERROR:", error);
      alert("Terjadi kesalahan saat menghapus latihan");
    }
  };

  return (
    <div className="page-stack fade-in">
      <SectionTitle
        title="Kelola Latihan"
        subtitle="Lihat seluruh latihan berdasarkan topik, level, dan status."
      />

      <div className="dashboard-card neu-card">
        <h3 style={{ marginBottom: 12 }}>
          {editingId ? "Edit Latihan" : "Tambah Latihan"}
        </h3>

        <div style={{ display: "grid", gap: 12 }}>
          <input
            className="neu-input"
            placeholder="Title"
            value={form.title}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, title: e.target.value }))
            }
          />

          <select
            className="neu-select"
            value={form.topicId}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, topicId: e.target.value }))
            }
          >
            <option value="">Pilih Topic</option>
            {topics.map((topic) => (
              <option key={topic._id} value={topic._id}>
                {topic.title}
              </option>
            ))}
          </select>

          <textarea
            className="neu-input"
            placeholder="Instruction"
            value={form.instruction}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, instruction: e.target.value }))
            }
            rows={4}
          />

          <select
            className="neu-select"
            value={form.level}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                level: e.target.value as "easy" | "medium" | "hard",
              }))
            }
          >
            <option value="easy">easy</option>
            <option value="medium">medium</option>
            <option value="hard">hard</option>
          </select>

          <input
            className="neu-input"
            placeholder="Correct Answer"
            value={form.correctAnswer}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, correctAnswer: e.target.value }))
            }
          />

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  isPublished: e.target.checked,
                }))
              }
            />
            Published
          </label>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="neu-button" onClick={handleSubmit}>
              {editingId ? "Update Latihan" : "Tambah Latihan"}
            </button>

            {editingId && (
              <button className="neu-button" onClick={resetForm}>
                Batal Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-card neu-card">Loading exercises...</div>
      ) : exercises.length === 0 ? (
        <div className="dashboard-card neu-card">
          <p style={{ color: "var(--text-soft)" }}>Belum ada latihan.</p>
        </div>
      ) : (
        <div className="info-list">
          {exercises.map((item) => (
            <div key={item._id} className="info-row-card neu-card">
              <div className="info-row-left">
                <h3>{item.title}</h3>
                <p>{item.instruction}</p>
              </div>

              <div className="info-row-meta">
                <span
                  className="neu-pill"
                  style={{ textTransform: "capitalize" }}
                >
                  {item.level}
                </span>
                <button className="neu-button" onClick={() => handleEdit(item)}>
                  Edit
                </button>
                <button
                  className="neu-button"
                  onClick={() => handleDelete(item._id)}
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}