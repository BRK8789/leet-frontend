import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SectionTitle } from "@/components/dashboard/StatCard";
import { toast } from "sonner";

export default function Settings() {
  const [college, setCollege] = useState("");
  const [milestones, setMilestones] = useState("100,500");
  const [inactive, setInactive] = useState(14);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/settings");
      setCollege(data.college_name || "");
      const nt = data.notification_thresholds || {};
      setMilestones((nt.problem_milestone || [100, 500]).join(","));
      setInactive(nt.inactive_days || 14);
    })();
  }, []);

  const save = async () => {
    try {
      await api.put("/settings", {
        college_name: college,
        notification_thresholds: {
          problem_milestone: milestones.split(",").map((n) => parseInt(n.trim())).filter(Boolean),
          inactive_days: inactive,
        },
      });
      toast.success("Settings saved");
    } catch (e) { toast.error("Failed"); }
  };

  return (
    <div>
      <SectionTitle sub="Configure system-wide settings.">Settings</SectionTitle>

      <div className="border border-zinc-800 bg-zinc-900/50 p-5 max-w-xl space-y-4">
        <div>
          <label className="label-upper block mb-1.5">College Name</label>
          <input data-testid="settings-college-input" value={college} onChange={(e) => setCollege(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-sm text-white outline-none focus:border-orange-500" />
        </div>
        <div>
          <label className="label-upper block mb-1.5">Problem Milestones (comma-separated)</label>
          <input data-testid="settings-milestones-input" value={milestones} onChange={(e) => setMilestones(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-sm text-white mono outline-none focus:border-orange-500" />
        </div>
        <div>
          <label className="label-upper block mb-1.5">Inactive Days Threshold</label>
          <input data-testid="settings-inactive-input" type="number" min="1" value={inactive} onChange={(e) => setInactive(parseInt(e.target.value || "0"))} className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-sm text-white mono outline-none focus:border-orange-500" />
        </div>
        <button data-testid="save-settings-button" onClick={save} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-sm text-sm font-semibold link-hover">Save</button>
      </div>
    </div>
  );
}
