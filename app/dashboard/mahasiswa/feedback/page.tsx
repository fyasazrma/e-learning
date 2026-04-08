"use client";

import { useEffect, useMemo, useState } from "react";
import { getClientUser } from "@/lib/client-auth";

type FeedbackType = {
  _id: string;
  studentId?: string | null;
  exerciseAttemptId: string;
  feedbackText: string;
  tipText: string;
  errorType: string[];
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

export default function MahasiswaFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("today");

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const user = getClientUser();
        const res = await fetch("/api/feedbacks", {
          cache: "no-store",
        });
        const result = await res.json();

        if (result.success) {
          const filtered = (result.data || [])
            .filter(
              (item: FeedbackType) =>
                !user?.id || String(item.studentId) === String(user.id)
            )
            .sort((a: FeedbackType, b: FeedbackType) => {
              const dateA = new Date(a.createdAt || 0).getTime();
              const dateB = new Date(b.createdAt || 0).getTime();
              return dateB - dateA;
            });

          setFeedbacks(filtered);
        } else {
          setFeedbacks([]);
        }
      } catch (error) {
        console.error("FETCH_FEEDBACKS_ERROR:", error);
        setFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const filteredFeedbacks = useMemo(() => {
    if (filter === "today") {
      return feedbacks.filter((item) => isToday(item.createdAt));
    }

    if (filter === "yesterday") {
      return feedbacks.filter((item) => isYesterday(item.createdAt));
    }

    return feedbacks;
  }, [feedbacks, filter]);

  if (loading) {
    return <div className="dashboard-card neu-card">Loading feedback...</div>;
  }

  return (
    <div className="page-stack fade-in">
      <div className="dashboard-card neu-card">
        <h2 style={{ marginBottom: "12px" }}>Feedback Belajar</h2>
        <p style={{ color: "var(--text-soft)", lineHeight: 1.8 }}>
          Lihat feedback latihan berdasarkan waktu pengerjaan.
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

      {filteredFeedbacks.length === 0 ? (
        <div className="dashboard-card neu-card">
          <p style={{ color: "var(--text-soft)" }}>
            Tidak ada feedback untuk filter ini.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {filteredFeedbacks.map((item) => (
            <div key={item._id} className="dashboard-card neu-card">
              <h3 style={{ marginBottom: "10px" }}>Feedback Latihan</h3>

              <p style={{ marginBottom: "10px", lineHeight: 1.8 }}>
                {item.feedbackText}
              </p>

              <p
                style={{
                  marginBottom: "10px",
                  color: "var(--accent)",
                  fontWeight: 700,
                }}
              >
                Tip: {item.tipText}
              </p>

              <p style={{ marginBottom: "10px" }}>
                <strong>Error Type:</strong>{" "}
                {item.errorType?.length ? item.errorType.join(", ") : "Tidak ada"}
              </p>

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