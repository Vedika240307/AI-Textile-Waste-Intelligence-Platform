import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, showToast } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      showToast(err.response?.data?.detail || "Login failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-moss-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-8 border border-moss-200">
        <h1 className="font-display text-2xl font-semibold text-moss-800 mb-1">Welcome back</h1>
        <p className="text-sm text-moss-600 mb-6">Sign in to the Textile Waste Intelligence Platform</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-moss-800">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full rounded-md border border-moss-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-moss-400"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-moss-800">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full rounded-md border border-moss-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-moss-400"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 bg-moss-600 hover:bg-moss-700 text-white font-medium rounded-md py-2 text-sm transition disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-moss-600 mt-6 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-clay-600 font-medium hover:underline">
            Register
          </Link>
        </p>

        <div className="mt-6 text-xs text-moss-500 bg-moss-50 rounded-md p-3 leading-relaxed">
          <strong>Demo accounts</strong> (password: Password123!):<br />
          admin@textilewaste.com · manufacturer@textilewaste.com<br />
          operator@textilewaste.com · analyst@textilewaste.com
        </div>
      </div>
    </div>
  );
}
