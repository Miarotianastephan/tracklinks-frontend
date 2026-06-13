import axios from 'axios';
import type {
  AlertEmail, AuthUser, Group, LinkItem, SettingsMap, StatusResponse,
} from '../types';

const TOKEN_KEY = 'lsd_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// Relative '/api' by default (same-origin: a reverse proxy forwards /api to the
// backend). Override with VITE_API_URL to call the backend directly.
const client = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname.startsWith('/admin')) {
      clearToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  // public
  getStatus: () => client.get<StatusResponse>('/public/status').then((r) => r.data),

  // auth
  login: (email: string, password: string) =>
    client.post<{ token: string; user: AuthUser }>('/auth/login', { email, password }).then((r) => r.data),
  me: () => client.get<{ user: AuthUser }>('/auth/me').then((r) => r.data.user),

  // groups
  getGroups: () => client.get<Group[]>('/admin/groups').then((r) => r.data),
  createGroup: (data: Partial<Group>) => client.post<Group>('/admin/groups', data).then((r) => r.data),
  updateGroup: (id: number, data: Partial<Group>) => client.put<Group>(`/admin/groups/${id}`, data).then((r) => r.data),
  deleteGroup: (id: number) => client.delete(`/admin/groups/${id}`).then((r) => r.data),

  // links
  getLinks: () => client.get<LinkItem[]>('/admin/links').then((r) => r.data),
  createLink: (data: Partial<LinkItem>) => client.post<LinkItem>('/admin/links', data).then((r) => r.data),
  updateLink: (id: number, data: Partial<LinkItem>) => client.put<LinkItem>(`/admin/links/${id}`, data).then((r) => r.data),
  deleteLink: (id: number) => client.delete(`/admin/links/${id}`).then((r) => r.data),
  checkLink: (id: number) => client.post<LinkItem>(`/admin/links/${id}/check`).then((r) => r.data),
  checkAll: () => client.post('/admin/check-all').then((r) => r.data),

  // settings
  getSettings: () => client.get<SettingsMap>('/admin/settings').then((r) => r.data),
  updateSettings: (data: Partial<SettingsMap>) => client.put<SettingsMap>('/admin/settings', data).then((r) => r.data),

  // alert emails
  getAlertEmails: () => client.get<AlertEmail[]>('/admin/alert-emails').then((r) => r.data),
  createAlertEmail: (email: string) => client.post<AlertEmail>('/admin/alert-emails', { email }).then((r) => r.data),
  updateAlertEmail: (id: number, data: Partial<AlertEmail>) =>
    client.put<AlertEmail>(`/admin/alert-emails/${id}`, data).then((r) => r.data),
  deleteAlertEmail: (id: number) => client.delete(`/admin/alert-emails/${id}`).then((r) => r.data),
  sendTestEmail: () => client.post<{ sent: boolean }>('/admin/alert-emails/test').then((r) => r.data),
};
