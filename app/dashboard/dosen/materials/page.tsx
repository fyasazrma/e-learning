"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SectionTitle from "@/components/common/SectionTitle";
import { getClientUser } from "@/lib/client-auth";

type MaterialType = {
  _id: string;
  title: string;
  description?: string;
  content?: string;
  createdAt?: string;
  fileName?: string;
  fileUrl?: string;
  contentType?: "text" | "file";
  isPublished?: boolean;
};

export default function DosenMaterialsPage() {
  const router = useRouter();
  const user = getClientUser();

  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState<string | null>(null);

  const fetchMaterials = async () => {
    try {
      const res = await fetch("/api/materials", { cache: "no-store" });
      const result = await res.json();

      if (result.success) {
        setMaterials(result.data || []);
      } else {
        setMaterials([]);
      }
    } catch (error) {
      console.error("FETCH_DOSEN_MATERIALS_ERROR:", error);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleDeleteRequest = async (item: MaterialType) => {
    const reason = window.prompt(
      `Tulis alasan penghapusan untuk "${item.title}":`,
      "Materi perlu diperbarui"
    );

    if (reason === null) return;

    try {
      setRequestingId(item._id);

      const res = await fetch("/api/deletion-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemType: "material",
          itemId: item._id,
          itemTitle: item.title,
          requestedBy: user?.id,
          reason,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "Gagal mengajukan penghapusan materi");
        return;
      }

      alert("Request penghapusan materi berhasil diajukan ke admin.");
    } catch (error) {
      console.error("REQUEST_DELETE_DOSEN_MATERIAL_ERROR:", error);
      alert("Terjadi kesalahan saat mengajukan penghapusan materi");
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <div className="page-stack fade-in">
      <SectionTitle
        title="Kelola Materi"
        subtitle="Lihat dan atur materi pembelajaran yang dibuat untuk mahasiswa."
      />

      <div className="dashboard-card neu-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3 style={{ marginBottom: 6 }}>Daftar Materi</h3>
            <p style={{ color: "var(--text-soft)" }}>
              Tambahkan materi baru dalam bentuk teks atau file.
            </p>
          </div>

          <button
            className="neu-button"
            onClick={() => router.push("/dashboard/dosen/materials/create")}
          >
            + Tambah Materi
          </button>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-card neu-card">Loading materials...</div>
      ) : materials.length === 0 ? (
        <div className="dashboard-card neu-card">
          <p style={{ color: "var(--text-soft)" }}>
            Belum ada materi yang tersedia.
          </p>
        </div>
      ) : (
        <div className="info-list">
          {materials.map((item) => (
            <div key={item._id} className="info-row-card neu-card">
              <div className="info-row-left">
                <h3>{item.title}</h3>
                <p>{item.description || "Belum ada deskripsi materi."}</p>

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

              <div
                className="info-row-meta"
                style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
              >
                <span className="neu-pill">
                  {item.isPublished ? "Published" : "Draft"}
                </span>
                <span className="neu-pill">
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString("id-ID")
                    : "-"}
                </span>
                <button
                  className="neu-button"
                  onClick={() =>
                    router.push(`/dashboard/dosen/materials/edit/${item._id}`)
                  }
                >
                  Edit
                </button>
                <button
                  className="neu-button"
                  onClick={() => handleDeleteRequest(item)}
                  disabled={requestingId === item._id}
                >
                  {requestingId === item._id ? "Mengajukan..." : "Ajukan Hapus"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}