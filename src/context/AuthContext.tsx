import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  setAccessToken,
  login as apiLogin,
  register as apiRegister,
  refreshSession,
  logoutServer,
  type AuthUser,
} from "../lib/api";
import { connectSocket, disconnectSocket } from "../lib/sockets";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;
    refreshSession()
      .then((result) => {
        if (cancelled) return;
        setAccessToken(result.token);
        setUser(result.user);
        connectSocket(result.token);
      })
      .catch(() => {
        if (cancelled) return;
        setAccessToken(null);
        setUser(null);
        disconnectSocket();
      })
      .finally(() => {
        if (!cancelled) setIsInitializing(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const result = await apiLogin(email, password);
    setAccessToken(result.token);
    setUser(result.user);
    connectSocket(result.token);
  };

  const register = async (email: string, password: string) => {
    const result = await apiRegister(email, password);
    setAccessToken(result.token);
    setUser(result.user);
    connectSocket(result.token);
  };

  const logout = async () => {
    setAccessToken(null);
    setUser(null);
    disconnectSocket();
    await logoutServer();
  };

  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, isInitializing, login, register, logout }),
    [user, isInitializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}