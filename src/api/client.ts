import createClient from "openapi-fetch";
import { useAuthStore } from "../stores/auth";
import { useUiStore } from "../stores/ui";

// Base API client — headers injected per-request
export const api = createClient({ baseUrl: import.meta.env.VITE_API_BASE_URL ?? "" });

// Add auth headers to every request
api.use({
  async onRequest({ request }) {
    const session = useAuthStore.getState().session;
    const position = useUiStore.getState().userPosition;
    if (session) {
      request.headers.set("X-User-Email", session.email);
      request.headers.set("X-User-Role", session.role);
      request.headers.set("X-Business-Unit", session.business_unit);
      request.headers.set("X-User-Geo", session.geo);
    }
    request.headers.set("X-User-Position", position || "employee");
    request.headers.set("Accept-Language", useUiStore.getState().language || "ru");
  },
});

// Simple fetch wrapper for endpoints not in OpenAPI schema
export async function apiFetch<T = unknown>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const session = useAuthStore.getState().session;
  const position = useUiStore.getState().userPosition;
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (session) {
    headers.set("X-User-Email", session.email);
    headers.set("X-User-Role", session.role);
    headers.set("X-Business-Unit", session.business_unit);
    headers.set("X-User-Geo", session.geo);
  }
  headers.set("X-User-Position", position || "employee");
  headers.set("Accept-Language", useUiStore.getState().language || "ru");

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.detail || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}
