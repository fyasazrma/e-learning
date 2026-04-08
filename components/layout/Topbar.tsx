"use client";

import { ClientUser } from "@/lib/client-auth";
import ThemeToggle from "@/components/common/ThemeToggle";

export default function Topbar({ user }: { user: ClientUser | null }) {
  const name = user?.fullName || "Guest User";
  const role = user?.role || "mahasiswa";

  return (
    <div className="dashboard-topbar neu-card slide-up">
      <div className="topbar-title">
        <h1>Dashboard</h1>
        <p>Selamat datang kembali di AI Adaptive Learning</p>
      </div>
      
      <div
        className="topbar-profile"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <ThemeToggle />

        {/* PROFILE */}
        <div className="profile-avatar">{name.charAt(0)}</div>
        <div className="profile-info">
          <strong>{name}</strong>
          <span style={{ textTransform: "capitalize" }}>{role}</span>
        </div>
      </div>
    </div>
  );
}