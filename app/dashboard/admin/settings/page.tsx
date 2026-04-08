import SectionTitle from "@/components/common/SectionTitle";

export default function AdminSettingsPage() {
  return (
    <div className="page-stack fade-in">
      <SectionTitle
        title="Pengaturan Sistem"
        subtitle="Konfigurasi dasar aplikasi e-learning dan fitur AI adaptif."
      />

      <div className="card-grid-2">
        <div className="dashboard-card neu-card">
          <h3>Theme Settings</h3>
          <p style={{ color: "var(--text-soft)", lineHeight: 1.8 }}>
            Gunakan tema neumorphism dengan aksen hijau tua untuk seluruh tampilan dashboard.
          </p>
          <div style={{ marginTop: 14 }}>
            <span className="neu-pill">Neumorphism Active</span>
          </div>
        </div>

        <div className="dashboard-card neu-card">
          <h3>AI Adaptive Mode</h3>
          <p style={{ color: "var(--text-soft)", lineHeight: 1.8 }}>
            Fitur rekomendasi latihan berdasarkan kesalahan pengguna akan dihubungkan ke backend pada tahap berikutnya.
          </p>
          <div style={{ marginTop: 14 }}>
            <span className="neu-pill">Mode: Draft Integration</span>
          </div>
        </div>

        <div className="dashboard-card neu-card">
          <h3>User Access Control</h3>
          <p style={{ color: "var(--text-soft)", lineHeight: 1.8 }}>
            Role utama saat ini terdiri dari admin, dosen, dan mahasiswa.
          </p>
          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span className="neu-pill">admin</span>
            <span className="neu-pill">dosen</span>
            <span className="neu-pill">mahasiswa</span>
          </div>
        </div>

        <div className="dashboard-card neu-card">
          <h3>Database Connection</h3>
          <p style={{ color: "var(--text-soft)", lineHeight: 1.8 }}>
            Tahap frontend sudah aktif. Integrasi MongoDB akan dilakukan setelah seluruh halaman utama selesai.
          </p>
          <div style={{ marginTop: 14 }}>
            <span className="neu-pill">Pending Backend</span>
          </div>
        </div>
      </div>
    </div>
  );
}