import { NavLink } from "react-router-dom";

const nav = [
  { title: "Players", link: "/players", icon: "🏀" },
  { title: "Coaches", link: "/coaches", icon: "📋" },
  { title: "Colleges", link: "/colleges", icon: "🎓" },
  { title: "Sports", link: "/sports", icon: "🏆" },
  { title: "Users", link: "/users", icon: "👥" },
  { title: "Packages", link: "/packages", icon: "📦" },
  { title: "Coupons", link: "/coupons", icon: "🏷️" },
];

export default function AdminSidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-white/10 bg-black/20 min-h-screen">
      <div className="px-5 py-6">
        <h1 className="text-lg font-bold leading-tight">
          <span className="text-[#FFB703]">Purple Box</span>
          <br />Sports Admin
        </h1>
      </div>
      <nav className="px-3 space-y-1">
        {nav.map((item) => (
          <NavLink
            key={item.link}
            to={item.link}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-[#FFB703] text-black"
                  : "text-white/80 hover:bg-white/10"
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
