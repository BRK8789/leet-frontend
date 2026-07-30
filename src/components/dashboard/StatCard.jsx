import React from "react";

export function StatCard({ label, value, icon: Icon, accent = "text-white", testid }) {
  return (
    <div
      data-testid={testid}
      className="border border-zinc-800 bg-zinc-900/50 p-5 flex items-start justify-between"
    >
      <div className="min-w-0">
        <div className="label-upper mb-2">{label}</div>
        <div className={`text-3xl md:text-4xl font-mono font-bold ${accent}`}>{value}</div>
      </div>
      {Icon && (
        <Icon className="w-5 h-5 text-zinc-500 shrink-0 mt-1" strokeWidth={1.5} />
      )}
    </div>
  );
}

export function SectionTitle({ children, sub, right }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white">{children}</h1>
        {sub && <p className="text-sm text-zinc-400 mt-1">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function EmptyState({ title, sub, action }) {
  return (
    <div className="border border-dashed border-zinc-800 p-10 text-center bg-zinc-900/30">
      <div className="text-white font-semibold">{title}</div>
      {sub && <div className="text-sm text-zinc-500 mt-1">{sub}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
