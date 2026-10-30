import { useCallback, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import apiInstance from "../../http/axios";
import { AppContext } from "../../context/app-context";

const input =
  "w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[#FFB703]";

const numOrNull = (v) => (v === "" || v === undefined || v === null ? null : Number(v));

export default function Players() {
  const { setSpinner } = useContext(AppContext);
  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null); // player with games[]
  const { register, handleSubmit, reset } = useForm();

  const loadRefs = useCallback(async () => {
    try {
      const [u, s] = await Promise.all([
        apiInstance.get("/admin/users"),
        apiInstance.get("/admin/sports"),
      ]);
      setUsers(u.data || []);
      setSports(s.data || []);
    } catch (e) { /* interceptor */ }
  }, []);

  const load = useCallback(async (search = "") => {
    setLoading(true);
    try {
      const res = await apiInstance.get(`/admin/players${search ? `?search=${encodeURIComponent(search)}` : ""}`);
      setRows(res.data || []);
    } catch (e) { /* interceptor */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadRefs(); }, [loadRefs]);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    reset({ owner_user_id: "", first_name: "", last_name: "", sport_id: "", grad_year: "", position: "", jersey_number: "", height_in: "", weight_lb: "", gpa: "", team_name: "", city: "", state: "", highlight_url: "", notes: "" });
    setOpen(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    reset({ ...p, owner_user_id: p.owner_user_id ?? "", sport_id: p.sport_id ?? "" });
    setOpen(true);
  };

  const onSubmit = async (form) => {
    if (!form.first_name) return toast.error("First name is required");
    const body = {
      first_name: form.first_name, last_name: form.last_name || null,
      sport_id: form.sport_id ? parseInt(form.sport_id, 10) : null,
      grad_year: numOrNull(form.grad_year), position: form.position || null,
      jersey_number: form.jersey_number || null,
      height_in: numOrNull(form.height_in), weight_lb: numOrNull(form.weight_lb),
      gpa: numOrNull(form.gpa), team_name: form.team_name || null,
      city: form.city || null, state: form.state || null,
      highlight_url: form.highlight_url || null, notes: form.notes || null,
    };
    setSpinner(true);
    try {
      if (editing) {
        await apiInstance.put(`/admin/players/${editing.id}`, body);
        toast.success("Player updated");
      } else {
        if (!form.owner_user_id) { toast.error("Owner is required"); setSpinner(false); return; }
        await apiInstance.post("/admin/players", { ...body, owner_user_id: parseInt(form.owner_user_id, 10) });
        toast.success("Player created");
      }
      setOpen(false);
      await load();
    } catch (e) { /* interceptor */ }
    finally { setSpinner(false); }
  };

  const onDelete = async (p) => {
    if (!window.confirm(`Delete ${p.first_name} ${p.last_name || ""}? This cannot be undone.`)) return;
    setSpinner(true);
    try { await apiInstance.delete(`/admin/players/${p.id}`); toast.success("Deleted"); await load(); }
    catch (e) { /* interceptor */ } finally { setSpinner(false); }
  };

  const viewDetail = async (p) => {
    setSpinner(true);
    try { const res = await apiInstance.get(`/admin/players/${p.id}`); setDetail(res.data); }
    catch (e) { /* interceptor */ } finally { setSpinner(false); }
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold">Players</h1>
        <div className="flex gap-2">
          <input className={`${input} w-56`} placeholder="Search name…" onChange={(e) => load(e.target.value)} />
          <button onClick={openCreate} className="rounded-lg bg-[#FFB703] px-4 py-2 text-sm font-semibold text-black hover:bg-[#e5a503]">+ Add Player</button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-white/50">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Sport</th><th className="px-4 py-3">Grad</th><th className="px-4 py-3">Pos</th><th className="px-4 py-3">#</th><th className="px-4 py-3">Team</th><th className="px-4 py-3">Owner</th><th className="px-4 py-3">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-white/50">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-white/50">No players.</td></tr>
            ) : rows.map((p) => (
              <tr key={p.id} className="hover:bg-white/5">
                <td className="px-4 py-3">{p.first_name} {p.last_name || ""}</td>
                <td className="px-4 py-3">{p.sport_name || "—"}</td>
                <td className="px-4 py-3">{p.grad_year || "—"}</td>
                <td className="px-4 py-3">{p.position || "—"}</td>
                <td className="px-4 py-3">{p.jersey_number || "—"}</td>
                <td className="px-4 py-3">{p.team_name || "—"}</td>
                <td className="px-4 py-3 text-white/60">{p.owner_email || "—"}</td>
                <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                  <button onClick={() => viewDetail(p)} className="rounded border border-white/20 px-2.5 py-1 text-xs hover:bg-white/10">👁 Games</button>
                  <button onClick={() => openEdit(p)} className="rounded border border-white/20 px-2.5 py-1 text-xs hover:bg-white/10">✏️ Edit</button>
                  <button onClick={() => onDelete(p)} className="rounded bg-red-500/80 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-500">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create / Edit modal */}
      {open && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-[#140024] p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-lg font-bold">{editing ? "Edit Player" : "Add Player"}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-3 gap-3">
              {!editing && (
                <div className="col-span-3">
                  <label className="mb-1 block text-xs text-white/50">Owner (parent/user)</label>
                  <select className={input} {...register("owner_user_id")}>
                    <option value="">— select owner —</option>
                    {users.map((u) => <option key={u.id} value={u.id}>{u.email}{u.full_name ? ` (${u.full_name})` : ""}</option>)}
                  </select>
                </div>
              )}
              <div><label className="mb-1 block text-xs text-white/50">First name</label><input className={input} {...register("first_name")} /></div>
              <div><label className="mb-1 block text-xs text-white/50">Last name</label><input className={input} {...register("last_name")} /></div>
              <div><label className="mb-1 block text-xs text-white/50">Sport</label>
                <select className={input} {...register("sport_id")}>
                  <option value="">— none —</option>
                  {sports.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div><label className="mb-1 block text-xs text-white/50">Grad year</label><input className={input} type="number" {...register("grad_year")} /></div>
              <div><label className="mb-1 block text-xs text-white/50">Position</label><input className={input} {...register("position")} /></div>
              <div><label className="mb-1 block text-xs text-white/50">Jersey #</label><input className={input} {...register("jersey_number")} /></div>
              <div><label className="mb-1 block text-xs text-white/50">Height (in)</label><input className={input} type="number" {...register("height_in")} /></div>
              <div><label className="mb-1 block text-xs text-white/50">Weight (lb)</label><input className={input} type="number" {...register("weight_lb")} /></div>
              <div><label className="mb-1 block text-xs text-white/50">GPA</label><input className={input} type="number" step="0.01" {...register("gpa")} /></div>
              <div><label className="mb-1 block text-xs text-white/50">Team</label><input className={input} {...register("team_name")} /></div>
              <div><label className="mb-1 block text-xs text-white/50">City</label><input className={input} {...register("city")} /></div>
              <div><label className="mb-1 block text-xs text-white/50">State</label><input className={input} {...register("state")} /></div>
              <div className="col-span-3"><label className="mb-1 block text-xs text-white/50">Highlight URL</label><input className={input} {...register("highlight_url")} /></div>
              <div className="col-span-3"><label className="mb-1 block text-xs text-white/50">Notes</label><textarea className={input} rows={2} {...register("notes")} /></div>
              <div className="col-span-3 mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10">Cancel</button>
                <button type="submit" className="rounded-lg bg-[#FFB703] px-4 py-2 text-sm font-semibold text-black hover:bg-[#e5a503]">{editing ? "Save" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Games / stats detail */}
      {detail && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4" onClick={() => setDetail(null)}>
          <div className="w-full max-w-xl rounded-xl border border-white/10 bg-[#140024] p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-1 text-lg font-bold">{detail.first_name} {detail.last_name || ""}</h2>
            <p className="mb-4 text-sm text-white/50">
              {detail.sport_name || "—"} · {detail.position || "—"} · #{detail.jersey_number || "—"} · owner {detail.owner_email}
            </p>
            <h3 className="mb-2 text-sm font-semibold text-[#FFB703]">Analyzed Games</h3>
            {(!detail.games || detail.games.length === 0) ? (
              <p className="text-sm text-white/50">No games linked to this player yet.</p>
            ) : (
              <div className="space-y-2">
                {detail.games.map((g) => (
                  <div key={g.id} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-mono text-white/80">{g.job_id}</span>
                      <span className={`rounded px-2 py-0.5 text-xs font-semibold ${g.status === "completed" ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/60"}`}>{g.status}</span>
                    </div>
                    <div className="mt-1 text-xs text-white/50">
                      jersey {g.jersey_number || "—"} · progress {g.progress ?? 0}% · {g.results_key || "no results yet"}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-5 flex justify-end">
              <button onClick={() => setDetail(null)} className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
