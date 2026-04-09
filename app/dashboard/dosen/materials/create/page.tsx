"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SectionTitle from "@/components/common/SectionTitle";

type TopicType = {
  _id: string;
  title: string;
};

export default function CreateDosenMaterialPage() {
  const router = useRouter();

  const [topics, setTopics] = useState<TopicType[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    topicId: "",
    isPublished: true,
  });

  useEffect(() => {
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
        console.error("FETCH_TOPICS_ERROR:", error);
        setTopics([]);
      } finally {
        setLoadingTopics(false);
      }
    };

    fetchTopics();
  }, []);

  const handleSubmit = async () => {
    try {
      if (!form.title.trim()) {
        alert("Title wajib diisi");
        return;
      }

      if (!form.content.trim() && !selectedFile) {
        alert("Isi content atau upload file materi");
        return;
      }

      setSubmitting(true);

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("content", form.content);
      formData.append("topicId", form.topicId);
      formData.append("isPublished", String(form.isPublished));

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const res = await fetch("/api/materials", {
        method: "POST",
        body: formData,
      });

      let result;
      try {
        result = await res.json();
      } catch {
        result = { success: false, message: "Response kosong dari server" };
      }

      if (!result.success) {
        alert(result.message || "Gagal menambahkan materi");
        return;
      }

      alert("Materi berhasil ditambahkan");
      router.push("/dashboard/dosen/materials");
    } catch (error) {
      console.error("CREATE_DOSEN_MATERIAL_ERROR:", error);
      alert("Terjadi kesalahan saat menambahkan materi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-stack fade-in">
      <SectionTitle
        title="Tambah Materi"
        subtitle="Dosen dapat menambahkan materi berupa teks atau file untuk mahasiswa."
      />

      <div className="dashboard-card neu-card">
        <div style={{ display: "grid", gap: 12 }}>
          <input
            className="neu-input"
            placeholder="Title"
            value={form.title}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, title: e.target.value }))
            }
          />

          <textarea
            className="neu-input"
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={3}
          />

          <textarea
            className="neu-input"
            placeholder="Content (isi kalau materi berbentuk teks)"
            value={form.content}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, content: e.target.value }))
            }
            rows={8}
          />

          <input
            type="file"
            accept=".doc,.docx,.pdf"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />

          {selectedFile && (
            <p style={{ color: "var(--text-soft)" }}>
              File dipilih: {selectedFile.name}
            </p>
          )}

          <select
            className="neu-select"
            value={form.topicId}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, topicId: e.target.value }))
            }
            disabled={loadingTopics}
          >
            <option value="">Pilih Topic</option>
            {topics.map((topic) => (
              <option key={topic._id} value={topic._id}>
                {topic.title}
              </option>
            ))}
          </select>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isPublished: e.target.checked }))
              }
            />
            Published
          </label>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              className="neu-button"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Menyimpan..." : "Simpan Materi"}
            </button>

            <button
              className="neu-button"
              type="button"
              onClick={() => router.push("/dashboard/dosen/materials")}
              disabled={submitting}
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}