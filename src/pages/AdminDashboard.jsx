import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StatCard, SectionTitle } from "@/components/dashboard/StatCard";
import { Users, CheckCircle2, XCircle, Award, TrendingUp, Trophy } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Link } from "react-router-dom";

const COLORS = ["#34d399", "#fbbf24", "#f43f5e"];

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [byDep, setByDep] = useState([]);
  const [byYear, setByYear] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [s, d, y] = await Promise.all([
          api.get("/analytics/summary"),
          api.get("/analytics/by-department"),
          api.get("/analytics/by-year"),
        ]);
        setSummary(s.data);
        setByDep(d.data);
        setByYear(y.data);
      } catch (e) { console.error(e); }
    })();
  }, []);

  if (!summary) {
    return <div className="text-zinc-500 mono">Loading dashboard…</div>;
  }

  const t = summary.totals || {};
  const pieData = [
    { name: "Easy", value: t.easy || 0 },
    { name: "Medium", value: t.medium || 0 },
    { name: "Hard", value: t.hard || 0 },
  ];

  return (
    <div>
      <SectionTitle sub="Overview of all students and their LeetCode progress.">
        Admin Dashboard
      </SectionTitle>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        <StatCard testid="stat-total-students" label="Total Students" value={summary.total_students} icon={Users} />
        <StatCard testid="stat-active-students" label="Active" value={summary.active_students} icon={CheckCircle2} accent="text-emerald-400" />
        <StatCard testid="stat-inactive-students" label="Inactive" value={summary.inactive_students} icon={XCircle} accent="text-rose-400" />
        <StatCard testid="stat-avg-per-student" label="Avg / Student" value={summary.avg_per_student} icon={TrendingUp} accent="text-orange-400" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-10">
        <StatCard testid="stat-total-solved" label="Total Solved" value={t.total_solved || 0} icon={Award} accent="text-white" />
        <StatCard testid="stat-easy" label="Easy" value={t.easy || 0} accent="text-emerald-400" />
        <StatCard testid="stat-medium" label="Medium" value={t.medium || 0} accent="text-amber-400" />
        <StatCard testid="stat-hard" label="Hard" value={t.hard || 0} accent="text-rose-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-10">
        <div className="border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="label-upper mb-4">Difficulty Distribution</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                cx="50%" cy="50%"
                innerRadius={55}
                outerRadius={95}
                strokeWidth={1}
                stroke="#09090b"
              >
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 0 }}
                labelStyle={{ color: "#fafafa" }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="label-upper mb-4">Problems Solved by Department</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byDep}>
              <XAxis dataKey="department_name" stroke="#71717a" fontSize={11} />
              <YAxis stroke="#71717a" fontSize={11} />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 0 }}
              />
              <Bar dataKey="total_solved" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="border border-zinc-800 bg-zinc-900/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="label-upper">Top Performers</div>
          <Link
            to="/leaderboard"
            data-testid="view-leaderboard-link"
            className="text-xs text-orange-500 hover:text-orange-400 link-hover flex items-center gap-1"
          >
            <Trophy className="w-3.5 h-3.5" /> Full leaderboard →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500 label-upper border-b border-zinc-800">
                <th className="py-2 px-2">#</th>
                <th className="py-2 px-2">Student</th>
                <th className="py-2 px-2">LeetCode</th>
                <th className="py-2 px-2 text-right">Total</th>
                <th className="py-2 px-2 text-right hidden md:table-cell">E / M / H</th>
              </tr>
            </thead>
            <tbody>
              {summary.top_performers.map((p, i) => (
                <tr key={p.id} className="border-b border-zinc-900 hover:bg-zinc-900 link-hover">
                  <td className="py-2.5 px-2 mono text-zinc-500">{i + 1}</td>
                  <td className="py-2.5 px-2">
                    <div className="font-medium text-white">{p.name}</div>
                    <div className="text-xs text-zinc-500 mono">{p.roll_number}</div>
                  </td>
                  <td className="py-2.5 px-2 mono text-zinc-300">{p.leetcode_username}</td>
                  <td className="py-2.5 px-2 mono text-right text-orange-400 font-bold">{p.total_solved}</td>
                  <td className="py-2.5 px-2 mono text-right hidden md:table-cell text-zinc-400">
                    <span className="text-emerald-400">{p.easy}</span> /{" "}
                    <span className="text-amber-400">{p.medium}</span> /{" "}
                    <span className="text-rose-400">{p.hard}</span>
                  </td>
                </tr>
              ))}
              {summary.top_performers.length === 0 && (
                <tr><td colSpan="5" className="py-6 text-center text-zinc-500 mono text-sm">
                  No data yet. Add students with LeetCode usernames and run a sync.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
