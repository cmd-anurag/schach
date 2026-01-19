"use client";
import { createContext, ReactNode, useEffect, useState, useCallback } from "react";

type User = {
  id: string;
  username: string;
};

export const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  refreshUser: () => Promise<void>;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { credentials: "include" });
      const data = res.ok ? await res.json() : null;
      setUser(data);
    } catch {
      setUser(null);
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
        loading,
        isLoggedIn: !!user,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}