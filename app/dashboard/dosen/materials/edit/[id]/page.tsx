"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SectionTitle from "@/components/common/SectionTitle";

type TopicType = {
  _id: string;
  title: string;
};

type MaterialType = {
  _id: string;
  title: string;
  description?: string;
  content?: string;
  topicId?: string | null;
  isPublished?: boolean;
  fileName?: string;
  fileUrl?: string;
  contentType?: "text" | "file";
};

export default function EditDosenMaterialPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [topics, setTopics] = useState<TopicType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingMaterial, setExistingMaterial] = useState<MaterialType | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    topicId: "",
    isPublished: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [materialRes, topicsRes] = await Promise.all([
          fetch(`/api/materials/${id}`, { cache: "no-store" }),
          fetch("/api/topics", { cache: "no-store" }),
        ]);

        const [materialJson, topicsJson] = await Promise.all([
          materialRes.json(),
          topicsRes.json(),
        ]);

        if (!materialJson.success || !materialJson.data) {
          alert(materialJson.message || "Materi tidak ditemukan");
          router.push("/dashboard/dosen/materials");
          return;
        }

        const material = materialJson.data;

        setExistingMaterial(material);
        setForm({
          title: material.title || "",
          description: material.description || "",
          content: material.content || "",
          topicId: material.topicId || "",
          isPublished: material.isPublished ?? true,
        });

        if (topicsJson.success) {
          setTopics(topicsJson.data || []);
        } else {
          setTopics([]);
        }
      } catch (error) {
        console.error("FETCH_EDIT_MATERIAL_ERROR:", error);
        alert("Gagal memuat data materi");
        router.push("/dashboard/dosen/materials");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, router]);

  const handleSubmit = async () => {
    try {
      if (!form.title.trim()) {
        alert("Title wajib diisi");
        return;
      }

      if (!form.content.trim() && !selectedFile && !existingMaterial?.fileUrl) {
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

      const res = await fetch(`/api/materials/${id}`, {
        method: "PUT",
        body: formData,
      });

      let result;
      try {
        result = await res.json();
      } catch {
        result = { success: false, message: "Response kosong dari server" };
      }

      if (!result.success) {
        alert(result.message || "Gagal mengupdate materi");
        return;
      }

      alert("Materi berhasil diupdate");
      router.push("/dashboard/dosen/materials");
    } catch (error) {
      console.error("UPDATE_DOSEN_MATERIAL_ERROR:", error);
      alert("Terjadi kesalahan saat update materi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-stack fade-in">
        <SectionTitle
          title="Edit Materi"
          subtitle="Memuat data materi..."
        />
        <div className="dashboard-card neu-card">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-stack fade-in">
      <SectionTitle
        title="Edit Materi"
        subtitle="Perbarui materi berupa teks atau file untuk mahasiswa."
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

          {existingMaterial?.fileUrl && !selectedFile && (
            <p style={{ color: "var(--text-soft)" }}>
              File saat ini:{" "}
              <a
                href={existingMaterial.fileUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--accent)" }}
              >
                {existingMaterial.fileName || "Buka File"}
              </a>
            </p>
          )}

          <input
            type="file"
            accept=".doc,.docx,.pdf"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />

          {selectedFile && (
            <p style={{ color: "var(--text-soft)" }}>
              File baru dipilih: {selectedFile.name}
            </p>
          )}

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
              {submitting ? "Menyimpan..." : "Update Materi"}
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