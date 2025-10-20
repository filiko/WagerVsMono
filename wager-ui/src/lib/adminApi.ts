export function getToken(): string | null {
  try { return localStorage.getItem("token"); } catch { return null; }
}

async function request<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const base = "/api"; // next.config.ts rewrites this to backend
  const token = getToken();
  const headers: Record<string, string> = {
    ...(init.headers as any),
  } as any;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${base}${path.startsWith("/") ? path : "/" + path}` , {
    ...init,
    headers,
  });
  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : (await res.text() as any);
  if (!res.ok) {
    if (res.status === 401) {
      if (typeof window !== "undefined") {
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/admin/login?next=${next}`;
      }
    }
    throw new Error((data && (data.error || data.message)) || `Request failed: ${res.status}`);
  }
  return data as T;
}

export const adminApi = {
  get: <T = any>(path: string) => request<T>(path),
  post: <T = any>(path: string, body?: any) => request<T>(path, { method: "POST", headers: { "Content-Type": "application/json"}, body: JSON.stringify(body||{}) }),
  put: <T = any>(path: string, body?: any) => request<T>(path, { method: "PUT", headers: { "Content-Type": "application/json"}, body: JSON.stringify(body||{}) }),
  del: <T = any>(path: string) => request<T>(path, { method: "DELETE" }),
  form: <T = any>(path: string, formData: FormData, method: string = "POST") => request<T>(path, { method, body: formData }),
};
