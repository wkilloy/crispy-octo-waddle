// finance.ts
// -----------------------------------------------------------------------------
// THE CORE OF THE APP. Every real-estate calculation lives here.
//
// Design principles (these are what make the code easy to read AND easy to test):
//   1. Every function is "pure": it takes numbers in and returns numbers out,
//      with no side effects (it never touches the screen, the network, etc.).
//   2. Each formula is small and named after the metric it computes, with a
//      comment explaining the real-estate meaning.
//
// Because of this, `finance.test.ts` can check each formula against numbers we
// work out by hand — which is what protects investors from a math bug.
// -----------------------------------------------------------------------------

import type { PropertyInputs, AnalysisResult, ProjectionYear } from "./types";

/**
 * Monthly mortgage payment (principal + interest) using the standard
 * amortization formula:
 *
 *        r (1 + r)^n
 *   M = P -----------------
 *        (1 + r)^n - 1
 *
 *   P = loan amount, r = MONTHLY interest rate, n = total number of months.
 *
 * Special case: a 0% loan is just the principal spread evenly over the months.
 */
export function monthlyMortgagePayment(
  loanAmount: number,
  annualRatePercent: number,
  termYears: number,
): number {
  const n = termYears * 12;
  if (n <= 0) return 0;
  const r = annualRatePercent / 100 / 12; // convert annual % to a monthly decimal
  if (r === 0) return loanAmount / n; // no-interest edge case
  const factor = Math.pow(1 + r, n);
  return (loanAmount * (r * factor)) / (factor - 1);
}

/**
 * Remaining loan balance after a given number of payments have been made.
 * Used by the projection to track how equity grows as the loan is paid down.
 */
export function remainingLoanBalance(
  loanAmount: number,
  annualRatePercent: number,
  termYears: number,
  paymentsMade: number,
): number {
  const n = termYears * 12;
  if (n <= 0) return 0;
  if (paymentsMade >= n) return 0; // loan fully paid off
  const r = annualRatePercent / 100 / 12;
  if (r === 0) {
    // With no interest, each payment reduces principal evenly.
    const principalPerPayment = loanAmount / n;
    return Math.max(0, loanAmount - principalPerPayment * paymentsMade);
  }
  // Standard remaining-balance formula.
  const factorN = Math.pow(1 + r, n);
  const factorP = Math.pow(1 + r, paymentsMade);
  return loanAmount * ((factorN - factorP) / (factorN - 1));
}

/**
 * Net Operating Income: the property's income after operating expenses but
 * BEFORE the mortgage. NOI is the basis for cap rate and is how investors
 * compare properties independent of how they're financed.
 */
export function netOperatingIncome(
  effectiveGrossIncome: number,
  annualOperatingExpenses: number,
): number {
  return effectiveGrossIncome - annualOperatingExpenses;
}

/** Cap rate = NOI / purchase price, expressed as a percent. */
export function capRatePercent(noi: number, purchasePrice: number): number {
  if (purchasePrice === 0) return 0;
  return (noi / purchasePrice) * 100;
}

/**
 * Cash-on-cash return = annual pre-tax cash flow / total cash invested,
 * as a percent. This is the "what does my actual money earn" number.
 */
export function cashOnCashPercent(
  annualCashFlow: number,
  totalCashInvested: number,
): number {
  if (totalCashInvested === 0) return 0;
  return (annualCashFlow / totalCashInvested) * 100;
}

/**
 * The full analysis. This ties every helper above together and also builds the
 * year-by-year projection. It returns a single AnalysisResult object that the
 * UI can render directly.
 */
