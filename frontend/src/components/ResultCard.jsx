import {
  CheckCircle,
  XCircle,
  CircleHelp,
  ShieldCheck,
  ExternalLink,
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Globe,
  FlaskConical,
  AlertTriangle,
} from "lucide-react";

export default function ResultCard({
  verdict = "Unverified",
  mlPrediction = "Unverified",
  mlConfidence = 0,
  webVerdict = "Unverified",
  reason = "",
  confidence = 0,
  evidenceScore = 0,
  supportingScore = 0,
  contradictingScore = 0,
  supportingPercentage,
  contradictingPercentage,
  analysisEngine = "Hybrid: NLP ML Classifier + Web Search + Gemini LLM",
  sources = [],
}) {
  // ── helpers ──────────────────────────────────────────────
  const toNumber = (v) => {
    const n = Number(v);
    return Number.isNaN(n) || !Number.isFinite(n) ? 0 : n;
  };
  const clamp = (v) => Math.max(0, Math.min(100, toNumber(v)));
  const s2p = (v) => {
    const n = toNumber(v);
    return n <= 1 ? n * 100 : n;
  };
  const fmt = (v) => `${clamp(v).toFixed(0)}%`;

  const confidenceValue = clamp(s2p(confidence));
  const evidenceValue = clamp(s2p(evidenceScore));
  const supportingValue =
    supportingPercentage != null
      ? clamp(supportingPercentage)
      : clamp(s2p(supportingScore));
  const contradictingValue =
    contradictingPercentage != null
      ? clamp(contradictingPercentage)
      : clamp(s2p(contradictingScore));

  // ── per-verdict styling ───────────────────────────────────
  const verdictStyle = (v) => {
    const val = String(v || "").toLowerCase();
    if (val === "real")
      return {
        label: "REAL",
        icon: CheckCircle,
        color: "text-emerald-400",
        border: "border-emerald-500/30",
        bg: "bg-emerald-500/10",
        bar: "bg-emerald-500",
        badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        glow: "shadow-[0_0_40px_rgba(52,211,153,0.10)]",
      };
    if (val === "fake")
      return {
        label: "FAKE",
        icon: XCircle,
        color: "text-red-400",
        border: "border-red-500/30",
        bg: "bg-red-500/10",
        bar: "bg-red-500",
        badge: "border-red-500/30 bg-red-500/10 text-red-400",
        glow: "shadow-[0_0_40px_rgba(248,113,113,0.10)]",
      };
    return {
      label: "UNVERIFIED",
      icon: CircleHelp,
      color: "text-amber-400",
      border: "border-amber-500/30",
      bg: "bg-amber-500/10",
      bar: "bg-amber-500",
      badge: "border-amber-500/30 bg-amber-500/10 text-amber-400",
      glow: "shadow-[0_0_40px_rgba(251,191,36,0.10)]",
    };
  };

  const mlStyle = verdictStyle(mlPrediction);
  const webStyle = verdictStyle(webVerdict);
  const MLIcon = mlStyle.icon;
  const WebIcon = webStyle.icon;

  // Detect conflict
  const conflict =
    mlPrediction !== "Unverified" &&
    webVerdict !== "Unverified" &&
    mlPrediction.toLowerCase() !== webVerdict.toLowerCase();

  // ── sources ───────────────────────────────────────────────
  const safeSources = Array.isArray(sources)
    ? sources
        .map((s) => {
          if (typeof s === "string") {
            const u = s.trim();
            return u ? { title: u, url: u } : null;
          }
          if (s && typeof s === "object") {
            const url =
              typeof s.url === "string" ? s.url.trim() : "";
            if (!url) return null;
            return {
              title:
                typeof s.title === "string" && s.title.trim()
                  ? s.title.trim()
                  : "News Source",
              url,
            };
          }
          return null;
        })
        .filter(Boolean)
    : [];

  // ── shared sub-components ─────────────────────────────────
  const ScoreBar = ({ label, value, color, textColor }) => (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs text-slate-500">{label}</span>
        <span className={`text-xs font-bold ${textColor}`}>{fmt(value)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  // ── render ────────────────────────────────────────────────
  return (
    <div className="mt-8 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">

      {/* ── TOP HEADER ─────────────────────────────────── */}
      <div className="border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 px-6 py-5 sm:px-8">
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
          NewsShield · Hybrid AI Verification
        </p>
        <p className="text-sm text-slate-400">
          Powered by NLP Machine Learning + Real-Time Web Evidence + Groq AI
        </p>

        {/* Conflict warning */}
        {conflict && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <p className="text-sm leading-6 text-amber-300">
              <span className="font-bold">Conflict Detected:</span> The ML
              model predicts{" "}
              <span className="font-bold">{mlPrediction}</span>, but the web
              evidence suggests{" "}
              <span className="font-bold">{webVerdict}</span>. ML predictions
              are based on past data patterns — the web evidence below reflects
              current facts. Read the AI explanation carefully.
            </p>
          </div>
        )}
      </div>

      {/* ── TWO PANEL PARTITION ────────────────────────── */}
      <div className="grid grid-cols-1 divide-y divide-slate-800 lg:grid-cols-2 lg:divide-x lg:divide-y-0">

        {/* ══════════════════════════════════════
            LEFT PANEL — MACHINE LEARNING
        ══════════════════════════════════════ */}
        <div className={`p-6 sm:p-8 ${mlStyle.glow}`}>
          {/* Panel Label */}
          <div className="mb-5 flex items-center gap-2">
            <div className={`rounded-lg p-1.5 ${mlStyle.bg}`}>
              <FlaskConical className={`h-4 w-4 ${mlStyle.color}`} />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Machine Learning Analysis
            </span>
          </div>

          {/* Big Verdict Badge */}
          <div
            className={`mb-6 flex items-center gap-4 rounded-2xl border p-5 ${mlStyle.border} ${mlStyle.bg}`}
          >
            <MLIcon className={`h-10 w-10 shrink-0 ${mlStyle.color}`} />
            <div>
              <p className="text-xs text-slate-400">ML Prediction</p>
              <p className={`text-3xl font-black ${mlStyle.color}`}>
                {mlStyle.label}
              </p>
            </div>
          </div>

          {/* Confidence Bar */}
          <div className="mb-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400">
                ML Confidence
              </span>
              <span className={`text-2xl font-black ${mlStyle.color}`}>
                {fmt(mlConfidence)}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-700 ${mlStyle.bar}`}
                style={{ width: `${clamp(mlConfidence)}%` }}
              />
            </div>
          </div>

          {/* How this works */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="mb-2 flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-cyan-400" />
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                How This Works
              </p>
            </div>
            <p className="text-xs leading-5 text-slate-400">
              The NLP model cleaned the text, converted it to TF-IDF
              numerical vectors, and Logistic Regression classified it
              based on patterns from{" "}
              <span className="font-semibold text-slate-300">72,134</span>{" "}
              labeled news articles.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["NLP Preprocessing", "TF-IDF", "Logistic Regression"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-cyan-500/20 bg-cyan-500/5 px-2.5 py-1 text-xs font-medium text-cyan-400"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-600">
            ⚠ ML confidence is NOT factual certainty. It measures how closely
            the text matches patterns in the training dataset.
          </p>
        </div>

        {/* ══════════════════════════════════════
            RIGHT PANEL — WEB EVIDENCE
        ══════════════════════════════════════ */}
        <div className={`p-6 sm:p-8 ${webStyle.glow}`}>
          {/* Panel Label */}
          <div className="mb-5 flex items-center gap-2">
            <div className={`rounded-lg p-1.5 ${webStyle.bg}`}>
              <Globe className={`h-4 w-4 ${webStyle.color}`} />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Web Evidence Analysis
            </span>
          </div>

          {/* Big Verdict Badge */}
          <div
            className={`mb-6 flex items-center gap-4 rounded-2xl border p-5 ${webStyle.border} ${webStyle.bg}`}
          >
            <WebIcon className={`h-10 w-10 shrink-0 ${webStyle.color}`} />
            <div>
              <p className="text-xs text-slate-400">Web Verdict</p>
              <p className={`text-3xl font-black ${webStyle.color}`}>
                {webStyle.label}
              </p>
            </div>
          </div>

          {/* Web Confidence Bar */}
          <div className="mb-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400">
                Groq Confidence
              </span>
              <span className={`text-2xl font-black ${webStyle.color}`}>
                {fmt(confidenceValue)}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-700 ${webStyle.bar}`}
                style={{ width: `${confidenceValue}%` }}
              />
            </div>
          </div>

          {/* Evidence Scores */}
          <div className="mb-5 space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Evidence Breakdown
            </p>
            <ScoreBar
              label="Overall Evidence Score"
              value={evidenceValue}
              color="bg-blue-500"
              textColor="text-blue-400"
            />
            <ScoreBar
              label="Supporting Evidence"
              value={supportingValue}
              color="bg-emerald-500"
              textColor="text-emerald-400"
            />
            <ScoreBar
              label="Contradicting Evidence"
              value={contradictingValue}
              color="bg-red-500"
              textColor="text-red-400"
            />
          </div>

          {/* AI Explanation */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Groq AI Explanation
              </p>
            </div>
            <p className="text-sm leading-6 text-slate-300">
              {reason || "No explanation was provided."}
            </p>
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-600">
            ⚠ Web evidence reflects currently available online sources at the
            time of verification. New information may change the verdict.
          </p>
        </div>
      </div>

      {/* ── SOURCES ─────────────────────────────────────── */}
      <div className="border-t border-slate-800 p-6 sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-500/10 p-2.5">
              <ExternalLink className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Evidence Sources</h3>
              <p className="text-sm text-slate-500">
                Live web sources retrieved by Tavily
              </p>
            </div>
          </div>
          {safeSources.length > 0 && (
            <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-400">
              {safeSources.length}{" "}
              {safeSources.length === 1 ? "source" : "sources"}
            </span>
          )}
        </div>

        {safeSources.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {safeSources.map((source, index) => (
              <a
                key={`${source.url}-${index}`}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-w-0 items-start gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 transition duration-200 hover:border-cyan-500/40 hover:bg-slate-800/70"
              >
                <div className="mt-0.5 shrink-0 rounded-xl bg-cyan-500/10 p-2.5">
                  <ExternalLink className="h-4 w-4 text-cyan-400 transition group-hover:text-cyan-300" />
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-2 break-words text-sm font-medium leading-6 text-slate-200 transition group-hover:text-cyan-300">
                    {source.title}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {source.url}
                  </p>
                  <p className="mt-2 text-xs font-medium text-cyan-500 opacity-0 transition group-hover:opacity-100">
                    Open source →
                  </p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-8 text-center">
            <ExternalLink className="mx-auto mb-3 h-8 w-8 text-slate-700" />
            <p className="font-medium text-slate-400">No source links available</p>
            <p className="mt-1 text-sm text-slate-600">
              No web sources were returned for this verification.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
