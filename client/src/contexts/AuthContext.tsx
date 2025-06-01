import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";

// Types
export type User = {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  address: string | null;
  city: string | null;
  state: string | null;
};

export type Caterer = {
  id: number;
  userId: number;
  businessName: string;
  location: string;
  city: string;
  state: string;
  minPlate: number;
  maxPlate: number;
  rating?: number;
  reviewCount?: number;
  specialties?: string[];
  eventTypes?: string[];
  description?: string;
};

export type AuthContextType = {
  user: User | null;
  caterer: Caterer | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  registerCaterer: (catererData: any) => Promise<void>;
};

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [caterer, setCaterer] = useState<Caterer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        console.log("Checking auth status...");
        
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          console.log("Auth data received:", data);
          setUser(data.user);
          setCaterer(data.caterer);
        } else {
          console.log("Not authenticated, status:", res.status);
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const res = await apiRequest("POST", "/api/auth/login", { username, password });
      const data = await res.json();
      setUser(data.user);
      setCaterer(data.caterer);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      setUser(null);
      setCaterer(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const res = await apiRequest("POST", "/api/auth/register", userData);
      const data = await res.json();
      setUser(data.user);
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  const registerCaterer = async (catererData: any) => {
    try {
      const res = await apiRequest("POST", "/api/auth/register-caterer", catererData);
      const data = await res.json();
      setUser(data.user);
      setCaterer(data.caterer);
    } catch (error) {
      console.error("Caterer register error:", error);
      throw error;
    }
  };

  const value = {
    user,
    caterer,
    isLoading,
    login,
    logout,
    register,
    registerCaterer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}