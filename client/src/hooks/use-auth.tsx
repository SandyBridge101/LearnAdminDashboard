import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { authApi, getStoredToken, setStoredToken, removeStoredToken } from "@/lib/auth";
import type { AuthResponse } from "@/lib/auth";

interface AuthContextType {
  admin: AuthResponse['admin'] | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  setAdmin: (admin: AuthResponse['admin']) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AuthResponse['admin'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredToken();
      if (token) {
        try {
          const response = await authApi.getCurrentUser();
          setAdmin(response.admin);
        } catch (error) {
          console.error("Failed to verify token:", error);
          removeStoredToken();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await authApi.login({ email, password });
    setStoredToken(response.token);
    setAdmin(response.admin);
    return response;
  };

  const logout = () => {
    removeStoredToken();
    setAdmin(null);
    setLocation("/login");
  };

  const value = {
    admin,
    isLoading,
    login,
    logout,
    setAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
