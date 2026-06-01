// types.ts
// -----------------------------------------------------------------------------
// These TypeScript types describe the SHAPE of the data flowing through the app.
// `PropertyInputs` is everything the user types into the form.
// `AnalysisResult` is everything the finance engine calculates from those inputs.
// Defining them once here means the form, the engine, and the UI all agree on
// the same structure — the compiler will warn us if they ever drift apart.
// -----------------------------------------------------------------------------

/** Everything the user enters about a property. */
export interface PropertyInputs {
  // --- Purchase & financing ---
  purchasePrice: number; // e.g. 200000
  downPaymentPercent: number; // e.g. 20  (means 20%)
  closingCosts: number; // one-time costs to buy, e.g. 6000
  rehabBudget: number; // one-time repairs before renting, e.g. 0
  interestRate: number; // annual mortgage rate as a percent, e.g. 7 (means 7%)
  loanTermYears: number; // e.g. 30

  // --- Income ---
  monthlyRent: number; // e.g. 1800
  vacancyPercent: number; // expected % of time empty, e.g. 5 (means 5%)

  // --- Recurring operating expenses ---
  propertyTaxAnnual: number; // dollars per year, e.g. 2400
  insuranceAnnual: number; // dollars per year, e.g. 1200
  maintenancePercent: number; // % of rent set aside for repairs, e.g. 5
  managementPercent: number; // % of rent paid to a property manager, e.g. 8
  hoaMonthly: number; // dollars per month, e.g. 0
  otherMonthly: number; // any other monthly cost, e.g. 0

  // --- Growth assumptions (used only by the long-term projection) ---
  appreciationPercent: number; // yearly home-value growth, e.g. 3
  rentGrowthPercent: number; // yearly rent growth, e.g. 2
  expenseGrowthPercent: number; // yearly expense growth, e.g. 2
}

/** One row of the year-by-year projection. */
export interface ProjectionYear {
  year: number; // 1, 2, 3, ...
  propertyValue: number; // appreciated value at end of year
  loanBalance: number; // remaining mortgage balance
  equity: number; // propertyValue - loanBalance
  annualCashFlow: number; // cash flow for this single year
  cumulativeCashFlow: number; // total cash flow collected through this year
  totalReturn: number; // equity gained + cumulative cash flow, vs cash invested
  roiPercent: number; // totalReturn / total cash invested, as a percent
}

/** A property the user has named and saved (stored in the browser). */
export interface SavedDeal {
  id: string; // unique id, used as a React key and for delete
  name: string; // user-given label, e.g. "123 Main St"
  inputs: PropertyInputs; // the full set of numbers for this deal
  savedAt: number; // timestamp (ms) so we can sort newest-first
}

/** Everything the engine computes from a set of inputs. */
export interface AnalysisResult {
  // Cash invested up front (the denominator for return calculations).
  loanAmount: number;
  downPayment: number;
  totalCashInvested: number;

  // Monthly figures.
  monthlyMortgagePayment: number; // principal + interest
  monthlyOperatingExpenses: number; // everything EXCEPT the mortgage
  monthlyCashFlow: number;

  // Annual headline metrics.
  effectiveGrossIncome: number; // rent after the vacancy allowance
  annualOperatingExpenses: number;
  noi: number; // Net Operating Income
  annualDebtService: number; // total mortgage paid per year
  annualCashFlow: number;

  // The investor's key return ratios.
  capRatePercent: number;
  cashOnCashPercent: number;
  grossRentMultiplier: number;
  dscr: number; // Debt Service Coverage Ratio
  onePercentRulePercent: number; // monthly rent as a % of price

  // Long-term outlook.
  projection: ProjectionYear[];
}
