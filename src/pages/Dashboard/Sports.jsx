import { useCallback, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import apiInstance from "../../http/axios";
import { AppContext } from "../../context/app-context";

const input =
  "w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[#FFB703]";

const TYPES = ["team", "individual", "winter", "combat", "motor", "other"];

export default function Sports() {
  const { setSpinner } = useContext(AppContext);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset } = useForm({ defaultValues: { type: "team" } });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiInstance.get("/admin/sports");
      setRows(res.data || []);
    } catch (e) { /* toast via interceptor */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const run = async (fn) => {
    setSpinner(true);
    try { const r = await fn(); if (r?.data?.message) toast.success(r.data.message); await load(); }
    catch (e) { /* interceptor */ }
    finally { setSpinner(false); }
  };

  const onCreate = (form) => {
    if (!form.name) return toast.error("Name is required");
    run(() => apiInstance.post("/admin/sports", { name: form.name, type: form.type }));
    reset({ type: "team" });
  };

  const onEdit = (s) => {
    const name = window.prompt("Sport name:", s.name);
    if (name === null) return;
    run(() => apiInstance.put(`/admin/sports/${s.id}`, { name }));
  };

  const onDeactivate = (s) => {
    if (!window.confirm(`Deactivate "${s.name}"?`)) return;
    run(() => apiInstance.delete(`/admin/sports/${s.id}`));
  };

  return (
    <div>
      <h1 className="mb-5 text-xl font-bold">Sports</h1>

      <form onSubmit={handleSubmit(onCreate)} className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex-1 min-w-[180px]">
          <label className="mb-1 block text-xs text-white/50">Name</label>
          <input className={input} placeholder="Basketball" {...register("name")} />
        </div>
        <div className="w-44">
          <label className="mb-1 block text-xs text-white/50">Type</label>
          <select className={input} {...register("type")}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button type="submit" className="rounded-lg bg-[#FFB703] px-4 py-2 text-sm font-semibold text-black hover:bg-[#e5a503]">+ Add</button>
      </form>

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-white/50">
            <tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Active</th><th className="px-4 py-3">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-white/50">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-white/50">No sports.</td></tr>
            ) : rows.map((s) => (
              <tr key={s.id} className="hover:bg-white/5">
                <td className="px-4 py-3">{s.id}</td>
                <td className="px-4 py-3">{s.name}</td>
                <td className="px-4 py-3 capitalize">{s.type}</td>
                <td className="px-4 py-3">{s.is_active
                  ? <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs font-semibold text-green-400">Yes</span>
                  : <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-400">No</span>}</td>
                <td className="px-4 py-3 space-x-2">
                  <button onClick={() => onEdit(s)} className="rounded border border-white/20 px-2.5 py-1 text-xs hover:bg-white/10">✏️ Edit</button>
                  <button onClick={() => onDeactivate(s)} className="rounded bg-red-500/80 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-500">Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
