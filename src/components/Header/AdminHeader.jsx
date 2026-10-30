import { useNavigate } from "react-router-dom";
import Auth from "../../auth/Auth";

export default function AdminHeader() {
  const navigate = useNavigate();
  const user = Auth.userInfo();

  const handleLogout = () => {
    Auth.logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="flex items-center justify-between border-b border-white/10 px-6 py-3">
      <div className="text-sm text-white/60">Admin Console</div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-white/80">
          {user?.full_name || user?.email}
        </span>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-white/20 px-3 py-1.5 text-sm font-medium text-white/80 hover:bg-white/10"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
