import type { FacultyAccount, FacultyStatus } from '../types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';
const TOKEN_KEY = 'faculty_hub_jwt';

export const token = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (t: string): void => { localStorage.setItem(TOKEN_KEY, t); },
  clear: (): void => { localStorage.removeItem(TOKEN_KEY); },
};

function headers(withAuth = false): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (withAuth) {
    const t = token.get();
    if (t) h['Authorization'] = `Bearer ${t}`;
  }
  return h;
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (res.status === 204) return undefined as T;
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
  return body as T;
}

export type RegisterPayload = {
  email: string;
  pin: string;
  title: string;
  name: string;
  fullName: string;
  block: string;
  floor: string;
  cabinPosition: string;
  phone?: string;
  photoDataUrl?: string;
  linkedFacultyId?: number;
};

export type StatusOverrideDTO = {
  facultyId: number;
  status: string;
  note?: string | null;
  updatedAt: string;
  updatedBy?: string | null;
};

export const api = {
  auth: {
    register: (data: RegisterPayload) =>
      req<{ token: string; account: FacultyAccount }>('/auth/register', {
        method: 'POST', headers: headers(), body: JSON.stringify(data),
      }),
    login: (email: string, pin: string) =>
      req<{ token: string; account: FacultyAccount }>('/auth/login', {
        method: 'POST', headers: headers(), body: JSON.stringify({ email, pin }),
      }),
    me: () =>
      req<{ account: FacultyAccount }>('/auth/me', { headers: headers(true) }),
    changePin: (currentPin: string, newPin: string) =>
      req<{ message: string }>('/auth/change-pin', {
        method: 'POST', headers: headers(true), body: JSON.stringify({ currentPin, newPin }),
      }),
  },
  accounts: {
    linkedIds: () =>
      req<{ linkedIds: number[] }>('/accounts/linked-ids'),
    update: (email: string, updates: Partial<FacultyAccount>) =>
      req<{ account: FacultyAccount }>(`/accounts/${encodeURIComponent(email)}`, {
        method: 'PUT', headers: headers(true), body: JSON.stringify(updates),
      }),
    delete: (email: string) =>
      req<void>(`/accounts/${encodeURIComponent(email)}`, {
        method: 'DELETE', headers: headers(true),
      }),
  },
  status: {
    list: () =>
      req<{ overrides: StatusOverrideDTO[] }>('/status'),
    set: (facultyId: number, status: FacultyStatus, note?: string) =>
      req<{ override: StatusOverrideDTO }>(`/status/${facultyId}`, {
        method: 'PUT', headers: headers(true), body: JSON.stringify({ status, note }),
      }),
    clear: (facultyId: number) =>
      req<void>(`/status/${facultyId}`, { method: 'DELETE', headers: headers(true) }),
    clearAll: () =>
      req<void>('/status/all', { method: 'DELETE', headers: headers(true) }),
  },
};
