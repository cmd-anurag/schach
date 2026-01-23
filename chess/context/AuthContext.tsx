"use client";
import { createContext, ReactNode, useEffect, useState, useCallback } from "react";

type User = {
  id: string;
  username: string;
};

export const AuthContext = createContext<{
  user: User | null;
  wsToken: string | null,
  loading: boolean;
  isLoggedIn: boolean;
  refreshUser: () => Promise<void>;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [wsToken, setWsToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { credentials: "include" });

      if (!res.ok) {
        setUser(null);
        setWsToken(null);
        return;
      }

      const { user, wsToken } = await res.json();

      setUser(user);
      setWsToken(wsToken);
    } catch {
      setUser(null);
      setWsToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        wsToken,
        loading,
        isLoggedIn: !!user,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}