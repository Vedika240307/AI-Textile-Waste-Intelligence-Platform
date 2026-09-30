import React, { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api.js";

const ROLES = ["admin", "manufacturer", "operator", "analyst"];

export default function Users() {
  const { showToast } = useAuth();
  const [users, setUsers] = useState([]);

  const load = () => api.get("/api/users").then((res) => setUsers(res.data));

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (userId, role) => {
    try {
      await api.put(`/api/users/${userId}/role`, { role });
      showToast("Role updated", "success");
      load();
    } catch (err) {
      showToast(err.response?.data?.detail || "Update failed", "error");
    }
  };

  return (
    <Layout>
      <h2 className="font-display text-xl font-semibold text-moss-800 mb-6">Users</h2>
      <div className="bg-white border border-moss-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-moss-50 text-moss-700 text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Organization</th>
              <th className="px-4 py-2 font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-moss-100">
                <td className="px-4 py-2 font-medium text-moss-900">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.organization || "—"}</td>
                <td className="px-4 py-2">
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    className="text-xs border border-moss-300 rounded-md px-2 py-1"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
