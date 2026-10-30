import { useCallback, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import apiInstance from "../../http/axios";
import { AppContext } from "../../context/app-context";

const input =
  "w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[#FFB703]";

export default function Packages() {
  const { setSpinner } = useContext(AppContext);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset } = useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiInstance.get("/admin/packages");
      setPackages(res.data || []);
    } catch (e) {
      // interceptor toasts
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onCreate = async (form) => {
    const priceDollars = parseFloat(form.price);
    const games = parseInt(form.games_included, 10);
    if (!form.name || !Number.isFinite(games) || !Number.isFinite(priceDollars)) {
      toast.error("Name, games, and price are required");
      return;
    }
    setSpinner(true);
    try {
      await apiInstance.post("/admin/packages", {
        name: form.name,
        games_included: games,
        price_cents: Math.round(priceDollars * 100),
        description: form.description || "",
        sort_order: parseInt(form.sort_order, 10) || 0,
      });
      toast.success("Package created");
      reset();
      load();
    } catch (e) {
      // interceptor toasts
    } finally {
      setSpinner(false);
    }
  };

  const onEdit = async (pkg) => {
    const name = window.prompt("Package name:", pkg.name);
    if (name === null) return;
    const games = window.prompt("Games included:", pkg.games_included);
    if (games === null) return;
    const price = window.prompt("Price ($):", (pkg.price_cents / 100).toFixed(0));
    if (price === null) return;
    const sort = window.prompt("Sort order:", pkg.sort_order);
    if (sort === null) return;

    setSpinner(true);
    try {
      await apiInstance.put(`/admin/packages/${pkg.id}`, {
        name,
        games_included: parseInt(games, 10),
        price_cents: Math.round(parseFloat(price) * 100),
        sort_order: parseInt(sort, 10),
      });
      toast.success("Package updated");
      load();
    } catch (e) {
      // interceptor toasts
    } finally {
      setSpinner(false);
    }
  };

  const onDeactivate = async (pkg) => {
    if (!window.confirm(`Deactivate "${pkg.name}"?`)) return;
    setSpinner(true);
    try {
      await apiInstance.delete(`/admin/packages/${pkg.id}`);
      toast.success("Package deactivated");
      load();
    } catch (e) {
      // interceptor toasts
    } finally {
      setSpinner(false);
    }
  };

  return (
    <div>
      <h1 className="mb-5 text-xl font-bold">Manage Packages</h1>

      <form
        onSubmit={handleSubmit(onCreate)}
        className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
      >
        <div className="flex-1 min-w-[140px]">
          <label className="mb-1 block text-xs text-white/50">Name</label>
          <input className={input} placeholder="Starter" {...register("name")} />
        </div>
        <div className="w-28">
          <label className="mb-1 block text-xs text-white/50">Games</label>
          <input className={input} type="number" {...register("games_included")} />
        </div>
        <div className="w-28">
          <label className="mb-1 block text-xs text-white/50">Price ($)</label>
          <input className={input} type="number" step="1" {...register("price")} />
        </div>
        <div className="w-28">
          <label className="mb-1 block text-xs text-white/50">Sort</label>
          <input className={input} type="number" {...register("sort_order")} />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="mb-1 block text-xs text-white/50">Description</label>
          <input className={input} {...register("description")} />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-[#FFB703] px-4 py-2 text-sm font-semibold text-black hover:bg-[#e5a503]"
        >
          + Add
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-white/50">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Games</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-white/50">Loading…</td></tr>
            ) : packages.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-white/50">No packages.</td></tr>
            ) : (
              packages.map((p) => (
                <tr key={p.id} className="hover:bg-white/5">
                  <td className="px-4 py-3">{p.sort_order}</td>
                  <td className="px-4 py-3">{p.id}</td>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3">{p.games_included}</td>
                  <td className="px-4 py-3">${(p.price_cents / 100).toFixed(0)}</td>
                  <td className="px-4 py-3">
                    {p.is_active ? (
                      <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs font-semibold text-green-400">Yes</span>
                    ) : (
                      <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-400">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => onEdit(p)} className="rounded border border-white/20 px-2.5 py-1 text-xs hover:bg-white/10">✏️ Edit</button>
                    <button onClick={() => onDeactivate(p)} className="rounded bg-red-500/80 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-500">Deactivate</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
