"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterAdminPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    accessKey: "",
  });

  useEffect(() => {
    setMounted(true);
    setForm({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      accessKey: "",
    });
  }, []);

  const handleSubmit = async () => {
    if (
      !form.fullName ||
      !form.email ||
      !form.password ||
      !form.confirmPassword ||
      !form.accessKey
    ) {
      alert("Semua field wajib diisi");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Password dan konfirmasi password tidak sama");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          accessKey: form.accessKey,
        }),
      });

      const result = await res.json();

      if (!result.success) {
        alert(result.message || "Gagal register admin");
        return;
      }

      alert("Admin berhasil dibuat, silakan login");
      router.push("/login");
    } catch (error) {
      console.error("REGISTER_ADMIN_PAGE_ERROR", error);
      alert("Terjadi kesalahan saat register admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell compact-auth">
      <div className={`auth-card-grid ${mounted ? "auth-enter" : ""}`}>
        <div className="auth-left-panel">
          <div className="auth-badge">Register Admin</div>
          <h1 className="auth-title">Buat admin pertama sistem</h1>
          <p className="auth-desc">
            Halaman ini khusus untuk membuat akun admin pertama dan membutuhkan
            access key khusus.
          </p>

          <div className="auth-mini-list">
            <div className="auth-mini-card">
              <strong>Keamanan Role</strong>
              <p>Akun admin tidak dibuat dari register umum agar akses sensitif tetap terkontrol.</p>
            </div>
            <div className="auth-mini-card">
              <strong>Kontrol Sistem</strong>
              <p>Setelah admin pertama dibuat, user dan konten dikelola dari dashboard admin.</p>
            </div>
          </div>
        </div>

        <div className="auth-right-panel">
          <div className="auth-head">
            <h2>Daftar akun admin</h2>
            <p>Isi data admin dan masukkan access key yang valid.</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            autoComplete="off"
            className="auth-form"
          >
            <input
              type="text"
              name="fake-username"
              autoComplete="username"
              tabIndex={-1}
              className="hidden-autofill"
            />
            <input
              type="password"
              name="fake-password"
              autoComplete="new-password"
              tabIndex={-1}
              className="hidden-autofill"
            />

            <div className="auth-field">
              <label>Nama Lengkap</label>
              <input
                className="auth-input"
                type="text"
                placeholder="Masukkan nama admin"
                value={form.fullName}
                autoComplete="off"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, fullName: e.target.value }))
                }
              />
            </div>

            <div className="auth-field">
              <label>Email</label>
              <input
                className="auth-input"
                type="email"
                placeholder="Masukkan email admin"
                value={form.email}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>

            <div className="auth-field">
              <label>Password</label>
              <input
                className="auth-input"
                type="password"
                placeholder="Masukkan password"
                value={form.password}
                autoComplete="new-password"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
              />
            </div>

            <div className="auth-field">
              <label>Konfirmasi Password</label>
              <input
                className="auth-input"
                type="password"
                placeholder="Ulangi password"
                value={form.confirmPassword}
                autoComplete="new-password"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
              />
            </div>

            <div className="auth-field">
              <label>Admin Key</label>
              <input
                className="auth-input"
                type="text"
                placeholder="Masukkan admin key"
                value={form.accessKey}
                autoComplete="off"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, accessKey: e.target.value }))
                }
              />
            </div>

            <button className="auth-primary-btn" type="submit" disabled={loading}>
              {loading ? "Memproses..." : "Daftar Admin"}
            </button>
          </form>

          <div className="auth-links">
            <p>
              Sudah punya akun? <Link href="/login">Login di sini</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}