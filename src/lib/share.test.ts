// share.test.ts
// Tests that encoding inputs into a link and decoding them back returns the
// same data (a "round trip"), and that bad/malformed links fail safely.

import { describe, it, expect } from "vitest";
import { encodeInputs, decodeInputs } from "./share";
import { DEFAULT_INPUTS } from "./finance";

describe("encode/decode round trip", () => {
  it("returns the original inputs after encode then decode", () => {
    const encoded = encodeInputs(DEFAULT_INPUTS);
    expect(decodeInputs(encoded)).toEqual(DEFAULT_INPUTS);
  });

  it("preserves custom values", () => {
    const custom = { ...DEFAULT_INPUTS, purchasePrice: 425000, monthlyRent: 3100 };
    expect(decodeInputs(encodeInputs(custom))).toEqual(custom);
  });

  it("produces a URL-safe string (no +, /, or = characters)", () => {
    const encoded = encodeInputs(DEFAULT_INPUTS);
    expect(encoded).not.toMatch(/[+/=]/);
  });
});

describe("decodeInputs safety", () => {
  it("returns null for null or empty input", () => {
    expect(decodeInputs(null)).toBeNull();
    expect(decodeInputs("")).toBeNull();
  });

  it("returns null for malformed strings", () => {
    expect(decodeInputs("not-valid-base64!!!")).toBeNull();
  });

  it("fills missing fields from defaults", () => {
    // Encode an object with only one field; the rest should fall back.
    const partial = btoa(JSON.stringify({ purchasePrice: 999000 }));
    const decoded = decodeInputs(partial);
    expect(decoded?.purchasePrice).toBe(999000);
    expect(decoded?.monthlyRent).toBe(DEFAULT_INPUTS.monthlyRent);
  });
});
