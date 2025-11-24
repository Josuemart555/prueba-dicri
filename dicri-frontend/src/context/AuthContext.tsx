import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { storage } from '../utils/storage';
import { authService } from '../services/authService';
import type { Usuario } from '../types';

type AuthContextType = {
  user: Usuario | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(storage.getToken());
  const [user, setUser] = useState<Usuario | null>(storage.getUser<Usuario>());
  const [loading, setLoading] = useState<boolean>(!!token && !storage.getUser());

  useEffect(() => {
    let mounted = true;
    async function fetchMe() {
      if (!token) return;
      // Si ya hay user en storage/state, no necesitamos pedirlo
      if (storage.getUser()) {
        setLoading(false);
        return;
      }
      try {
        const me = await authService.me();
        if (mounted) {
          setUser(me);
          storage.setUser(me);
        }
      } catch {
        storage.clearToken();
        storage.clearUser();
        if (mounted) setToken(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchMe();
    return () => {
      mounted = false;
    };
  }, [token]);

  const login = async (email: string, password: string) => {
    const { token: tkn, user: usr } = await authService.login(email, password);
    storage.setToken(tkn);
    storage.setUser(usr);
    setToken(tkn);
    setUser(usr);
  };

  const logout = () => {
    storage.clearToken();
    storage.clearUser();
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, token, loading, login, logout }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