export function analyzeProperty(inputs: PropertyInputs): AnalysisResult {
  // --- 1. Financing: how much we borrow vs. how much cash we put in ---
  const downPayment = inputs.purchasePrice * (inputs.downPaymentPercent / 100);
  const loanAmount = inputs.purchasePrice - downPayment;
  const totalCashInvested =
    downPayment + inputs.closingCosts + inputs.rehabBudget;

  // --- 2. Income: gross rent minus an allowance for vacancy ---
  const annualGrossRent = inputs.monthlyRent * 12;
  const effectiveGrossIncome =
    annualGrossRent * (1 - inputs.vacancyPercent / 100);

  // --- 3. Operating expenses (everything EXCEPT the mortgage) ---
  // Maintenance and management are commonly estimated as a % of rent.
  const maintenanceAnnual =
    annualGrossRent * (inputs.maintenancePercent / 100);
  const managementAnnual =
    annualGrossRent * (inputs.managementPercent / 100);
  const annualOperatingExpenses =
    inputs.propertyTaxAnnual +
    inputs.insuranceAnnual +
    maintenanceAnnual +
    managementAnnual +
    inputs.hoaMonthly * 12 +
    inputs.otherMonthly * 12;

  // --- 4. Mortgage / debt service ---
  const monthlyMortgage = monthlyMortgagePayment(
    loanAmount,
    inputs.interestRate,
    inputs.loanTermYears,
  );
  const annualDebtService = monthlyMortgage * 12;

  // --- 5. Headline metrics ---
  const noi = netOperatingIncome(effectiveGrossIncome, annualOperatingExpenses);
  const annualCashFlow = noi - annualDebtService;
  const monthlyCashFlow = annualCashFlow / 12;
  const monthlyOperatingExpenses = annualOperatingExpenses / 12;

  const capRate = capRatePercent(noi, inputs.purchasePrice);
  const coc = cashOnCashPercent(annualCashFlow, totalCashInvested);
  const grossRentMultiplier =
    annualGrossRent === 0 ? 0 : inputs.purchasePrice / annualGrossRent;
  const dscr = annualDebtService === 0 ? 0 : noi / annualDebtService;
  const onePercentRulePercent =
    inputs.purchasePrice === 0
      ? 0
      : (inputs.monthlyRent / inputs.purchasePrice) * 100;

  // --- 6. Year-by-year projection ---
  const projection = buildProjection(inputs, {
    loanAmount,
    totalCashInvested,
    effectiveGrossIncome,
    annualOperatingExpenses,
    annualDebtService,
    annualCashFlow,
  });

  return {
    loanAmount,
    downPayment,
    totalCashInvested,
    monthlyMortgagePayment: monthlyMortgage,
    monthlyOperatingExpenses,
    monthlyCashFlow,
    effectiveGrossIncome,
    annualOperatingExpenses,
    noi,
    annualDebtService,
    annualCashFlow,
    capRatePercent: capRate,
    cashOnCashPercent: coc,
    grossRentMultiplier,
    dscr,
    onePercentRulePercent,
    projection,
  };
}

/**
 * Builds the multi-year projection. Each year we:
 *   - grow rent and expenses by their assumed rates,
 *   - appreciate the property's value,
 *   - pay down the loan a bit more (so equity rises),
 *   - and tally cumulative cash flow and total ROI.
 */
function buildProjection(
  inputs: PropertyInputs,
  base: {
    loanAmount: number;
    totalCashInvested: number;
    effectiveGrossIncome: number;
    annualOperatingExpenses: number;
    annualDebtService: number;
    annualCashFlow: number;
  },
): ProjectionYear[] {
  const years: ProjectionYear[] = [];
  let cumulativeCashFlow = 0;

  const rentGrowth = inputs.rentGrowthPercent / 100;
  const expenseGrowth = inputs.expenseGrowthPercent / 100;
  const appreciation = inputs.appreciationPercent / 100;
  const horizon = inputs.loanTermYears; // project across the whole loan term

  for (let year = 1; year <= horizon; year++) {
    // Compound rent and expenses forward from year 1.
    const grownIncome =
      base.effectiveGrossIncome * Math.pow(1 + rentGrowth, year - 1);
    const grownExpenses =
      base.annualOperatingExpenses * Math.pow(1 + expenseGrowth, year - 1);

    // Debt service is fixed for a fixed-rate loan, so cash flow this year is:
    const annualCashFlow = grownIncome - grownExpenses - base.annualDebtService;
    cumulativeCashFlow += annualCashFlow;

    const propertyValue =
      inputs.purchasePrice * Math.pow(1 + appreciation, year);
    const loanBalance = remainingLoanBalance(
      base.loanAmount,
      inputs.interestRate,
      inputs.loanTermYears,
      year * 12,
    );
    const equity = propertyValue - loanBalance;

    // Total return = equity built since purchase + all cash collected so far.
    const equityGain = equity - base.totalCashInvested;
    const totalReturn = equityGain + cumulativeCashFlow;
    const roiPercent =
      base.totalCashInvested === 0
        ? 0
        : (totalReturn / base.totalCashInvested) * 100;

    years.push({
      year,
      propertyValue,
      loanBalance,
      equity,
      annualCashFlow,
      cumulativeCashFlow,
      totalReturn,
      roiPercent,
    });
  }

  return years;
}

/** Sensible starting numbers so the app shows a real example on first load. */
export const DEFAULT_INPUTS: PropertyInputs = {
  purchasePrice: 200000,
  downPaymentPercent: 20,
  closingCosts: 6000,
  rehabBudget: 0,
  interestRate: 7,
  loanTermYears: 30,
  monthlyRent: 1800,
  vacancyPercent: 5,
  propertyTaxAnnual: 2400,
  insuranceAnnual: 1200,
  maintenancePercent: 5,
  managementPercent: 8,
  hoaMonthly: 0,
  otherMonthly: 0,
  appreciationPercent: 3,
  rentGrowthPercent: 2,
  expenseGrowthPercent: 2,
};
