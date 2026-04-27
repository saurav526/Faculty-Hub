import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import type { FacultyStatus, StatusOverrides } from '../types';

export function useFacultyStatus() {
  const [overrides, setOverrides] = useState<StatusOverrides>({});

  const fetchAll = useCallback(async () => {
    try {
      const { overrides: list } = await api.status.list();
      const map: StatusOverrides = {};
      for (const o of list) {
        map[o.facultyId] = {
          status: o.status as FacultyStatus,
          updatedAt: o.updatedAt,
          note: o.note ?? undefined,
        };
      }
      setOverrides(map);
    } catch {
      // keep existing state on network error
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const setStatus = useCallback(async (facultyId: number, status: FacultyStatus, note?: string) => {
    await api.status.set(facultyId, status, note);
    setOverrides(prev => ({
      ...prev,
      [facultyId]: { status, updatedAt: new Date().toISOString(), note },
    }));
  }, []);

  const clearStatus = useCallback(async (facultyId: number) => {
    await api.status.clear(facultyId);
    setOverrides(prev => {
      const next = { ...prev };
      delete next[facultyId];
      return next;
    });
  }, []);

  const clearAll = useCallback(async () => {
    await api.status.clearAll();
    setOverrides({});
  }, []);

  return {
    overrides,
    setStatus,
    clearStatus,
    clearAll,
    overrideCount: Object.keys(overrides).length,
  };
}
