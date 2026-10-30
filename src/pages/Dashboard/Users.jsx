import { useCallback, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import apiInstance from "../../http/axios";
import Auth from "../../auth/Auth";
import { AppContext } from "../../context/app-context";

const badge = (ok, yes = "active", no = "disabled") =>
  ok ? (
    <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs font-semibold text-green-400">{yes}</span>
  ) : (
    <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-400">{no}</span>
  );

const btn =
  "rounded border border-white/20 px-2.5 py-1 text-xs hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent";

export default function Users() {
  const { setSpinner } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const me = Auth.userInfo();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiInstance.get("/admin/users");
      setUsers(res.data || []);
    } catch (e) {
      // interceptor toasts
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (fn, successMsg) => {
    setSpinner(true);
    try {
      const res = await fn();
      if (successMsg || res?.data?.message) toast.success(successMsg || res.data.message);
      await load();
    } catch (e) {
      // interceptor toasts
    } finally {
      setSpinner(false);
    }
  };

  const giftGames = (u) => {
    const input = window.prompt(`Gift how many games to ${u.email}?`, "1");
    if (input === null) return;
    const n = parseInt(input, 10);
    if (!Number.isFinite(n) || n === 0) return toast.error("Enter a non-zero number");
    run(() => apiInstance.post(`/admin/users/${u.id}/gift-games?games=${n}`));
  };

  const toggleAdmin = (u) => {
    if (!window.confirm(u.is_admin ? `Revoke admin from ${u.email}?` : `Grant admin to ${u.email}?`)) return;
    run(() => apiInstance.patch(`/admin/users/${u.id}`, { is_admin: !u.is_admin }), "Updated");
  };

  const toggleActive = (u) => {
    if (!window.confirm(u.is_active ? `Disable ${u.email}?` : `Enable ${u.email}?`)) return;
    run(() => apiInstance.patch(`/admin/users/${u.id}`, { is_active: !u.is_active }), "Updated");
  };

  const resetPassword = (u) => {
    const pw = window.prompt(`New password for ${u.email} (min 6 chars):`);
    if (pw === null) return;
    if (pw.length < 6) return toast.error("Password must be at least 6 characters");
    run(() => apiInstance.post(`/admin/users/${u.id}/reset-password`, { new_password: pw }));
  };

  const deleteUser = (u) => {
    if (!window.confirm(`Permanently delete ${u.email}? This cannot be undone.`)) return;
    run(() => apiInstance.delete(`/admin/users/${u.id}`));
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold">Users &amp; Game Balances</h1>
        <button onClick={load} className="rounded-lg border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10">
          Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-white/50">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Games</th>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-white/50">Loading…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-white/50">No users found.</td></tr>
            ) : (
              users.map((u) => {
                const isSelf = me && u.id === me.id;
                return (
                  <tr key={u.id} className="hover:bg-white/5 align-top">
                    <td className="px-4 py-3">{u.id}</td>
                    <td className="px-4 py-3">
                      {u.email}
                      {isSelf && <span className="ml-2 text-xs text-white/40">(you)</span>}
                    </td>
                    <td className="px-4 py-3">{u.full_name || "—"}</td>
                    <td className="px-4 py-3 font-semibold">{u.games_remaining}</td>
                    <td className="px-4 py-3">{u.is_admin ? "✓" : ""}</td>
                    <td className="px-4 py-3">{badge(u.is_active)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <button onClick={() => giftGames(u)} className={btn}>🎁 Gift</button>
                        <button onClick={() => toggleAdmin(u)} disabled={isSelf} className={btn}>
                          {u.is_admin ? "Revoke Admin" : "Make Admin"}
                        </button>
                        <button onClick={() => toggleActive(u)} disabled={isSelf} className={btn}>
                          {u.is_active ? "Disable" : "Enable"}
                        </button>
                        <button onClick={() => resetPassword(u)} className={btn}>Reset PW</button>
                        <button
                          onClick={() => deleteUser(u)}
                          disabled={isSelf}
                          className="rounded bg-red-500/80 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-30 disabled:hover:bg-red-500/80"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-white/40">
        Showing {users.length} user{users.length === 1 ? "" : "s"}.
      </p>
    </div>
  );
}
