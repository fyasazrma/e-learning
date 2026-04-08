export type ClientUser = {
  id: string;
  fullName: string;
  email: string;
  role: "admin" | "dosen" | "mahasiswa";
  npm?: string;
};

const USER_STORAGE_KEY = "client_user";
const TOKEN_STORAGE_KEY = "client_token";

/* =========================
   USER
========================= */

export function setClientUser(user: ClientUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function getClientUser(): ClientUser | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as ClientUser;
  } catch {
    return null;
  }
}

export function clearClientUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_STORAGE_KEY);
}

/* =========================
   TOKEN
========================= */

export function setClientToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function getClientToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function clearClientToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/* =========================
   COMPATIBILITY
========================= */

/**
 * Dipakai untuk kompatibilitas code lama
 */
export function clearClientAuth() {
  clearClientUser();
  clearClientToken();
}

/**
 * Alias kalau nanti ada code lama yang pakai nama ini
 */
export function clearAuth() {
  clearClientAuth();
}