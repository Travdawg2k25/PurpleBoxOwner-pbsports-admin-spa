import { useCallback, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import apiInstance from "../../http/axios";
import { AppContext } from "../../context/app-context";

const input =
  "w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[#FFB703]";
const TYPES = ["college", "club", "high_school"];

export default function Coaches() {
  const { setSpinner } = useContext(AppContext);
  const [rows, setRows] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset } = useForm({ defaultValues: { type: "college" } });

  const loadRefs = useCallback(async () => {
    try {
      const [c, s] = await Promise.all([
        apiInstance.get("/admin/colleges"),
        apiInstance.get("/admin/sports"),
      ]);
      setColleges(c.data || []);
      setSports(s.data || []);
    } catch (e) { /* interceptor */ }
  }, []);

  const load = useCallback(async (type = filter, search = "") => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (type && type !== "all") qs.set("type", type);
      if (search) qs.set("search", search);
      const res = await apiInstance.get(`/admin/coaches${qs.toString() ? `?${qs}` : ""}`);
      setRows(res.data || []);
    } catch (e) { /* interceptor */ }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { loadRefs(); }, [loadRefs]);
  useEffect(() => { load(filter); }, [filter, load]);

  const openCreate = () => { setEditing(null); reset({ type: "college", name: "", email: "", phone: "", title: "", college_id: "", sport_id: "" }); setOpen(true); };
  const openEdit = (c) => { setEditing(c); reset({ ...c, college_id: c.college_id ?? "", sport_id: c.sport_id ?? "" }); setOpen(true); };

  const onSubmit = async (form) => {
    if (!form.name) return toast.error("Coach name is required");
    const body = {
      name: form.name, email: form.email || null, phone: form.phone || null,
      type: form.type, title: form.title || null,
      college_id: form.college_id ? parseInt(form.college_id, 10) : null,
      sport_id: form.sport_id ? parseInt(form.sport_id, 10) : null,
    };
    setSpinner(true);
    try {
      if (editing) { await apiInstance.put(`/admin/coaches/${editing.id}`, body); toast.success("Coach updated"); }
      else { await apiInstance.post("/admin/coaches", body); toast.success("Coach created"); }
      setOpen(false);
      await load(filter);
    } catch (e) { /* interceptor */ }
    finally { setSpinner(false); }
  };

  const onDeactivate = async (c) => {
    if (!window.confirm(`Deactivate ${c.name}?`)) return;
    setSpinner(true);
    try { await apiInstance.delete(`/admin/coaches/${c.id}`); toast.success("Deactivated"); await load(filter); }
    catch (e) { /* interceptor */ } finally { setSpinner(false); }
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold">Coaches</h1>
        <div className="flex gap-2">
          <select className={`${input} w-40`} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All types</option>
            {TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
          </select>
          <input className={`${input} w-56`} placeholder="Search…" onChange={(e) => load(filter, e.target.value)} />
          <button onClick={openCreate} className="rounded-lg bg-[#FFB703] px-4 py-2 text-sm font-semibold text-black hover:bg-[#e5a503]">+ Add Coach</button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-white/50">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Title</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">College</th><th className="px-4 py-3">Sport</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-white/50">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-white/50">No coaches.</td></tr>
            ) : rows.map((c) => (
              <tr key={c.id} className="hover:bg-white/5">
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3">{c.title || "—"}</td>
                <td className="px-4 py-3 capitalize">{(c.type || "").replace("_", " ")}</td>
                <td className="px-4 py-3">{c.college_name || "—"}</td>
                <td className="px-4 py-3">{c.sport_name || "—"}</td>
                <td className="px-4 py-3">{c.email || "—"}</td>
                <td className="px-4 py-3 space-x-2">
                  <button onClick={() => openEdit(c)} className="rounded border border-white/20 px-2.5 py-1 text-xs hover:bg-white/10">✏️ Edit</button>
                  <button onClick={() => onDeactivate(c)} className="rounded bg-red-500/80 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-500">Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg rounded-xl border border-white/10 bg-[#140024] p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-lg font-bold">{editing ? "Edit Coach" : "Add Coach"}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-3">
              <div><label className="mb-1 block text-xs text-white/50">Name</label><input className={input} {...register("name")} /></div>
              <div><label className="mb-1 block text-xs text-white/50">Title</label><input className={input} placeholder="Head Coach" {...register("title")} /></div>
              <div><label className="mb-1 block text-xs text-white/50">Type</label>
                <select className={input} {...register("type")}>{TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}</select>
              </div>
              <div><label className="mb-1 block text-xs text-white/50">College</label>
                <select className={input} {...register("college_id")}>
                  <option value="">— none —</option>
                  {colleges.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div><label className="mb-1 block text-xs text-white/50">Sport</label>
                <select className={input} {...register("sport_id")}>
                  <option value="">— none —</option>
                  {sports.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div><label className="mb-1 block text-xs text-white/50">Email</label><input className={input} {...register("email")} /></div>
              <div><label className="mb-1 block text-xs text-white/50">Phone</label><input className={input} {...register("phone")} /></div>
              <div className="col-span-2 mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10">Cancel</button>
                <button type="submit" className="rounded-lg bg-[#FFB703] px-4 py-2 text-sm font-semibold text-black hover:bg-[#e5a503]">{editing ? "Save" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
