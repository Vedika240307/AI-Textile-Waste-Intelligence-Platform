import React, { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api.js";

const STATUS_COLORS = {
  Pending: "bg-clay-100 text-clay-700",
  Sorting: "bg-yellow-100 text-yellow-700",
  Processing: "bg-blue-100 text-blue-700",
  Recycled: "bg-moss-100 text-moss-700",
  Rejected: "bg-red-100 text-red-700",
};

export default function Batches() {
  const { user, showToast } = useAuth();
  const [batches, setBatches] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ weight_kg: "", fabric_type: "", notes: "" });
  const pageSize = 10;

  const loadBatches = async () => {
    const params = { page, page_size: pageSize };
    if (search) params.search = search;
    const res = await api.get("/api/batches", { params });
    setBatches(res.data.items);
    setTotal(res.data.total);
  };

  useEffect(() => {
    loadBatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/batches", {
        weight_kg: parseFloat(form.weight_kg),
        fabric_type: form.fabric_type || null,
        notes: form.notes || null,
      });
      showToast("Batch created", "success");
      setForm({ weight_kg: "", fabric_type: "", notes: "" });
      setShowForm(false);
      loadBatches();
    } catch (err) {
      showToast(err.response?.data?.detail || "Could not create batch", "error");
    }
  };

  const updateStatus = async (batchId, status) => {
    try {
      await api.put(`/api/batches/${batchId}`, { status });
      showToast(`Batch marked ${status}`, "success");
      loadBatches();
    } catch (err) {
      showToast(err.response?.data?.detail || "Update failed", "error");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-semibold text-moss-800">Batches</h2>
        {user?.role === "manufacturer" && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-moss-600 hover:bg-moss-700 text-white text-sm font-medium px-4 py-2 rounded-md transition"
          >
            {showForm ? "Cancel" : "+ New Batch"}
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white border border-moss-200 rounded-xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end"
        >
          <div>
            <label className="text-xs font-medium text-moss-700">Weight (kg)</label>
            <input
              required
              type="number"
              step="0.1"
              value={form.weight_kg}
              onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
              className="mt-1 w-full rounded-md border border-moss-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-moss-700">Fabric Type</label>
            <input
              value={form.fabric_type}
              onChange={(e) => setForm({ ...form, fabric_type: e.target.value })}
              placeholder="e.g. Cotton blend"
              className="mt-1 w-full rounded-md border border-moss-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-moss-700">Notes</label>
            <input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="mt-1 w-full rounded-md border border-moss-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-moss-600 hover:bg-moss-700 text-white text-sm font-medium px-4 py-2 rounded-md transition"
          >
            Create
          </button>
        </form>
      )}

      <div className="bg-white border border-moss-200 rounded-xl overflow-hidden">
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search by batch code or fabric type..."
          className="w-full px-4 py-3 text-sm border-b border-moss-200 focus:outline-none"
        />
        <table className="w-full text-sm">
          <thead className="bg-moss-50 text-moss-700 text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Batch Code</th>
              <th className="px-4 py-2 font-medium">Weight (kg)</th>
              <th className="px-4 py-2 font-medium">Fabric</th>
              <th className="px-4 py-2 font-medium">Status</th>
              {user?.role === "operator" && <th className="px-4 py-2 font-medium">Update</th>}
            </tr>
          </thead>
          <tbody>
            {batches.map((b) => (
              <tr key={b.id} className="border-t border-moss-100">
                <td className="px-4 py-2 font-medium text-moss-900">{b.batch_code}</td>
                <td className="px-4 py-2">{b.weight_kg}</td>
                <td className="px-4 py-2">{b.fabric_type || "—"}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[b.status]}`}>
                    {b.status}
                  </span>
                </td>
                {user?.role === "operator" && (
                  <td className="px-4 py-2">
                    <select
                      value={b.status}
                      onChange={(e) => updateStatus(b.id, e.target.value)}
                      className="text-xs border border-moss-300 rounded-md px-2 py-1"
                    >
                      {["Pending", "Sorting", "Processing", "Recycled", "Rejected"].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                )}
              </tr>
            ))}
            {batches.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-moss-500">
                  No batches found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-4 py-3 border-t border-moss-200 text-sm text-moss-600">
          <span>
            Page {page} of {totalPages} ({total} total)
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 rounded-md border border-moss-300 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 rounded-md border border-moss-300 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
