import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register, showToast } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    organization: "",
    role: "manufacturer",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      showToast(err.response?.data?.detail || "Registration failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-moss-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-8 border border-moss-200">
        <h1 className="font-display text-2xl font-semibold text-moss-800 mb-1">Create account</h1>
        <p className="text-sm text-moss-600 mb-6">Join the Textile Waste Intelligence Platform</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-moss-800">Full name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-md border border-moss-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-moss-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-moss-800">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full rounded-md border border-moss-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-moss-400"
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
            />
          </div>
          <div>
            <label className="text-sm font-medium text-moss-800">Organization</label>
            <input
              value={form.organization}
              onChange={(e) => setForm({ ...form, organization: e.target.value })}
              className="mt-1 w-full rounded-md border border-moss-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-moss-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-moss-800">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="mt-1 w-full rounded-md border border-moss-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-moss-400"
            >
              <option value="manufacturer">Manufacturer</option>
              <option value="operator">Recycling Operator</option>
              <option value="analyst">Sustainability Analyst</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 bg-moss-600 hover:bg-moss-700 text-white font-medium rounded-md py-2 text-sm transition disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-moss-600 mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-clay-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
