import axios from "axios";

const AUTH_TOKEN_KEY = "trans_ruta_token";

function normalizeApiBaseUrl(rawBaseUrl?: string): string {
  const candidate = (rawBaseUrl ?? "").trim();
  const fallback = "http://localhost:3000/api/v1";

  if (!candidate) {
    return fallback;
  }

  const withoutTrailingSlash = candidate.replace(/\/+$/, "");

  if (withoutTrailingSlash.endsWith("/api/v1")) {
    return withoutTrailingSlash;
  }

  return `${withoutTrailingSlash}/api/v1`;
}

export const api = axios.create({
  baseURL: normalizeApiBaseUrl(import.meta.env.VITE_API_URL),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      // clear token and notify app
      localStorage.removeItem(AUTH_TOKEN_KEY);
      window.dispatchEvent(new CustomEvent('transruta:authError', { detail: { status: 401 } }));
    } else if (status === 403) {
      window.dispatchEvent(new CustomEvent('transruta:authError', { detail: { status: 403 } }));
    }
    return Promise.reject(error);
  }
);

export function setAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}
