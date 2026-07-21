import axios from "axios";

export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/\/+$/, "");

const PUBLIC_AUTH_PATHS = ["/auth/login", "/auth/register", "/auth/refresh"];

export type WebhookType = "slack" | "discord";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  console.log(`[auth-debug] setAccessToken(${token ? "token-present" : "null"})`, new Error().stack?.split("\n")[2]?.trim());
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export const api = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

api.interceptors.request.use((config) => {
  console.log(`[auth-debug] request ${config.method} ${config.url} — token present: ${!!accessToken}`);
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

export type UserProfile = {
  id: string;
  email: string;
  webhookUrl: string | null;
  webhookType: WebhookType | null;
};

export async function getMe() {
  const { data } = await api.get<UserProfile>("/auth/me");
  return data;
}

export async function updateWebhookSettings(input: { webhookUrl: string | null; webhookType: WebhookType | null }) {
  const { data } = await api.patch<UserProfile>("/auth/webhook", input);
  return data;
}

async function refreshAccessTokenOnce(): Promise<string | null> {
  if (!refreshPromise) {
    console.log("[auth-debug] attempting /auth/refresh");
    refreshPromise = api
      .post<{ token: string }>("/auth/refresh")
      .then((response) => {
        console.log("[auth-debug] /auth/refresh succeeded");
        setAccessToken(response.data.token);
        return response.data.token;
      })
      .catch((err) => {
        console.log("[auth-debug] /auth/refresh FAILED:", err?.response?.status, err?.response?.data);
        setAccessToken(null);
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isPublicAuthEndpoint = PUBLIC_AUTH_PATHS.some((path) => original?.url?.startsWith(path));

    if (error.response?.status === 401 && !original?._retried && !isPublicAuthEndpoint) {
      original._retried = true;
      const newToken = await refreshAccessTokenOnce();
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);
export async function refreshSession() {
  const { data } = await api.post<{ token: string; user: AuthUser }>("/auth/refresh");
  return data;
}

export async function logoutServer() {
  await api.post("/auth/logout").catch(() => undefined);
}

export type AuthUser = { id: string; email: string };

export type TrackedProduct = {
  id: string;
  userId: string;
  url: string;
  domain: string;
  name: string;
  selector: string;
  targetPriceCents: number;
  currentPriceCents: number | null;
  currency: string;
  checkIntervalMinutes: number;
  isActive: boolean;
  lastCheckedAt: string | null;
  createdAt: string;
};

export type PriceCheck = {
  id: string;
  trackedProductId: string;
  priceCents: number | null;
  success: boolean;
  errorMessage: string | null;
  checkedAt: string;
};

export type SentinelNotification = {
  id: string;
  trackedProductId: string;
  priceCents: number;
  status: string;
  sentAt: string | null;
  createdAt: string;
};

export async function login(email: string, password: string) {
  const { data } = await api.post<{ token: string; user: AuthUser }>("/auth/login", {
    email,
    password,
  });
  return data;
}

export async function register(email: string, password: string) {
  const { data } = await api.post<{ token: string; user: AuthUser }>("/auth/register", {
    email,
    password,
  });
  return data;
}

export async function listSentinels() {
  const { data } = await api.get<TrackedProduct[]>("/products");
  return data;
}

export async function getSentinel(id: string) {
  const { data } = await api.get<TrackedProduct>(`/products/${id}`);
  return data;
}

export async function getSentinelHistory(id: string) {
  const { data } = await api.get<PriceCheck[]>(`/products/${id}/history`);
  return data;
}

export async function getSentinelNotifications(id: string) {
  const { data } = await api.get<SentinelNotification[]>(`/products/${id}/notifications`);
  return data;
}

export type DeploySentinelInput = {
  url: string;
  name: string;
  selector: string;
  targetPriceCents: number;
  currency: "BRL" | "USD" | "GBP" | "EUR";
  checkIntervalMinutes: number;
};

export async function deploySentinel(input: DeploySentinelInput) {
  const { data } = await api.post<TrackedProduct>("/products", input);
  return data;
}

export async function checkNow(id: string) {
  const { data } = await api.post<{ enqueued: boolean }>(`/products/${id}/check-now`);
  return data;
}

export async function setSentinelActive(id: string, isActive: boolean) {
  const { data } = await api.patch<TrackedProduct>(`/products/${id}`, { isActive });
  return data;
}

export async function deleteSentinel(id: string) {
  await api.delete(`/products/${id}`);
}
