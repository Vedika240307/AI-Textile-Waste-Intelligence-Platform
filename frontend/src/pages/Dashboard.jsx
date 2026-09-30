import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Layout from "../components/Layout.jsx";
import api from "../api.js";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/dashboard/summary").then((res) => {
      setSummary(res.data);
      setLoading(false);
    });
  }, []);

  const chartData = summary
    ? Object.entries(summary.by_status).map(([status, count]) => ({ status, count }))
    : [];

  return (
    <Layout>
      <h2 className="font-display text-xl font-semibold text-moss-800 mb-6">Dashboard</h2>

      {loading ? (
        <p className="text-moss-600 text-sm">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard label="Total Batches" value={summary.total_batches} />
            <StatCard label="Total Weight (kg)" value={summary.total_weight_kg.toFixed(1)} />
            <StatCard
              label="Avg. Circularity Score"
              value={summary.average_circularity_score ? summary.average_circularity_score.toFixed(1) : "—"}
            />
          </div>

          <div className="bg-white rounded-xl border border-moss-200 p-6">
            <h3 className="font-display text-sm font-medium text-moss-700 mb-4">Batches by Status</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3ebd9" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6b8c47" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Layout>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-moss-200 p-5">
      <div className="text-xs uppercase tracking-wide text-clay-600 font-medium mb-1">{label}</div>
      <div className="font-display text-2xl font-semibold text-moss-900">{value}</div>
    </div>
  );
}
