const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const DEFAULT_TIMEOUT_MS = 45_000;

export function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token')?.trim();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Admin-only multipart upload → public URLs under API origin `/uploads/...`. */
export async function uploadAdminMedia(files: File[]): Promise<{ urls: string[] }> {
  if (!files.length) return { urls: [] };
  if (typeof window === 'undefined') throw new Error('Upload is only available in the browser');
  const token = localStorage.getItem('token')?.trim();
  if (!token) {
    throw new Error(
      'SIGN_IN_REQUIRED: No session token. Open Sign In, log in as admin, then try uploading again.',
    );
  }
  const form = new FormData();
  for (const f of files) form.append('files', f);
  const res = await fetch(`${API}/admin/uploads`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: form,
    cache: 'no-store',
  });
  const text = await res.text();
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error(
        'SESSION_INVALID: Your login may have expired. Sign out and sign in again (use admin@investify.com if you use the demo admin).',
      );
    }
    if (res.status === 403) {
      throw new Error('Admin role required for uploads. Sign in with an admin account.');
    }
    throw new Error(text.slice(0, 200) || 'Upload failed');
  }
  return JSON.parse(text) as { urls: string[] };
}

export async function fetchApi<T>(path: string, init?: RequestInit & { timeoutMs?: number }): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, signal: userSignal, ...rest } = init ?? {};
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const onUserAbort = () => ctrl.abort();
  if (userSignal) {
    if (userSignal.aborted) ctrl.abort();
    else userSignal.addEventListener('abort', onUserAbort, { once: true });
  }
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      ...rest,
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), ...rest.headers },
    });
  } catch (e) {
    const aborted =
      (e instanceof DOMException && e.name === 'AbortError') ||
      (e instanceof Error && e.name === 'AbortError');
    if (aborted) {
      throw new TypeError(`REQUEST_TIMEOUT:${API}`);
    }
    throw new TypeError(`NETWORK_ERROR:${API}`);
  } finally {
    clearTimeout(timer);
    userSignal?.removeEventListener('abort', onUserAbort);
  }
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export function apiBaseDisplay(): string {
  return API;
}

export function apiUrl(path: string) {
  return `${API}${path}`;
}
