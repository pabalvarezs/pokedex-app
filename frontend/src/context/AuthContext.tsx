import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (u: string, p: string) => Promise<User>;
  logout: () => void;
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

function getStoredUser(): User | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = localStorage.getItem("pokedex_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => {
    throw new Error("No provider");
  },
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser());

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    const { data } = await axios.post(`${API_URL}/api/auth/login`, { username, password });
    if (data.success && data.user) {
      try {
        localStorage.setItem("pokedex_user", JSON.stringify(data.user));
        localStorage.setItem("pokedex_token", data.token);
      } catch {}
      setUser(data.user);
      return data.user;
    }
    throw new Error(data.error || "Error al iniciar sesión");
  };

  const logout = () => {
    try {
      localStorage.removeItem("pokedex_user");
      localStorage.removeItem("pokedex_token");
    } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
