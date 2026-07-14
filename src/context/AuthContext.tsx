import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { setAccessToken, login as apiLogin, register as apiRegister, type AuthUser } from "../lib/api";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = async (email: string, password: string) => {
    const result = await apiLogin(email, password);
    setAccessToken(result.token);
    setUser(result.user);
  };

  const register = async (email: string, password: string) => {
    const result = await apiRegister(email, password);
    setAccessToken(result.token);
    setUser(result.user);
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, login, register, logout }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
