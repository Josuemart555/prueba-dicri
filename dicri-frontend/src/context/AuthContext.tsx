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
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState<boolean>(!!token);

  useEffect(() => {
    let mounted = true;
    async function fetchMe() {
      if (!token) return;
      try {
        const me = await authService.me();
        if (mounted) setUser(me);
      } catch {
        storage.clearToken();
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
    setToken(tkn);
    setUser(usr);
  };

  const logout = () => {
    storage.clearToken();
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
