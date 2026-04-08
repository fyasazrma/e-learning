"use client";

import { useEffect, useMemo, useState } from "react";
import SectionTitle from "@/components/common/SectionTitle";

type UserRole = "admin" | "dosen" | "mahasiswa";

type UserType = {
  _id: string;
  fullName?: string;
  email?: string;
  role?: UserRole;
  npm?: string;
  nipd?: string;
  createdAt?: string;
};

type FilterType = "all" | "admin" | "dosen" | "mahasiswa";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "mahasiswa" as UserRole,
    npm: "",
    nipd: "",
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      const result = await res.json();

      if (result.success) {
        setUsers(result.data || []);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("FETCH_ADMIN_USERS_ERROR:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (filter === "all") return users;
    return users.filter((user) => user.role === filter);
  }, [users, filter]);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      fullName: "",
      email: "",
      password: "",
      role: "mahasiswa",
      npm: "",
      nipd: "",
    });
  };

  const handleEdit = (user: UserType) => {
    setEditingId(user._id);
    setForm({
      fullName: user.fullName || "",
      email: user.email || "",
      password: "",
      role: user.role || "mahasiswa",
      npm: user.npm || "",
      nipd: user.nipd || "",
    });
  };

  const handleRoleChange = (role: UserRole) => {
    setForm((prev) => ({
      ...prev,
      role,
      npm: role === "mahasiswa" ? prev.npm : "",
      nipd: role === "dosen" ? prev.nipd : "",
    }));
  };

  const handleSubmit = async () => {
    try {
      const isEdit = !!editingId;
      const url = isEdit ? `/api/users/${editingId}` : "/api/users";
      const method = isEdit ? "PUT" : "POST";

      if (!form.fullName || !form.email || (!isEdit && !form.password)) {
        alert("Full name, email, dan password wajib diisi");
        return;
      }

      if (form.role === "mahasiswa" && !form.npm.trim()) {
        alert("NPM wajib diisi untuk mahasiswa");
        return;
      }

      if (form.role === "dosen" && !form.nipd.trim()) {
        alert("NIPD wajib diisi untuk dosen");
        return;
      }

      const payload = isEdit
        ? {
            fullName: form.fullName,
            email: form.email,
            role: form.role,
            npm: form.role === "mahasiswa" ? form.npm : "",
            nipd: form.role === "dosen" ? form.nipd : "",
          }
        : {
            fullName: form.fullName,
            email: form.email,
            password: form.password,
            role: form.role,
            npm: form.role === "mahasiswa" ? form.npm : "",
            nipd: form.role === "dosen" ? form.nipd : "",
          };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!result.success) {
        alert(result.message || "Gagal menyimpan user");
        return;
      }

      resetForm();
      fetchUsers();
    } catch (error) {
      console.error("SUBMIT_ADMIN_USER_ERROR:", error);
      alert("Terjadi kesalahan saat menyimpan user");
    }
  };

  const handleDelete = async (id: string) => {
    const ok = confirm("Yakin ingin menghapus user ini?");
    if (!ok) return;

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!result.success) {
        alert(result.message || "Gagal menghapus user");
        return;
      }

      if (editingId === id) {
        resetForm();
      }

      fetchUsers();
    } catch (error) {
      console.error("DELETE_ADMIN_USER_ERROR:", error);
      alert("Terjadi kesalahan saat menghapus user");
    }
  };

  return (
    <div className="page-stack fade-in">
      <SectionTitle
        title="Kelola Users"
        subtitle="Lihat, filter, tambah, edit, dan hapus data pengguna berdasarkan role."
      />

      <div
        className="dashboard-card neu-card"
        style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
      >
        <button className="neu-button" onClick={() => setFilter("all")}>
          Semua
        </button>
        <button className="neu-button" onClick={() => setFilter("admin")}>
          Admin
        </button>
        <button className="neu-button" onClick={() => setFilter("dosen")}>
          Dosen
        </button>
        <button className="neu-button" onClick={() => setFilter("mahasiswa")}>
          Mahasiswa
        </button>
      </div>

      <div className="dashboard-card neu-card">
        <h3 style={{ marginBottom: 12 }}>
          {editingId ? "Edit User" : "Tambah User"}
        </h3>

        <div style={{ display: "grid", gap: 12 }}>
          <input
  className="neu-input"
  placeholder="Full Name"
  autoComplete="off"
  value={form.fullName}
  onChange={(e) =>
    setForm((prev) => ({ ...prev, fullName: e.target.value }))
  }
/>

          <input
  className="neu-input"
  placeholder="Email"
  type="email"
  autoComplete="off"
  value={form.email}
  onChange={(e) =>
    setForm((prev) => ({ ...prev, email: e.target.value }))
  }
/>

          {!editingId && (
  <input
    className="neu-input"
    type="password"
    placeholder="Password"
    autoComplete="new-password"
    value={form.password}
    onChange={(e) =>
      setForm((prev) => ({ ...prev, password: e.target.value }))
    }
  />
)}

          <select
            className="neu-select"
            value={form.role}
            onChange={(e) => handleRoleChange(e.target.value as UserRole)}
          >
            <option value="admin">admin</option>
            <option value="dosen">dosen</option>
            <option value="mahasiswa">mahasiswa</option>
          </select>

          {form.role === "mahasiswa" && (
            <input
              className="neu-input"
              placeholder="NPM"
              value={form.npm}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, npm: e.target.value }))
              }
            />
          )}

          {form.role === "dosen" && (
            <input
              className="neu-input"
              placeholder="NIPD"
              value={form.nipd}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, nipd: e.target.value }))
              }
            />
          )}

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="neu-button" onClick={handleSubmit}>
              {editingId ? "Update User" : "Tambah User"}
            </button>

            {(editingId ||
              form.fullName ||
              form.email ||
              form.password ||
              form.npm ||
              form.nipd) && (
              <button className="neu-button" onClick={resetForm}>
                Batal
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-card neu-card">Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="dashboard-card neu-card">
          <p style={{ color: "var(--text-soft)" }}>
            Belum ada user untuk filter ini.
          </p>
        </div>
      ) : (
        <div className="info-list">
          {filteredUsers.map((user) => (
            <div key={user._id} className="info-row-card neu-card">
              <div className="info-row-left">
                <h3>{user.fullName || "-"}</h3>
                <p>Email: {user.email || "-"}</p>
                {user.role === "mahasiswa" && <p>NPM: {user.npm || "-"}</p>}
                {user.role === "dosen" && <p>NIPD: {user.nipd || "-"}</p>}
              </div>

              <div
                className="info-row-meta"
                style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
              >
                <span
                  className="neu-pill"
                  style={{ textTransform: "capitalize" }}
                >
                  {user.role || "-"}
                </span>
                <span className="neu-pill">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("id-ID")
                    : "-"}
                </span>
                <button className="neu-button" onClick={() => handleEdit(user)}>
                  Edit
                </button>
                <button
                  className="neu-button"
                  onClick={() => handleDelete(user._id)}
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}