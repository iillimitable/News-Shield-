import { useNavigate } from "react-router-dom";
import {
  Users,
  MessageSquare,
  History,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

function AdminDashboard() {
  const navigate = useNavigate();

  // Admin management cards
  const cards = [
    {
      title: "Users",
      description: "Manage registered users",
      icon: Users,
      path: "/admin/users",
    },
    {
      title: "Feedback",
      description: "Review and manage user feedback",
      icon: MessageSquare,
      path: "/admin/feedback",
    },
    {
      title: "History",
      description: "Review and manage verification records",
      icon: History,
      path: "/admin/history",
    },
  ];

  return (
    <div className="min-h-full space-y-6 text-slate-100">
      {/* Dashboard heading */}
      <section className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-lg shadow-black/10 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/15 to-blue-500/10">
            <ShieldCheck size={30} className="text-cyan-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Manage users, feedback and verification history.
            </p>
          </div>
        </div>
      </section>

      {/* Admin management cards */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-6 transition duration-200 hover:-translate-y-1 hover:border-cyan-500/30 hover:bg-slate-900"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-400 transition group-hover:bg-cyan-500/15">
                <Icon size={25} />
              </div>

              <h2 className="mt-5 text-xl font-bold text-white">
                {card.title}
              </h2>

              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">
                {card.description}
              </p>

              <button
                type="button"
                onClick={() => navigate(card.path)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:from-cyan-400 hover:to-blue-400"
              >
                Open {card.title}
                <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
      </section>

      {/* Admin information */}
      <section className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 sm:p-7">
        <h2 className="text-lg font-bold text-white">
          Administration
        </h2>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          Use the management sections above to review registered
          users, manage feedback and maintain verification history.
          News verification is available separately in the User Dashboard.
        </p>
      </section>
    </div>
  );
}

export default AdminDashboard;
