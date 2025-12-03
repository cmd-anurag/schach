"use client";

import { createContext, ReactNode, useEffect, useState } from "react";

export interface AuthContextType {
    token: string | null,
    username: string | null,
    isLoading: boolean,
    login: (token: string, username: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({children} : {children: ReactNode}) {
    const [token, setToken] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUsername = localStorage.getItem('username');
        setToken(savedToken);
        setUsername(savedUsername);
        setIsLoading(false);
    }, [])

    const login = (token: string, username: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        setToken(token);
        setUsername(username);
    }

    const logout = ()=> {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setToken(null);
        setUsername(null);
    }

    return (
        <AuthContext.Provider value={{ token, username, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}