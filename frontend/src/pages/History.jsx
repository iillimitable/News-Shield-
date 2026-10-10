
import { useEffect, useState } from "react";
import {
  History as HistoryIcon,
  CheckCircle,
  XCircle,
  CircleHelp,
  FileText,
  Trash2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Search,
  Sparkles,
  Users,
  UserRound,
} from "lucide-react";

const API_URL = "http://localhost:5001";

export default function History() {
  const [history, setHistory] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [view, setView] = useState("mine");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load personal or public verification history.
  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      setError("");
      setHistory([]);
      setExpandedId(null);

      try {
        const storedUser = JSON.parse(
          localStorage.getItem("newsShieldUser") || "null"
        );

        const token = localStorage.getItem("newsShieldToken");

        let endpoint;

        if (view === "mine") {
          const userId = storedUser?.id || storedUser?._id;

          if (!userId) {
            throw new Error("Please log in to view your history.");
          }

          endpoint = `${API_URL}/api/history/${userId}`;
        } else {
          if (!token) {
            throw new Error("Please log in to view public history.");
          }

          endpoint = `${API_URL}/api/history/all`;
        }

        const response = await fetch(endpoint, {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load verification history."
          );
        }

        setHistory(
          Array.isArray(data.history) ? data.history : []
        );
      } catch (err) {
        console.error("History loading error:", err);
        setError(err.message || "Unable to load history.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [view]);

  // Delete one record. This action is available only in My History.
  const deleteHistory = async (historyId) => {
    if (view !== "mine" || !historyId) return;

    if (!window.confirm("Delete this verification record?")) return;

    try {
      const token = localStorage.getItem("newsShieldToken");

      const response = await fetch(
        `${API_URL}/api/history/${historyId}`,
        {
          method: "DELETE",
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete record.");
      }

      setHistory((current) =>
        current.filter((item) => item._id !== historyId)
      );
      setExpandedId(null);
    } catch (err) {
      console.error("Delete history error:", err);
      alert(err.message || "Unable to delete verification.");
    }
  };

  // Clear the current user's records only.
  const clearHistory = async () => {
    if (view !== "mine" || history.length === 0) return;

    if (
      !window.confirm(
        "Are you sure you want to clear your verification history?"
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("newsShieldToken");

      for (const item of history) {
        if (!item._id) continue;

        const response = await fetch(
          `${API_URL}/api/history/${item._id}`,
          {
            method: "DELETE",
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : {},
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "A record could not be deleted.");
        }
      }

      setHistory([]);
      setExpandedId(null);
    } catch (err) {
      console.error("Clear history error:", err);
      alert(
        err.message ||
          "Some records may not have been deleted. Please reload history."
      );

      // Refresh the selected tab after a partial failure.
      setView((current) => (current === "mine" ? "all" : "mine"));
      setTimeout(() => {
        setView((current) => (current === "mine" ? "all" : "mine"));
      }, 0);
    }
  };

  // Expand or collapse a record.
  const toggleDetails = (id) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  // Verdict badge styles.
  const getVerdictData = (verdict) => {
    const value = String(verdict || "").toLowerCase();

    if (value === "real") {
      return {
        label: "Real",
        icon: CheckCircle,
        badge:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
      };
    }

    if (value === "fake") {
      return {
        label: "Fake",
        icon: XCircle,
        badge: "border-red-500/20 bg-red-500/10 text-red-400",
      };
    }

    return {
      label: "Unverified",
      icon: CircleHelp,
      badge: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    };
  };

  // Supports values such as 0.75 and 75.
  const formatPercentage = (value) => {
    const number = Number(value);

    if (value === null || value === undefined || value === "") {
      return "0%";
    }

    if (!Number.isFinite(number)) return "0%";

    const percentage = number <= 1 ? number * 100 : number;

    return `${Math.max(0, Math.min(100, percentage)).toFixed(0)}%`;
  };

  // Statistics for the selected tab.
  const realCount = history.filter(
    (item) => String(item.verdict || "").toLowerCase() === "real"
  ).length;

  const fakeCount = history.filter(
    (item) => String(item.verdict || "").toLowerCase() === "fake"
  ).length;

  const unverifiedCount = history.filter(
    (item) => String(item.verdict || "").toLowerCase() === "unverified"
  ).length;

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-white sm:py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.10),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_32%)]" />

      <div className="relative mx-auto max-w-6xl">
        {/* Page heading */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400">
              <HistoryIcon size={14} />
              Verification Records
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
                <ShieldCheck className="h-6 w-6 text-cyan-400" />
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Verification History
              </h1>
            </div>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Review verification results, evidence scores, and trusted sources.
            </p>
          </div>

          {view === "mine" && history.length > 0 && !loading && (
            <button
              type="button"
              onClick={clearHistory}
              className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
            >
              <Trash2 className="h-4 w-4" />
              Clear My History
            </button>
          )}
        </div>

        {/* History tabs */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setView("mine")}
            className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition ${
              view === "mine"
                ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
            }`}
          >
            <UserRound size={18} />
            My History
          </button>

          <button
            type="button"
            onClick={() => setView("all")}
            className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition ${
              view === "all"
                ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
            }`}
          >
            <Users size={18} />
            All Users' History
          </button>
        </div>

        <p className="mb-6 text-sm text-slate-400">
          {view === "mine"
            ? "These are your own verification records."
            : "Browse shared verification results. Other users' personal details are not displayed."}
        </p>

        {/* Loading and error states */}
        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center text-slate-400">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />
            Loading verification history...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
            <p className="font-semibold text-red-400">Unable to load history</p>
            <p className="mt-2 text-sm text-slate-400">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Statistics */}
            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                <div className="rounded-xl bg-cyan-500/10 p-2.5 inline-flex">
                  <Search className="h-5 w-5 text-cyan-400" />
                </div>
                <p className="mt-5 text-sm text-slate-400">Total Checks</p>
                <p className="mt-1 text-3xl font-bold">{history.length}</p>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/80 p-5">
                <div className="inline-flex rounded-xl bg-emerald-500/10 p-2.5">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                </div>
                <p className="mt-5 text-sm text-slate-400">Real News</p>
                <p className="mt-1 text-3xl font-bold text-emerald-400">
                  {realCount}
                </p>
              </div>

              <div className="rounded-2xl border border-red-500/20 bg-slate-900/80 p-5">
                <div className="inline-flex rounded-xl bg-red-500/10 p-2.5">
                  <XCircle className="h-5 w-5 text-red-400" />
                </div>
                <p className="mt-5 text-sm text-slate-400">Fake News</p>
                <p className="mt-1 text-3xl font-bold text-red-400">
                  {fakeCount}
                </p>
              </div>

              <div className="rounded-2xl border border-amber-500/20 bg-slate-900/80 p-5">
                <div className="inline-flex rounded-xl bg-amber-500/10 p-2.5">
                  <CircleHelp className="h-5 w-5 text-amber-400" />
                </div>
                <p className="mt-5 text-sm text-slate-400">Unverified</p>
                <p className="mt-1 text-3xl font-bold text-amber-400">
                  {unverifiedCount}
                </p>
              </div>
            </div>

            {/* Empty state */}
            {history.length === 0 && (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 px-6 py-20 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-500/20 bg-cyan-500/10">
                  <FileText className="h-9 w-9 text-cyan-400" />
                </div>

                <div className="mb-2 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-500">
                  <Sparkles size={13} />
                  NewsShield
                </div>

                <h2 className="text-2xl font-bold">
                  {view === "mine"
                    ? "No Verification History"
                    : "No Shared Results Yet"}
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
                  {view === "mine"
                    ? "Your verified news articles will appear here after your first verification."
                    : "No public verification results are available yet."}
                </p>
              </div>
            )}

            {/* History records */}
            {history.length > 0 && (
              <div className="space-y-4">
                {history.map((item, index) => {
                  const itemId =
                    item._id || item.id || `${item.createdAt}-${index}`;

                  const isExpanded = expandedId === itemId;
                  const verdictData = getVerdictData(item.verdict);
                  const VerdictIcon = verdictData.icon;

                  return (
                    <div
                      key={itemId}
                      className={`overflow-hidden rounded-2xl border bg-slate-900/90 shadow-lg transition ${
                        isExpanded
                          ? "border-cyan-500/20"
                          : "border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {/* Record summary */}
                      <button
                        type="button"
                        onClick={() => toggleDetails(itemId)}
                        className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-slate-800/40 sm:p-6"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="mb-3 flex flex-wrap items-center gap-3">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${verdictData.badge}`}
                            >
                              <VerdictIcon className="h-4 w-4" />
                              {verdictData.label}
                            </span>

                            {item.confidence !== undefined && (
                              <span className="rounded-full border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-400">
                                Confidence{" "}
                                <span className="font-bold text-slate-300">
                                  {formatPercentage(item.confidence)}
                                </span>
                              </span>
                            )}
                          </div>

                          <h2 className="line-clamp-2 text-base font-semibold leading-6 text-white sm:text-lg">
                            {item.title || item.text || "News verification"}
                          </h2>

                          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                            <HistoryIcon className="h-3.5 w-3.5" />
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleString()
                              : "Verification completed"}
                          </div>
                        </div>

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-950">
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-cyan-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="border-t border-slate-800 bg-slate-950/50 p-5 sm:p-6">
                          <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
                            <div className="mb-3 flex items-center gap-2">
                              <div className="rounded-lg bg-cyan-500/10 p-2">
                                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                              </div>
                              <h3 className="font-semibold">
                                Verification Reason
                              </h3>
                            </div>
                            <p className="text-sm leading-7 text-slate-400">
                              {item.reason || "No verification reason available."}
                            </p>
                          </div>

                          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Evidence Score
                              </p>
                              <p className="mt-2 text-3xl font-bold text-cyan-400">
                                {formatPercentage(item.evidenceScore)}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Supporting Evidence
                              </p>
                              <p className="mt-2 text-3xl font-bold text-emerald-400">
                                {formatPercentage(
                                  item.supportingPercentage ?? item.supportingScore
                                )}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Contradicting Evidence
                              </p>
                              <p className="mt-2 text-3xl font-bold text-red-400">
                                {formatPercentage(
                                  item.contradictingPercentage ??
                                    item.contradictingScore
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
                            <div className="flex items-start gap-3">
                              <div className="rounded-xl bg-cyan-500/10 p-2.5">
                                <Sparkles className="h-5 w-5 text-cyan-400" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                  Analysis Engine
                                </p>
                                <p className="mt-1 font-medium text-white">
                                  {item.analysisEngine ||
                                    "Tavily Web Search + AI"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Evidence source links */}
                          <div>
                            <div className="mb-4 flex items-center gap-2">
                              <div className="rounded-lg bg-cyan-500/10 p-2">
                                <ExternalLink className="h-4 w-4 text-cyan-400" />
                              </div>
                              <h3 className="font-semibold">Evidence Sources</h3>
                            </div>

                            {Array.isArray(item.sources) &&
                            item.sources.length > 0 ? (
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {item.sources.map((source, sourceIndex) => {
                                  const sourceUrl =
                                    typeof source === "string"
                                      ? source.trim()
                                      : typeof source?.url === "string"
                                      ? source.url.trim()
                                      : "";

                                  if (!sourceUrl) return null;

                                  const sourceTitle =
                                    typeof source === "string"
                                      ? sourceUrl
                                      : source?.title?.trim() || sourceUrl;

                                  return (
                                    <a
                                      key={`${sourceUrl}-${sourceIndex}`}
                                      href={sourceUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="group flex min-w-0 items-start gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-cyan-500/30 hover:bg-slate-800"
                                    >
                                      <div className="mt-0.5 shrink-0 rounded-lg bg-cyan-500/10 p-2">
                                        <ExternalLink className="h-4 w-4 text-cyan-400" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="line-clamp-2 break-words text-sm font-semibold text-slate-200 group-hover:text-cyan-300">
                                          {sourceTitle}
                                        </p>
                                        <p className="mt-1 break-all text-xs text-slate-600">
                                          {sourceUrl}
                                        </p>
                                      </div>
                                    </a>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-5 text-sm text-slate-500">
                                No source links available.
                              </div>
                            )}
                          </div>

                          {/* Other users' records cannot be deleted here */}
                          {view === "mine" && (
                            <div className="mt-7 flex justify-end border-t border-slate-800 pt-5">
                              <button
                                type="button"
                                onClick={() => deleteHistory(item._id)}
                                className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Verification
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
