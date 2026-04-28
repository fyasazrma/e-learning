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
    <section className="hero-section">
      <div className="page-container">
        <div className="hero-wrapper">
          <div className="hero-content neu-card slide-up">
            <div className="hero-bg-layer" />

            <div className="hero-inner">
              <div className="hero-badge">
                <span className="neu-pill">
                  <span className="hero-badge-inner">
                    <Sparkles size={16} />
                    AI Adaptive Learning
                  </span>
                </span>
              </div>

              <h1 className="hero-title">
                Belajar Software Perkantoran Lebih
                <span className="text-accent"> Adaptif</span> dan Lebih Terarah
              </h1>

              <p className="hero-desc">
                Platform e-learning untuk Word, Excel, dan PowerPoint dengan
                materi, latihan, feedback singkat, progress belajar, dan
                rekomendasi latihan yang menyesuaikan kesalahan pengguna.
              </p>

              <div className="hero-tags">
                <span className="neu-pill">3 Topik Utama</span>
                <span className="neu-pill">3 Level Latihan</span>
                <span className="neu-pill">Smart Feedback</span>
              </div>

              <div className="hero-actions">
                <Link href="/register" className="neu-button hero-button">
                  Mulai Sekarang
                  <ArrowRight size={18} />
                </Link>

                <Link href="/login" className="neu-button hero-button">
                  Login
                </Link>
              </div>

              <div className="hero-stats">
                {stats.map((item) => (
                  <div key={item.label} className="hero-stat-card neu-card">
                    <div className="hero-stat-value">{item.value}</div>
                    <div className="hero-stat-label">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="hero-preview-wrap float-soft">
            <div className="hero-preview-card neu-card">
              <div className="hero-preview-head">
                <div>
                  <div className="hero-preview-title">Dashboard Preview</div>
                  <p>
                    Materi, latihan, feedback, dan progress dalam satu halaman.
                  </p>
                </div>
                <span className="neu-pill">Live Learning Flow</span>
              </div>

              <div className="hero-preview-grid">
                {cards.map((item) => (
                  <div key={item.title} className="hero-feature-card neu-card">
                    <div className="hero-feature-icon">{item.icon}</div>

                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hero-flow-card neu-card">
                <div>
                  <h4>Alur Belajar Adaptif</h4>
                  <p>
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