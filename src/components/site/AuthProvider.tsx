import React, { createContext, useEffect, useState } from "react";
import { apiFetch, apiPost, setToken, clearToken } from "@/lib/api-client";

interface AuthUser {
  id: string;
  email: string;
  created_at?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ user: AuthUser }>("/auth/me.php")
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signUp = async (email: string, password: string) => {
    const res = await apiPost<{ token: string; user: AuthUser }>("/auth/signup.php", {
      email,
      password,
    });
    setToken(res.token);
    setUser(res.user);
  };

  const signIn = async (email: string, password: string) => {
    const res = await apiPost<{ token: string; user: AuthUser }>("/auth/login.php", {
      email,
      password,
    });
    setToken(res.token);
    setUser(res.user);
  };

  const signOut = async () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
