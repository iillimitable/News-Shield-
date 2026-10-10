
import { useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Menu,
  X,
  ShieldCheck,
  Search,
  History,
  LogIn,
  UserPlus,
  LogOut,
  Sparkles,
  Users,
  MessageSquare,
  LayoutDashboard,
} from "lucide-react";

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Read current login details
  const token = localStorage.getItem("newsShieldToken");
  const isLoggedIn = Boolean(token);

  let storedUser = null;

  try {
    storedUser = JSON.parse(
      localStorage.getItem("newsShieldUser")
    );
  } catch {
    storedUser = null;
  }

  const isAdmin = isLoggedIn && storedUser?.role === "admin";
  const isUser = isLoggedIn && storedUser?.role !== "admin";

  // Close mobile menu
  const closeMobile = () => {
    setMobileOpen(false);
  };

  // Logout and return to role selection
  const handleLogout = () => {
    localStorage.removeItem("newsShieldToken");
    localStorage.removeItem("newsShieldUser");

    setMobileOpen(false);
    navigate("/", { replace: true });
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
      isActive
        ? "bg-cyan-500/10 text-cyan-400"
        : "text-slate-300 hover:bg-slate-900 hover:text-white"
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
      isActive
        ? "border border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
        : "text-slate-300 hover:bg-slate-900 hover:text-white"
    }`;

  // Shared navigation links based on role
  const renderNavigation = (mobile = false) => {
    const linkClass = mobile
      ? mobileNavLinkClass
      : navLinkClass;

    const closeProps = mobile
      ? { onClick: closeMobile }
      : {};

    if (isAdmin) {
      return (
        <>
          <NavLink
            to="/admin/dashboard"
            className={linkClass}
            {...closeProps}
          >
            <LayoutDashboard size={17} />
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/users"
            className={linkClass}
            {...closeProps}
          >
            <Users size={17} />
            Manage Users
          </NavLink>

          <NavLink
            to="/admin/history"
            className={linkClass}
            {...closeProps}
          >
            <History size={17} />
            Manage History
          </NavLink>

          <NavLink
            to="/admin/feedback"
            className={linkClass}
            {...closeProps}
          >
            <MessageSquare size={17} />
            Manage Feedback
          </NavLink>
        </>
      );
    }

    if (isUser) {
      return (
        <>
          <NavLink
            to="/dashboard"
            className={linkClass}
            {...closeProps}
          >
            <Search size={17} />
            Verify News
          </NavLink>

          <NavLink
            to="/history"
            className={linkClass}
            {...closeProps}
          >
            <History size={17} />
            History
          </NavLink>

          <NavLink
            to="/feedback"
            className={linkClass}
            {...closeProps}
          >
            <MessageSquare size={17} />
            Feedback
          </NavLink>
        </>
      );
    }

    // Visitors can choose their role
    return (
      <>
        <NavLink
          to="/"
          end
          className={linkClass}
          {...closeProps}
        >
          Home
        </NavLink>
      </>
    );
  };

  // Don't show navigation links for a role that doesn't match
  // the current route while changing roles or logging out.
  const showRoleNavigation =
    isLoggedIn &&
    storedUser &&
    (isAdmin || isUser);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/95 shadow-lg shadow-black/10 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

        {/* LOGO */}
        <Link
          to={isAdmin ? "/admin/dashboard" : isUser ? "/dashboard" : "/"}
          onClick={closeMobile}
          className="group flex items-center gap-3"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/15 to-blue-500/10">
            <ShieldCheck
              size={25}
              className="text-cyan-400 transition-transform group-hover:scale-110"
            />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-cyan-400" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold tracking-tight text-white">
                NewsShield
              </h1>
              <Sparkles size={13} className="text-cyan-400" />
            </div>

            <p className="hidden text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 sm:block">
              News Verification
            </p>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <div className="hidden items-center gap-1 md:flex">
          {showRoleNavigation && renderNavigation(false)}
        </div>

        {/* DESKTOP AUTH BUTTONS */}
        <div className="hidden items-center gap-2 md:flex">
          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <LogIn size={17} />
                User Login
              </Link>

              <Link
                to="/admin"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:from-cyan-400 hover:to-blue-400"
              >
                <ShieldCheck size={17} />
                Admin Login
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/5 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10"
            >
              <LogOut size={17} />
              Logout
            </button>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          onClick={() => setMobileOpen((previous) => !previous)}
          className="rounded-xl border border-slate-800 bg-slate-900/70 p-2.5 text-slate-300 hover:bg-slate-800 hover:text-white md:hidden"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* MOBILE NAVIGATION */}
      {mobileOpen && (
        <div className="border-t border-slate-800/80 bg-slate-950 px-4 py-5 sm:px-6 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {showRoleNavigation && renderNavigation(true)}

            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  onClick={closeMobile}
                  className={mobileNavLinkClass({ isActive: location.pathname === "/login" })}
                >
                  <LogIn size={18} />
                  User Login
                </Link>

                <Link
                  to="/register"
                  onClick={closeMobile}
                  className={mobileNavLinkClass({ isActive: location.pathname === "/register" })}
                >
                  <UserPlus size={18} />
                  Create User Account
                </Link>

                <Link
                  to="/admin"
                  onClick={closeMobile}
                  className={mobileNavLinkClass({ isActive: location.pathname === "/admin" })}
                >
                  <ShieldCheck size={18} />
                  Admin Login
                </Link>
              </>
            ) : (
              <>
                <div className="my-2 h-px bg-slate-800" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/5 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
