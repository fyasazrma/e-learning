"use client";

import { useEffect, useState } from "react";
import SectionTitle from "@/components/common/SectionTitle";

type MaterialType = {
  _id: string;
  title: string;
  description?: string;
  content?: string;
  topicId?: string | null;
  isPublished?: boolean;
  fileName?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  contentType?: "text" | "file";
};

type TopicType = {
  _id: string;
  title: string;
};

export default function AdminMaterialsPage() {
  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [topics, setTopics] = useState<TopicType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    topicId: "",
    isPublished: true,
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      const [materialsRes, topicsRes] = await Promise.all([
        fetch("/api/materials", { cache: "no-store" }),
        fetch("/api/topics", { cache: "no-store" }),
      ]);

      const [materialsJson, topicsJson] = await Promise.all([
        materialsRes.json(),
        topicsRes.json(),
      ]);

      if (materialsJson.success) setMaterials(materialsJson.data || []);
      if (topicsJson.success) setTopics(topicsJson.data || []);
    } catch (error) {
      console.error("FETCH_ADMIN_MATERIALS_ERROR:", error);
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
      description: "",
      content: "",
      topicId: "",
      isPublished: true,
    });
    setSelectedFile(null);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    try {
      if (!form.title.trim()) {
        alert("Title wajib diisi");
        return;
      }

      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/materials/${editingId}` : "/api/materials";

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("content", form.content);
      formData.append("topicId", form.topicId);
      formData.append("isPublished", String(form.isPublished));

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const res = await fetch(url, {
        method,
        body: formData,
      });

      let result;
      try {
        result = await res.json();
      } catch {
        result = { success: false, message: "Response kosong dari server" };
      }

      if (!result.success) {
        alert(result.message || "Gagal menyimpan materi");
        return;
      }

      resetForm();
      fetchAll();
    } catch (error) {
      console.error("SUBMIT_MATERIAL_ERROR:", error);
      alert("Terjadi kesalahan saat menyimpan materi");
    }
  };

  const handleEdit = (material: MaterialType) => {
    setEditingId(material._id);
    setSelectedFile(null);
    setForm({
      title: material.title,
      description: material.description || "",
      content: material.content || "",
      topicId: material.topicId || "",
      isPublished: material.isPublished ?? true,
    });
  };

  const handleDelete = async (id: string) => {
    const ok = confirm("Yakin ingin menghapus materi ini?");
    if (!ok) return;

    try {
      const res = await fetch(`/api/materials/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!result.success) {
        alert(result.message || "Gagal menghapus materi");
        return;
      }

      fetchAll();
    } catch (error) {
      console.error("DELETE_MATERIAL_ERROR:", error);
      alert("Terjadi kesalahan saat menghapus materi");
    }
  };

  return (
    <div className="page-stack fade-in">
      <SectionTitle
        title="Kelola Materi"
        subtitle="Admin dapat memantau dan mengunggah materi pada sistem."
      />

      <div className="dashboard-card neu-card">
        <h3 style={{ marginBottom: 12 }}>
          {editingId ? "Edit Materi" : "Tambah Materi"}
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
            placeholder="Content (opsional kalau tanpa file)"
            value={form.content}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, content: e.target.value }))
            }
            rows={6}
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
            <button className="neu-button" onClick={handleSubmit}>
              {editingId ? "Update Materi" : "Tambah Materi"}
            </button>

            {(editingId ||
              form.title ||
              form.description ||
              form.content ||
              form.topicId ||
              selectedFile) && (
              <button className="neu-button" onClick={resetForm}>
                Batal
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-card neu-card">Loading materials...</div>
      ) : materials.length === 0 ? (
        <div className="dashboard-card neu-card">
          <p style={{ color: "var(--text-soft)" }}>Belum ada materi.</p>
        </div>
      ) : (
        <div className="info-list">
          {materials.map((item) => (
            <div key={item._id} className="info-row-card neu-card">
              <div className="info-row-left">
                <h3>{item.title}</h3>
                <p>{item.description || "Tidak ada deskripsi."}</p>

                {item.fileUrl && (
                  <p style={{ marginTop: 8 }}>
                    File:{" "}
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "var(--accent)" }}
                    >
                      {item.fileName || "Buka File"}
                    </a>
                  </p>
                )}

                {!item.fileUrl && item.content && (
                  <p style={{ marginTop: 8, color: "var(--text-soft)" }}>
                    Materi teks tersedia
                  </p>
                )}
              </div>

              <div className="info-row-meta">
                <button className="neu-button" onClick={() => handleEdit(item)}>
                  Edit
                </button>
                <button className="neu-button" onClick={() => handleDelete(item._id)}>
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