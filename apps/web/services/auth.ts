const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FetchOptions extends RequestInit {
  token?: string | null;
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const token = options.token ?? (typeof window !== "undefined" ? localStorage.getItem("ordexa_token") : null);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || "Terjadi kesalahan pada server.";
    throw new Error(errorMsg);
  }

  return data as T;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  restaurant_name: string;
  referral_code?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  async register(payload: RegisterPayload) {
    const res = await apiFetch<{
      message: string;
      data: {
        token: string;
        user: { id: number; name: string; email: string };
        restaurant: { id: number; name: string; slug: string };
      };
    }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (typeof window !== "undefined" && res.data.token) {
      localStorage.setItem("ordexa_token", res.data.token);
      localStorage.setItem("token", res.data.token);
    }
    return res;
  },

  async login(payload: LoginPayload) {
    const res = await apiFetch<{
      message: string;
      data: {
        token: string;
        user: { id: number; name: string; email: string };
        memberships: any[];
      };
    }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (typeof window !== "undefined" && res.data.token) {
      localStorage.setItem("ordexa_token", res.data.token);
      localStorage.setItem("token", res.data.token);
    }
    return res;
  },

  async me() {
    return apiFetch<{
      data: {
        user: { id: number; name: string; email: string };
        current_membership: any;
      };
    }>("/api/auth/me");
  },

  async logout() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("ordexa_token");
        localStorage.removeItem("token");
      }
    }
  },
};
