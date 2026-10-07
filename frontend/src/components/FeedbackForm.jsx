import { useState } from "react";
import { CheckCircle2, Loader2, MessageSquare, Star, ThumbsDown, ThumbsUp } from "lucide-react";

const categories = [
  "Correct result",
  "Incorrect result",
  "Unclear explanation",
  "Insufficient evidence",
  "Irrelevant sources",
  "Other",
];

export default function FeedbackForm({ verificationId, verificationResult }) {
  const [open, setOpen] = useState(false);
  const [helpful, setHelpful] = useState(null);
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    if (helpful === null || !rating || !category) {
      setError("Please answer the helpfulness, rating, and feedback type questions.");
      return;
    }
    const token = localStorage.getItem("newsShieldToken");
    if (!token) {
      setError("Please log in to submit feedback.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:5001/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ verificationId, verificationResult, helpful, rating, category, comment }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to submit feedback.");
      setSubmitted(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return <div className="flex items-center gap-3 border-t border-emerald-500/20 bg-emerald-500/5 px-6 py-5 text-sm text-emerald-300 sm:px-8"><CheckCircle2 className="h-5 w-5 shrink-0" />Thank you! Your feedback helps us improve NewsShield.</div>;
  }

  return (
    <div className="border-t border-slate-800 bg-slate-950/50 px-6 py-6 sm:px-8">
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-300 transition hover:border-cyan-400 hover:bg-cyan-500/20">
          <MessageSquare className="h-4 w-4" /> Give Feedback
        </button>
      ) : (
        <form onSubmit={submit} className="max-w-2xl space-y-5">
          <div><h3 className="text-base font-semibold text-white">Give Feedback</h3><p className="mt-1 text-sm text-slate-400">Help us make NewsShield more useful.</p></div>
          <fieldset><legend className="mb-2 text-sm font-medium text-slate-300">Was NewsShield helpful?</legend><div className="flex gap-3">
            {[{ value: true, label: "Yes", Icon: ThumbsUp }, { value: false, label: "No", Icon: ThumbsDown }].map(({ value, label, Icon }) => <button key={label} type="button" onClick={() => setHelpful(value)} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition ${helpful === value ? "border-cyan-400 bg-cyan-500/15 text-cyan-300" : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"}`}><Icon className="h-4 w-4" />{label}</button>)}
          </div></fieldset>
          <fieldset><legend className="mb-2 text-sm font-medium text-slate-300">Accuracy rating</legend><div className="flex gap-1" aria-label="Accuracy rating from 1 to 5 stars">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} star${value > 1 ? "s" : ""}`} className="p-1"><Star className={`h-7 w-7 ${value <= rating ? "fill-amber-400 text-amber-400" : "text-slate-600 hover:text-amber-300"}`} /></button>)}</div></fieldset>
          <label className="block text-sm font-medium text-slate-300">Feedback type<select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-cyan-500"><option value="">Select a type</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label className="block text-sm font-medium text-slate-300">Optional comment<textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={2000} rows={3} placeholder="Tell us more (optional)" className="mt-2 w-full resize-y rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500" /></label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3"><button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60">{loading && <Loader2 className="h-4 w-4 animate-spin" />}Submit Feedback</button><button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-400 hover:text-white">Cancel</button></div>
        </form>
      )}
    </div>
  );
}
