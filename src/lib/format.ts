// format.ts
// Small helpers to turn raw numbers into human-friendly strings for the UI.
// Keeping these in one place means money and percentages look consistent
// everywhere in the app.

/** "$1,234" — whole-dollar currency (no cents, easier to scan). */
export function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

/** "$1,234.56" — currency with cents, for precise figures like cash flow. */
export function formatCurrencyCents(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** "7.5%" — a percentage value (the number is already a percent, e.g. 7.5). */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/** "1.25" — a plain ratio like GRM or DSCR. */
export function formatRatio(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}
