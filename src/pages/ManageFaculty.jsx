import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SectionTitle, EmptyState } from "@/components/dashboard/StatCard";
import { Plus, Pencil, Trash2, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ManageFaculty() {
  const [items, setItems] = useState([]);
  const [deps, setDeps] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "Faculty@123", mobile: "", department_id: "" });

  const load = async () => {
    const [f, d] = await Promise.all([api.get("/faculty"), api.get("/departments")]);
    setItems(f.data); setDeps(d.data);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      if (editing) {
        const { password, email, ...rest } = form; // don't send password/email in update
        await api.put(`/faculty/${editing.id}`, rest);
      } else {
        await api.post("/faculty", form);
      }
      toast.success("Saved"); setOpen(false); setEditing(null);
      setForm({ name: "", email: "", password: "Faculty@123", mobile: "", department_id: "" });
      load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };
  const del = async (id) => { if (!confirm("Delete faculty?")) return; await api.delete(`/faculty/${id}`); toast.success("Deleted"); load(); };
  const edit = (f) => { setEditing(f); setForm({ name: f.name, email: f.email, password: "", mobile: f.mobile || "", department_id: f.department_id || "" }); setOpen(true); };
  const depName = (id) => deps.find((d) => d.id === id)?.name || "—";

  return (
    <div>
      <SectionTitle
        sub="Add faculty members and assign them to departments."
        right={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v){setEditing(null); setForm({ name: "", email: "", password: "Faculty@123", mobile: "", department_id: "" });} }}>
            <DialogTrigger asChild>
              <button data-testid="add-faculty-button" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-sm text-sm font-semibold flex items-center gap-2 link-hover"><Plus className="w-4 h-4" /> Add Faculty</button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800">
              <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Faculty</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <label className="label-upper block mb-1.5">Full Name</label>
                  <input data-testid="faculty-name-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-sm text-white outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="label-upper block mb-1.5">Email</label>
                  <input data-testid="faculty-email-input" type="email" disabled={!!editing} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-sm text-white outline-none focus:border-orange-500 mono disabled:opacity-60" />
                </div>
                {!editing && (
                  <div>
                    <label className="label-upper block mb-1.5">Password</label>
                    <input data-testid="faculty-password-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-sm text-white outline-none focus:border-orange-500 mono" />
                  </div>
                )}
                <div>
                  <label className="label-upper block mb-1.5">Mobile</label>
                  <input data-testid="faculty-mobile-input" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-sm text-white outline-none focus:border-orange-500 mono" />
                </div>
                <div>
                  <label className="label-upper block mb-1.5">Department</label>
                  <Select value={form.department_id} onValueChange={(v) => setForm({ ...form, department_id: v })}>
                    <SelectTrigger data-testid="faculty-department-select" className="bg-zinc-900 border-zinc-800 text-white"><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800">
                      {deps.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <button data-testid="save-faculty-button" onClick={save} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-sm text-sm font-semibold">Save</button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >Faculty</SectionTitle>

      {items.length === 0 ? (
        <EmptyState title="No faculty yet" sub="Add a faculty member to start assigning students." />
      ) : (
        <div className="border border-zinc-800 bg-zinc-900/50 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500 label-upper border-b border-zinc-800">
                <th className="py-2.5 px-4">Name</th>
                <th className="py-2.5 px-4">Email</th>
                <th className="py-2.5 px-4">Mobile</th>
                <th className="py-2.5 px-4">Department</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((f) => (
                <tr key={f.id} className="border-b border-zinc-900 hover:bg-zinc-900 link-hover">
                  <td className="py-3 px-4 text-white flex items-center gap-2"><GraduationCap className="w-4 h-4 text-zinc-500" />{f.name}</td>
                  <td className="py-3 px-4 mono text-zinc-300">{f.email}</td>
                  <td className="py-3 px-4 mono text-zinc-400">{f.mobile || "—"}</td>
                  <td className="py-3 px-4 text-zinc-300">{depName(f.department_id)}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button data-testid={`edit-faculty-${f.id}`} onClick={() => edit(f)} className="text-zinc-400 hover:text-white link-hover"><Pencil className="w-4 h-4 inline" /></button>
                    <button data-testid={`delete-faculty-${f.id}`} onClick={() => del(f.id)} className="text-zinc-400 hover:text-rose-500 link-hover"><Trash2 className="w-4 h-4 inline" /></button>
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
