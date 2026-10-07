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
} from "lucide-react";

export default function History() {
const [history, setHistory] = useState([]);
const [expandedId, setExpandedId] = useState(null);

// =========================================================
// LOAD HISTORY FROM MONGODB
// =========================================================

useEffect(() => {
const loadHistory = async () => {
try {
const storedUser = JSON.parse(
localStorage.getItem("newsShieldUser")
);

    const userId =
      storedUser?.id ||
      storedUser?._id;

    if (!userId) {
      console.error("User ID not found.");
      setHistory([]);
      return;
    }

    console.log(
      "Loading history for user:",
      userId
    );

    const response = await fetch(
      `http://localhost:5001/api/history/${userId}`
    );

    const data = await response.json();

    console.log(
      "History API status:",
      response.status
    );

    console.log(
      "History API response:",
      data
    );

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Failed to load history."
      );
    }

    if (Array.isArray(data.history)) {
      setHistory(data.history);
    } else {
      setHistory([]);
    }
  } catch (error) {
    console.error(
      "Error loading verification history:",
      error
    );

    setHistory([]);
  }
};

loadHistory();

}, []);

// =========================================================
// DELETE ALL HISTORY
// =========================================================

const clearHistory = async () => {
const confirmDelete = window.confirm(
"Are you sure you want to clear all verification history?"
);

if (!confirmDelete) {
  return;
}

try {
  const currentHistory = [...history];

  for (const item of currentHistory) {
    const historyId = item._id;

    if (!historyId) {
      continue;
    }

    const response = await fetch(
      `http://localhost:5001/api/history/${historyId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const data = await response.json();

      console.error(
        "Delete history failed:",
        data
      );
    }
  }

  setHistory([]);
  setExpandedId(null);
} catch (error) {
  console.error(
    "Clear history error:",
    error
  );

  alert(
    "Unable to clear verification history."
  );
}

};

// =========================================================
// DELETE ONE HISTORY ITEM
// =========================================================

const deleteHistory = async (historyId) => {
if (!historyId) {
console.error(
"History ID not found."
);


  return;
}

const confirmDelete = window.confirm(
  "Are you sure you want to delete this verification?"
);

if (!confirmDelete) {
  return;
}

try {
  const response = await fetch(
    `http://localhost:5001/api/history/${historyId}`,
    {
      method: "DELETE",
    }
  );

  const data = await response.json();

  console.log(
    "Delete history response:",
    data
  );

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Failed to delete verification."
    );
  }

  setHistory((currentHistory) =>
    currentHistory.filter(
      (item) =>
        item._id !== historyId
    )
  );

  setExpandedId(null);
} catch (error) {
  console.error(
    "Delete history error:",
    error
  );

  alert(
    "Unable to delete verification history."
  );
}

};

// =========================================================
// EXPAND / COLLAPSE
// =========================================================

const toggleDetails = (id) => {
setExpandedId((currentId) =>
currentId === id ? null : id
);
};

// =========================================================
// VERDICT DATA
// =========================================================

const getVerdictData = (verdict) => {
const value = String(
verdict || ""
).toLowerCase();


if (value === "real") {
  return {
    label: "Real",
    icon: CheckCircle,
    badge:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    iconBg:
      "bg-emerald-500/10 text-emerald-400",
    accent:
      "border-emerald-500/20",
  };
}

if (value === "fake") {
  return {
    label: "Fake",
    icon: XCircle,
    badge:
      "border-red-500/20 bg-red-500/10 text-red-400",
    iconBg:
      "bg-red-500/10 text-red-400",
    accent:
      "border-red-500/20",
  };
}

return {
  label: "Unverified",
  icon: CircleHelp,
  badge:
    "border-amber-500/20 bg-amber-500/10 text-amber-400",
  iconBg:
    "bg-amber-500/10 text-amber-400",
  accent:
    "border-amber-500/20",
};


};

// =========================================================
// FORMAT PERCENTAGE
// =========================================================

const formatPercentage = (value) => {
const number = Number(value);

if (Number.isNaN(number)) {
  return "0%";
}

const percentage =
  number <= 1
    ? number * 100
    : number;

return `${Math.max(
  0,
  Math.min(100, percentage)
).toFixed(0)}%`;


};

// =========================================================
// STATISTICS
// =========================================================

const realCount = history.filter(
(item) =>
String(item.verdict || "")
.toLowerCase() === "real"
).length;

const fakeCount = history.filter(
(item) =>
String(item.verdict || "")
.toLowerCase() === "fake"
).length;

const unverifiedCount = history.filter(
(item) =>
String(item.verdict || "")
.toLowerCase() === "unverified"
).length;

