import { useState, useCallback, useEffect } from 'react';
import { api, token, type RegisterPayload } from '../api/client';
import type { FacultyAccount } from '../types';

export function useAuth() {
  const [loggedInAccount, setLoggedInAccount] = useState<FacultyAccount | null>(null);

  useEffect(() => {
    if (!token.get()) return;
    api.auth.me()
      .then(({ account }) => setLoggedInAccount(account))
      .catch(() => token.clear());
  }, []);

  const login = useCallback(async (email: string, pin: string): Promise<string | null> => {
    try {
      const { token: jwt, account } = await api.auth.login(email, pin);
      token.set(jwt);
      setLoggedInAccount(account);
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Login failed';
    }
  }, []);

  const register = useCallback(async (data: RegisterPayload): Promise<string | null> => {
    try {
      const { token: jwt, account } = await api.auth.register(data);
      token.set(jwt);
      setLoggedInAccount(account);
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Registration failed';
    }
  }, []);

  const logout = useCallback(() => {
    token.clear();
    setLoggedInAccount(null);
  }, []);

  const updateAccount = useCallback(async (updates: Partial<FacultyAccount>): Promise<void> => {
    if (!loggedInAccount) return;
    const { account } = await api.accounts.update(loggedInAccount.email, updates);
    setLoggedInAccount(account);
  }, [loggedInAccount]);

  const deleteAccount = useCallback(async (): Promise<void> => {
    if (!loggedInAccount) return;
    await api.accounts.delete(loggedInAccount.email);
    token.clear();
    setLoggedInAccount(null);
  }, [loggedInAccount]);

  const changePin = useCallback(async (currentPin: string, newPin: string): Promise<string | null> => {
    try {
      await api.auth.changePin(currentPin, newPin);
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Failed to update PIN';
    }
  }, []);

  return {
    loggedInEmail: loggedInAccount?.email ?? null,
    loggedInAccount,
    isLoggedIn: loggedInAccount !== null,
    login,
    logout,
    register,
    updateAccount,
    deleteAccount,
    changePin,
  };
}
