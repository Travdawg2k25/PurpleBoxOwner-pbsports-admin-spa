import { useCallback, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import apiInstance from "../../http/axios";
import { AppContext } from "../../context/app-context";

const input =
  "w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[#FFB703]";
const DIVISIONS = ["", "D1", "D2", "D3", "NAIA", "JUCO"];

export default function Colleges() {
  const { setSpinner } = useContext(AppContext);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const load = useCallback(async (search = "") => {
    setLoading(true);
    try {
      const res = await apiInstance.get(`/admin/colleges${search ? `?search=${encodeURIComponent(search)}` : ""}`);
      setRows(res.data || []);
    } catch (e) { /* interceptor */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); reset({ name: "", nickname: "", abbreviation: "", address: "", city: "", state: "", zip: "", email_ext: "", division: "" }); setOpen(true); };
  const openEdit = (c) => { setEditing(c); reset(c); setOpen(true); };

  const onSubmit = async (form) => {
    if (!form.name) return toast.error("College name is required");
    setSpinner(true);
    try {
      if (editing) {
        await apiInstance.put(`/admin/colleges/${editing.id}`, form);
        toast.success("College updated");
      } else {
        await apiInstance.post("/admin/colleges", form);
        toast.success("College created");
      }
      setOpen(false);
      await load();
    } catch (e) { /* interceptor */ }
    finally { setSpinner(false); }
  };

  const onDeactivate = async (c) => {
    if (!window.confirm(`Deactivate ${c.name}?`)) return;
    setSpinner(true);
    try { await apiInstance.delete(`/admin/colleges/${c.id}`); toast.success("Deactivated"); await load(); }
    catch (e) { /* interceptor */ } finally { setSpinner(false); }
  };

  const field = (name, label, extra = {}) => (
    <div>
      <label className="mb-1 block text-xs text-white/50">{label}</label>
      {name === "division" ? (
        <select className={input} {...register("division")}>
          {DIVISIONS.map((d) => <option key={d} value={d}>{d || "—"}</option>)}
        </select>
      ) : (
        <input className={input} {...register(name)} {...extra} />
      )}
    </div>
  );

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold">Colleges</h1>
        <div className="flex gap-2">
          <input className={`${input} w-56`} placeholder="Search…" onChange={(e) => load(e.target.value)} />
          <button onClick={openCreate} className="rounded-lg bg-[#FFB703] px-4 py-2 text-sm font-semibold text-black hover:bg-[#e5a503]">+ Add College</button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-white/50">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Nick</th><th className="px-4 py-3">Abbr</th><th className="px-4 py-3">City</th><th className="px-4 py-3">State</th><th className="px-4 py-3">Div</th><th className="px-4 py-3">Email Ext</th><th className="px-4 py-3">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-white/50">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-white/50">No colleges.</td></tr>
            ) : rows.map((c) => (
              <tr key={c.id} className="hover:bg-white/5">
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3">{c.nickname || "—"}</td>
                <td className="px-4 py-3">{c.abbreviation || "—"}</td>
                <td className="px-4 py-3">{c.city || "—"}</td>
                <td className="px-4 py-3">{c.state || "—"}</td>
                <td className="px-4 py-3">{c.division || "—"}</td>
                <td className="px-4 py-3">{c.email_ext || "—"}</td>
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
            <h2 className="mb-4 text-lg font-bold">{editing ? "Edit College" : "Add College"}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-3">
              {field("name", "College Name")}
              {field("nickname", "Nickname")}
              {field("abbreviation", "Abbreviation", { maxLength: 10 })}
              {field("division", "Division")}
              {field("address", "Address")}
              {field("city", "City")}
              {field("state", "State")}
              {field("zip", "Zip")}
              {field("email_ext", "Email Extension")}
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
