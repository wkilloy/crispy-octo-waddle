// ProjectionTable.tsx
// A year-by-year breakdown of the projection, for users who want the exact
// numbers behind the chart. We show selected milestone years to keep it
// readable rather than printing all 30 rows.

import type { ProjectionYear } from "../lib/types";
import { formatCurrency, formatPercent } from "../lib/format";

interface ProjectionTableProps {
  projection: ProjectionYear[];
}

export default function ProjectionTable({ projection }: ProjectionTableProps) {
  // Show years 1, 5, 10, 15, 20, 25, 30 (whichever exist) to stay compact.
  const milestones = [1, 5, 10, 15, 20, 25, 30];
  const rows = projection.filter((p) => milestones.includes(p.year));

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo-600">
        Milestone Projection
      </h3>
      <table className="w-full text-right text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
            <th className="py-2 text-left">Year</th>
            <th className="py-2">Property Value</th>
            <th className="py-2">Loan Balance</th>
            <th className="py-2">Equity</th>
            <th className="py-2">Cumulative Cash Flow</th>
            <th className="py-2">Total ROI</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.year} className="border-b border-slate-100 last:border-0">
              <td className="py-2 text-left font-medium">{r.year}</td>
              <td className="py-2">{formatCurrency(r.propertyValue)}</td>
              <td className="py-2">{formatCurrency(r.loanBalance)}</td>
              <td className="py-2 font-medium text-indigo-700">
                {formatCurrency(r.equity)}
              </td>
              <td className="py-2 text-emerald-700">
                {formatCurrency(r.cumulativeCashFlow)}
              </td>
              <td className="py-2 font-medium">
                {formatPercent(r.roiPercent, 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
