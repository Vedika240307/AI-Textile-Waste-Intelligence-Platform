import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/batches", label: "Batches" },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-moss-50">
      <aside className="w-60 bg-moss-800 text-moss-50 flex flex-col p-4">
        <h1 className="font-display font-semibold text-lg mb-8 leading-tight">
          Textile Waste<br />Intelligence
        </h1>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive ? "bg-moss-600" : "hover:bg-moss-700"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {user?.role === "admin" && (
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive ? "bg-moss-600" : "hover:bg-moss-700"
                }`
              }
            >
              Users
            </NavLink>
          )}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-moss-200 flex items-center justify-between px-6">
          <span className="font-display text-moss-800 font-medium">
            {user?.organization || "—"}
          </span>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-moss-900">{user?.name}</div>
              <div className="text-xs uppercase tracking-wide text-clay-600">{user?.role}</div>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm px-3 py-1.5 rounded-md border border-moss-300 hover:bg-moss-100 transition"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
