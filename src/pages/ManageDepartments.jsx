import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SectionTitle, EmptyState } from "@/components/dashboard/StatCard";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";

export default function ManageDepartments() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const load = async () => {
    const { data } = await api.get("/departments");
    setItems(data);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      if (editing) await api.put(`/departments/${editing.id}`, { name, code });
      else await api.post("/departments", { name, code });
      toast.success("Saved"); setOpen(false); setEditing(null); setName(""); setCode(""); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };
  const del = async (id) => {
    if (!confirm("Delete this department?")) return;
    await api.delete(`/departments/${id}`); toast.success("Deleted"); load();
  };
  const edit = (d) => { setEditing(d); setName(d.name); setCode(d.code); setOpen(true); };

  return (
    <div>
      <SectionTitle
        sub="Create and manage academic departments."
        right={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v){setEditing(null); setName(""); setCode("");} }}>
            <DialogTrigger asChild>
              <button data-testid="add-department-button" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-sm text-sm font-semibold flex items-center gap-2 link-hover">
                <Plus className="w-4 h-4" /> Add Department
              </button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800">
              <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Department</DialogTitle></DialogHeader>
              <div className="space-y-3 mt-2">
                <div>
                  <label className="label-upper block mb-1.5">Name</label>
                  <input data-testid="department-name-input" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-sm text-white outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="label-upper block mb-1.5">Code</label>
                  <input data-testid="department-code-input" value={code} onChange={(e) => setCode(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-sm text-white outline-none focus:border-orange-500 mono uppercase" />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <button data-testid="save-department-button" onClick={save} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-sm text-sm font-semibold link-hover">Save</button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >Departments</SectionTitle>

      {items.length === 0 ? (
        <EmptyState title="No departments yet" sub="Add a department to start categorizing branches and students." />
      ) : (
        <div className="border border-zinc-800 bg-zinc-900/50 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500 label-upper border-b border-zinc-800">
                <th className="py-2.5 px-4">Code</th>
                <th className="py-2.5 px-4">Name</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((d) => (
                <tr key={d.id} data-testid={`department-row-${d.code}`} className="border-b border-zinc-900 hover:bg-zinc-900 link-hover">
                  <td className="py-3 px-4 mono text-orange-400">{d.code}</td>
                  <td className="py-3 px-4 text-white flex items-center gap-2"><Building2 className="w-4 h-4 text-zinc-500" />{d.name}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button data-testid={`edit-department-${d.code}`} onClick={() => edit(d)} className="text-zinc-400 hover:text-white link-hover"><Pencil className="w-4 h-4 inline" /></button>
                    <button data-testid={`delete-department-${d.code}`} onClick={() => del(d.id)} className="text-zinc-400 hover:text-rose-500 link-hover"><Trash2 className="w-4 h-4 inline" /></button>
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
