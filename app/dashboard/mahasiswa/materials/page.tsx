"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type MaterialType = {
  _id: string;
  title: string;
  description: string;
  content?: string;
  topicId?: string | null;
  isPublished?: boolean;
};

export default function MahasiswaMaterialsPage() {
  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        console.error("FETCH_MATERIALS_ERROR:", error);
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  if (loading) {
    return <div className="dashboard-card neu-card">Loading materials...</div>;
  }

  return (
    <div className="page-stack fade-in">
      <div className="dashboard-card neu-card">
        <h2 style={{ marginBottom: "12px" }}>Materials</h2>
        <p style={{ color: "var(--text-soft)", lineHeight: 1.8 }}>
          Pelajari materi software perkantoran sebelum lanjut ke latihan adaptif.
        </p>
      </div>

      {materials.length === 0 ? (
        <div className="dashboard-card neu-card">
          <p style={{ color: "var(--text-soft)" }}>
            Belum ada materi yang tersedia.
          </p>
        </div>
      ) : (
        <div className="card-grid-3">
          {materials.map((material) => (
            <div key={material._id} className="dashboard-card neu-card">
              <h3 style={{ marginBottom: "10px" }}>{material.title}</h3>
              <p
                style={{
                  marginBottom: "16px",
                  color: "var(--text-soft)",
                  lineHeight: 1.7,
                }}
              >
                {material.description}
              </p>

              <Link
                href={`/dashboard/mahasiswa/materials/${material._id}`}
                className="neu-button"
              >
                Buka Materi
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}