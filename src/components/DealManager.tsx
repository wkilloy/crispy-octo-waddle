// DealManager.tsx
// A small toolbar for working with deals: name & save the current property,
// copy a shareable link, and load or delete previously saved deals.

import { useState } from "react";
import type { PropertyInputs, SavedDeal } from "../lib/types";
import { analyzeProperty } from "../lib/finance";
import { buildShareUrl } from "../lib/share";
import { formatCurrencyCents } from "../lib/format";

interface DealManagerProps {
  currentInputs: PropertyInputs;
  savedDeals: SavedDeal[];
  onSave: (name: string) => void;
  onLoad: (deal: SavedDeal) => void;
  onDelete: (id: string) => void;
}

export default function DealManager({
  currentInputs,
  savedDeals,
  onSave,
  onLoad,
  onDelete,
}: DealManagerProps) {
  const [name, setName] = useState("");
  // Tracks the "Copied!" confirmation after clicking the share button.
  const [copied, setCopied] = useState(false);

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return; // don't save unnamed deals
    onSave(trimmed);
    setName("");
  }

  async function handleShare() {
    const url = buildShareUrl(currentInputs);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // reset the label after 2s
    } catch {
      // Clipboard can be blocked (e.g. insecure context); show the URL instead.
      window.prompt("Copy this shareable link:", url);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo-600">
        Save & Share
      </h3>

      {/* Save the current deal under a name. */}
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder="Name this deal (e.g. 123 Main St)"
          className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="button"
          onClick={handleSave}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Save
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="rounded-md border border-indigo-600 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
        >
          {copied ? "Copied!" : "Share link"}
        </button>
      </div>

      {/* List of previously saved deals. */}
      {savedDeals.length > 0 && (
        <ul className="mt-4 space-y-2">
          {savedDeals.map((deal) => {
            const monthlyCashFlow =
              analyzeProperty(deal.inputs).monthlyCashFlow;
            return (
              <li
                key={deal.id}
                className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-medium text-slate-700">
                    {deal.name}
                  </span>
                  <span className="ml-2 text-slate-400">
                    {formatCurrencyCents(monthlyCashFlow)}/mo
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => onLoad(deal)}
                    className="text-indigo-600 hover:underline"
                  >
                    Load
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(deal.id)}
                    className="text-rose-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
