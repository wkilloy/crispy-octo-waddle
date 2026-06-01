// ProjectionChart.tsx
// A line chart showing how equity and cumulative cash flow grow over the life
// of the loan. Built with Recharts, which handles the axes and tooltips for us.

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ProjectionYear } from "../lib/types";
import { formatCurrency } from "../lib/format";

interface ProjectionChartProps {
  projection: ProjectionYear[];
}

export default function ProjectionChart({ projection }: ProjectionChartProps) {
  return (
    <div className="card p-4">
      <h3 className="section-label mb-3">
        Equity & Cumulative Cash Flow Over Time
      </h3>
      {/* ResponsiveContainer makes the chart fill the width of its parent. */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={projection} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12 }}
            label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 12 }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            width={50}
          />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
          <Line
            type="monotone"
            dataKey="equity"
            name="Equity"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="cumulativeCashFlow"
            name="Cumulative Cash Flow"
            stroke="#059669"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
