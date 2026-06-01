// storage.ts
// -----------------------------------------------------------------------------
// Reads and writes the user's saved deals to the browser's localStorage.
// localStorage is a small key/value store built into every browser that
// survives page reloads — so saved deals stick around without any server.
//
// (In a later phase, the roadmap swaps this for a real database tied to a user
// account; keeping all the storage logic in this one file makes that easy.)
// -----------------------------------------------------------------------------

import type { SavedDeal } from "./types";

const STORAGE_KEY = "rpa.savedDeals.v1";

/** Load all saved deals, newest first. Returns [] if none or on any error. */
export function loadDeals(): SavedDeal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const deals = JSON.parse(raw) as SavedDeal[];
    if (!Array.isArray(deals)) return [];
    return deals.sort((a, b) => b.savedAt - a.savedAt);
  } catch {
    return []; // corrupted data shouldn't crash the app
  }
}

/** Persist the full list of deals. */
function persist(deals: SavedDeal[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
}

/**
 * Save (or update) a deal and return the new full list. If a deal with the same
 * name already exists, it's overwritten so users don't end up with duplicates.
 */
export function saveDeal(deal: SavedDeal): SavedDeal[] {
  const existing = loadDeals().filter(
    (d) => d.name.toLowerCase() !== deal.name.toLowerCase(),
  );
  const next = [deal, ...existing].sort((a, b) => b.savedAt - a.savedAt);
  persist(next);
  return next;
}

/** Delete a deal by id and return the new full list. */
export function deleteDeal(id: string): SavedDeal[] {
  const next = loadDeals().filter((d) => d.id !== id);
  persist(next);
  return next;
}

/** Create a small random id for a new deal. */
export function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}
