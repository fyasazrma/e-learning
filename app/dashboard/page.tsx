export default function MahasiswaDashboardPage() {
  return (
    <div className="dashboard-grid fade-in">
      <div className="dashboard-card neu-card">
        <div className="dashboard-number">6</div>
        <h3>Materi Dipelajari</h3>
        <p>Lanjutkan pembelajaran materi software perkantoran sesuai topik.</p>
      </div>

      <div className="dashboard-card neu-card">
        <div className="dashboard-number">70</div>
        <h3>Rata-rata Skor</h3>
        <p>Skor belajar meningkat setelah mendapat feedback dan latihan adaptif.</p>
      </div>

      <div className="dashboard-card neu-card">
        <div className="dashboard-number">Easy</div>
        <h3>Level Saat Ini</h3>
        <p>Sistem akan menaikkan level ketika performa latihan mulai stabil.</p>
      </div>
    </div>
  );
}