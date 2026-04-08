import SectionTitle from "@/components/common/SectionTitle";
import { dummyAdminAnalytics } from "@/data/dummyAdminAnalytics";

export default function AdminAnalyticsPage() {
  return (
    <div className="page-stack fade-in">
      <SectionTitle
        title="Analytics Sistem"
        subtitle="Ringkasan statistik utama dari platform e-learning."
      />

      <div className="analytics-grid">
        <div className="analytics-card neu-card">
          <strong>{dummyAdminAnalytics.totalUsers}</strong>
          <h3>Total Users</h3>
          <p>Jumlah semua akun yang terdaftar pada sistem.</p>
        </div>

        <div className="analytics-card neu-card">
          <strong>{dummyAdminAnalytics.totalTopics}</strong>
          <h3>Total Topics</h3>
          <p>Jumlah topik pembelajaran aktif dan draft.</p>
        </div>

        <div className="analytics-card neu-card">
          <strong>{dummyAdminAnalytics.totalMaterials}</strong>
          <h3>Total Materials</h3>
          <p>Total materi yang tersedia untuk pembelajaran.</p>
        </div>

        <div className="analytics-card neu-card">
          <strong>{dummyAdminAnalytics.totalExercises}</strong>
          <h3>Total Exercises</h3>
          <p>Total latihan yang tersedia untuk evaluasi adaptif.</p>
        </div>

        <div className="analytics-card neu-card">
          <strong>{dummyAdminAnalytics.activeStudents}</strong>
          <h3>Active Students</h3>
          <p>Jumlah mahasiswa aktif yang sedang belajar.</p>
        </div>

        <div className="analytics-card neu-card">
          <strong>{dummyAdminAnalytics.systemStatus}</strong>
          <h3>System Status</h3>
          <p>Status umum sistem pembelajaran saat ini.</p>
        </div>
      </div>
    </div>
  );
}