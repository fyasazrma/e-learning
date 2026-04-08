"use client";

import Link from "next/link";

const topics = [
  {
    title: "Sheets",
    slug: "sheets",
    description: "Latihan spreadsheet seperti formula, range, dan chart.",
  },
  {
    title: "Docs",
    slug: "docs",
    description: "Latihan dokumen seperti formatting, table, dan mail merge.",
  },
  {
    title: "Slides",
    slug: "slides",
    description: "Latihan presentasi seperti layout, design, dan visual slide.",
  },
];

export default function MahasiswaExercisesPage() {
  return (
    <div className="page-stack fade-in">
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>Exercises</h2>
        <p style={{ color: "var(--text-soft)", lineHeight: 1.7 }}>
          Pilih topik latihan terlebih dahulu, lalu lanjut ke level latihan.
        </p>
      </div>

      <div className="card-grid-3">
        {topics.map((topic) => (
          <div key={topic.slug} className="dashboard-card neu-card">
            <h3 style={{ marginBottom: "10px" }}>{topic.title}</h3>
            <p
              style={{
                marginBottom: "16px",
                color: "var(--text-soft)",
                lineHeight: 1.7,
              }}
            >
              {topic.description}
            </p>

            <Link
              href={`/dashboard/mahasiswa/exercises/${topic.slug}`}
              className="neu-button"
            >
              Pilih Topik
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}