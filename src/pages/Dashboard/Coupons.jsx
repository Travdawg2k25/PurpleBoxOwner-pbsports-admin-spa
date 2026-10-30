import { useCallback, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import apiInstance from "../../http/axios";
import { AppContext } from "../../context/app-context";

const input =
  "w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[#FFB703]";

const valueDisplay = (c) => {
  if (c.discount_type === "free") return "FREE";
  if (c.discount_type === "percent") return `${c.discount_value}%`;
  return `$${(c.discount_value / 100).toFixed(2)}`;
};

export default function Coupons() {
  const { setSpinner } = useContext(AppContext);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: { discount_type: "percent" },
  });
  const type = watch("discount_type");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiInstance.get("/admin/coupons");
      setCoupons(res.data || []);
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
    if (!form.code) {
      toast.error("Enter a coupon code");
      return;
    }
    let value = parseFloat(form.value) || 0;
    // fixed discounts are entered in dollars, stored in cents
    const apiValue = form.discount_type === "fixed" ? Math.round(value * 100) : value;
    setSpinner(true);
    try {
      await apiInstance.post("/admin/coupons", {
        code: form.code,
        discount_type: form.discount_type,
        discount_value: apiValue,
        max_uses: form.max_uses ? parseInt(form.max_uses, 10) : null,
      });
      toast.success("Coupon created");
      reset({ discount_type: "percent" });
      load();
    } catch (e) {
      // interceptor toasts
    } finally {
      setSpinner(false);
    }
  };

  const onDeactivate = async (c) => {
    if (!window.confirm(`Deactivate coupon ${c.code}?`)) return;
    setSpinner(true);
    try {
      await apiInstance.delete(`/admin/coupons/${c.id}`);
      toast.success("Coupon deactivated");
      load();
    } catch (e) {
      // interceptor toasts
    } finally {
      setSpinner(false);
    }
  };

  return (
    <div>
      <h1 className="mb-5 text-xl font-bold">Manage Coupons</h1>

      <form
        onSubmit={handleSubmit(onCreate)}
        className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
      >
        <div className="w-40">
          <label className="mb-1 block text-xs text-white/50">Code</label>
          <input className={input} placeholder="SUMMER25" {...register("code")} />
        </div>
        <div className="w-40">
          <label className="mb-1 block text-xs text-white/50">Type</label>
          <select className={input} {...register("discount_type")}>
            <option value="percent">Percent Off</option>
            <option value="fixed">Fixed $ Off</option>
            <option value="free">100% Free</option>
          </select>
        </div>
        <div className="w-32">
          <label className="mb-1 block text-xs text-white/50">
            {type === "fixed" ? "Value ($)" : type === "percent" ? "Value (%)" : "Value"}
          </label>
          <input
            className={input}
            type="number"
            disabled={type === "free"}
            {...register("value")}
          />
        </div>
        <div className="w-36">
          <label className="mb-1 block text-xs text-white/50">Max uses</label>
          <input className={input} type="number" placeholder="∞" {...register("max_uses")} />
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
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Used</th>
              <th className="px-4 py-3">Max</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-white/50">Loading…</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-white/50">No coupons.</td></tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-semibold">{c.code}</td>
                  <td className="px-4 py-3">{c.discount_type}</td>
                  <td className="px-4 py-3">{valueDisplay(c)}</td>
                  <td className="px-4 py-3">{c.times_used}</td>
                  <td className="px-4 py-3">{c.max_uses ?? "∞"}</td>
                  <td className="px-4 py-3">
                    {c.is_active ? (
                      <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs font-semibold text-green-400">Yes</span>
                    ) : (
                      <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-400">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => onDeactivate(c)} className="rounded bg-red-500/80 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-500">Deactivate</button>
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
