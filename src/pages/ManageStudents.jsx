import React, { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { SectionTitle, EmptyState } from "@/components/dashboard/StatCard";
import { Plus, Pencil, Trash2, Search, Upload, Download, RefreshCw, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { API } from "@/lib/api";

const empty = {
  roll_number: "", name: "", email: "", password: "Student@123",
  mobile: "", department_id: "", branch_id: "", section_id: "",
  year: 1, semester: 1, faculty_id: "", leetcode_username: "",
};

export default function ManageStudents() {
  const { user } = useAuth();
  const isFaculty = user?.role === "faculty";
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [deps, setDeps] = useState([]);
  const [branches, setBranches] = useState([]);
  const [sections, setSections] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...empty });
  const [csvFile, setCsvFile] = useState(null);

  const load = React.useCallback(async () => {
    const { data } = await api.get("/students", { params: { q, limit: 500 } });
    setItems(data.items); setTotal(data.total);
  }, [q]);

  const loadDicts = React.useCallback(async () => {
    const [d, b, s, f] = await Promise.all([
      api.get("/departments"),
      api.get("/branches"),
      api.get("/sections"),
      isFaculty ? Promise.resolve({ data: [] }) : api.get("/faculty"),
    ]);
    setDeps(d.data); setBranches(b.data); setSections(s.data); setFaculty(f.data);
  }, [isFaculty]);

  useEffect(() => { loadDicts(); }, [loadDicts]);
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  const save = async () => {
    try {
      if (editing) {
        const { password, email, ...rest } = form;
        await api.put(`/students/${editing.id}`, rest);
      } else {
        await api.post("/students", form);
      }
      toast.success("Saved");
      setOpen(false); setEditing(null); setForm({ ...empty }); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };
  const del = async (id) => { if (!confirm("Delete student?")) return; await api.delete(`/students/${id}`); toast.success("Deleted"); load(); };
  const edit = (s) => { setEditing(s); setForm({ ...empty, ...s, password: "" }); setOpen(true); };

  const syncOne = async (s) => {
    if (!s.leetcode_username) return toast.error("No LeetCode username");
    const p = api.post(`/sync/student/${s.id}`);
    toast.promise(p, { loading: `Syncing ${s.leetcode_username}…`, success: "Synced", error: (e) => e.response?.data?.detail || "Failed" });
    await p.catch(() => {});
    load();
  };

  const importCsv = async () => {
    if (!csvFile) return;
    const text = await csvFile.text();
    try {
      const { data } = await api.post("/students/import/csv", text, { headers: { "Content-Type": "text/plain" } });
      toast.success(`Imported ${data.created} student(s), ${data.failed.length} failed`);
      setCsvFile(null); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Import failed"); }
  };

  const exportUrl = `${API}/students/export/csv`;
  const templateUrl = `${API}/students/import/template`;

  const depName = (id) => deps.find((d) => d.id === id)?.name || "";
  const secName = (id) => sections.find((s) => s.id === id)?.name || "";

  return (
    <div>
      <SectionTitle
        sub={`Total ${total} student(s). Search, edit, sync and export.`}
        right={
          <div className="flex flex-wrap gap-2">
            {!isFaculty && (
              <a href={templateUrl} data-testid="download-csv-template-link" className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-sm text-xs link-hover flex items-center gap-2">
                <Download className="w-3.5 h-3.5" /> Template
              </a>
            )}
            {!isFaculty && (
              <label className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-sm text-xs cursor-pointer link-hover flex items-center gap-2">
                <Upload className="w-3.5 h-3.5" /> Import CSV
                <input data-testid="import-csv-input" type="file" accept=".csv" hidden onChange={(e) => setCsvFile(e.target.files?.[0])} />
              </label>
            )}
            {csvFile && !isFaculty && (
              <button data-testid="import-csv-button" onClick={importCsv} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-sm text-xs">Upload {csvFile.name}</button>
            )}
            <a href={exportUrl} data-testid="export-students-csv-link" className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-sm text-xs link-hover flex items-center gap-2">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </a>
            {!isFaculty && (
              <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v){setEditing(null); setForm({ ...empty });} }}>
                <DialogTrigger asChild>
                  <button data-testid="add-student-button" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-sm text-sm font-semibold flex items-center gap-2 link-hover"><Plus className="w-4 h-4" /> Add Student</button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-950 border-zinc-800 max-w-2xl">
                  <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Student</DialogTitle></DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="label-upper block mb-1.5">Roll Number</label>
                      <input data-testid="student-roll-input" value={form.roll_number} onChange={(e) => setForm({ ...form, roll_number: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-sm text-white mono outline-none focus:border-orange-500" />
                    </div>
                    <div>
                      <label className="label-upper block mb-1.5">Full Name</label>
                      <input data-testid="student-name-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-sm text-white outline-none focus:border-orange-500" />
                    </div>
                    <div>
                      <label className="label-upper block mb-1.5">Email</label>
                      <input data-testid="student-email-input" type="email" disabled={!!editing} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-sm text-white mono outline-none focus:border-orange-500 disabled:opacity-60" />
                    </div>
                    {!editing && (
                      <div>
                        <label className="label-upper block mb-1.5">Password</label>
                        <input data-testid="student-password-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-sm text-white mono outline-none focus:border-orange-500" />
                      </div>
                    )}
                    <div>
                      <label className="label-upper block mb-1.5">Mobile</label>
                      <input data-testid="student-mobile-input" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-sm text-white mono outline-none focus:border-orange-500" />
                    </div>
                    <div>
                      <label className="label-upper block mb-1.5">LeetCode Username</label>
                      <input data-testid="student-leetcode-input" value={form.leetcode_username} onChange={(e) => setForm({ ...form, leetcode_username: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-sm text-white mono outline-none focus:border-orange-500" placeholder="e.g., nSKWHoKvyX" />
                      <div className="text-[10px] text-zinc-500 mt-1">Just the username — not the full URL. `u/` prefix is auto-stripped.</div>
                    </div>
                    <div>
                      <label className="label-upper block mb-1.5">Department</label>
                      <Select value={form.department_id} onValueChange={(v) => setForm({ ...form, department_id: v })}>
                        <SelectTrigger data-testid="student-department-select" className="bg-zinc-900 border-zinc-800 text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-zinc-800">
                          {deps.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="label-upper block mb-1.5">Branch</label>
                      <Select value={form.branch_id} onValueChange={(v) => setForm({ ...form, branch_id: v })}>
                        <SelectTrigger data-testid="student-branch-select" className="bg-zinc-900 border-zinc-800 text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-zinc-800">
                          {branches.filter((b) => !form.department_id || b.department_id === form.department_id).map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="label-upper block mb-1.5">Section</label>
                      <Select value={form.section_id} onValueChange={(v) => setForm({ ...form, section_id: v })}>
                        <SelectTrigger data-testid="student-section-select" className="bg-zinc-900 border-zinc-800 text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-zinc-800">
                          {sections.filter((s) => !form.branch_id || s.branch_id === form.branch_id).map((s) => <SelectItem key={s.id} value={s.id}>{s.name} (Y{s.year})</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="label-upper block mb-1.5">Faculty</label>
                      <Select value={form.faculty_id} onValueChange={(v) => setForm({ ...form, faculty_id: v })}>
                        <SelectTrigger data-testid="student-faculty-select" className="bg-zinc-900 border-zinc-800 text-white"><SelectValue placeholder="Optional" /></SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-zinc-800">
                          {faculty.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label-upper block mb-1.5">Year</label>
                        <input data-testid="student-year-input" type="number" min="1" max="6" value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value || "1") })} className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-sm text-white mono outline-none focus:border-orange-500" />
                      </div>
                      <div>
                        <label className="label-upper block mb-1.5">Semester</label>
                        <input data-testid="student-semester-input" type="number" min="1" max="12" value={form.semester} onChange={(e) => setForm({ ...form, semester: parseInt(e.target.value || "1") })} className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-sm text-white mono outline-none focus:border-orange-500" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="mt-4">
                    <button data-testid="save-student-button" onClick={save} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-sm text-sm font-semibold">Save</button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        }
      >{isFaculty ? "My Students" : "Students"}</SectionTitle>

      <div className="mb-4 relative max-w-md">
        <Search className="w-4 h-4 absolute top-2.5 left-3 text-zinc-500" />
        <input
          data-testid="students-search-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, roll, email, LeetCode…"
          className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-sm outline-none focus:border-orange-500 text-sm"
        />
      </div>

      {items.length === 0 ? (
        <EmptyState title="No students found" sub="Add students to see them here." />
      ) : (
        <div className="border border-zinc-800 bg-zinc-900/50 overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="text-left text-zinc-500 label-upper border-b border-zinc-800">
                <th className="py-2.5 px-4">Roll</th>
                <th className="py-2.5 px-4">Name</th>
                <th className="py-2.5 px-4">LeetCode</th>
                <th className="py-2.5 px-4">Section</th>
                <th className="py-2.5 px-4 text-right">Total</th>
                <th className="py-2.5 px-4 text-right hidden md:table-cell">E/M/H</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => {
                const st = s.leetcode_stats || {};
                return (
                  <tr key={s.id} className="border-b border-zinc-900 hover:bg-zinc-900 link-hover">
                    <td className="py-3 px-4 mono text-orange-400">{s.roll_number}</td>
                    <td className="py-3 px-4">
                      <div className="text-white">{s.name}</div>
                      <div className="text-xs text-zinc-500 mono">{s.email}</div>
                    </td>
                    <td className="py-3 px-4 mono text-zinc-300">
                      {s.leetcode_username ? (
                        <a href={`https://leetcode.com/${s.leetcode_username}/`} target="_blank" rel="noreferrer" className="text-orange-500 hover:text-orange-400 link-hover inline-flex items-center gap-1">
                          {s.leetcode_username} <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : "—"}
                    </td>
                    <td className="py-3 px-4 text-zinc-400">{secName(s.section_id)}</td>
                    <td className="py-3 px-4 mono text-right text-orange-400 font-bold">{st.total_solved || 0}</td>
                    <td className="py-3 px-4 mono text-right hidden md:table-cell">
                      <span className="text-emerald-400">{st.easy || 0}</span> /{" "}
                      <span className="text-amber-400">{st.medium || 0}</span> /{" "}
                      <span className="text-rose-400">{st.hard || 0}</span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button data-testid={`sync-student-${s.roll_number}`} title="Sync" onClick={() => syncOne(s)} className="text-zinc-400 hover:text-orange-500 link-hover"><RefreshCw className="w-4 h-4 inline" /></button>
                      {!isFaculty && (
                        <>
                          <button data-testid={`edit-student-${s.roll_number}`} onClick={() => edit(s)} className="text-zinc-400 hover:text-white link-hover"><Pencil className="w-4 h-4 inline" /></button>
                          <button data-testid={`delete-student-${s.roll_number}`} onClick={() => del(s.id)} className="text-zinc-400 hover:text-rose-500 link-hover"><Trash2 className="w-4 h-4 inline" /></button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
