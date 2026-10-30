import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import apiInstance from "../../http/axios";
import Auth from "../../auth/Auth";
import { AppContext } from "../../context/app-context";

export default function Login() {
  const navigate = useNavigate();
  const { setSpinner } = useContext(AppContext);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  const onSubmit = async (form) => {
    setSpinner(true);
    try {
      // disableToast so we can show the error inline instead of a toast
      const res = await apiInstance.post(
        "/auth/login",
        { email: form.email, password: form.password },
        { disableToast: true }
      );
      const { access_token, user } = res.data;

      if (!user?.is_admin) {
        toast.error("This account is not an admin.");
        return;
      }

      Auth.login(user, access_token);
      toast.success("Welcome back!");
      navigate("/users", { replace: true });
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast.error(detail || "Invalid email or password");
    } finally {
      setSpinner(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="text-left">
      <label className="mb-1 block text-sm text-white/70">Email</label>
      <input
        type="email"
        autoComplete="username"
        className="mb-4 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[#FFB703]"
        placeholder="admin@pbsportstech.com"
        {...register("email", { required: "Email is required" })}
      />
      {errors.email && (
        <p className="-mt-3 mb-3 text-xs text-red-400">{errors.email.message}</p>
      )}

      <label className="mb-1 block text-sm text-white/70">Password</label>
      <div className="relative mb-6">
        <input
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 pr-16 text-sm outline-none focus:border-[#FFB703]"
          placeholder="••••••••"
          {...register("password", { required: "Password is required" })}
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white/50 hover:text-white/80"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
      {errors.password && (
        <p className="-mt-5 mb-3 text-xs text-red-400">{errors.password.message}</p>
      )}

      <button
        type="submit"
        className="w-full rounded-lg bg-[#FFB703] py-2.5 text-sm font-semibold text-black hover:bg-[#e5a503]"
      >
        Log In
      </button>
    </form>
  );
}
