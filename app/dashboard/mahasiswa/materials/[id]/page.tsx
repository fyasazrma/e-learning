"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type MaterialType = {
  _id: string;
  title: string;
  description: string;
  content?: string;
};

export default function MahasiswaMaterialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const materialId = params.id as string;

  const [material, setMaterial] = useState<MaterialType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterialDetail = async () => {
      try {
        const res = await fetch(`/api/materials/${materialId}`, {
          cache: "no-store",
        });
        const result = await res.json();

        if (result.success) {
          setMaterial(result.data || null);
        } else {
          setMaterial(null);
        }
      } catch (error) {
        console.error("FETCH_MATERIAL_DETAIL_ERROR:", error);
        setMaterial(null);
      } finally {
        setLoading(false);
      }
    };

    if (materialId) {
      fetchMaterialDetail();
    }
  }, [materialId]);

  if (loading) {
    return <div className="dashboard-card neu-card">Loading material...</div>;
  }

  if (!material) {
    return <div className="dashboard-card neu-card">Materi tidak ditemukan.</div>;
  }

  return (
    <div className="page-stack fade-in">
      <div className="dashboard-card neu-card">
        <h2 style={{ marginBottom: "12px" }}>{material.title}</h2>
        <p style={{ color: "var(--text-soft)", lineHeight: 1.8 }}>
          {material.description}
        </p>
      </div>

      <div className="dashboard-card neu-card">
        <h3 style={{ marginBottom: "12px" }}>Isi Materi</h3>
        <div style={{ lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
          {material.content || "Konten materi belum tersedia."}
        </div>
      </div>

      <div
        className="dashboard-card neu-card"
        style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
      >
        <button className="neu-button" onClick={() => router.back()}>
          Kembali
        </button>

        <button
          className="neu-button"
          onClick={() => router.push("/dashboard/mahasiswa/exercises")}
        >
          Mulai Exercises
        </button>
      </div>
    </div>
  );
}