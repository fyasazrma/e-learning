"use client";

import { useState } from "react";
import { ClientUser, clearClientAuth } from "@/lib/client-auth";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useRouter } from "next/navigation";

export default function Topbar({ user }: { user: ClientUser | null }) {
  const router = useRouter();

  const [openDropdown, setOpenDropdown] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [name, setName] = useState(user?.fullName || "");

  const role = user?.role || "mahasiswa";

  const handleLogout = () => {
    clearClientAuth();
    router.push("/login");
  };

  return (
    <>
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
            position: "relative",
            cursor: "pointer",
          }}
          onClick={() => setOpenDropdown(!openDropdown)}
        >
          <ThemeToggle />

          <div className="profile-avatar">{name.charAt(0)}</div>
          <div className="profile-info">
            <strong>{name}</strong>
            <span style={{ textTransform: "capitalize" }}>{role}</span>
          </div>

          {/* DROPDOWN */}
          {openDropdown && (
            <div
              className="neu-card"
              style={{
                position: "absolute",
                top: "60px",
                right: 0,
                padding: "12px",
                minWidth: "180px",
                zIndex: 10,
              }}
            >
              <div
                style={{ padding: "8px", cursor: "pointer" }}
                onClick={() => {
                  setOpenProfile(true);
                  setOpenDropdown(false);
                }}
              >
                Profile
              </div>

              <div
                style={{ padding: "8px", cursor: "pointer" }}
                onClick={handleLogout}
              >
                Logout
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PROFILE MODAL */}
      {openProfile && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "grid",
            placeItems: "center",
            zIndex: 20,
          }}
        >
          <div
            className="neu-card"
            style={{
              padding: "24px",
              width: "400px",
              maxWidth: "90%",
            }}
          >
            <h2 style={{ marginBottom: "16px" }}>Profile</h2>

            {/* EDIT NAME */}
            <label>Nama</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "6px",
                marginBottom: "16px",
              }}
            />

            {/* PROGRESS (DUMMY) */}
            <div style={{ marginBottom: "16px" }}>
              <h3>Progress</h3>

              <div style={{ fontSize: "14px" }}>
                <p>AI Basics - 80%</p>
                <p>Machine Learning - 40%</p>
                <p>Deep Learning - 10%</p>
              </div>
            </div>

            {/* ACTION */}
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setOpenProfile(false)}
                className="neu-button"
              >
                Close
              </button>

              <button
                className="neu-button"
                onClick={() => {
                  alert("Nama berhasil diubah (dummy)");
                  setOpenProfile(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}