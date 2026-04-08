"use client";

import { useEffect, useMemo, useState } from "react";
import { getClientUser } from "@/lib/client-auth";

type RecommendationType = {
  _id: string;
  studentId?: string | null;
  basedOnAttemptId: string;
  recommendedExerciseId?: string | null;
  reason: string;
  targetLevel: "easy" | "medium" | "hard";
  status: "pending" | "taken" | "done";
  createdAt?: string;
};

type FilterType = "today" | "yesterday" | "all";

function isToday(dateString?: string) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function isYesterday(dateString?: string) {
  if (!dateString) return false;

  const date = new Date(dateString);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
}

export default function MahasiswaRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<RecommendationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("today");

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const user = getClientUser();
        const res = await fetch("/api/recommendations", {
          cache: "no-store",
        });
        const result = await res.json();

        if (result.success) {
          const filtered = (result.data || [])
            .filter(
              (item: RecommendationType) =>
                !user?.id || String(item.studentId) === String(user.id)
            )
            .sort((a: RecommendationType, b: RecommendationType) => {
              const dateA = new Date(a.createdAt || 0).getTime();
              const dateB = new Date(b.createdAt || 0).getTime();
              return dateB - dateA;
            });

          setRecommendations(filtered);
        } else {
          setRecommendations([]);
        }
      } catch (error) {
        console.error("FETCH_RECOMMENDATIONS_ERROR:", error);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const filteredRecommendations = useMemo(() => {
    if (filter === "today") {
      return recommendations.filter((item) => isToday(item.createdAt));
    }

    if (filter === "yesterday") {
      return recommendations.filter((item) => isYesterday(item.createdAt));
    }

    return recommendations;
  }, [recommendations, filter]);

  if (loading) {
    return <div className="dashboard-card neu-card">Loading recommendations...</div>;
  }

  return (
    <div className="page-stack fade-in">
      <div className="dashboard-card neu-card">
        <h2 style={{ marginBottom: "12px" }}>Rekomendasi Adaptif</h2>
        <p style={{ color: "var(--text-soft)", lineHeight: 1.8 }}>
          Lihat rekomendasi latihan berdasarkan waktu dan hasil latihanmu.
        </p>
      </div>

      <div
        className="dashboard-card neu-card"
        style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
      >
        <button className="neu-button" onClick={() => setFilter("today")}>
          Hari Ini
        </button>
        <button className="neu-button" onClick={() => setFilter("yesterday")}>
          Kemarin
        </button>
        <button className="neu-button" onClick={() => setFilter("all")}>
          Semua Riwayat
        </button>
      </div>

      {filteredRecommendations.length === 0 ? (
        <div className="dashboard-card neu-card">
          <p style={{ color: "var(--text-soft)" }}>
            Tidak ada rekomendasi untuk filter ini.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {filteredRecommendations.map((item) => (
            <div key={item._id} className="dashboard-card neu-card">
              <h3 style={{ marginBottom: "10px" }}>Recommendation</h3>

              <p style={{ marginBottom: "10px", lineHeight: 1.8 }}>
                {item.reason}
              </p>

              <p style={{ marginBottom: "8px" }}>
                <strong>Target Level:</strong>{" "}
                <span style={{ color: "var(--accent)", textTransform: "capitalize" }}>
                  {item.targetLevel}
                </span>
              </p>

              <p style={{ marginBottom: "8px" }}>
                <strong>Status:</strong>{" "}
                <span style={{ textTransform: "capitalize" }}>{item.status}</span>
              </p>

              {item.recommendedExerciseId && (
                <p style={{ marginBottom: "8px" }}>
                  <strong>Recommended Exercise ID:</strong>{" "}
                  {item.recommendedExerciseId}
                </p>
              )}

              {item.createdAt && (
                <p style={{ color: "var(--text-soft)" }}>
                  <strong>Waktu:</strong>{" "}
                  {new Date(item.createdAt).toLocaleString("id-ID")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}