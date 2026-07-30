import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, Users, GraduationCap, Building2, Boxes, GitBranch,
  Trophy, BarChart3, RefreshCw, FileText, Settings, LogOut, Code2, Menu, X,
  User,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

function LinkItem({ to, icon: Icon, label, onClick, variant = "desktop" }) {
  return (
    <NavLink
      to={to}
      end
      onClick={onClick}
      data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}${variant === "mobile" ? "-mobile" : ""}`}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 text-sm border-l-2 link-hover ${
          isActive
            ? "border-orange-500 text-white bg-zinc-900"
            : "border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/70"
        }`
      }
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

function SidebarContent({ onNav, variant = "desktop" }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;

  const adminLinks = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/students", icon: GraduationCap, label: "Students" },
    { to: "/faculty", icon: Users, label: "Faculty" },
    { to: "/departments", icon: Building2, label: "Departments" },
    { to: "/branches", icon: GitBranch, label: "Branches" },
    { to: "/sections", icon: Boxes, label: "Sections" },
    { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { to: "/analytics", icon: BarChart3, label: "Analytics" },
    { to: "/sync", icon: RefreshCw, label: "Sync LeetCode" },
    { to: "/reports", icon: FileText, label: "Reports" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];
  const facultyLinks = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/students", icon: GraduationCap, label: "My Students" },
    { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { to: "/analytics", icon: BarChart3, label: "Analytics" },
    { to: "/reports", icon: FileText, label: "Reports" },
  ];
  const studentLinks = [
    { to: "/", icon: LayoutDashboard, label: "My Progress" },
    { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  const links =
    role === "admin" ? adminLinks : role === "faculty" ? facultyLinks : studentLinks;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-6 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center bg-orange-500 rounded-sm">
            <Code2 className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-black text-white text-sm tracking-tight">LEETRACK</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">
              {role} Console
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto">
        {links.map((l) => (
          <LinkItem key={l.to} {...l} onClick={onNav} variant={variant} />
        ))}
      </nav>

      <div className="border-t border-zinc-800 p-4 space-y-3">
        <div className="text-xs">
          <div className="text-white truncate">{user?.name}</div>
          <div className="text-zinc-500 mono truncate">{user?.email}</div>
        </div>
        <button
          data-testid="logout-button"
          onClick={async () => { await logout(); navigate("/login"); }}
          className="flex items-center gap-2 text-xs text-zinc-400 hover:text-orange-500 link-hover"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-60 flex-col border-r border-zinc-800 bg-zinc-950 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-xl flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 flex items-center justify-center bg-orange-500 rounded-sm">
            <Code2 className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-black text-white text-sm">LEETRACK</span>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button data-testid="mobile-menu-button" className="p-2 text-zinc-300 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 bg-zinc-950 border-zinc-800">
            <SidebarContent onNav={() => setOpen(false)} variant="mobile" />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
