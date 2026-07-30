import React, { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { SectionTitle } from "@/components/dashboard/StatCard";
import { RefreshCw, Play, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function SyncModule() {
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const pollRef = useRef(null);

  const loadHistory = async () => {
    const { data } = await api.get("/sync/logs");
    setHistory(data);
  };

  useEffect(() => { loadHistory(); }, []);

  const poll = (id) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await api.get(`/sync/status/${id}`);
        setStatus(data);
        if (data.status === "completed") {
          clearInterval(pollRef.current);
          setRunning(false);
          toast.success("Sync completed");
          loadHistory();
        }
      } catch { clearInterval(pollRef.current); setRunning(false); }
    }, 1500);
  };

  const startSync = async () => {
    setRunning(true);
    setStatus({ status: "running", total: 0, success: 0, failed: 0, logs: [] });
    try {
      const { data } = await api.post("/sync/leetcode");
      poll(data.sync_id);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to start");
      setRunning(false);
    }
  };

  useEffect(() => () => pollRef.current && clearInterval(pollRef.current), []);

  const pct = status?.total ? Math.round(((status.success + status.failed) / status.total) * 100) : 0;

  return (
    <div>
      <SectionTitle
        sub="Fetch fresh LeetCode statistics for every student with a registered username."
        right={
          <button
            data-testid="sync-leetcode-data-button"
            onClick={startSync}
            disabled={running}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-4 py-2 rounded-sm text-sm font-semibold flex items-center gap-2 link-hover"
          >
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {running ? "Syncing…" : "Sync LeetCode Data"}
          </button>
        }
      >Sync LeetCode</SectionTitle>

      {status && (
        <div className="border border-zinc-800 bg-zinc-900/50 p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="label-upper">Current Run</div>
            <div className="mono text-xs text-zinc-400">
              {status.success + status.failed} / {status.total || "?"}
              <span className="ml-3 text-emerald-400">✓ {status.success}</span>
              <span className="ml-3 text-rose-400">✗ {status.failed}</span>
            </div>
          </div>
          <Progress value={pct} className="h-2 bg-zinc-800" />
          <div className="mt-4 bg-black border border-zinc-800 p-3 h-56 overflow-auto mono text-xs text-zinc-300 rounded-sm">
            {(status.logs || []).map((l, i) => (
              <div key={i} className={l.startsWith("[OK]") ? "text-emerald-400" : l.startsWith("[FAIL]") ? "text-amber-400" : l.startsWith("[ERROR]") ? "text-rose-400" : "text-zinc-400"}>
                {l}
              </div>
            ))}
            {(status.logs || []).length === 0 && <div className="text-zinc-500">Waiting for logs…</div>}
          </div>
        </div>
      )}

      <div className="border border-zinc-800 bg-zinc-900/50 p-5">
        <div className="label-upper mb-4">Recent Runs</div>
        {history.length === 0 ? (
          <div className="text-zinc-500 text-sm mono">No sync history yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-zinc-500 label-upper border-b border-zinc-800">
                  <th className="py-2 px-2">Started</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-2 text-right">Total</th>
                  <th className="py-2 px-2 text-right">Success</th>
                  <th className="py-2 px-2 text-right">Failed</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-b border-zinc-900">
                    <td className="py-2 px-2 mono text-zinc-300">{h.started_at?.replace("T", " ").slice(0, 19)}</td>
                    <td className="py-2 px-2">
                      <span className={`text-xs px-2 py-0.5 rounded-sm mono ${h.status === "completed" ? "bg-emerald-900/30 text-emerald-400" : "bg-amber-900/30 text-amber-400"}`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right mono">{h.total}</td>
                    <td className="py-2 px-2 text-right mono text-emerald-400">{h.success}</td>
                    <td className="py-2 px-2 text-right mono text-rose-400">{h.failed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
