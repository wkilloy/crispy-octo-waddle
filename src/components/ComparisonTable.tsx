// ComparisonTable.tsx
// Shows saved deals side-by-side so the user can compare properties at a glance.
// Each saved deal becomes a column; each metric is a row. The best value in a
// row is highlighted green so the strongest deal jumps out.

import type { SavedDeal } from "../lib/types";
import { analyzeProperty } from "../lib/finance";
import {
  formatCurrency,
  formatCurrencyCents,
  formatPercent,
  formatRatio,
} from "../lib/format";

interface ComparisonTableProps {
  deals: SavedDeal[];
}

// Each row describes how to pull a number out of an analysis, format it, and
// decide whether "higher is better" (for the green highlight).
interface Row {
  label: string;
  value: (inputs: SavedDeal["inputs"]) => number;
  format: (n: number) => string;
  higherIsBetter: boolean;
}

const ROWS: Row[] = [
  {
    label: "Purchase price",
    value: (i) => i.purchasePrice,
    format: formatCurrency,
    higherIsBetter: false,
  },
  {
    label: "Monthly cash flow",
    value: (i) => analyzeProperty(i).monthlyCashFlow,
    format: formatCurrencyCents,
    higherIsBetter: true,
  },
  {
    label: "Cash-on-cash",
    value: (i) => analyzeProperty(i).cashOnCashPercent,
    format: (n) => formatPercent(n),
    higherIsBetter: true,
  },
  {
    label: "Cap rate",
    value: (i) => analyzeProperty(i).capRatePercent,
    format: (n) => formatPercent(n),
    higherIsBetter: true,
  },
  {
    label: "DSCR",
    value: (i) => analyzeProperty(i).dscr,
    format: (n) => formatRatio(n),
    higherIsBetter: true,
  },
  {
    label: "1% rule",
    value: (i) => analyzeProperty(i).onePercentRulePercent,
    format: (n) => formatPercent(n, 2),
    higherIsBetter: true,
  },
];

export default function ComparisonTable({ deals }: ComparisonTableProps) {
  // Nothing to compare yet — show a friendly hint instead of an empty table.
  if (deals.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
        No saved deals yet. Go to the <strong>Analyze</strong> tab, enter a
        property, name it, and click <strong>Save</strong> to compare deals here.
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto p-4">
      <h3 className="section-label mb-3">Deal Comparison</h3>
      <table className="w-full text-right text-sm tabular-nums">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
            <th className="py-2 text-left">Metric</th>
            {deals.map((d) => (
              <th key={d.id} className="py-2">
                {d.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => {
            // Compute this row's value for every deal so we can find the best.
            const values = deals.map((d) => row.value(d.inputs));
            const best = row.higherIsBetter
              ? Math.max(...values)
              : Math.min(...values);
            return (
              <tr
                key={row.label}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="py-2 text-left font-medium text-slate-600">
                  {row.label}
                </td>
                {values.map((v, idx) => {
                  // Highlight the winning cell (only when deals actually differ).
                  const isBest = deals.length > 1 && v === best;
                  return (
                    <td
                      key={deals[idx].id}
                      className={`py-2 ${
                        isBest ? "font-bold text-emerald-600" : ""
                      }`}
                    >
                      {row.format(v)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
