
import { useState } from "react";
import {
  ShieldCheck,
  Search,
  FileText,
  CheckCircle,
  XCircle,
  CircleHelp,
  Loader2,
  Trash2,
  Sparkles,
  ExternalLink,
} from "lucide-react";

import ResultCard from "../components/ResultCard";

function Dashboard() {
  const [news, setNews] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // VERIFY NEWS AND SAVE HISTORY
  // ==========================================

  const verifyNews = async () => {
    if (!news.trim()) {
      setError("Please enter a news claim first.");
      return;
    }

    const token = localStorage.getItem("newsShieldToken");

    if (!token) {
      setError("Please log in again to verify news.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // STEP 1: VERIFY NEWS
      const response = await fetch(
        "http://localhost:5001/api/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: news.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to verify the news."
        );
      }

      // Display verification result immediately
      setResult(data);

      // STEP 2: PREPARE SOURCES
      const historySources = Array.isArray(data.sources)
        ? data.sources
            .map((source) => {
              if (typeof source === "string") {
                return {
                  title: source,
                  url: source,
                };
              }

              return {
                title: source?.title || "",
                url: source?.url || "",
              };
            })
            .filter((source) => source.url)
            .slice(0, 20)
        : [];

      // STEP 3: SAVE HISTORY ONCE
      // The backend gets the user ID from the login token.
      try {
        const historyResponse = await fetch(
          "http://localhost:5001/api/history",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: news.trim(),
              verdict: data.verdict || "Unverified",
              mlPrediction:
                data.mlPrediction || "Unverified",
              mlConfidence: Number(data.mlConfidence) || 0,
              webVerdict: data.webVerdict || "Unverified",
              reason: data.reason || "",
              confidence: Number(data.confidence) || 0,
              evidenceScore: Number(data.evidenceScore) || 0,
              supportingScore:
                Number(data.supportingScore) || 0,
              contradictingScore:
                Number(data.contradictingScore) || 0,
              supportingPercentage:
                Number(data.supportingPercentage) || 0,
              contradictingPercentage:
                Number(data.contradictingPercentage) || 0,
              analysisEngine:
                data.analysisEngine ||
                "Tavily Web Search + Groq AI",
              sources: historySources,
            }),
          }
        );

        const historyData = await historyResponse.json();

        if (!historyResponse.ok) {
          console.error(
            "History save failed:",
            historyResponse.status,
            historyData
          );
        } else {
          console.log("Verification history saved successfully.");

          // Store saved record ID without showing a message
          setResult((currentResult) => ({
            ...currentResult,
            verificationId: historyData.history?._id,
          }));
        }
      } catch (historyError) {
        // Keep the verification result visible.
        // Do not show a history-save warning.
        console.error("History save error:", historyError);
      }
    } catch (err) {
      console.error("Verification error:", err);
      setResult(null);

      setError(
        err.message ||
          "Unable to connect to NewsShield backend. Please make sure the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CLEAR CURRENT NEWS
  // ==========================================

  const clearNews = () => {
    setNews("");
    setResult(null);
    setError("");
  };

  // ==========================================
  // DASHBOARD UI
  // ==========================================

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-white sm:px-6 sm:py-12">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.10),transparent_32%)]" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_32%)]" />

      <div className="pointer-events-none absolute left-1/2 top-20 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        {/* HERO HEADER */}
        <div className="mb-10 text-center">
          <div className="mb-5 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 shadow-lg shadow-cyan-500/5">
              <ShieldCheck
                size={34}
                className="text-cyan-400"
              />
            </div>
          </div>

          <div className="mb-3 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-500">
            <Sparkles size={14} />
            AI-Powered News Verification
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Verify Before You Believe
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Enter a news claim and NewsShield will search
            the web for supporting and contradicting evidence,
            then provide a clear verification result.
          </p>

          {/* Trust Points */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-400">
              Web Evidence
            </span>

            <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-400">
              AI Analysis
            </span>

            <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-400">
              Source Links
            </span>
          </div>
        </div>

        {/* MAIN INPUT CARD */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl shadow-black/10 backdrop-blur sm:p-7">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10">
              <FileText
                size={21}
                className="text-cyan-400"
              />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">
                Enter News Claim
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Paste the news, headline, or claim you
                want NewsShield to verify.
              </p>
            </div>
          </div>

          {/* TEXTAREA */}
          <div className="relative">
            <textarea
              value={news}
              onChange={(event) => {
                setNews(event.target.value);
                setError("");
              }}
              placeholder="Example: The Reserve Bank of India kept the repo rate unchanged after its monetary policy meeting."
              className="min-h-[190px] w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 p-5 text-sm leading-7 text-white outline-none transition placeholder:text-slate-600 hover:border-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10"
            />
          </div>

          {/* CHARACTER COUNTER */}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-slate-600">
              NewsShield searches available web evidence
              for your claim.
            </span>

            <span className="text-xs font-medium text-slate-500">
              {news.length} characters
            </span>
          </div>

          {/* BUTTONS */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={verifyNews}
              disabled={loading}
              className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3.5 font-bold text-slate-950 shadow-lg shadow-cyan-500/10 transition duration-200 hover:bg-cyan-400 hover:shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />
                  Searching & Verifying...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Verify News
                  <ExternalLink
                    size={17}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={clearNews}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-5 py-3.5 font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={18} />
              Clear
            </button>
          </div>

          {/* LOADING INFORMATION */}
          {loading && (
            <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-cyan-500/10 p-2">
                  <Search
                    size={17}
                    className="animate-pulse text-cyan-400"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-cyan-300">
                    NewsShield is verifying your claim
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Searching web evidence and analyzing
                    the available information...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ONLY SHOW ACTUAL VERIFICATION ERRORS */}
          {error && (
            <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-sm font-bold text-red-400">
                  !
                </div>

                <div>
                  <p className="text-sm font-semibold text-red-300">
                    Verification Notice
                  </p>

                  <p className="mt-1 text-sm leading-6 text-red-400/80">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* VERIFICATION RESULT */}
        {result && (
          <section className="mt-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10">
                <ShieldCheck
                  size={20}
                  className="text-cyan-400"
                />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-500">
                  Analysis Complete
                </p>

                <h2 className="text-xl font-bold text-white">
                  Verification Result
                </h2>
              </div>
            </div>

            <ResultCard
              verdict={result.verdict}
              mlPrediction={result.mlPrediction}
              mlConfidence={result.mlConfidence}
              webVerdict={result.webVerdict}
              reason={result.reason}
              confidence={result.confidence}
              evidenceScore={result.evidenceScore}
              supportingScore={result.supportingScore}
              contradictingScore={result.contradictingScore}
              supportingPercentage={result.supportingPercentage}
              contradictingPercentage={result.contradictingPercentage}
              analysisEngine={result.analysisEngine}
              sources={result.sources || []}
            />
          </section>
        )}

        {/* HOW RESULTS WORK */}
        <section className="mt-10">
          <div className="mb-5 text-center">
            <div className="mb-2 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-500">
              <Sparkles size={13} />
              Understand Your Result
            </div>

            <h2 className="text-2xl font-bold text-white">
              What does the verdict mean?
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              NewsShield compares available evidence before
              giving a verification status.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* REAL */}
            <div className="group rounded-2xl border border-emerald-500/20 bg-slate-900/80 p-5 transition hover:border-emerald-500/40">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
                <CheckCircle
                  size={24}
                  className="text-emerald-400"
                />
              </div>

              <h3 className="text-lg font-bold text-white">
                Real
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Strong supporting evidence is found from
                available reliable sources.
              </p>
            </div>

            {/* FAKE */}
            <div className="group rounded-2xl border border-red-500/20 bg-slate-900/80 p-5 transition hover:border-red-500/40">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10">
                <XCircle
                  size={24}
                  className="text-red-400"
                />
              </div>

              <h3 className="text-lg font-bold text-white">
                Fake
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Reliable evidence contradicts the submitted
                news claim.
              </p>
            </div>

            {/* UNVERIFIED */}
            <div className="group rounded-2xl border border-amber-500/20 bg-slate-900/80 p-5 transition hover:border-amber-500/40">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10">
                <CircleHelp
                  size={24}
                  className="text-amber-400"
                />
              </div>

              <h3 className="text-lg font-bold text-white">
                Unverified
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Available evidence is not strong enough to
                confirm or reject the claim.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <div className="mt-10 flex items-center justify-center gap-2 text-center text-xs text-slate-600">
          <ShieldCheck
            size={14}
            className="text-cyan-500/60"
          />
          NewsShield helps you evaluate information using
          web evidence and AI-assisted analysis.
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
