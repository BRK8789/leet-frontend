import React from "react";
import { SectionTitle } from "@/components/dashboard/StatCard";
import { FileText, FileSpreadsheet, FileType } from "lucide-react";
import { API } from "@/lib/api";

export default function Reports() {
  const items = [
    { fmt: "csv", label: "CSV", icon: FileText, color: "text-emerald-400" },
    { fmt: "xlsx", label: "Excel", icon: FileSpreadsheet, color: "text-orange-400" },
    { fmt: "pdf", label: "PDF", icon: FileType, color: "text-rose-400" },
  ];
  return (
    <div>
      <SectionTitle sub="Download student progress reports.">Reports</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((it) => (
          <a
            key={it.fmt}
            href={`${API}/reports/students?format=${it.fmt}`}
            data-testid={`download-report-${it.fmt}`}
            className="border border-zinc-800 hover:border-orange-500 bg-zinc-900/50 p-6 flex flex-col items-start gap-3 link-hover"
          >
            <it.icon className={`w-8 h-8 ${it.color}`} strokeWidth={1.5} />
            <div>
              <div className="text-white font-semibold">Student Report — {it.label}</div>
              <div className="text-xs text-zinc-500 mt-1">All students with LeetCode statistics.</div>
            </div>
            <div className="text-xs mono text-orange-500 mt-2">Download →</div>
          </a>
        ))}
      </div>
    </div>
  );
}
