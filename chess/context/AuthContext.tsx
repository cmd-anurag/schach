"use client";

import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from "react";

export interface AuthContextType {
    token: string | null,
    username: string | null,
    isLoggedIn: boolean,
    loading: boolean,  
    login: (token: string, username: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children} : {children: ReactNode}) {
    const [token, setToken] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUsername = localStorage.getItem('username');
        // a necessary evil i think
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setToken(savedToken);
        setUsername(savedUsername);
        setLoading(false);
    }, [])

    const login = useCallback((newToken: string, newUsername: string) => {
        try {
            localStorage.setItem("token", newToken);
            localStorage.setItem("username", newUsername);
        } catch {
            // swallow storage errors
        }
        setToken(newToken);
        setUsername(newUsername);
    }, []);

    const logout = useCallback(() => {
        try {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
        } catch {
            // swallow storage errors
        }
        setToken(null);
        setUsername(null);
    }, []);
    
    const isLoggedIn = useMemo(() => !!token, [token]);

    return (
        <AuthContext.Provider value={{ token, username, isLoggedIn, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}