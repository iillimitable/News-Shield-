
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  History,
  MessageSquare,
  ArrowLeft,
  ShieldCheck,
  LogOut,
} from "lucide-react";

function AdminLayout() {
  const navigate = useNavigate();

  // Admin menu links
  const links = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Manage Users", path: "/admin/users", icon: Users },
    { name: "Manage History", path: "/admin/history", icon: History },
    { name: "Manage Feedback", path: "/admin/feedback", icon: MessageSquare },
  ];

  // Logout admin
  const handleLogout = () => {
    localStorage.removeItem("newsShieldToken");
    localStorage.removeItem("newsShieldUser");
    navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">

      {/* Admin Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-800/80 bg-slate-950 p-5">

        {/* Logo */}
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/15 to-blue-500/10">
            <ShieldCheck size={25} className="text-cyan-400" />
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">
              NewsShield
            </h2>
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
              Admin Panel
            </p>
          </div>
        </div>

        {/* Menu heading */}
        <p className="mb-3 px-3 text-[10px] font-semibold tracking-[0.16em] text-slate-500">
          ADMINISTRATION
        </p>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {links.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/admin/dashboard"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "border border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
                      : "border border-transparent text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`
                }
              >
                <Icon size={18} />
                {link.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="mt-auto space-y-3 border-t border-slate-800/80 pt-5">

          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to Website
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl border border-red-500/25 bg-red-500/5 px-3 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut size={18} />
            Admin Logout
          </button>
        </div>
      </aside>

      {/* Admin page content */}
      <main className="min-w-0 flex-1 bg-slate-950 p-5 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
