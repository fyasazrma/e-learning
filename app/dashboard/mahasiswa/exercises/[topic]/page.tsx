"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

const levels = [
  {
    title: "Easy",
    slug: "easy",
    description: "Latihan dasar untuk membangun pemahaman awal.",
  },
  {
    title: "Medium",
    slug: "medium",
    description: "Latihan menengah untuk memperkuat ketelitian dan langkah kerja.",
  },
  {
    title: "Hard",
    slug: "hard",
    description: "Latihan lanjutan untuk menguji stabilitas kemampuan.",
  },
];

export default function TopicLevelsPage() {
  const params = useParams();
  const topic = params.topic as string;

  const topicTitle =
    topic === "sheets" ? "Sheets" : topic === "docs" ? "Docs" : "Slides";

  return (
    <div className="page-stack fade-in">
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>
          {topicTitle} Levels
        </h2>
        <p style={{ color: "var(--text-soft)", lineHeight: 1.7 }}>
          Pilih level latihan yang ingin dikerjakan.
        </p>
      </div>

      <div className="card-grid-3">
        {levels.map((level) => (
          <div key={level.slug} className="dashboard-card neu-card">
            <h3 style={{ marginBottom: "10px" }}>{level.title}</h3>
            <p
              style={{
                marginBottom: "16px",
                color: "var(--text-soft)",
                lineHeight: 1.7,
              }}
            >
              {level.description}
            </p>

            <Link
              href={`/dashboard/mahasiswa/exercises/${topic}/${level.slug}`}
              className="neu-button"
            >
              Mulai Level
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}