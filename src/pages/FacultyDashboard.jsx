import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StatCard, SectionTitle } from "@/components/dashboard/StatCard";
import { Users, CheckCircle2, TrendingUp, Award } from "lucide-react";
import { Link } from "react-router-dom";

export default function FacultyDashboard() {
  const [summary, setSummary] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [s, st] = await Promise.all([
          api.get("/analytics/summary"),
          api.get("/students", { params: { limit: 10 } }),
        ]);
        setSummary(s.data);
        setStudents(st.data.items);
      } catch (e) { console.error(e); }
    })();
  }, []);

  if (!summary) return <div className="text-zinc-500 mono">Loading…</div>;
  const t = summary.totals || {};

  return (
    <div>
      <SectionTitle sub="Monitor your assigned students at a glance.">Faculty Dashboard</SectionTitle>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        <StatCard label="My Students" value={summary.total_students} icon={Users} testid="stat-my-students" />
        <StatCard label="Active" value={summary.active_students} icon={CheckCircle2} accent="text-emerald-400" />
        <StatCard label="Avg Solved" value={summary.avg_per_student} icon={TrendingUp} accent="text-orange-400" />
        <StatCard label="Total Solved" value={t.total_solved || 0} icon={Award} />
      </div>

      <div className="border border-zinc-800 bg-zinc-900/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="label-upper">Top of my students</div>
          <Link to="/students" data-testid="view-my-students-link" className="text-xs text-orange-500 hover:text-orange-400 link-hover">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500 label-upper border-b border-zinc-800">
                <th className="py-2 px-2">Name</th>
                <th className="py-2 px-2">Roll</th>
                <th className="py-2 px-2">LeetCode</th>
                <th className="py-2 px-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-zinc-900 hover:bg-zinc-900 link-hover">
                  <td className="py-2.5 px-2 text-white">{s.name}</td>
                  <td className="py-2.5 px-2 mono text-zinc-400">{s.roll_number}</td>
                  <td className="py-2.5 px-2 mono text-zinc-300">{s.leetcode_username || "—"}</td>
                  <td className="py-2.5 px-2 mono text-right text-orange-400">{(s.leetcode_stats?.total_solved) || 0}</td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan="4" className="py-6 text-center text-zinc-500 text-sm">No students assigned yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
