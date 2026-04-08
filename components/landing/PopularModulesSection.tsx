import { BookOpen, BarChart3, Presentation } from "lucide-react";

export default function PopularModulesSection() {
  const modules = [
    {
      icon: <BookOpen size={22} />,
      title: "Word Fundamentals",
      desc: "Pelajari formatting, layout dokumen, dan penyusunan dokumen profesional.",
      level: "Beginner",
      topic: "Docs",
    },
    {
      icon: <BarChart3 size={22} />,
      title: "Excel Formula Practice",
      desc: "Latihan formula dasar, range, fungsi, dan analisis data secara bertahap.",
      level: "Intermediate",
      topic: "Sheets",
    },
    {
      icon: <Presentation size={22} />,
      title: "PowerPoint Presentation",
      desc: "Bangun slide yang rapi, komunikatif, dan lebih menarik untuk presentasi.",
      level: "Beginner",
      topic: "Slides",
    },
  ];

  return (
    <section className="section-space">
      <div className="page-container">
        <h2 className="section-title">Topik Belajar Populer</h2>
        <p className="section-subtitle">
          Fokus pada tiga aplikasi perkantoran utama dengan materi, latihan,
          dan evaluasi yang disusun bertahap.
        </p>

        <div className="popular-grid">
          {modules.map((item) => (
            <div key={item.title} className="popular-card neu-card slide-up">
              <div className="popular-card-top">
                <div className="popular-icon">{item.icon}</div>
                <span className="neu-pill">{item.topic}</span>
              </div>

              <h3 className="popular-title">{item.title}</h3>
              <p className="popular-desc">{item.desc}</p>

              <div className="popular-meta">
                <span className="popular-meta-item">Level: {item.level}</span>
                <span className="popular-meta-item">Adaptive Practice</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}