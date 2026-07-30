import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SectionTitle } from "@/components/dashboard/StatCard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from "recharts";

const COLORS = ["#34d399", "#fbbf24", "#f43f5e"];

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [byDep, setByDep] = useState([]);
  const [byYear, setByYear] = useState([]);

  useEffect(() => {
    (async () => {
      const [s, d, y] = await Promise.all([
        api.get("/analytics/summary"),
        api.get("/analytics/by-department"),
        api.get("/analytics/by-year"),
      ]);
      setSummary(s.data); setByDep(d.data); setByYear(y.data);
    })();
  }, []);

  if (!summary) return <div className="text-zinc-500 mono">Loading…</div>;
  const t = summary.totals || {};
  const pieData = [
    { name: "Easy", value: t.easy || 0 },
    { name: "Medium", value: t.medium || 0 },
    { name: "Hard", value: t.hard || 0 },
  ];

  return (
    <div>
      <SectionTitle sub="Deeper breakdowns of LeetCode performance across the college.">Analytics</SectionTitle>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        <div className="border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="label-upper mb-4">Difficulty Distribution</div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={100} strokeWidth={1} stroke="#09090b">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="label-upper mb-4">Problems by Department</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byDep}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
              <XAxis dataKey="department_name" stroke="#71717a" fontSize={11} />
              <YAxis stroke="#71717a" fontSize={11} />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a" }} />
              <Legend />
              <Bar dataKey="easy" stackId="a" fill="#34d399" />
              <Bar dataKey="medium" stackId="a" fill="#fbbf24" />
              <Bar dataKey="hard" stackId="a" fill="#f43f5e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="border border-zinc-800 bg-zinc-900/50 p-5">
        <div className="label-upper mb-4">Progress by Year</div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={byYear}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis dataKey="year" stroke="#71717a" fontSize={11} />
            <YAxis stroke="#71717a" fontSize={11} />
            <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a" }} />
            <Legend />
            <Line type="monotone" dataKey="total_solved" stroke="#f97316" strokeWidth={2} dot={{ fill: "#f97316" }} />
            <Line type="monotone" dataKey="students" stroke="#34d399" strokeWidth={2} dot={{ fill: "#34d399" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
