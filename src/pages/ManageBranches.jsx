import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SectionTitle, EmptyState } from "@/components/dashboard/StatCard";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ManageBranches() {
  const [items, setItems] = useState([]);
  const [deps, setDeps] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", code: "", department_id: "" });

  const load = async () => {
    const [b, d] = await Promise.all([api.get("/branches"), api.get("/departments")]);
    setItems(b.data); setDeps(d.data);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      if (editing) await api.put(`/branches/${editing.id}`, form);
      else await api.post("/branches", form);
      toast.success("Saved"); setOpen(false); setEditing(null); setForm({ name: "", code: "", department_id: "" }); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };
  const del = async (id) => { if (!confirm("Delete branch?")) return; await api.delete(`/branches/${id}`); toast.success("Deleted"); load(); };
  const edit = (b) => { setEditing(b); setForm({ name: b.name, code: b.code, department_id: b.department_id }); setOpen(true); };
  const depName = (id) => deps.find((d) => d.id === id)?.name || "—";

  return (
    <div>
      <SectionTitle
        sub="Manage branches under departments (e.g., CSE, ECE)."
        right={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v){setEditing(null); setForm({ name: "", code: "", department_id: "" });} }}>
            <DialogTrigger asChild>
              <button data-testid="add-branch-button" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-sm text-sm font-semibold flex items-center gap-2 link-hover">
                <Plus className="w-4 h-4" /> Add Branch
              </button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800">
              <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Branch</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <label className="label-upper block mb-1.5">Department</label>
                  <Select value={form.department_id} onValueChange={(v) => setForm({ ...form, department_id: v })}>
                    <SelectTrigger data-testid="branch-department-select" className="bg-zinc-900 border-zinc-800 text-white"><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800">
                      {deps.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="label-upper block mb-1.5">Name</label>
                  <input data-testid="branch-name-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-sm text-white outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="label-upper block mb-1.5">Code</label>
                  <input data-testid="branch-code-input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-sm text-white outline-none focus:border-orange-500 mono uppercase" />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <button data-testid="save-branch-button" onClick={save} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-sm text-sm font-semibold">Save</button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >Branches</SectionTitle>

      {items.length === 0 ? (
        <EmptyState title="No branches yet" sub="Create a department first, then add branches under it." />
      ) : (
        <div className="border border-zinc-800 bg-zinc-900/50 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500 label-upper border-b border-zinc-800">
                <th className="py-2.5 px-4">Code</th>
                <th className="py-2.5 px-4">Name</th>
                <th className="py-2.5 px-4">Department</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id} className="border-b border-zinc-900 hover:bg-zinc-900 link-hover">
                  <td className="py-3 px-4 mono text-orange-400">{b.code}</td>
                  <td className="py-3 px-4 text-white">{b.name}</td>
                  <td className="py-3 px-4 text-zinc-300">{depName(b.department_id)}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button data-testid={`edit-branch-${b.code}`} onClick={() => edit(b)} className="text-zinc-400 hover:text-white link-hover"><Pencil className="w-4 h-4 inline" /></button>
                    <button data-testid={`delete-branch-${b.code}`} onClick={() => del(b.id)} className="text-zinc-400 hover:text-rose-500 link-hover"><Trash2 className="w-4 h-4 inline" /></button>
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
