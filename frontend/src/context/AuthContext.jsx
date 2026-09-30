import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get("/api/auth/me");
      setUser(res.data);
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (email, password) => {
    const res = await api.post("/api/auth/login-json", { email, password });
    localStorage.setItem("token", res.data.access_token);
    await fetchMe();
    showToast("Logged in successfully", "success");
  };

  const register = async (payload) => {
    await api.post("/api/auth/register", payload);
    showToast("Account created — please log in", "success");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    showToast("Logged out", "info");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, showToast }}>
      {children}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-white font-body text-sm z-50 ${
            toast.type === "success" ? "bg-moss-600" : toast.type === "error" ? "bg-red-600" : "bg-clay-600"
          }`}
        >
          {toast.message}
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
