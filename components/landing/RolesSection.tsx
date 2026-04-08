import { GraduationCap, UserCog, ShieldCheck } from "lucide-react";
import RevealOnScroll from "@/components/common/RevealOnScroll";

export default function RolesSection() {
  const roles = [
    {
      icon: <GraduationCap size={24} />,
      title: "Mahasiswa",
      text: "Akses materi, latihan, feedback, progress, dan rekomendasi belajar adaptif untuk meningkatkan kemampuan software perkantoran.",
    },
    {
      icon: <UserCog size={24} />,
      title: "Dosen",
      text: "Kelola materi, latihan, quiz, mahasiswa, dan analytics sederhana untuk mendukung proses belajar secara lebih terstruktur.",
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "Admin",
      text: "Kelola user, topik, materi, latihan, quiz, dan pengaturan sistem secara terpusat agar platform tetap rapi dan terkontrol.",
    },
  ];

  return (
    <section className="section-space roles-section-upgrade">
      <div className="page-container">
        <RevealOnScroll>
          <div className="roles-heading">
            <span className="neu-pill roles-badge">Role Based Platform</span>
            <h2 className="section-title">Untuk Siapa?</h2>
            <p className="section-subtitle roles-subtitle">
              Platform ini dirancang untuk mendukung pembelajaran terstruktur
              dari sisi mahasiswa, dosen, dan admin dalam satu ekosistem digital.
            </p>
          </div>
        </RevealOnScroll>

        <div className="roles-grid-upgrade">
          {roles.map((item, index) => (
            <RevealOnScroll key={item.title} delay={index * 140}>
              <div className="role-card-upgrade neu-card">
                <div className="role-card-top">
                  <div className="role-icon-upgrade">{item.icon}</div>
                  <span className="role-number">0{index + 1}</span>
                </div>

                <h3 className="role-title-upgrade">{item.title}</h3>
                <p className="role-text-upgrade">{item.text}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}