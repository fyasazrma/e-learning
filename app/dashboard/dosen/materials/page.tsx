"use client";

import { useEffect, useState } from "react";
import SectionTitle from "@/components/common/SectionTitle";

type MaterialType = {
  _id: string;
  title: string;
  description?: string;
  createdAt?: string;
};

export default function DosenMaterialsPage() {
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
        console.error("FETCH_DOSEN_MATERIALS_ERROR:", error);
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  return (
    <div className="page-stack fade-in">
      <SectionTitle
        title="Kelola Materi"
        subtitle="Lihat dan atur materi pembelajaran yang dibuat untuk mahasiswa."
      />

      {loading ? (
        <div className="dashboard-card neu-card">Loading materials...</div>
      ) : materials.length === 0 ? (
        <div className="dashboard-card neu-card">
          <p style={{ color: "var(--text-soft)" }}>Belum ada materi yang tersedia.</p>
        </div>
      ) : (
        <div className="info-list">
          {materials.map((item) => (
            <div key={item._id} className="info-row-card neu-card">
              <div className="info-row-left">
                <h3>{item.title}</h3>
                <p>{item.description || "Belum ada deskripsi materi."}</p>
              </div>

              <div className="info-row-meta">
                <span className="neu-pill">Active</span>
                <span className="neu-pill">
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString("id-ID")
                    : "-"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}