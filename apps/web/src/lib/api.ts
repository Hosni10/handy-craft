import type { ApiResponse } from '@handycraft/shared';
import { useAuthStore } from '@/store/auth.store';

const BASE = '/api';

class ApiError extends Error {
  constructor(
    public readonly message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let refreshing: Promise<boolean> | null = null;

/** Exchange the refresh-token cookie for a new access-token cookie; concurrent 401s share one call */
function refreshAccessToken(): Promise<boolean> {
  refreshing ??= fetch(`${BASE}/auth/refresh`, { method: 'POST', credentials: 'include' })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

async function fetchWithRefresh(path: string, init: RequestInit): Promise<Response> {
  const res = await fetch(`${BASE}${path}`, { credentials: 'include', ...init });
  if (res.status !== 401 || path.startsWith('/auth/')) return res;

  if (await refreshAccessToken()) {
    return fetch(`${BASE}${path}`, { credentials: 'include', ...init });
  }
  useAuthStore.getState().logout();
  return res;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetchWithRefresh(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const json = (await res.json()) as ApiResponse<T>;

  if (!json.success) {
    throw new ApiError(json.error ?? 'حدث خطأ غير متوقع', res.status);
  }

  return json.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),

  async upload<T>(path: string, files: File[]): Promise<T> {
    const form = new FormData();
    for (const file of files) form.append('files', file);
    const res = await fetchWithRefresh(path, { method: 'POST', body: form });
    const json = (await res.json()) as ApiResponse<T>;
    if (!json.success) throw new ApiError(json.error ?? 'فشل رفع الملف', res.status);
    return json.data as T;
  },
};

export { ApiError };
