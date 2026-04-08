"use client";

import { useEffect, useState } from "react";
import SectionTitle from "@/components/common/SectionTitle";

type TopicType = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
};

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<TopicType[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchTopics = async () => {
    try {
      const res = await fetch("/api/topics", { cache: "no-store" });
      const result = await res.json();

      if (result.success) {
        setTopics(result.data || []);
      } else {
        setTopics([]);
      }
    } catch (error) {
      console.error("FETCH_ADMIN_TOPICS_ERROR:", error);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      slug: "",
      description: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/topics/${editingId}` : "/api/topics";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await res.json();

      if (!result.success) {
        alert(result.message || "Gagal menyimpan topic");
        return;
      }

      resetForm();
      fetchTopics();
    } catch (error) {
      console.error("SUBMIT_TOPIC_ERROR:", error);
      alert("Terjadi kesalahan saat menyimpan topic");
    }
  };

  const handleEdit = (topic: TopicType) => {
    setEditingId(topic._id);
    setForm({
      title: topic.title,
      slug: topic.slug,
      description: topic.description || "",
    });
  };

  const handleDelete = async (id: string) => {
    const ok = confirm("Yakin ingin menghapus topic ini?");
    if (!ok) return;

    try {
      const res = await fetch(`/api/topics/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!result.success) {
        alert(result.message || "Gagal menghapus topic");
        return;
      }

      fetchTopics();
    } catch (error) {
      console.error("DELETE_TOPIC_ERROR:", error);
      alert("Terjadi kesalahan saat menghapus topic");
    }
  };

  return (
    <div className="page-stack fade-in">
      <SectionTitle
        title="Kelola Topik"
        subtitle="Kelola topik pembelajaran yang digunakan pada materi dan latihan."
      />

      <div className="dashboard-card neu-card">
        <h3 style={{ marginBottom: 12 }}>
          {editingId ? "Edit Topic" : "Tambah Topic"}
        </h3>

        <div style={{ display: "grid", gap: 12 }}>
          <input
            className="neu-input"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          />
          <input
            className="neu-input"
            placeholder="Slug"
            value={form.slug}
            onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
          />
          <textarea
            className="neu-input"
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={4}
          />

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="neu-button" onClick={handleSubmit}>
              {editingId ? "Update Topic" : "Tambah Topic"}
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
        <div className="dashboard-card neu-card">Loading topics...</div>
      ) : topics.length === 0 ? (
        <div className="dashboard-card neu-card">
          <p style={{ color: "var(--text-soft)" }}>Belum ada topic.</p>
        </div>
      ) : (
        <div className="info-list">
          {topics.map((topic) => (
            <div key={topic._id} className="info-row-card neu-card">
              <div className="info-row-left">
                <h3>{topic.title}</h3>
                <p>{topic.description || "Tidak ada deskripsi."}</p>
                <p style={{ marginTop: 6, color: "var(--text-soft)" }}>
                  Slug: {topic.slug}
                </p>
              </div>

              <div className="info-row-meta">
                <button className="neu-button" onClick={() => handleEdit(topic)}>
                  Edit
                </button>
                <button className="neu-button" onClick={() => handleDelete(topic._id)}>
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