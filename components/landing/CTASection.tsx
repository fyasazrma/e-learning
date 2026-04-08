import Link from "next/link";
import RevealOnScroll from "@/components/common/RevealOnScroll";

export default function CTASection() {
  return (
    <section className="section-space cta-section-wrap">
      <div className="page-container">
        <RevealOnScroll>
          <div className="cta-upgrade-card neu-card">
            <div className="cta-upgrade-content">
              <span className="neu-pill cta-badge">Mulai Sekarang</span>

              <h2 className="cta-upgrade-title">
                Tingkatkan Kemampuan Software Perkantoran dengan
                <span className="text-accent"> Pembelajaran Adaptif</span>
              </h2>

              <p className="cta-upgrade-text">
                Belajar Word, Excel, dan PowerPoint dengan sistem latihan yang
                menyesuaikan kebutuhanmu, memberi feedback spesifik, dan membantu
                meningkatkan hasil belajar secara bertahap.
              </p>

              <div className="cta-upgrade-actions">
                <Link href="/register" className="neu-button cta-btn-primary">
                  Daftar Sekarang
                </Link>
                <Link href="/login" className="neu-button cta-btn-secondary">
                  Masuk ke Sistem
                </Link>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}