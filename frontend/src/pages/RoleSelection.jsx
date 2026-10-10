import { Link, Navigate } from "react-router-dom";
import { ShieldCheck, UserRound } from "lucide-react";

export default function RoleSelection() {
  // Check whether someone is already logged in
  const token = localStorage.getItem("newsShieldToken");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("newsShieldUser"));
  } catch {
    user = null;
  }

  // Send logged-in users to their own dashboard
  if (token && user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (token && user && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-slate-950 px-4 py-12 text-white">
      <div className="w-full max-w-3xl">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex rounded-2xl bg-blue-500/15 p-4">
            <ShieldCheck size={42} className="text-blue-400" />
          </div>

          <h1 className="text-3xl font-bold sm:text-4xl">
            Welcome to NewsShield
          </h1>

          <p className="mt-3 text-slate-400">
            Fake News Detection System
          </p>

          <h2 className="mt-8 text-xl font-semibold">
            Please select your role
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Choose how you want to continue.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* User option */}
          <Link
            to="/login"
            className="rounded-2xl border border-slate-700 bg-slate-900 p-7 transition hover:border-blue-500 hover:bg-slate-800"
          >
            <div className="mb-5 inline-flex rounded-xl bg-blue-500/15 p-4">
              <UserRound size={32} className="text-blue-400" />
            </div>

            <h3 className="text-xl font-bold">Continue as User</h3>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Register or log in to verify news, view your history,
              and submit feedback.
            </p>

            <div className="mt-6 font-semibold text-blue-400">
              User Login →
            </div>
          </Link>

          {/* Admin option */}
          <Link
            to="/admin"
            className="rounded-2xl border border-slate-700 bg-slate-900 p-7 transition hover:border-purple-500 hover:bg-slate-800"
          >
            <div className="mb-5 inline-flex rounded-xl bg-purple-500/15 p-4">
              <ShieldCheck size={32} className="text-purple-400" />
            </div>

            <h3 className="text-xl font-bold">Continue as Admin</h3>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Sign in to manage users, verification history,
              and user feedback.
            </p>

            <div className="mt-6 font-semibold text-purple-400">
              Admin Login →
            </div>
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          NewsShield helps users evaluate news using web evidence
          and AI analysis.
        </p>
      </div>
    </div>
  );
}