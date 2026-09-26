const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function getToken() {
  return localStorage.getItem('admin_token');
}

export function setToken(token) {
  if (token) localStorage.setItem('admin_token', token);
  else localStorage.removeItem('admin_token');
}

export async function api(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function login(phone, password) {
  const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ phone, password }) });
  if (data.user.role !== 'ADMIN') throw new Error('This account is not an admin account');
  setToken(data.token);
  return data.user;
}

export function logout() {
  setToken(null);
}
