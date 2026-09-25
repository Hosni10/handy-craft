import type { ApiResponse } from '@craftsouq/shared';

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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
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
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      credentials: 'include',
      body: form,
    });
    const json = (await res.json()) as ApiResponse<T>;
    if (!json.success) throw new ApiError(json.error ?? 'فشل رفع الملف', res.status);
    return json.data as T;
  },
};

export { ApiError };
