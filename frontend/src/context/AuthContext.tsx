import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, logoutUser } from "../services/api";

export type UserRole = "admin" | "trainer";

export interface User {
  id: number;
  username: string;
  name: string;
  role: UserRole | string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (u: string, p: string) => Promise<User>;
  logout: () => void;
}

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
  isAdmin: false,
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
    const loggedUser = await loginUser(username, password);
    setUser(loggedUser);
    return loggedUser;
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
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
