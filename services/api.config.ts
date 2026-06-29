export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  const headers: Record<string, string> = {};
  
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    cache: 'no-store',
    ...options,
    headers,
  });

  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    let errorMsg = `API Error: ${res.statusText}`;
    try {
      const errJson = await res.json();
      if (errJson.message) {
        errorMsg = Array.isArray(errJson.message) ? errJson.message.join(', ') : errJson.message;
      }
    } catch (e) {}
    throw new Error(errorMsg);
  }
  
  if (res.status === 204) return null;
  
  const json = await res.json();
  if (json && json.success !== undefined && json.data !== undefined) {
    return json.data;
  }
  return json;
}
