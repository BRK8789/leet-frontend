import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SectionTitle, EmptyState } from "@/components/dashboard/StatCard";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ManageSections() {
  const [items, setItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", branch_id: "", year: 1, semester: 1 });

  const load = async () => {
    const [s, b] = await Promise.all([api.get("/sections"), api.get("/branches")]);
    setItems(s.data); setBranches(b.data);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      if (editing) await api.put(`/sections/${editing.id}`, form);
      else await api.post("/sections", form);
      toast.success("Saved"); setOpen(false); setEditing(null); setForm({ name: "", branch_id: "", year: 1, semester: 1 }); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };
  const del = async (id) => { if (!confirm("Delete section?")) return; await api.delete(`/sections/${id}`); toast.success("Deleted"); load(); };
  const edit = (s) => { setEditing(s); setForm({ name: s.name, branch_id: s.branch_id, year: s.year, semester: s.semester }); setOpen(true); };
  const branchName = (id) => branches.find((b) => b.id === id)?.name || "—";

  return (
    <div>
      <SectionTitle
        sub="Sections group students within a branch and year."
        right={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v){setEditing(null); setForm({ name: "", branch_id: "", year: 1, semester: 1 });} }}>
            <DialogTrigger asChild>
              <button data-testid="add-section-button" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-sm text-sm font-semibold flex items-center gap-2 link-hover"><Plus className="w-4 h-4" /> Add Section</button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800">
              <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Section</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <label className="label-upper block mb-1.5">Branch</label>
                  <Select value={form.branch_id} onValueChange={(v) => setForm({ ...form, branch_id: v })}>
                    <SelectTrigger data-testid="section-branch-select" className="bg-zinc-900 border-zinc-800 text-white"><SelectValue placeholder="Select branch" /></SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800">
                      {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="label-upper block mb-1.5">Section Name</label>
                  <input data-testid="section-name-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-sm text-white outline-none focus:border-orange-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-upper block mb-1.5">Year</label>
                    <input data-testid="section-year-input" type="number" min="1" max="6" value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value || "1") })} className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-sm text-white outline-none focus:border-orange-500 mono" />
                  </div>
                  <div>
                    <label className="label-upper block mb-1.5">Semester</label>
                    <input data-testid="section-semester-input" type="number" min="1" max="12" value={form.semester} onChange={(e) => setForm({ ...form, semester: parseInt(e.target.value || "1") })} className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-sm text-white outline-none focus:border-orange-500 mono" />
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <button data-testid="save-section-button" onClick={save} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-sm text-sm font-semibold">Save</button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >Sections</SectionTitle>

      {items.length === 0 ? (
        <EmptyState title="No sections yet" sub="Add a branch first, then create sections." />
      ) : (
        <div className="border border-zinc-800 bg-zinc-900/50 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500 label-upper border-b border-zinc-800">
                <th className="py-2.5 px-4">Section</th>
                <th className="py-2.5 px-4">Branch</th>
                <th className="py-2.5 px-4">Year</th>
                <th className="py-2.5 px-4">Sem</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-b border-zinc-900 hover:bg-zinc-900 link-hover">
                  <td className="py-3 px-4 text-white font-medium">{s.name}</td>
                  <td className="py-3 px-4 text-zinc-300">{branchName(s.branch_id)}</td>
                  <td className="py-3 px-4 mono text-orange-400">{s.year}</td>
                  <td className="py-3 px-4 mono text-zinc-400">{s.semester}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button data-testid={`edit-section-${s.id}`} onClick={() => edit(s)} className="text-zinc-400 hover:text-white link-hover"><Pencil className="w-4 h-4 inline" /></button>
                    <button data-testid={`delete-section-${s.id}`} onClick={() => del(s.id)} className="text-zinc-400 hover:text-rose-500 link-hover"><Trash2 className="w-4 h-4 inline" /></button>
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
