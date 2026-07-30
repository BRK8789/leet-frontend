import React from "react";
import Sidebar from "@/components/layout/Sidebar";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />
      <main className="lg:pl-60 pt-14 lg:pt-0 min-h-screen">
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
