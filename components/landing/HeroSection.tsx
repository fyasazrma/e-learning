import Link from "next/link";
import {
  BookOpen,
  Brain,
  BarChart3,
  Target,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const stats = [
  { label: "Topik", value: "3+" },
  { label: "Level", value: "3" },
  { label: "Feedback", value: "AI" },
];

const cards = [
  {
    icon: <BookOpen size={22} />,
    title: "Materi Terstruktur",
    text: "Pelatihan Word, Excel, dan PowerPoint.",
  },
  {
    icon: <Brain size={22} />,
    title: "AI Feedback",
    text: "Feedback cepat berdasarkan kesalahan belajar.",
  },
  {
    icon: <BarChart3 size={22} />,
    title: "Progress Tracking",
    text: "Pantau skor, level, dan perkembangan latihan.",
  },
  {
    icon: <Target size={22} />,
    title: "Adaptive Exercise",
    text: "Latihan penguatan menyesuaikan performa pengguna.",
  },
];

export default function HeroSection() {
  return (
    <section className="hero-section" style={{ padding: "42px 0 34px" }}>
      <div className="page-container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.12fr 0.88fr",
            gap: 28,
            alignItems: "stretch",
          }}
        >
          <div
            className="neu-card slide-up"
            style={{
              padding: "34px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minHeight: 520,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, transparent), transparent 48%)",
                pointerEvents: "none",
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ marginBottom: 18 }}>
                <span className="neu-pill" style={{ padding: "10px 16px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Sparkles size={16} />
                    AI Adaptive Learning
                  </span>
                </span>
              </div>

              <h1
                style={{
                  fontSize: "clamp(2.5rem, 5vw, 4.2rem)",
                  lineHeight: 1.05,
                  fontWeight: 800,
                  marginBottom: 18,
                  maxWidth: 720,
                }}
              >
                Belajar Software Perkantoran Lebih
                <span className="text-accent"> Adaptif</span> dan Lebih
                Terarah
              </h1>

              <p
                style={{
                  fontSize: "1.03rem",
                  color: "var(--text-soft)",
                  lineHeight: 1.9,
                  maxWidth: 640,
                  marginBottom: 18,
                }}
              >
                Platform e-learning untuk Word, Excel, dan PowerPoint dengan
                materi, latihan, feedback singkat, progress belajar, dan
                rekomendasi latihan yang menyesuaikan kesalahan pengguna.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  marginBottom: 22,
                }}
              >
                <span className="neu-pill">3 Topik Utama</span>
                <span className="neu-pill">3 Level Latihan</span>
                <span className="neu-pill">Smart Feedback</span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 14,
                  flexWrap: "wrap",
                  marginBottom: 28,
                }}
              >
                <Link
                  href="/register"
                  className="neu-button"
                  style={{
                    padding: "14px 22px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    fontWeight: 700,
                  }}
                >
                  Mulai Sekarang
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="/login"
                  className="neu-button"
                  style={{
                    padding: "14px 22px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    fontWeight: 700,
                  }}
                >
                  Login
                </Link>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 14,
                  maxWidth: 560,
                }}
              >
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="neu-card"
                    style={{
                      padding: "16px 18px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "1.45rem",
                        fontWeight: 800,
                        color: "var(--accent)",
                        marginBottom: 4,
                      }}
                    >
                      {item.value}
                    </div>
                    <div
                      style={{
                        color: "var(--text-soft)",
                        fontSize: "0.93rem",
                        fontWeight: 600,
                      }}
                    >
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className="float-soft"
            style={{
              display: "grid",
              gap: 18,
              alignSelf: "stretch",
            }}
          >
            <div
              className="neu-card"
              style={{
                padding: 20,
                minHeight: 520,
                display: "grid",
                gridTemplateRows: "auto 1fr auto",
                gap: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: "1.1rem",
                      marginBottom: 6,
                    }}
                  >
                    Dashboard Preview
                  </div>
                  <p style={{ color: "var(--text-soft)", lineHeight: 1.7 }}>
                    Materi, latihan, feedback, dan progress dalam satu halaman.
                  </p>
                </div>
                <span className="neu-pill">Live Learning Flow</span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 14,
                }}
              >
                {cards.map((item) => (
                  <div
                    key={item.title}
                    className="neu-card"
                    style={{
                      padding: 18,
                      minHeight: 150,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      background:
                        "linear-gradient(145deg, var(--surface), var(--surface-soft))",
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 16,
                        display: "grid",
                        placeItems: "center",
                        background: "var(--surface-soft)",
                        boxShadow: "var(--shadow-inset)",
                        color: "var(--accent)",
                        marginBottom: 12,
                      }}
                    >
                      {item.icon}
                    </div>

                    <div>
                      <h3
                        style={{
                          fontSize: "1rem",
                          marginBottom: 8,
                          fontWeight: 700,
                        }}
                      >
                        {item.title}
                      </h3>
                      <p
                        style={{
                          color: "var(--text-soft)",
                          lineHeight: 1.75,
                          fontSize: "0.92rem",
                        }}
                      >
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="neu-card"
                style={{
                  padding: 18,
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 14,
                  alignItems: "center",
                }}
              >
                <div>
                  <h4 style={{ fontSize: "1rem", marginBottom: 6 }}>
                    Alur Belajar Adaptif
                  </h4>
                  <p style={{ color: "var(--text-soft)", lineHeight: 1.7 }}>
                    Sistem mendeteksi kesalahan, memberi tips singkat, lalu
                    memilih latihan berikutnya yang paling sesuai.
                  </p>
                </div>
                <span className="neu-pill">Smart Recommendation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}