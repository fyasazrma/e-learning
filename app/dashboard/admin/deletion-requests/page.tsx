"use client";

import { useEffect, useState } from "react";
import SectionTitle from "@/components/common/SectionTitle";
import { getClientUser } from "@/lib/client-auth";

type DeletionRequestType = {
  _id: string;
  itemType: "material" | "exercise";
  itemTitle?: string;
  reason?: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
};

export default function AdminDeletionRequestsPage() {
  const user = getClientUser();
  const [requests, setRequests] = useState<DeletionRequestType[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/deletion-requests?status=pending", {
        cache: "no-store",
      });
      const result = await res.json();

      if (result.success) {
        setRequests(result.data || []);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error("FETCH_DELETION_REQUESTS_ERROR:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleReview = async (
    id: string,
    status: "approved" | "rejected"
  ) => {
    const adminNote =
      window.prompt(
        status === "approved"
          ? "Catatan admin (opsional) saat menyetujui:"
          : "Catatan admin (opsional) saat menolak:",
        ""
      ) || "";

    try {
      setProcessingId(id);

      const res = await fetch(`/api/deletion-requests/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          reviewedBy: user?.id || null,
          adminNote,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Gagal memproses request");
      }

      alert(result.message);
      fetchRequests();
    } catch (error) {
      console.error("REVIEW_DELETION_REQUEST_ERROR:", error);
      alert("Gagal memproses request.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="page-stack fade-in">
      <SectionTitle
        title="Approval Penghapusan"
        subtitle="Admin meninjau request hapus materi dan exercise dari dosen."
      />

      {loading ? (
        <div className="dashboard-card neu-card">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="dashboard-card neu-card">
          <p style={{ color: "var(--text-soft)" }}>
            Tidak ada request penghapusan yang pending.
          </p>
        </div>
      ) : (
        <div className="info-list">
          {requests.map((item) => (
            <div key={item._id} className="info-row-card neu-card">
              <div className="info-row-left">
                <h3>{item.itemTitle || "-"}</h3>
                <p>
                  Tipe: {item.itemType} • Alasan: {item.reason || "-"}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <span className="neu-pill">{item.status}</span>

                <button
                  className="neu-button"
                  onClick={() => handleReview(item._id, "approved")}
                  disabled={processingId === item._id}
                >
                  Approve
                </button>

                <button
                  className="neu-button"
                  onClick={() => handleReview(item._id, "rejected")}
                  disabled={processingId === item._id}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}