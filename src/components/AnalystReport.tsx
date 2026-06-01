// AnalystReport.tsx
// Renders the Deal Analyst's output: an overall verdict + score, the key
// verified metrics, what's good (highlights), the biggest risks, and the
// questions to ask the seller.

import type { DealAnalysis } from "../lib/analyst";
import { formatCurrencyCents, formatPercent, formatRatio } from "../lib/format";

interface AnalystReportProps {
  analysis: DealAnalysis;
}

// Color scheme per verdict so the headline reads at a glance.
const VERDICT_STYLES = {
  strong: { label: "Strong Deal", badge: "bg-emerald-100 text-emerald-700", bar: "bg-emerald-500" },
  fair: { label: "Fair / Marginal", badge: "bg-amber-100 text-amber-700", bar: "bg-amber-500" },
  weak: { label: "Weak Deal", badge: "bg-rose-100 text-rose-700", bar: "bg-rose-500" },
} as const;

// A small bulleted list with a colored icon, reused for highlights/risks/etc.
function List({
  title,
  items,
  icon,
  empty,
}: {
  title: string;
  items: string[];
  icon: string;
  empty?: string;
}) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-slate-700">{title}</h4>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">{empty ?? "None."}</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-600">
              <span aria-hidden>{icon}</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AnalystReport({ analysis }: AnalystReportProps) {
  const style = VERDICT_STYLES[analysis.verdict];
  const m = analysis.metrics;

  return (
    <div className="space-y-4">
      {/* Verdict header */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${style.badge}`}
          >
            {style.label}
          </span>
          <span className="text-sm text-slate-500">
            Deal score: <strong className="text-slate-800">{analysis.score}/100</strong>
          </span>
        </div>
        <p className="mt-3 text-lg font-medium text-slate-800">
          {analysis.headline}
        </p>
        {/* Score bar */}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full ${style.bar}`}
            style={{ width: `${analysis.score}%` }}
          />
        </div>
      </div>

      {/* Verified metrics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Cap Rate" value={formatPercent(m.capRatePercent)} />
        <Metric label="Cash-on-Cash" value={formatPercent(m.cashOnCashPercent)} />
        <Metric label="Monthly Cash Flow" value={formatCurrencyCents(m.monthlyCashFlow)} />
        <Metric label="DSCR" value={formatRatio(m.dscr)} />
      </div>

      {/* Highlights & risks */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <List
            title="✅ Highlights"
            items={analysis.highlights}
            icon="•"
            empty="No standout strengths at these numbers."
          />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <List
            title="⚠️ Biggest Risks"
            items={analysis.risks}
            icon="•"
            empty="No major red flags detected."
          />
        </div>
      </div>

      {/* Seller questions */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <List
          title="❓ Questions to Ask the Seller"
          items={analysis.sellerQuestions}
          icon="→"
        />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 text-center shadow-sm">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-bold text-slate-800">{value}</div>
    </div>
  );
}
