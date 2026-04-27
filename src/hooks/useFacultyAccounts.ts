import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

export function useFacultyAccounts() {
  const [linkedFacultyIds, setLinkedFacultyIds] = useState<Set<number>>(new Set());

  const refresh = useCallback(() => {
    api.accounts.linkedIds()
      .then(({ linkedIds }) => setLinkedFacultyIds(new Set(linkedIds)))
      .catch(() => {});
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { linkedFacultyIds, refresh };
}
