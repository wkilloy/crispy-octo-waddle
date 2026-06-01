// analyst.test.ts
// Tests for the rules-based Deal Analyst. We feed it deliberately good and bad
// deals and check that the verdict, risks, and questions respond sensibly.

import { describe, it, expect } from "vitest";
import { analyzeDeal } from "./analyst";
import { DEFAULT_INPUTS } from "./finance";
import type { PropertyInputs } from "./types";

// A clearly strong deal: cheap price, high rent, big down payment.
const STRONG: PropertyInputs = {
  ...DEFAULT_INPUTS,
  purchasePrice: 150000,
  downPaymentPercent: 25,
  monthlyRent: 2200,
};

// A clearly weak deal: expensive price, low rent, small down payment.
const WEAK: PropertyInputs = {
  ...DEFAULT_INPUTS,
  purchasePrice: 400000,
  downPaymentPercent: 10,
  monthlyRent: 1500,
};

describe("analyzeDeal", () => {
  it("rates a strong deal higher than a weak one", () => {
    expect(analyzeDeal(STRONG).score).toBeGreaterThan(analyzeDeal(WEAK).score);
  });

  it("flags negative cash flow as a risk on a weak deal", () => {
    const weak = analyzeDeal(WEAK);
    expect(weak.verdict).toBe("weak");
    expect(weak.risks.some((r) => /negative cash flow/i.test(r))).toBe(true);
  });

  it("always provides seller questions", () => {
    expect(analyzeDeal(DEFAULT_INPUTS).sellerQuestions.length).toBeGreaterThan(0);
  });

  it("includes the verified metrics in the report", () => {
    const report = analyzeDeal(STRONG);
    // The metrics object must be the real engine output, not invented numbers.
    expect(report.metrics.capRatePercent).toBeGreaterThan(0);
    expect(report.metrics.monthlyCashFlow).toBeGreaterThan(0);
  });

  it("adds a management question when management is 0%", () => {
    const noMgmt = analyzeDeal({ ...DEFAULT_INPUTS, managementPercent: 0 });
    expect(noMgmt.sellerQuestions.some((q) => /self-managed/i.test(q))).toBe(
      true,
    );
  });
});
