import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { StatCard, SectionTitle } from "@/components/dashboard/StatCard";
import { Trophy, RefreshCw, Award, Flame, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#34d399", "#fbbf24", "#f43f5e"];

export default function StudentDashboard() {
  const { user, refreshUser } = useAuth();
  const [data, setData] = useState(null);
  const [uname, setUname] = useState(user?.leetcode_username || "");
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const load = React.useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data } = await api.get(`/students/${user.id}`);
      setData(data);
      setUname(data.leetcode_username || "");
    } catch (e) { console.error(e); }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const saveUsername = async () => {
    setSaving(true);
    try {
      await api.post("/students/me/leetcode-username", { leetcode_username: uname });
      toast.success("LeetCode username updated");
      await refreshUser();
      await load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to save");
    }
    setSaving(false);
  };

  const syncNow = async () => {
    setSyncing(true);
    try {
      await api.post(`/sync/student/${user.id}`);
      toast.success("Synced successfully");
      await load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Sync failed");
    }
    setSyncing(false);
  };

  const stats = data?.leetcode_stats || {};
  const pieData = [
    { name: "Easy", value: stats.easy || 0 },
    { name: "Medium", value: stats.medium || 0 },
    { name: "Hard", value: stats.hard || 0 },
  ];

  return (
    <div>
      <SectionTitle sub={`Welcome back, ${user?.name}. Keep grinding.`}>
        My Progress
      </SectionTitle>

      {/* LeetCode username setup */}
      <div className="border border-zinc-800 bg-zinc-900/50 p-5 mb-6">
        <div className="label-upper mb-3">LeetCode Username</div>
        <div className="text-xs text-zinc-500 mb-3">
          Enter just the username — not the full URL. If your profile is{" "}
          <span className="mono text-zinc-300">leetcode.com/u/nSKWHoKvyX/</span>, enter{" "}
          <span className="mono text-orange-400">nSKWHoKvyX</span>. The <span className="mono">u/</span> prefix and full URLs are auto-stripped.
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            data-testid="student-leetcode-username-input"
            className="flex-1 bg-zinc-950 border border-zinc-800 px-3 py-2 text-white rounded-sm mono outline-none focus:border-orange-500"
            value={uname}
            onChange={(e) => setUname(e.target.value)}
            placeholder="e.g., nSKWHoKvyX (just the username)"
          />
          <button
            data-testid="save-leetcode-username-button"
            onClick={saveUsername}
            disabled={saving || !uname.trim()}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-4 py-2 rounded-sm text-sm font-semibold link-hover"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            data-testid="student-sync-button"
            onClick={syncNow}
            disabled={syncing || !data?.leetcode_username}
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-sm text-sm font-semibold link-hover flex items-center gap-2 disabled:opacity-60"
          >
            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Sync now
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard testid="student-total-solved" label="Total Solved" value={stats.total_solved || 0} icon={Award} accent="text-orange-400" />
        <StatCard testid="student-easy" label="Easy" value={stats.easy || 0} accent="text-emerald-400" />
        <StatCard testid="student-medium" label="Medium" value={stats.medium || 0} accent="text-amber-400" />
        <StatCard testid="student-hard" label="Hard" value={stats.hard || 0} accent="text-rose-400" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        <StatCard testid="student-streak" label="Streak" value={stats.streak || 0} icon={Flame} accent="text-orange-400" />
        <StatCard testid="student-active-days" label="Active Days" value={stats.total_active_days || 0} />
        <StatCard testid="student-contest-rating" label="Contest Rating" value={stats.contest_rating ? Math.round(stats.contest_rating) : "—"} icon={Trophy} />
        <StatCard testid="student-badges" label="Badges" value={stats.badges_count || 0} />
      </div>

      {stats.total_solved > 0 && (
        <div className="border border-zinc-800 bg-zinc-900/50 p-5 mb-8">
          <div className="label-upper mb-4">Difficulty Split</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={55} outerRadius={95} strokeWidth={1} stroke="#09090b">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {data?.leetcode_username && (
        <a
          href={`https://leetcode.com/${data.leetcode_username}/`}
          target="_blank"
          rel="noreferrer"
          data-testid="view-leetcode-profile-link"
          className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 text-sm link-hover"
        >
          View LeetCode profile <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
}
