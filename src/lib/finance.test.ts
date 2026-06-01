// finance.test.ts
// -----------------------------------------------------------------------------
// Unit tests for the finance engine. Each test checks a formula against a value
// we worked out by hand, so if anyone ever changes a formula by mistake, these
// tests fail and catch it. (Run with `npm run test`.)
// -----------------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import {
  monthlyMortgagePayment,
  remainingLoanBalance,
  netOperatingIncome,
  capRatePercent,
  cashOnCashPercent,
  analyzeProperty,
  clampInputs,
  DEFAULT_INPUTS,
} from "./finance";

describe("monthlyMortgagePayment", () => {
  it("matches the known payment for a $160k, 7%, 30-year loan", () => {
    // Industry-standard reference: ~$1,064.48/month.
    expect(monthlyMortgagePayment(160000, 7, 30)).toBeCloseTo(1064.48, 1);
  });

  it("spreads a 0% loan evenly over the term", () => {
    // $120,000 over 360 months with no interest = $333.33/month.
    expect(monthlyMortgagePayment(120000, 0, 30)).toBeCloseTo(333.33, 2);
  });

  it("returns 0 when there is no loan", () => {
    expect(monthlyMortgagePayment(0, 7, 30)).toBe(0);
  });
});

describe("remainingLoanBalance", () => {
  it("equals the full loan before any payments", () => {
    expect(remainingLoanBalance(160000, 7, 30, 0)).toBeCloseTo(160000, 2);
  });

  it("is fully paid off at the end of the term", () => {
    expect(remainingLoanBalance(160000, 7, 30, 360)).toBe(0);
  });

  it("is below the original balance partway through", () => {
    const balance = remainingLoanBalance(160000, 7, 30, 120); // after 10 years
    expect(balance).toBeGreaterThan(0);
    expect(balance).toBeLessThan(160000);
  });
});

describe("netOperatingIncome", () => {
  it("is income minus operating expenses", () => {
    expect(netOperatingIncome(20520, 6408)).toBe(14112);
  });
});

describe("capRatePercent", () => {
  it("is NOI divided by price, as a percent", () => {
    expect(capRatePercent(14112, 200000)).toBeCloseTo(7.056, 3);
  });

  it("is 0 when price is 0 (avoids divide-by-zero)", () => {
    expect(capRatePercent(14112, 0)).toBe(0);
  });
});

describe("cashOnCashPercent", () => {
  it("is annual cash flow divided by cash invested, as a percent", () => {
    expect(cashOnCashPercent(1338.24, 46000)).toBeCloseTo(2.909, 3);
  });
});

describe("clampInputs", () => {
  it("forces negative money values up to 0", () => {
    const cleaned = clampInputs({
      ...DEFAULT_INPUTS,
      purchasePrice: -5000,
      monthlyRent: -100,
    });
    expect(cleaned.purchasePrice).toBe(0);
    expect(cleaned.monthlyRent).toBe(0);
  });

  it("caps share-of-whole percentages at 100", () => {
    const cleaned = clampInputs({ ...DEFAULT_INPUTS, vacancyPercent: 250 });
    expect(cleaned.vacancyPercent).toBe(100);
  });

  it("keeps the loan term at least 1 year", () => {
    const cleaned = clampInputs({ ...DEFAULT_INPUTS, loanTermYears: 0 });
    expect(cleaned.loanTermYears).toBe(1);
  });

  it("leaves valid inputs unchanged", () => {
    expect(clampInputs(DEFAULT_INPUTS)).toEqual(DEFAULT_INPUTS);
  });
});

describe("analyzeProperty (end-to-end with default inputs)", () => {
  const result = analyzeProperty(DEFAULT_INPUTS);

  it("computes financing correctly", () => {
    expect(result.downPayment).toBe(40000); // 20% of 200k
    expect(result.loanAmount).toBe(160000);
    expect(result.totalCashInvested).toBe(46000); // 40k + 6k closing
  });

  it("computes NOI and cap rate", () => {
    expect(result.noi).toBeCloseTo(14112, 2);
    expect(result.capRatePercent).toBeCloseTo(7.056, 2);
  });

  it("computes cash flow", () => {
    expect(result.annualCashFlow).toBeCloseTo(1338.24, 0);
    expect(result.monthlyCashFlow).toBeCloseTo(111.52, 0);
  });

  it("computes the rule-of-thumb ratios", () => {
    expect(result.grossRentMultiplier).toBeCloseTo(9.259, 2);
    expect(result.dscr).toBeCloseTo(1.105, 2);
    expect(result.onePercentRulePercent).toBeCloseTo(0.9, 2);
  });

  it("produces a projection across the whole loan term", () => {
    expect(result.projection).toHaveLength(30);
    // Property should appreciate over time...
    expect(result.projection[29].propertyValue).toBeGreaterThan(
      DEFAULT_INPUTS.purchasePrice,
    );
    // ...the loan should be paid off by the final year...
    expect(result.projection[29].loanBalance).toBe(0);
    // ...and equity should equal the (appreciated) property value at payoff.
    expect(result.projection[29].equity).toBeCloseTo(
      result.projection[29].propertyValue,
      2,
    );
  });
});
