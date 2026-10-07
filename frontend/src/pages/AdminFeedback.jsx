import { useEffect, useState } from "react";
import { BarChart3, MessageSquare, Star, ThumbsUp } from "lucide-react";

export default function AdminFeedback() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/admin/feedback", {
          headers: { Authorization: `Bearer ${localStorage.getItem("newsShieldToken")}` },
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Unable to load feedback.");
        setData(payload);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <main className="min-h-screen bg-slate-950 p-10 text-center text-slate-400">Loading feedback management…</main>;
  if (error) return <main className="min-h-screen bg-slate-950 p-10 text-center text-red-400">{error}</main>;
  const { feedback, statistics } = data;
  const cards = [
    { label: "Total feedback", value: statistics.total, Icon: MessageSquare, color: "text-cyan-400" },
    { label: "Average rating", value: `${statistics.averageRating} / 5`, Icon: Star, color: "text-amber-400" },
    { label: "Helpful results", value: `${statistics.helpfulPercentage}%`, Icon: ThumbsUp, color: "text-emerald-400" },
  ];

  return <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6"><div className="mx-auto max-w-7xl">
    <div className="mb-8"><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400"><BarChart3 className="h-4 w-4" />Admin Dashboard</div><h1 className="text-3xl font-bold">Feedback Management</h1><p className="mt-2 text-slate-400">Review user feedback and identify opportunities to improve NewsShield.</p></div>
    <div className="mb-8 grid gap-4 sm:grid-cols-3">{cards.map(({ label, value, Icon, color }) => <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><Icon className={`h-5 w-5 ${color}`} /><p className="mt-4 text-sm text-slate-400">{label}</p><p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p></div>)}</div>
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-5"><h2 className="font-semibold">Feedback categories</h2><div className="mt-4 flex flex-wrap gap-3">{Object.entries(statistics.categories).length ? Object.entries(statistics.categories).map(([category, count]) => <span key={category} className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-300">{category}: <b className="text-cyan-300">{count}</b></span>) : <p className="text-sm text-slate-500">No feedback yet.</p>}</div></section>
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900"><div className="border-b border-slate-800 p-5"><h2 className="font-semibold">All feedback</h2></div>{feedback.length ? <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-950 text-xs uppercase tracking-wide text-slate-500"><tr><th className="p-4">User</th><th className="p-4">Result</th><th className="p-4">Helpful</th><th className="p-4">Rating</th><th className="p-4">Category</th><th className="p-4">Comment</th><th className="p-4">Date</th></tr></thead><tbody>{feedback.map((item) => <tr key={item._id} className="border-t border-slate-800 text-slate-300"><td className="p-4"><div>{item.userId?.name || "Deleted user"}</div><div className="text-xs text-slate-500">{item.userId?.email || ""}</div></td><td className="p-4">{item.verificationResult}</td><td className="p-4">{item.helpful ? "Yes" : "No"}</td><td className="p-4 text-amber-400">{"★".repeat(item.rating)}<span className="text-slate-600">{"★".repeat(5 - item.rating)}</span></td><td className="p-4">{item.category}</td><td className="max-w-xs p-4 text-slate-400">{item.comment || "—"}</td><td className="p-4 text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div> : <p className="p-8 text-center text-slate-500">No feedback has been submitted yet.</p>}</section>
  </div></main>;
}
