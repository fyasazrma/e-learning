"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setClientToken, setClientUser } from "@/lib/client-auth";

export default function LoginPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    setForm({ email: "", password: "" });
  }, []);

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      alert("Email dan password wajib diisi");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await res.json();

      if (!result.success) {
        alert(result.message || "Gagal login");
        return;
      }

      setClientUser(result.data);
      setClientToken("logged-in");

      if (result.data.role === "admin") {
        router.push("/dashboard/admin");
        return;
      }

      if (result.data.role === "dosen") {
        router.push("/dashboard/dosen");
        return;
      }

      router.push("/dashboard/mahasiswa");
    } catch (error) {
      console.error("LOGIN_PAGE_ERROR", error);
      alert("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell compact-auth">
      <div className={`auth-card-grid ${mounted ? "auth-enter" : ""}`}>
        <div className="auth-left-panel">
          <div className="auth-badge">AI Adaptive Learning</div>
          <h1 className="auth-title">Masuk ke platform pembelajaran adaptif</h1>
          <p className="auth-desc">
            Akses materi, latihan adaptif, feedback otomatis, dan progress belajar
            berdasarkan performa pengguna pada Docs, Sheets, dan Slides.
          </p>

          <div className="auth-mini-list">
            <div className="auth-mini-card">
              <strong>Adaptive Exercises</strong>
              <p>Latihan berikutnya dipilih berdasarkan jawaban dan jenis kesalahan.</p>
            </div>
            <div className="auth-mini-card">
              <strong>Feedback Cepat</strong>
              <p>Mahasiswa mendapat tips singkat dan rekomendasi remedial yang sesuai.</p>
            </div>
          </div>
        </div>

        <div className="auth-right-panel">
          <div className="auth-head">
            <h2>Login</h2>
            <p>Masukkan akun yang sudah terdaftar untuk masuk ke dashboard.</p>
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
              <label>Akun / Email</label>
              <input
                className="auth-input"
                type="email"
                name="login-email-no-save"
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
              <label>Password</label>
              <input
                className="auth-input"
                type="password"
                name="login-password-no-save"
                placeholder="Masukkan password"
                value={form.password}
                autoComplete="new-password"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
              />
            </div>

            <button className="auth-primary-btn" type="submit" disabled={loading}>
              {loading ? "Memproses..." : "Login"}
            </button>
          </form>

          <div className="auth-links">
            <p>
              Belum punya akun mahasiswa? <Link href="/register">Register di sini</Link>
            </p>
            <p>
              Khusus admin pertama? <Link href="/register-admin">Register admin</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}