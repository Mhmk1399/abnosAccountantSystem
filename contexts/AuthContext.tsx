"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type UserRole = "seller" | "manager" | "supervisor";

interface User {
  id: string;
  username: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  hasAccess: (requiredRoles: UserRole[]) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/auth");
  };

  const hasAccess = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        localStorage.removeItem("token");
        router.push("/auth");
        return;
      }

      try {
        const response = await fetch("/api/auth/verify", {
          headers: { token },
        });

        if (!response.ok) {
          throw new Error("Token verification failed");
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.log("Token verification error:", error);
        toast.error("جلسه شما منقضی شده است");
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, hasAccess, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
