import FeedbackForm from "../components/FeedbackForm";
import { MessageSquare } from "lucide-react";

export default function Feedback() {
  return <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6"><div className="mx-auto max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/10"><div className="border-b border-slate-800 p-6 sm:p-8"><div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10"><MessageSquare className="h-6 w-6 text-cyan-400" /></div><h1 className="mt-4 text-3xl font-bold">Share your feedback</h1><p className="mt-2 leading-6 text-slate-400">Tell us what works well and what NewsShield can improve.</p></div><FeedbackForm /></div></main>;
}
