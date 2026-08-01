import React, { useState } from "react";
import { SectionTitle } from "@/components/dashboard/StatCard";
import { FileText, FileSpreadsheet, FileType } from "lucide-react";
import { API, api } from "@/lib/api";

export default function Reports() {
  const [downloading, setDownloading] = useState(null);

  const items = [
    { fmt: "csv", label: "CSV", icon: FileText, color: "text-emerald-400" },
    { fmt: "xlsx", label: "Excel", icon: FileSpreadsheet, color: "text-orange-400" },
    { fmt: "pdf", label: "PDF", icon: FileType, color: "text-rose-400" },
  ];

  const handleDownload = async (fmt) => {
    setDownloading(fmt);
    try {
      const response = await api.get(`/reports/students?format=${fmt}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `student_report.${fmt}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback to direct URL if blob fetch fails
      window.open(`${API}/reports/students?format=${fmt}`, "_blank");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div>
      <SectionTitle sub="Download student progress reports.">Reports</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((it) => (
          <button
            key={it.fmt}
            type="button"
            onClick={() => handleDownload(it.fmt)}
            disabled={downloading === it.fmt}
            data-testid={`download-report-${it.fmt}`}
            className="border border-zinc-800 hover:border-orange-500 bg-zinc-900/50 p-6 flex flex-col items-start gap-3 text-left transition-all hover:bg-zinc-800/40 disabled:opacity-50 cursor-pointer w-full"
          >
            <it.icon className={`w-8 h-8 ${it.color}`} strokeWidth={1.5} />
            <div>
              <div className="text-white font-semibold">Student Report — {it.label}</div>
              <div className="text-xs text-zinc-500 mt-1">All students with LeetCode statistics.</div>
            </div>
            <div className="text-xs mono text-orange-500 mt-2">
              {downloading === it.fmt ? "Downloading..." : "Download →"}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
