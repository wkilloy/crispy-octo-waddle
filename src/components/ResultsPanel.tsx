// ResultsPanel.tsx
// The set of "metric cards" that summarize the deal at a glance: cash flow,
// cap rate, cash-on-cash, NOI, and the rule-of-thumb ratios.

import type { AnalysisResult } from "../lib/types";
import {
  formatCurrency,
  formatCurrencyCents,
  formatPercent,
  formatRatio,
} from "../lib/format";

interface ResultsPanelProps {
  result: AnalysisResult;
}

// One metric card. `tone` lets us color the headline number green/red/neutral
// to give a quick visual read on whether a number is good or bad.
function MetricCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "good" | "bad" | "neutral";
}) {
  const toneClass =
    tone === "good"
      ? "text-emerald-600"
      : tone === "bad"
        ? "text-rose-600"
        : "text-slate-800";
  return (
    <div className="card p-4 transition hover:shadow-md">
      <div className="section-label">{label}</div>
      <div className={`mt-1.5 text-2xl font-bold tabular-nums ${toneClass}`}>
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}

export default function ResultsPanel({ result }: ResultsPanelProps) {
  // Simple positive/negative coloring for the cash-based metrics.
  const cashFlowTone = result.monthlyCashFlow >= 0 ? "good" : "bad";

  return (
    <div className="space-y-4">
      {/* The four headline metrics an investor looks at first. */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Monthly Cash Flow"
          value={formatCurrencyCents(result.monthlyCashFlow)}
          hint={`${formatCurrency(result.annualCashFlow)} / year`}
          tone={cashFlowTone}
        />
        <MetricCard
          label="Cash-on-Cash"
          value={formatPercent(result.cashOnCashPercent)}
          hint="Annual return on cash invested"
          tone={result.cashOnCashPercent >= 0 ? "good" : "bad"}
        />
        <MetricCard
          label="Cap Rate"
          value={formatPercent(result.capRatePercent)}
          hint="NOI / purchase price"
        />
        <MetricCard
          label="NOI"
          value={formatCurrency(result.noi)}
          hint="Net operating income / year"
        />
      </div>

      {/* Secondary metrics and rules of thumb. */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Cash Invested"
          value={formatCurrency(result.totalCashInvested)}
          hint="Down payment + closing + rehab"
        />
        <MetricCard
          label="Mortgage (mo)"
          value={formatCurrencyCents(result.monthlyMortgagePayment)}
          hint="Principal + interest"
        />
        <MetricCard
          label="1% Rule"
          value={formatPercent(result.onePercentRulePercent, 2)}
          hint="Rent ÷ price (aim ≥ 1%)"
          tone={result.onePercentRulePercent >= 1 ? "good" : "neutral"}
        />
        <MetricCard
          label="DSCR"
          value={formatRatio(result.dscr)}
          hint="NOI ÷ debt (aim ≥ 1.25)"
          tone={result.dscr >= 1.25 ? "good" : result.dscr < 1 ? "bad" : "neutral"}
        />
      </div>
    </div>
  );
}
