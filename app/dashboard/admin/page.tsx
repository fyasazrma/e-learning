"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  ShieldCheck,
  BookOpen,
  FileText,
  ClipboardList,
  BarChart3,
  ArrowRight,
  Settings,
} from "lucide-react";

type UserType = {
  _id: string;
  fullName?: string;
  email?: string;
  role?: "admin" | "dosen" | "mahasiswa";
};

type TopicType = {
  _id: string;
  title: string;
  slug: string;
};

type MaterialType = {
  _id: string;
  title: string;
  description?: string;
};

type ExerciseType = {
  _id: string;
  title: string;
  level: "easy" | "medium" | "hard";
};

function StatCard({
  icon,
  value,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  value: string | number;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="dashboard-card neu-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              color: "var(--accent)",
              marginBottom: 6,
            }}
          >
            {value}
          </div>
          <h3 style={{ marginBottom: 6 }}>{title}</h3>
          <p style={{ color: "var(--text-soft)", lineHeight: 1.7 }}>{subtitle}</p>
        </div>

        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 18,
            display: "grid",
            placeItems: "center",
            background: "var(--surface)",
            boxShadow: "var(--shadow-inset)",
            color: "var(--accent)",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function SectionPanel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-card neu-card">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            display: "grid",
            placeItems: "center",
            background: "var(--surface)",
            boxShadow: "var(--shadow-inset)",
            color: "var(--accent)",
          }}
        >
          {icon}
        </div>
        <h3>{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [topics, setTopics] = useState<TopicType[]>([]);
  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [exercises, setExercises] = useState<ExerciseType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [usersRes, topicsRes, materialsRes, exercisesRes] = await Promise.all([
          fetch("/api/users", { cache: "no-store" }),
          fetch("/api/topics", { cache: "no-store" }),
          fetch("/api/materials", { cache: "no-store" }),
          fetch("/api/exercises", { cache: "no-store" }),
        ]);

        const [usersJson, topicsJson, materialsJson, exercisesJson] =
          await Promise.all([
            usersRes.json(),
            topicsRes.json(),
            materialsRes.json(),
            exercisesRes.json(),
          ]);

        if (usersJson.success) setUsers(usersJson.data || []);
        if (topicsJson.success) setTopics(topicsJson.data || []);
        if (materialsJson.success) setMaterials(materialsJson.data || []);
        if (exercisesJson.success) setExercises(exercisesJson.data || []);
      } catch (error) {
        console.error("FETCH_ADMIN_DASHBOARD_ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalAdmin = useMemo(
    () => users.filter((user) => user.role === "admin").length,
    [users]
  );
  const totalDosen = useMemo(
    () => users.filter((user) => user.role === "dosen").length,
    [users]
  );
  const totalMahasiswa = useMemo(
    () => users.filter((user) => user.role === "mahasiswa").length,
    [users]
  );

  const easyCount = useMemo(
    () => exercises.filter((item) => item.level === "easy").length,
    [exercises]
  );
  const mediumCount = useMemo(
    () => exercises.filter((item) => item.level === "medium").length,
    [exercises]
  );
  const hardCount = useMemo(
    () => exercises.filter((item) => item.level === "hard").length,
    [exercises]
  );

  const latestUser = users[0];
  const latestTopic = topics[0];
  const latestMaterial = materials[0];
  const latestExercise = exercises[0];

  if (loading) {
    return <div className="dashboard-card neu-card">Loading dashboard admin...</div>;
  }

  return (
    <div className="page-stack fade-in">
      <div
        className="dashboard-card neu-card"
        style={{
          padding: 28,
          background:
            "linear-gradient(135deg, rgba(90,120,255,.10), rgba(90,120,255,.03))",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ flex: 1, minWidth: 280 }}>
            <div className="neu-pill" style={{ marginBottom: 14 }}>
              System Admin Dashboard
            </div>
            <h2 style={{ marginBottom: 10 }}>Dashboard Admin</h2>
            <p style={{ color: "var(--text-soft)", lineHeight: 1.8, marginBottom: 18 }}>
              Kelola struktur sistem, pengguna, topik, materi, dan latihan untuk
              memastikan platform adaptive learning berjalan stabil.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/dashboard/admin/users" className="neu-button">
                Kelola Users
              </Link>
              <Link href="/dashboard/admin/topics" className="neu-button">
                Kelola Topics
              </Link>
            </div>
          </div>

          <div
            style={{
              minWidth: 240,
              maxWidth: 280,
              width: "100%",
              padding: 20,
              borderRadius: 24,
              background: "var(--surface)",
              boxShadow: "var(--shadow-inset)",
            }}
          >
            <div style={{ marginBottom: 10, color: "var(--text-soft)" }}>
              Status Sistem
            </div>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                color: "var(--accent)",
                marginBottom: 8,
              }}
            >
              Aktif
            </div>
            <p style={{ color: "var(--text-soft)", lineHeight: 1.7 }}>
              Data inti sistem tersedia dan siap dipakai untuk pengelolaan admin.
            </p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <StatCard
          icon={<Users size={20} />}
          value={users.length}
          title="Total Users"
          subtitle="Jumlah seluruh pengguna dalam sistem."
        />

        <StatCard
          icon={<BookOpen size={20} />}
          value={topics.length}
          title="Total Topics"
          subtitle="Jumlah topik pembelajaran aktif."
        />

        <StatCard
          icon={<ClipboardList size={20} />}
          value={exercises.length}
          title="Total Exercises"
          subtitle="Jumlah latihan yang tersedia untuk adaptive learning."
        />
      </div>

      <div className="dashboard-grid">
        <StatCard
          icon={<ShieldCheck size={20} />}
          value={totalAdmin}
          title="Admin"
          subtitle="Jumlah akun admin dalam sistem."
        />

        <StatCard
          icon={<FileText size={20} />}
          value={materials.length}
          title="Total Materials"
          subtitle="Jumlah materi pembelajaran aktif."
        />

        <StatCard
          icon={<GraduationCap size={20} />}
          value={totalMahasiswa}
          title="Mahasiswa"
          subtitle="Jumlah akun mahasiswa yang terdaftar."
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
        }}
      >
        <SectionPanel title="Distribusi Role" icon={<Users size={20} />}>
          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "var(--surface)",
                boxShadow: "var(--shadow-inset)",
              }}
            >
              <strong>Admin:</strong> {totalAdmin}
            </div>
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "var(--surface)",
                boxShadow: "var(--shadow-inset)",
              }}
            >
              <strong>Dosen:</strong> {totalDosen}
            </div>
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "var(--surface)",
                boxShadow: "var(--shadow-inset)",
              }}
            >
              <strong>Mahasiswa:</strong> {totalMahasiswa}
            </div>
          </div>
        </SectionPanel>

        <SectionPanel title="Distribusi Level Exercises" icon={<BarChart3 size={20} />}>
          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "var(--surface)",
                boxShadow: "var(--shadow-inset)",
              }}
            >
              <strong>Easy:</strong> {easyCount}
            </div>
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "var(--surface)",
                boxShadow: "var(--shadow-inset)",
              }}
            >
              <strong>Medium:</strong> {mediumCount}
            </div>
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "var(--surface)",
                boxShadow: "var(--shadow-inset)",
              }}
            >
              <strong>Hard:</strong> {hardCount}
            </div>
          </div>
        </SectionPanel>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 20,
        }}
      >
        <SectionPanel title="User Terbaru" icon={<Users size={20} />}>
          {latestUser ? (
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "var(--surface)",
                boxShadow: "var(--shadow-inset)",
              }}
            >
              <h4 style={{ marginBottom: 8 }}>{latestUser.fullName || "-"}</h4>
              <p style={{ color: "var(--text-soft)", marginBottom: 6 }}>
                {latestUser.email || "-"}
              </p>
              <p style={{ color: "var(--accent)", textTransform: "capitalize" }}>
                {latestUser.role || "-"}
              </p>
            </div>
          ) : (
            <p style={{ color: "var(--text-soft)" }}>Belum ada user.</p>
          )}
        </SectionPanel>

        <SectionPanel title="Topik Terbaru" icon={<BookOpen size={20} />}>
          {latestTopic ? (
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "var(--surface)",
                boxShadow: "var(--shadow-inset)",
              }}
            >
              <h4 style={{ marginBottom: 8 }}>{latestTopic.title}</h4>
              <p style={{ color: "var(--text-soft)" }}>Slug: {latestTopic.slug}</p>
            </div>
          ) : (
            <p style={{ color: "var(--text-soft)" }}>Belum ada topic.</p>
          )}
        </SectionPanel>

        <SectionPanel title="Materi Terbaru" icon={<FileText size={20} />}>
          {latestMaterial ? (
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "var(--surface)",
                boxShadow: "var(--shadow-inset)",
              }}
            >
              <h4 style={{ marginBottom: 8 }}>{latestMaterial.title}</h4>
              <p style={{ color: "var(--text-soft)", lineHeight: 1.7 }}>
                {latestMaterial.description || "Belum ada deskripsi."}
              </p>
            </div>
          ) : (
            <p style={{ color: "var(--text-soft)" }}>Belum ada materi.</p>
          )}
        </SectionPanel>

        <SectionPanel title="Latihan Terbaru" icon={<ClipboardList size={20} />}>
          {latestExercise ? (
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "var(--surface)",
                boxShadow: "var(--shadow-inset)",
              }}
            >
              <h4 style={{ marginBottom: 8 }}>{latestExercise.title}</h4>
              <p style={{ color: "var(--text-soft)" }}>
                Level:{" "}
                <strong style={{ color: "var(--accent)", textTransform: "capitalize" }}>
                  {latestExercise.level}
                </strong>
              </p>
            </div>
          ) : (
            <p style={{ color: "var(--text-soft)" }}>Belum ada latihan.</p>
          )}
        </SectionPanel>
      </div>

      <SectionPanel title="Akses Cepat" icon={<ArrowRight size={20} />}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 14,
          }}
        >
          <Link href="/dashboard/admin/users" className="neu-button">
            Users
          </Link>
          <Link href="/dashboard/admin/topics" className="neu-button">
            Topics
          </Link>
          <Link href="/dashboard/admin/materials" className="neu-button">
            Materials
          </Link>
          <Link href="/dashboard/admin/exercises" className="neu-button">
            Exercises
          </Link>
          <Link href="/dashboard/admin/analytics" className="neu-button">
            Analytics
          </Link>
          <Link href="/dashboard/admin/settings" className="neu-button">
            <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
              <Settings size={18} />
              Settings
            </span>
          </Link>
        </div>
      </SectionPanel>
    </div>
  );
}