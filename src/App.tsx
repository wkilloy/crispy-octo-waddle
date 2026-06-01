// App.tsx
// The top-level component. It holds the form values in state, recomputes the
// analysis whenever those values change, manages the user's saved deals, and
// switches between the "Analyze" and "Compare" views.

import { useEffect, useMemo, useState } from "react";
import type { PropertyInputs, SavedDeal } from "./lib/types";
import { analyzeProperty, clampInputs, DEFAULT_INPUTS } from "./lib/finance";
import { readInputsFromUrl } from "./lib/share";
import * as storage from "./lib/storage";
import InputForm from "./components/InputForm";
import ResultsPanel from "./components/ResultsPanel";
import ProjectionChart from "./components/ProjectionChart";
import ProjectionTable from "./components/ProjectionTable";
import DealManager from "./components/DealManager";
import ComparisonTable from "./components/ComparisonTable";

type View = "analyze" | "compare";

export default function App() {
  // On first load, prefer inputs from a shared link; otherwise use the example.
  const [inputs, setInputs] = useState<PropertyInputs>(
    () => readInputsFromUrl() ?? DEFAULT_INPUTS,
  );
  const [savedDeals, setSavedDeals] = useState<SavedDeal[]>([]);
  const [view, setView] = useState<View>("analyze");

  // Load any previously saved deals from the browser once, on startup.
  useEffect(() => {
    setSavedDeals(storage.loadDeals());
  }, []);

  // `useMemo` recomputes the analysis only when `inputs` changes, so typing
  // stays snappy. We clamp first so bad inputs can't produce nonsense.
  const result = useMemo(() => analyzeProperty(clampInputs(inputs)), [inputs]);

  // --- Saved-deal handlers -------------------------------------------------
  function handleSave(name: string) {
    const deal: SavedDeal = {
      id: storage.newId(),
      name,
      inputs: clampInputs(inputs),
      savedAt: Date.now(),
    };
    setSavedDeals(storage.saveDeal(deal));
  }

  function handleLoad(deal: SavedDeal) {
    setInputs(deal.inputs);
    setView("analyze"); // jump back to the editor with the loaded numbers
  }

  function handleDelete(id: string) {
    setSavedDeals(storage.deleteDeal(id));
  }

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

          {/* View tabs */}
          <nav className="mt-4 flex gap-1">
            <TabButton
              active={view === "analyze"}
              onClick={() => setView("analyze")}
            >
              Analyze
            </TabButton>
            <TabButton
              active={view === "compare"}
              onClick={() => setView("compare")}
            >
              Compare ({savedDeals.length})
            </TabButton>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {view === "analyze" ? (
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
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
              <DealManager
                currentInputs={inputs}
                savedDeals={savedDeals}
                onSave={handleSave}
                onLoad={handleLoad}
                onDelete={handleDelete}
              />
              <ProjectionChart projection={result.projection} />
              <ProjectionTable projection={result.projection} />
            </section>
          </div>
        ) : (
          <ComparisonTable deals={savedDeals} />
        )}
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-slate-400">
        Estimates only — not financial advice. Always verify numbers before
        investing.
      </footer>
    </div>
  );
}

// A single tab button in the header nav.
function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-4 py-1.5 text-sm font-medium ${
        active
          ? "bg-indigo-600 text-white"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}
