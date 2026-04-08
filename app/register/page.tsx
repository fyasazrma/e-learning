"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    npm: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setMounted(true);
    setForm({
      fullName: "",
      email: "",
      npm: "",
      password: "",
      confirmPassword: "",
    });
  }, []);

  const handleSubmit = async () => {
    if (
      !form.fullName ||
      !form.email ||
      !form.npm ||
      !form.password ||
      !form.confirmPassword
    ) {
      alert("Semua field wajib diisi");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Password dan konfirmasi password tidak sama");
      return;
    }

    if (form.password.length < 6) {
      alert("Password minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          npm: form.npm,
          password: form.password,
        }),
      });

      const result = await res.json();

      if (!result.success) {
        alert(result.message || "Gagal register");
        return;
      }

      alert("Registrasi berhasil, silakan login");
      router.push("/login");
    } catch (error) {
      console.error("REGISTER_PAGE_ERROR", error);
      alert("Terjadi kesalahan saat registrasi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell compact-auth">
      <div className={`auth-card-grid ${mounted ? "auth-enter" : ""}`}>
        <div className="auth-left-panel">
          <div className="auth-badge">Register Mahasiswa</div>
          <h1 className="auth-title">Buat akun untuk mulai belajar</h1>
          <p className="auth-desc">
            Daftar sebagai mahasiswa untuk mengakses materi, mengerjakan latihan,
            menerima feedback adaptif, dan memantau progress belajar.
          </p>

          <div className="auth-mini-list">
            <div className="auth-mini-card">
              <strong>Materi Interaktif</strong>
              <p>Pelajari Docs, Sheets, dan Slides sebelum masuk ke latihan bertahap.</p>
            </div>
            <div className="auth-mini-card">
              <strong>Adaptive Feedback</strong>
              <p>Sistem memberi tips dan remedial sesuai kesalahan yang kamu buat.</p>
            </div>
          </div>
        </div>

        <div className="auth-right-panel">
          <div className="auth-head">
            <h2>Daftar akun mahasiswa</h2>
            <p>Isi data berikut untuk membuat akun mahasiswa baru.</p>
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
                placeholder="Masukkan nama lengkap"
                value={form.fullName}
                autoComplete="off"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, fullName: e.target.value }))
                }
              />
            </div>

            <div className="auth-field">
              <label>Akun / Email</label>
              <input
                className="auth-input"
                type="email"
                placeholder="Masukkan email"
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
              <label>NPM</label>
              <input
                className="auth-input"
                type="text"
                placeholder="Masukkan NPM"
                value={form.npm}
                autoComplete="off"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, npm: e.target.value }))
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

            <button className="auth-primary-btn" type="submit" disabled={loading}>
              {loading ? "Memproses..." : "Daftar"}
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