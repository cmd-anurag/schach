"use client";
import { createContext, ReactNode, useEffect, useState } from "react";
import jwt from 'jsonwebtoken';

type User = {
  id: number;
  username: string;
};

export const AuthContext = createContext<{
  user: User | null;
  token: string | null,
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem('session');
    const userFromStorage = localStorage.getItem('user');

    if (userFromStorage) {
      const parsedUser: User = JSON.parse(userFromStorage);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(parsedUser);
      setToken(tokenFromStorage);
    }
  }, []);

  const login = (token: string) => {
    
    const payload = jwt.decode(
      token,
    ) as { id: number; username: string }

    localStorage.setItem('session', token);
    localStorage.setItem('user', JSON.stringify(payload));
    setToken(token);
    setUser(payload);
  }

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('session');
    localStorage.removeItem('user');
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}