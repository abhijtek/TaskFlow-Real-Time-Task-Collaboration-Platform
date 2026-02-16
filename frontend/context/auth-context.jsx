import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authService } from "@/services/auth-service";
import { connectSocket, disconnectSocket } from "@/lib/socket-client";

const AuthContext = createContext(undefined);

const extractErrorMessage = (error, fallback) => {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  return error.error || error.message || fallback;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("taskflow_token");
    if (token) {
      authService.me().then((res) => {
        if (res.user) {
          setUser(res.user);
          connectSocket(token);
        } else {
          localStorage.removeItem("taskflow_token");
          localStorage.removeItem("taskflow_user");
        }
      }).catch(() => {
        localStorage.removeItem("taskflow_token");
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const res = await authService.login(email, password);
      if (res.error) return { error: res.error };
      localStorage.setItem("taskflow_token", res.token);
      localStorage.setItem("taskflow_user", JSON.stringify(res.user));
      setUser(res.user);
      connectSocket(res.token);
      return { success: true };
    } catch (error) {
      return { error: extractErrorMessage(error, "Invalid credentials") };
    }
  }, []);

  const signup = useCallback(async (name, email, password) => {
    try {
      if (!password || password.length < 6) {
        return { error: "Password must be at least 6 characters" };
      }

      const res = await authService.signup(name, email, password);
      if (res.error) return { error: res.error };
      localStorage.setItem("taskflow_token", res.token);
      localStorage.setItem("taskflow_user", JSON.stringify(res.user));
      setUser(res.user);
      connectSocket(res.token);
      return { success: true };
    } catch (error) {
      return { error: extractErrorMessage(error, "Unable to sign up") };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("taskflow_token");
    localStorage.removeItem("taskflow_user");
    setUser(null);
    disconnectSocket();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
