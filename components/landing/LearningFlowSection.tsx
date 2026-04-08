import {
  BookText,
  PencilRuler,
  AlertCircle,
  Lightbulb,
  TrendingUp,
} from "lucide-react";

export default function LearningFlowSection() {
  const steps = [
    {
      icon: <BookText size={22} />,
      title: "Pelajari Materi",
      text: "Mahasiswa memulai dari topik Word, Excel, atau PowerPoint yang telah disusun secara terstruktur.",
    },
    {
      icon: <PencilRuler size={22} />,
      title: "Kerjakan Latihan",
      text: "Setiap topik memiliki level easy, medium, dan hard dengan alur pengerjaan bertahap.",
    },
    {
      icon: <AlertCircle size={22} />,
      title: "Deteksi Kesalahan",
      text: "Sistem membaca jawaban dan mengenali kesalahan utama berdasarkan aturan adaptive learning.",
    },
    {
      icon: <Lightbulb size={22} />,
      title: "Dapat Feedback",
      text: "Pengguna menerima feedback singkat, tips spesifik, dan rekomendasi latihan penguatan.",
    },
    {
      icon: <TrendingUp size={22} />,
      title: "Naikkan Progress",
      text: "Progress belajar, level, dan skor diperbarui agar pembelajaran menjadi lebih terarah dari waktu ke waktu.",
    },
  ];

  return (
    <section className="section-space">
      <div className="page-container">
        <div
          className="neu-card"
          style={{
            padding: "34px 28px",
          }}
        >
          <h2 className="section-title">Alur Belajar Adaptif</h2>
          <p className="section-subtitle">
            Sistem dirancang untuk membimbing pengguna dari materi, latihan,
            evaluasi, sampai rekomendasi latihan berikutnya secara otomatis.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
              gap: 16,
            }}
          >
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="neu-card slide-up"
                style={{
                  padding: 20,
                  textAlign: "left",
                  minHeight: 220,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 15,
                      display: "grid",
                      placeItems: "center",
                      color: "var(--accent)",
                      background: "var(--surface-soft)",
                      boxShadow: "var(--shadow-inset)",
                    }}
                  >
                    {step.icon}
                  </div>

                  <span className="neu-pill" style={{ minWidth: 44 }}>
                    0{index + 1}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 800,
                    marginTop: 2,
                  }}
                >
                  {step.title}
                </h3>

                <p
                  style={{
                    color: "var(--text-soft)",
                    lineHeight: 1.8,
                    fontSize: "0.93rem",
                  }}
                >
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}