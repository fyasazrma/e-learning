import { BrainCircuit, BarChart3, MessageSquareMore } from "lucide-react";

export default function FeaturesSection() {
  const items = [
    {
      icon: <BrainCircuit size={26} />,
      title: "AI Adaptive Learning",
      text: "Sistem memilih latihan penguatan berdasarkan jenis kesalahan mahasiswa agar proses belajar lebih terarah.",
    },
    {
      icon: <BarChart3 size={26} />,
      title: "Learning Analytics",
      text: "Pantau progres belajar, level latihan, skor rata-rata, dan perkembangan hasil secara bertahap.",
    },
    {
      icon: <MessageSquareMore size={26} />,
      title: "Smart Feedback",
      text: "Feedback diberikan secara singkat, spesifik, dan langsung sesuai error yang terdeteksi saat latihan.",
    },
  ];

  return (
    <section className="section-space">
      <div className="page-container">
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h2 className="section-title">Fitur Utama</h2>
          <p className="section-subtitle">
            Pembelajaran digital yang fokus pada latihan, evaluasi, dan
            perbaikan bertahap dengan bantuan AI adaptif.
          </p>
        </div>

        <div
          className="features-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 22,
          }}
        >
          {items.map((item) => (
            <div
              key={item.title}
              className="feature-card neu-card slide-up"
              style={{
                padding: 26,
                textAlign: "left",
                position: "relative",
                overflow: "hidden",
                minHeight: 260,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, color-mix(in srgb, var(--accent) 8%, transparent), transparent 45%)",
                  pointerEvents: "none",
                }}
              />

              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  className="feature-icon"
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 18,
                    display: "grid",
                    placeItems: "center",
                    marginBottom: 16,
                    color: "var(--accent)",
                    background: "var(--surface-soft)",
                    boxShadow: "var(--shadow-inset)",
                  }}
                >
                  {item.icon}
                </div>

                <h3
                  className="feature-title"
                  style={{
                    fontSize: "1.15rem",
                    marginBottom: 12,
                    fontWeight: 800,
                  }}
                >
                  {item.title}
                </h3>

                <p
                  className="feature-text"
                  style={{
                    color: "var(--text-soft)",
                    lineHeight: 1.85,
                  }}
                >
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}