// App.tsx
// The top-level component. It holds the form values in state, recomputes the
// analysis whenever those values change, manages the user's saved deals, and
// switches between the "Analyze" and "Compare" views.

import { useEffect, useMemo, useState } from "react";
import type { PropertyInputs, SavedDeal } from "./lib/types";
import { analyzeProperty, clampInputs, DEFAULT_INPUTS } from "./lib/finance";
import { analyzeDeal } from "./lib/analyst";
import { readInputsFromUrl } from "./lib/share";
import * as storage from "./lib/storage";
import InputForm from "./components/InputForm";
import ResultsPanel from "./components/ResultsPanel";
import ProjectionChart from "./components/ProjectionChart";
import ProjectionTable from "./components/ProjectionTable";
import DealManager from "./components/DealManager";
import ComparisonTable from "./components/ComparisonTable";
import DocumentUpload from "./components/DocumentUpload";
import AnalystReport from "./components/AnalystReport";

type View = "analyze" | "analyst" | "compare";

export default function App() {
  // On first load, prefer inputs from a shared link; otherwise use the example.
  const [inputs, setInputs] = useState<PropertyInputs>(
    () => readInputsFromUrl() ?? DEFAULT_INPUTS,
  );
  const [savedDeals, setSavedDeals] = useState<SavedDeal[]>([]);
  const [view, setView] = useState<View>("analyze");
  // Documents attached on the AI Analyst tab (read by AI in a future phase).
  const [documents, setDocuments] = useState<File[]>([]);

  // Load any previously saved deals from the browser once, on startup.
  useEffect(() => {
    setSavedDeals(storage.loadDeals());
  }, []);

  // `useMemo` recomputes the analysis only when `inputs` changes, so typing
  // stays snappy. We clamp first so bad inputs can't produce nonsense.
  const cleanInputs = useMemo(() => clampInputs(inputs), [inputs]);
  const result = useMemo(() => analyzeProperty(cleanInputs), [cleanInputs]);
  // The Deal Analyst's verdict/risks/questions, derived from the same numbers.
  const analysis = useMemo(() => analyzeDeal(cleanInputs), [cleanInputs]);

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
      {/* Sticky header with a branded logo mark */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-lg font-bold text-white shadow-card">
              RP
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-slate-900">
                Rental Property Analyzer
              </h1>
              <p className="text-xs text-slate-500">
                Underwrite any deal in seconds
              </p>
            </div>
          </div>

          {/* Segmented tab control */}
          <nav className="flex gap-1 rounded-lg bg-slate-100 p-1">
            <TabButton active={view === "analyze"} onClick={() => setView("analyze")}>
              Analyze
            </TabButton>
            <TabButton active={view === "analyst"} onClick={() => setView("analyst")}>
              AI Analyst
            </TabButton>
            <TabButton active={view === "compare"} onClick={() => setView("compare")}>
              Compare ({savedDeals.length})
            </TabButton>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {view === "analyze" && (
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            {/* Left: inputs */}
            <section className="card h-fit p-5">
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
        )}

        {view === "analyst" && (
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            {/* Left: document upload */}
            <section>
              <DocumentUpload files={documents} onChange={setDocuments} />
            </section>
            {/* Right: the analyst's verdict, risks, and seller questions */}
            <section>
              <AnalystReport analysis={analysis} />
            </section>
          </div>
        )}

        {view === "compare" && <ComparisonTable deals={savedDeals} />}
      </main>

      <footer className="mt-8 border-t border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-slate-400">
          Estimates only — not financial advice. Always verify numbers before
          investing.
        </div>
      </footer>
    </div>
  );
}

// A single tab inside the segmented control in the header nav.
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
      className={`rounded-md px-4 py-1.5 text-sm font-semibold transition ${
        active
          ? "bg-white text-slate-900 shadow-card"
          : "text-slate-500 hover:text-slate-800"
      }`}
    >
      {children}
    </button>
  );
}
