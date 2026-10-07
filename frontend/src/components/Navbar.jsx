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
BarChart3,
MessageSquare,
} from "lucide-react";

function Navbar() {
const [mobileOpen, setMobileOpen] = useState(false);

const navigate = useNavigate();
useLocation();

const isLoggedIn = Boolean(
localStorage.getItem("newsShieldToken")
);
let storedUser = null;
try {
  storedUser = JSON.parse(localStorage.getItem("newsShieldUser"));
} catch (_) {}
const isAdmin = storedUser?.role === "admin";

// ==========================================
// CLOSE MOBILE MENU
// ==========================================

const closeMobile = () => {
setMobileOpen(false);
};

// ==========================================
// LOGOUT
// ==========================================

const handleLogout = () => {
// Remove login information
localStorage.removeItem("newsShieldToken");
localStorage.removeItem("newsShieldUser");

// Close mobile menu
setMobileOpen(false);

// Go to login page
navigate("/login", {
  replace: true,
});

// Refresh page so Navbar immediately
// shows Login + Create Account
window.location.reload();


};

// ==========================================
// DESKTOP NAV LINK STYLE
// ==========================================

const navLinkClass = ({ isActive }) =>
`group relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "bg-cyan-500/10 text-cyan-400"
        : "text-slate-300 hover:bg-slate-900 hover:text-white"
    }`;

// ==========================================
// MOBILE NAV LINK STYLE
// ==========================================

const mobileNavLinkClass = ({ isActive }) =>
`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "border border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
        : "text-slate-300 hover:bg-slate-900 hover:text-white"
    }`;

return ( <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/95 shadow-lg shadow-black/10 backdrop-blur-xl"> <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

    {/* LOGO */}

    <Link
      to="/"
      onClick={closeMobile}
      className="group flex items-center gap-3"
    >
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/15 to-blue-500/10 shadow-lg shadow-cyan-500/5 transition-all duration-300 group-hover:border-cyan-400/40"
      >
        <ShieldCheck
          size={25}
          className="text-cyan-400 transition-transform duration-300 group-hover:scale-110"
        />

        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/60" />
      </div>

      <div>
        <div className="flex items-center gap-1.5">
          <h1 className="text-lg font-bold tracking-tight text-white">
            NewsShield
          </h1>

          <Sparkles
            size={13}
            className="text-cyan-400"
          />
        </div>

        <p className="hidden text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 sm:block">
          News Verification
        </p>
      </div>
    </Link>

    {/* DESKTOP NAVIGATION */}

    <div className="hidden items-center gap-1 md:flex">

      <NavLink
        to="/"
        className={navLinkClass}
      >
        {({ isActive }) => (
          <>
            <span>Home</span>

            {isActive && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
            )}
          </>
        )}
      </NavLink>

      <NavLink
        to="/dashboard"
        className={navLinkClass}
      >
        {({ isActive }) => (
          <>
            <Search
              size={17}
            />

            <span>Verify News</span>

            {isActive && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
            )}
          </>
        )}
      </NavLink>

      <NavLink
        to="/history"
        className={navLinkClass}
      >
        {({ isActive }) => (
          <>
            <History
              size={17}
            />

            <span>History</span>

            {isActive && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
            )}
          </>
        )}
      </NavLink>

      {isLoggedIn && <NavLink to="/feedback" className={navLinkClass}>
        <MessageSquare size={17} />
        <span>Feedback</span>
      </NavLink>}

      {isAdmin && <NavLink to="/admin/feedback" className={navLinkClass}>
        <BarChart3 size={17} />
        <span>Feedback</span>
      </NavLink>}

    </div>

    {/* DESKTOP AUTH BUTTONS */}

    <div className="hidden items-center gap-2 md:flex">

      {!isLoggedIn ? (
        <>
          <Link
            to="/login"
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-all duration-200 hover:border-cyan-500/30 hover:bg-slate-800 hover:text-white"
          >
            <LogIn size={17} />
            Login
          </Link>

          <Link
            to="/register"
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/10 transition-all duration-200 hover:-translate-y-0.5 hover:from-cyan-400 hover:to-blue-400"
          >
            <UserPlus
              size={17}
              className="transition-transform duration-200 group-hover:scale-110"
            />

            Create Account
          </Link>
        </>
      ) : (
        <button
          type="button"
          onClick={handleLogout}
          className="group flex cursor-pointer items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/5 px-4 py-2.5 text-sm font-semibold text-red-400 transition-all duration-200 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut
            size={17}
            className="transition-transform duration-200 group-hover:-translate-x-0.5"
          />

          Logout
        </button>
      )}

    </div>

    {/* MOBILE MENU BUTTON */}

    <button
      type="button"
      onClick={() =>
        setMobileOpen(
          (previous) => !previous
        )
      }
      className="rounded-xl border border-slate-800 bg-slate-900/70 p-2.5 text-slate-300 transition-all duration-200 hover:border-cyan-500/30 hover:bg-slate-800 hover:text-white md:hidden"
      aria-label={
        mobileOpen
          ? "Close navigation menu"
          : "Open navigation menu"
      }
      aria-expanded={mobileOpen}
    >
      {mobileOpen ? (
        <X size={22} />
      ) : (
        <Menu size={22} />
      )}
    </button>

  </nav>

  {/* MOBILE NAVIGATION */}

  {mobileOpen && (
    <div className="border-t border-slate-800/80 bg-slate-950 px-4 py-5 shadow-2xl backdrop-blur-xl sm:px-6 md:hidden">

      <div className="mx-auto flex max-w-7xl flex-col gap-2">

        <NavLink
          to="/"
          onClick={closeMobile}
          className={mobileNavLinkClass}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          Home
        </NavLink>

        <NavLink
          to="/dashboard"
          onClick={closeMobile}
          className={mobileNavLinkClass}
        >
          <Search size={18} />
          Verify News
        </NavLink>

        <NavLink
          to="/history"
          onClick={closeMobile}
          className={mobileNavLinkClass}
        >
          <History size={18} />
          History
        </NavLink>

        {isLoggedIn && <NavLink to="/feedback" onClick={closeMobile} className={mobileNavLinkClass}>
          <MessageSquare size={18} />
          Feedback
        </NavLink>}

        {isAdmin && <NavLink to="/admin/feedback" onClick={closeMobile} className={mobileNavLinkClass}>
          <BarChart3 size={18} />
          Feedback
        </NavLink>}

        <div className="my-3 h-px bg-slate-800" />

        {!isLoggedIn ? (
          <>
            <Link
              to="/login"
              onClick={closeMobile}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm font-semibold text-slate-300 transition-all duration-200 hover:border-cyan-500/30 hover:bg-slate-800 hover:text-white"
            >
              <LogIn size={18} />
              Login
            </Link>

            <Link
              to="/register"
              onClick={closeMobile}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/10 transition-all duration-200 hover:from-cyan-400 hover:to-blue-400"
            >
              <UserPlus size={18} />
              Create Account
            </Link>
          </>
        ) : (
          <button
            type="button"
            onClick={handleLogout}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/5 px-4 py-3 text-sm font-semibold text-red-400 transition-all duration-200 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={18} />
            Logout
          </button>
        )}

      </div>
    </div>
  )}
</header>
);
}

export default Navbar;
