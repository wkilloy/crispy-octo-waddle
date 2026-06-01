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
    <div className="card p-4">
      <h3 className="section-label mb-3">Save & Share</h3>

      {/* Save the current deal under a name. */}
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder="Name this deal (e.g. 123 Main St)"
          className="input flex-1"
        />
        <button type="button" onClick={handleSave} className="btn-primary">
          Save
        </button>
        <button type="button" onClick={handleShare} className="btn-secondary">
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
