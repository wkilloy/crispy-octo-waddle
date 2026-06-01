// share.ts
// -----------------------------------------------------------------------------
// Turns a set of property inputs into a compact string we can put in the URL,
// and back again. This is how "shareable links" work: the entire analysis is
// encoded in the link itself, so there's no database or backend involved — the
// person who opens the link sees exactly the numbers you entered.
//
// These functions are pure (string in / data out), so they're easy to unit-test.
// -----------------------------------------------------------------------------

import type { PropertyInputs } from "./types";
import { DEFAULT_INPUTS } from "./finance";

// We store the encoded inputs in the URL "hash" (the part after #), e.g.
//   https://your-site.app/#deal=eyJwdXJjaGFzZ...
// Using the hash keeps things simple on static hosts (no server routing needed).
const HASH_KEY = "deal";

/** Encode inputs into a URL-safe string. */
export function encodeInputs(inputs: PropertyInputs): string {
  const json = JSON.stringify(inputs);
  // btoa makes base64; then we make it URL-safe by swapping characters that
  // have special meaning in URLs (+ / =).
  return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Decode a string back into inputs. Returns null if the string is missing or
 * malformed, so the caller can safely fall back to defaults. Any missing or
 * non-numeric fields are filled in from DEFAULT_INPUTS — this protects us from
 * old or hand-edited links.
 */
export function decodeInputs(encoded: string | null): PropertyInputs | null {
  if (!encoded) return null;
  try {
    // Reverse the URL-safe swaps, then base64-decode and parse.
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    const parsed = JSON.parse(json) as Partial<PropertyInputs>;

    // Rebuild a clean inputs object: start from defaults, then accept only
    // numeric values from the decoded data.
    const result = { ...DEFAULT_INPUTS };
    for (const key of Object.keys(DEFAULT_INPUTS) as (keyof PropertyInputs)[]) {
      const value = parsed[key];
      if (typeof value === "number" && Number.isFinite(value)) {
        result[key] = value;
      }
    }
    return result;
  } catch {
    return null;
  }
}

/** Read inputs from the current page's URL hash, if present. */
export function readInputsFromUrl(): PropertyInputs | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.hash.slice(1));
  return decodeInputs(params.get(HASH_KEY));
}

/** Build a full shareable URL for the given inputs, based on the current page. */
export function buildShareUrl(inputs: PropertyInputs): string {
  const base =
    typeof window === "undefined"
      ? "https://example.com/"
      : window.location.origin + window.location.pathname;
  return `${base}#${HASH_KEY}=${encodeInputs(inputs)}`;
}
