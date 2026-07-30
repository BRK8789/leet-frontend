import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SectionTitle } from "@/components/dashboard/StatCard";
import { Trophy, Medal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";

export default function Leaderboard() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [scope, setScope] = useState(user?.role === "faculty" ? "my" : "college");
  const [limit, setLimit] = useState(50);

  const load = React.useCallback(async () => {
    const { data } = await api.get("/leaderboard", { params: { scope, limit } });
    setRows(data);
  }, [scope, limit]);
  useEffect(() => { load(); }, [load]);

  const rankStyle = (r) => {
    if (r === 1) return "text-amber-300 font-black";
    if (r === 2) return "text-zinc-300 font-black";
    if (r === 3) return "text-orange-400 font-black";
    return "text-zinc-500";
  };

  return (
    <div>
      <SectionTitle
        sub="Ranked by total problems solved on LeetCode."
        right={
          <div className="flex gap-2">
            <Select value={scope} onValueChange={setScope}>
              <SelectTrigger data-testid="leaderboard-scope-select" className="w-36 bg-zinc-900 border-zinc-800 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800">
                <SelectItem value="college">College</SelectItem>
                {user?.role === "faculty" && <SelectItem value="my">My Students</SelectItem>}
              </SelectContent>
            </Select>
            <Select value={String(limit)} onValueChange={(v) => setLimit(parseInt(v))}>
              <SelectTrigger data-testid="leaderboard-limit-select" className="w-28 bg-zinc-900 border-zinc-800 text-white"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800">
                <SelectItem value="10">Top 10</SelectItem>
                <SelectItem value="50">Top 50</SelectItem>
                <SelectItem value="100">Top 100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      ><span className="inline-flex items-center gap-2"><Trophy className="w-8 h-8 text-orange-500" /> Leaderboard</span></SectionTitle>

      {rows.length === 0 ? (
        <div className="border border-dashed border-zinc-800 p-10 text-center text-zinc-500 mono">
          No ranked students yet. Sync LeetCode data first.
        </div>
      ) : (
        <div className="border border-zinc-800 bg-zinc-900/50 overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="text-left text-zinc-500 label-upper border-b border-zinc-800">
                <th className="py-2.5 px-4 w-14">Rank</th>
                <th className="py-2.5 px-4">Student</th>
                <th className="py-2.5 px-4">LeetCode</th>
                <th className="py-2.5 px-4 text-right">Total</th>
                <th className="py-2.5 px-4 text-right hidden md:table-cell">E / M / H</th>
                <th className="py-2.5 px-4 text-right hidden lg:table-cell">Contest</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-zinc-900 hover:bg-zinc-900 link-hover">
                  <td className={`py-3 px-4 mono ${rankStyle(r.rank)}`}>
                    {r.rank <= 3 ? <span className="inline-flex items-center gap-1"><Medal className="w-4 h-4" /> {r.rank}</span> : `#${r.rank}`}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-white">{r.name}</div>
                    <div className="text-xs text-zinc-500 mono">{r.roll_number}</div>
                  </td>
                  <td className="py-3 px-4 mono text-zinc-300">{r.leetcode_username}</td>
                  <td className="py-3 px-4 mono text-right text-orange-400 font-bold">{r.total_solved}</td>
                  <td className="py-3 px-4 mono text-right hidden md:table-cell">
                    <span className="text-emerald-400">{r.easy}</span> /{" "}
                    <span className="text-amber-400">{r.medium}</span> /{" "}
                    <span className="text-rose-400">{r.hard}</span>
                  </td>
                  <td className="py-3 px-4 mono text-right hidden lg:table-cell text-zinc-400">
                    {r.contest_rating ? Math.round(r.contest_rating) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