// =========================================================
// UI
// =========================================================

return ( <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-white sm:py-12">
{/* Background Effects */}


  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.10),transparent_32%)]" />

  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_32%)]" />

  <div className="relative mx-auto max-w-6xl">

    {/* =====================================================
        HEADER
    ===================================================== */}

    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400">
          <HistoryIcon size={14} />
          Verification Records
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
            <ShieldCheck
              className="h-6 w-6 text-cyan-400"
            />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Verification History
          </h1>
        </div>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
          Review your previous news verification
          results, evidence scores, and trusted sources.
        </p>
      </div>

      {history.length > 0 && (
        <button
          type="button"
          onClick={clearHistory}
          className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-400 transition hover:border-red-500/50 hover:bg-red-500/20"
        >
          <Trash2 className="h-4 w-4" />
          Clear History
        </button>
      )}
    </div>

    {/* =====================================================
        STATISTICS
    ===================================================== */}

    <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">

      {/* Total */}

      <div className="group rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-black/10 transition hover:border-cyan-500/20">
        <div className="flex items-center justify-between">
          <div className="rounded-xl bg-cyan-500/10 p-2.5">
            <Search className="h-5 w-5 text-cyan-400" />
          </div>

          <span className="text-xs font-medium uppercase tracking-wider text-slate-600">
            All
          </span>
        </div>

        <p className="mt-5 text-sm text-slate-400">
          Total Checks
        </p>

        <p className="mt-1 text-3xl font-bold text-white">
          {history.length}
        </p>
      </div>

      {/* Real */}

      <div className="group rounded-2xl border border-emerald-500/20 bg-slate-900/80 p-5 shadow-lg shadow-black/10 transition hover:border-emerald-500/40">
        <div className="flex items-center justify-between">
          <div className="rounded-xl bg-emerald-500/10 p-2.5">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
          </div>

          <span className="text-xs font-medium uppercase tracking-wider text-emerald-500/60">
            Verified
          </span>
        </div>

        <p className="mt-5 text-sm text-slate-400">
          Real News
        </p>

        <p className="mt-1 text-3xl font-bold text-emerald-400">
          {realCount}
        </p>
      </div>

      {/* Fake */}

      <div className="group rounded-2xl border border-red-500/20 bg-slate-900/80 p-5 shadow-lg shadow-black/10 transition hover:border-red-500/40">
        <div className="flex items-center justify-between">
          <div className="rounded-xl bg-red-500/10 p-2.5">
            <XCircle className="h-5 w-5 text-red-400" />
          </div>

          <span className="text-xs font-medium uppercase tracking-wider text-red-500/60">
            Alert
          </span>
        </div>

        <p className="mt-5 text-sm text-slate-400">
          Fake News
        </p>

        <p className="mt-1 text-3xl font-bold text-red-400">
          {fakeCount}
        </p>
      </div>

      {/* Unverified */}

      <div className="group rounded-2xl border border-amber-500/20 bg-slate-900/80 p-5 shadow-lg shadow-black/10 transition hover:border-amber-500/40">
        <div className="flex items-center justify-between">
          <div className="rounded-xl bg-amber-500/10 p-2.5">
            <CircleHelp className="h-5 w-5 text-amber-400" />
          </div>

          <span className="text-xs font-medium uppercase tracking-wider text-amber-500/60">
            Pending
          </span>
        </div>

        <p className="mt-5 text-sm text-slate-400">
          Unverified
        </p>

        <p className="mt-1 text-3xl font-bold text-amber-400">
          {unverifiedCount}
        </p>
      </div>
    </div>

    {/* =====================================================
        EMPTY STATE
    ===================================================== */}

    {history.length === 0 && (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 px-6 py-20 text-center shadow-xl shadow-black/10">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-500/20 bg-cyan-500/10">
          <FileText className="h-9 w-9 text-cyan-400" />
        </div>

        <div className="mb-2 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-500">
          <Sparkles size={13} />
          NewsShield
        </div>

        <h2 className="text-2xl font-bold text-white">
          No Verification History
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
          Your verified news articles will appear here
          after you complete your first verification.
        </p>
      </div>
    )}

    {/* =====================================================
        HISTORY LIST
    ===================================================== */}

    {history.length > 0 && (
      <div className="space-y-4">

        {history.map((item, index) => {
          const itemId =
            item._id ||
            item.id ||
            `${item.createdAt || "history"}-${index}`;

          const isExpanded =
            expandedId === itemId;

          const verdictData =
            getVerdictData(item.verdict);

          const VerdictIcon =
            verdictData.icon;

          return (
            <div
              key={itemId}
              className={`overflow-hidden rounded-2xl border bg-slate-900/90 shadow-lg shadow-black/10 transition ${
                isExpanded
                  ? "border-cyan-500/20"
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >

              {/* =================================================
                  SUMMARY
              ================================================= */}

              <button
                type="button"
                onClick={() =>
                  toggleDetails(itemId)
                }
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

                    {item.mlPrediction && item.mlPrediction !== "Unverified" && (
                      <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-400">
                        ML Pred: <span className="font-bold">{item.mlPrediction}</span> ({item.mlConfidence}%)
                      </span>
                    )}

                    {item.confidence !==
                      undefined && (
                      <span className="rounded-full border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-400">
                        Web Conf{" "}
                        <span className="font-bold text-slate-300">
                          {formatPercentage(
                            item.confidence
                          )}
                        </span>
                      </span>
                    )}
                  </div>

                  <h2 className="line-clamp-2 text-base font-semibold leading-6 text-white sm:text-lg">
                    {item.title ||
                      item.text ||
                      "News verification"}
                  </h2>

                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <HistoryIcon className="h-3.5 w-3.5" />

                    {item.createdAt
                      ? new Date(
                          item.createdAt
                        ).toLocaleString()
                      : item.date ||
                        "Verification completed"}
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

              {/* =================================================
                  EXPANDED DETAILS
              ================================================= */}

              {isExpanded && (
                <div className="border-t border-slate-800 bg-slate-950/50 p-5 sm:p-6">

                  {/* Reason */}

                  <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="rounded-lg bg-cyan-500/10 p-2">
                        <ShieldCheck className="h-4 w-4 text-cyan-400" />
                      </div>

                      <h3 className="font-semibold text-white">
                        Verification Reason
                      </h3>
                    </div>

                    <p className="text-sm leading-7 text-slate-400">
                      {item.reason ||
                        "No verification reason available."}
                    </p>
                  </div>

                  {/* Scores */}

                  <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Evidence Score
                      </p>

                      <p className="mt-2 text-3xl font-bold text-cyan-400">
                        {formatPercentage(
                          item.evidenceScore
                        )}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Supporting Evidence
                      </p>

                      <p className="mt-2 text-3xl font-bold text-emerald-400">
                        {formatPercentage(
                          item.supportingPercentage ??
                            item.supportingScore
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

                  {/* Analysis Engine */}

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
                            "Tavily Web Search + Gemini AI"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sources */}

                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <div className="rounded-lg bg-cyan-500/10 p-2">
                        <ExternalLink className="h-4 w-4 text-cyan-400" />
                      </div>

                      <h3 className="font-semibold text-white">
                        Evidence Sources
                      </h3>
                    </div>

                    {Array.isArray(
                      item.sources
                    ) &&
                    item.sources.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

                        {item.sources.map(
                          (
                            source,
                            sourceIndex
                          ) => {
                            const sourceUrl =
                              typeof source ===
                              "string"
                                ? source.trim()
                                : typeof source?.url ===
                                  "string"
                                ? source.url.trim()
                                : "";

                            if (!sourceUrl) {
                              return null;
                            }

                            const sourceTitle =
                              typeof source ===
                              "string"
                                ? sourceUrl
                                : source?.title?.trim() ||
                                  sourceUrl ||
                                  "News Source";

                            return (
                              <a
                                key={`${sourceUrl}-${sourceIndex}`}
                                href={sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex min-w-0 items-start gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-cyan-500/30 hover:bg-slate-800"
                              >
                                <div className="mt-0.5 shrink-0 rounded-lg bg-cyan-500/10 p-2">
                                  <ExternalLink className="h-4 w-4 text-cyan-400 transition group-hover:text-cyan-300" />
                                </div>

                                <div className="min-w-0">
                                  <p className="line-clamp-2 break-words text-sm font-semibold text-slate-200 transition group-hover:text-cyan-300">
                                    {sourceTitle}
                                  </p>

                                  <p className="mt-1 break-all text-xs text-slate-600">
                                    {sourceUrl}
                                  </p>
                                </div>
                              </a>
                            );
                          }
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-5 text-sm text-slate-500">
                        No source links available.
                      </div>
                    )}
                  </div>

                  {/* Delete */}

                  <div className="mt-7 flex justify-end border-t border-slate-800 pt-5">
                    <button
                      type="button"
                      onClick={() =>
                        deleteHistory(
                          item._id
                        )
                      }
                      className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:border-red-500/50 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Verification
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    )}
  </div>
</main>
);
}
