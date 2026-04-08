"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import FloatingAiTutor from "@/components/chatbot/FloatingAiTutor";

import {
  clearClientAuth,
  getClientToken,
  getClientUser,
  ClientUser,
} from "@/lib/client-auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getClientToken();
    const currentUser = getClientUser();

    if (!token || !currentUser || !currentUser.role) {
      clearClientAuth();
      router.replace("/login");
      return;
    }

    const role = currentUser.role;

    const isAdminRoute = pathname.startsWith("/dashboard/admin");
    const isDosenRoute = pathname.startsWith("/dashboard/dosen");
    const isMahasiswaRoute = pathname.startsWith("/dashboard/mahasiswa");

    if (isAdminRoute && role !== "admin") {
      router.replace(`/dashboard/${role}`);
      return;
    }

    if (isDosenRoute && role !== "dosen") {
      router.replace(`/dashboard/${role}`);
      return;
    }

    if (isMahasiswaRoute && role !== "mahasiswa") {
      router.replace(`/dashboard/${role}`);
      return;
    }

    setUser(currentUser);
    setLoading(false);
  }, [pathname, router]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
        }}
      >
        <div className="neu-card" style={{ padding: "24px 32px" }}>
          Memuat dashboard...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="dashboard-layout fade-in">
      <Sidebar user={user} />
      <main className="dashboard-main">
        <Topbar user={user} />
        {children}
      </main>

      <FloatingAiTutor />
    </div>
  );
}