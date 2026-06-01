// App.tsx
// The top-level component. It holds the form values in state, recomputes the
// analysis whenever those values change, and lays out the form (left) next to
// the results, chart, and table (right).

import { useMemo, useState } from "react";
import type { PropertyInputs } from "./lib/types";
import { analyzeProperty, DEFAULT_INPUTS } from "./lib/finance";
import InputForm from "./components/InputForm";
import ResultsPanel from "./components/ResultsPanel";
import ProjectionChart from "./components/ProjectionChart";
import ProjectionTable from "./components/ProjectionTable";

export default function App() {
  // `inputs` is the single source of truth for everything the user typed.
  const [inputs, setInputs] = useState<PropertyInputs>(DEFAULT_INPUTS);

  // `useMemo` recomputes the analysis only when `inputs` actually changes,
  // so typing stays snappy. This is where the finance engine is called.
  const result = useMemo(() => analyzeProperty(inputs), [inputs]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <h1 className="text-2xl font-bold text-slate-900">
            🏠 Rental Property Analyzer
          </h1>
          <p className="text-sm text-slate-500">
            Enter a property's numbers to instantly see cash flow, returns, and a
            long-term projection.
          </p>
        </div>
      </header>

      {/* Main two-column layout */}
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[380px_1fr]">
        {/* Left: inputs */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <InputForm
            values={inputs}
            onChange={setInputs}
            onReset={() => setInputs(DEFAULT_INPUTS)}
          />
        </section>

        {/* Right: results */}
        <section className="space-y-6">
          <ResultsPanel result={result} />
          <ProjectionChart projection={result.projection} />
          <ProjectionTable projection={result.projection} />
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-slate-400">
        Estimates only — not financial advice. Always verify numbers before
        investing.
      </footer>
    </div>
  );
}
