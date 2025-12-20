import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("userRole");
      const userId = localStorage.getItem("userId");
      setUserId(userId);
      setIsAuthenticated(!!token);
      setUserRole(role);
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const login = (token, role, userId) => {
    localStorage.setItem("token", token);
    if (role) {
      localStorage.setItem("userRole", role);
      setUserRole(role);
    } else {
      const storedRole = localStorage.getItem("userRole");
      setUserRole(storedRole);
    }
    if (userId) {
      localStorage.setItem("userId", userId);
      setUserId(userId);
    } else {
      const storedUserId = localStorage.getItem("userId");
      setUserId(storedUserId);
    }
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);