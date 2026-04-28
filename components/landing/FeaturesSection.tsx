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
        <div className="features-heading">
          <h2 className="section-title">Fitur Utama</h2>
          <p className="section-subtitle">
            Pembelajaran digital yang fokus pada latihan, evaluasi, dan
            perbaikan bertahap dengan bantuan AI adaptif.
          </p>
        </div>

        <div className="features-grid">
          {items.map((item) => (
            <div key={item.title} className="feature-card neu-card slide-up">
              <div className="feature-bg-layer" />

              <div className="feature-inner">
                <div className="feature-icon">{item.icon}</div>

                <h3 className="feature-title">{item.title}</h3>

                <p className="feature-text">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}