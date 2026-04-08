"use client";

import { useEffect, useMemo, useState } from "react";
import SectionTitle from "@/components/common/SectionTitle";

type FeedbackType = {
  _id: string;
  studentId?: string | null;
  feedbackText: string;
  tipText: string;
  errorType: string[];
  createdAt?: string;
};

type UserType = {
  _id: string;
  fullName?: string;
  role?: string;
};

export default function DosenFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const [feedbacksRes, usersRes] = await Promise.all([
          fetch("/api/feedbacks", { cache: "no-store" }),
          fetch("/api/users", { cache: "no-store" }),
        ]);

        const [feedbacksJson, usersJson] = await Promise.all([
          feedbacksRes.json(),
          usersRes.json(),
        ]);

        if (feedbacksJson.success) {
          setFeedbacks(feedbacksJson.data || []);
        }

        if (usersJson.success) {
          setUsers(usersJson.data || []);
        }
      } catch (error) {
        console.error("FETCH_DOSEN_FEEDBACKS_ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const feedbackCards = useMemo(() => {
    return feedbacks.map((item) => {
      const student = users.find(
        (user) => String(user._id) === String(item.studentId)
      );

      return {
        ...item,
        studentName: student?.fullName || "Mahasiswa",
      };
    });
  }, [feedbacks, users]);

  return (
    <div className="page-stack fade-in">
      <SectionTitle
        title="Feedback Mahasiswa"
        subtitle="Lihat ringkasan feedback dan tips yang diberikan sistem kepada mahasiswa."
      />

      {loading ? (
        <div className="dashboard-card neu-card">Loading feedback...</div>
      ) : feedbackCards.length === 0 ? (
        <div className="dashboard-card neu-card">
          <p style={{ color: "var(--text-soft)" }}>Belum ada feedback mahasiswa.</p>
        </div>
      ) : (
        <div className="info-list">
          {feedbackCards.map((item) => (
            <div key={item._id} className="info-row-card neu-card">
              <div className="info-row-left">
                <h3>{item.studentName}</h3>
                <p style={{ marginTop: 8 }}>{item.feedbackText}</p>
                <p style={{ marginTop: 8, color: "var(--text-soft)" }}>
                  Error: {item.errorType?.length ? item.errorType.join(", ") : "Tidak ada"}
                </p>
              </div>

              <div className="info-row-meta">
                <span className="neu-pill">{item.tipText}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}