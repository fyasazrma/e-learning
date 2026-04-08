"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  ClipboardList,
  BarChart3,
  Settings,
  GraduationCap,
  MessageSquareMore,
  LogOut,
  Sparkles,
} from "lucide-react";
import { clearClientAuth, ClientUser } from "@/lib/client-auth";

export default function Sidebar({ user }: { user: ClientUser | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const role = user?.role || "mahasiswa";

  const adminMenu = [
    {
      label: "Dashboard",
      href: "/dashboard/admin",
      icon: <LayoutDashboard size={18} />,
    },
    {
      label: "Users",
      href: "/dashboard/admin/users",
      icon: <Users size={18} />,
    },
    {
      label: "Topics",
      href: "/dashboard/admin/topics",
      icon: <BookOpen size={18} />,
    },
    {
      label: "Materials",
      href: "/dashboard/admin/materials",
      icon: <FileText size={18} />,
    },
    {
      label: "Exercises",
      href: "/dashboard/admin/exercises",
      icon: <ClipboardList size={18} />,
    },
    {
      label: "Analytics",
      href: "/dashboard/admin/analytics",
      icon: <BarChart3 size={18} />,
    },
    {
      label: "Settings",
      href: "/dashboard/admin/settings",
      icon: <Settings size={18} />,
    },
  ];

  const dosenMenu = [
    {
      label: "Dashboard",
      href: "/dashboard/dosen",
      icon: <LayoutDashboard size={18} />,
    },
    {
      label: "Materials",
      href: "/dashboard/dosen/materials",
      icon: <FileText size={18} />,
    },
    {
      label: "Exercises",
      href: "/dashboard/dosen/exercises",
      icon: <ClipboardList size={18} />,
    },
    {
      label: "Students",
      href: "/dashboard/dosen/students",
      icon: <GraduationCap size={18} />,
    },
    {
      label: "Analytics",
      href: "/dashboard/dosen/analytics",
      icon: <BarChart3 size={18} />,
    },
    {
      label: "Feedback",
      href: "/dashboard/dosen/feedback",
      icon: <MessageSquareMore size={18} />,
    },
  ];

  const mahasiswaMenu = [
    {
      label: "Dashboard",
      href: "/dashboard/mahasiswa",
      icon: <LayoutDashboard size={18} />,
    },
    {
      label: "Materials",
      href: "/dashboard/mahasiswa/materials",
      icon: <FileText size={18} />,
    },
    {
      label: "Exercises",
      href: "/dashboard/mahasiswa/exercises",
      icon: <ClipboardList size={18} />,
    },
    {
      label: "Progress",
      href: "/dashboard/mahasiswa/progress",
      icon: <BarChart3 size={18} />,
    },
    {
      label: "Feedback",
      href: "/dashboard/mahasiswa/feedback",
      icon: <MessageSquareMore size={18} />,
    },
    {
      label: "Recommendations",
      href: "/dashboard/mahasiswa/recommendations",
      icon: <Sparkles size={18} />,
    },
  ];

  const menu =
    role === "admin" ? adminMenu : role === "dosen" ? dosenMenu : mahasiswaMenu;

  const handleLogout = () => {
    clearClientAuth();
    router.push("/login");
  };

  return (
    <aside className="sidebar neu-card slide-up">
      <div className="sidebar-brand">
        <div className="neu-pill">AI Learning</div>
        <h2>Adaptive LMS</h2>
        <p>Smart office software training</p>
      </div>

      <nav className="sidebar-menu">
        {menu.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-item ${active ? "active" : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-profile neu-soft">
          <div className="sidebar-profile-name">
            {user?.fullName || "Guest User"}
          </div>
          <div
            className="sidebar-profile-role"
            style={{ textTransform: "capitalize" }}
          >
            {role}
          </div>
        </div>

        <button className="neu-button logout-button" onClick={handleLogout}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <LogOut size={18} />
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}