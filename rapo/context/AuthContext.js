import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";

// 1. Create context
const AuthContext = createContext();

// 2. Provider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Example: check localStorage token
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      // fake decode or fetch user
      setUser({ id: 1, name: "John Doe" });
    }

    setLoading(false);
  }, []);

  // login function
  const login = (userData, token) => {
    localStorage.setItem("token", token);
    setUser(userData);
    router.push("/dashboard");
  };

  // logout function
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Hook for easy use
export function useAuth() {
  return useContext(AuthContext);
}