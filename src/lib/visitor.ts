import axios, { AxiosInstance } from 'axios';
import { getDeviceFingerprint } from './fingerprint';

/**
 * Client-side visitor identification utilities.
 * Generates and persists a unique visitor ID in localStorage and syncs with cookies
 * so that both client Axios calls and Server Components can isolate scan history per-browser.
 */

export function getVisitorId(): string {
  if (typeof window === 'undefined') return 'anonymous';

  let id = localStorage.getItem('phishlens_visitor_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('phishlens_visitor_id', id);
  }

  // Sync to cookie so Server Components (e.g. /history) can read it
  if (typeof document !== 'undefined') {
    document.cookie = `phishlens_visitor_id=${encodeURIComponent(id)}; path=/; max-age=31536000; SameSite=Lax`;
  }

  return id;
}

/**
 * Pre-configured Axios instance that automatically attaches:
 * 1. x-visitor-id (Browser storage ID)
 * 2. x-device-hash (Hardware GPU/Audio/Screen fingerprint resistant to VPN & Incognito)
 */
export const apiClient: AxiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    config.headers.set('x-visitor-id', getVisitorId());
    try {
      const deviceHash = await getDeviceFingerprint();
      config.headers.set('x-device-hash', deviceHash);
    } catch {
      // Fallback gracefully
    }
  }
  return config;
});

/**
 * Backward-compatible helper wrapping apiClient
 */
export async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const method = (init?.method || 'GET').toLowerCase();
  const headers: Record<string, string> = {
    'x-visitor-id': getVisitorId(),
  };

  if (typeof window !== 'undefined') {
    try {
      headers['x-device-hash'] = await getDeviceFingerprint();
    } catch {
      // ignore
    }
  }

  if (init?.headers) {
    if (init.headers instanceof Headers) {
      init.headers.forEach((val, key) => {
        headers[key] = val;
      });
    } else if (Array.isArray(init.headers)) {
      init.headers.forEach(([key, val]) => {
        headers[key] = val;
      });
    } else {
      Object.assign(headers, init.headers);
    }
  }

  let data = init?.body;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      // Keep as string if not JSON
    }
  }

  try {
    const res = await axios({
      url,
      method,
      headers,
      data,
      withCredentials: true,
      validateStatus: () => true, // Don't throw so caller can inspect status
    });

    // Provide a Response-compatible interface for callers
    return new Response(JSON.stringify(res.data), {
      status: res.status,
      statusText: res.statusText,
      headers: new Headers(res.headers as Record<string, string>),
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'NETWORK_ERROR', message: err.message }), {
      status: 500,
      statusText: 'Internal Error',
    });
  }
}
