// analyst.ts
// -----------------------------------------------------------------------------
// The "Deal Analyst" — it turns a property's numbers into a plain-English
// verdict, a list of the biggest risks, and the questions a smart investor
// should ask the seller.
//
// IMPORTANT DESIGN NOTE (this is the part worth explaining in an interview):
// The actual financial math comes from our trusted, unit-tested `finance.ts`
// engine — never from guesswork. This module only adds *judgment* (rules) on
// top of those verified numbers.
//
// This rules-based version works today with zero cost. Later, an AI provider
// can (a) read uploaded documents to EXTRACT the numbers, and (b) enrich this
// judgment — but the math layer stays exactly the same. See `analyzeDealWithAI`
// at the bottom for that seam.
// -----------------------------------------------------------------------------

import type { PropertyInputs, AnalysisResult } from "./types";
import { analyzeProperty } from "./finance";
import { formatCurrencyCents, formatPercent, formatRatio } from "./format";

export type DealVerdict = "strong" | "fair" | "weak";

export interface DealAnalysis {
  verdict: DealVerdict;
  score: number; // 0–100, a rough overall quality score
  headline: string; // one-line summary
  metrics: AnalysisResult; // the verified numbers behind the verdict
  highlights: string[]; // what's good about the deal
  risks: string[]; // the biggest concerns
  sellerQuestions: string[]; // what to ask before making an offer
}

/**
 * Score the deal 0–100 from its key return metrics. Each metric contributes a
 * slice; we keep the weighting simple and transparent.
 */
function scoreDeal(r: AnalysisResult): number {
  let score = 0;

  // Cash flow (25 pts): rewards being cash-flow positive.
  if (r.monthlyCashFlow >= 300) score += 25;
  else if (r.monthlyCashFlow >= 0) score += 15;
  else score += 0;

  // Cash-on-cash (30 pts): the headline return on invested cash.
  if (r.cashOnCashPercent >= 8) score += 30;
  else if (r.cashOnCashPercent >= 4) score += 18;
  else if (r.cashOnCashPercent >= 0) score += 8;

  // DSCR (25 pts): can the income cover the debt?
  if (r.dscr >= 1.25) score += 25;
  else if (r.dscr >= 1.0) score += 12;

  // Cap rate (20 pts): unleveraged yield.
  if (r.capRatePercent >= 7) score += 20;
  else if (r.capRatePercent >= 5) score += 12;
  else if (r.capRatePercent >= 4) score += 6;

  return Math.min(100, Math.round(score));
}

function verdictFromScore(score: number): DealVerdict {
  if (score >= 70) return "strong";
  if (score >= 45) return "fair";
  return "weak";
}

/**
 * The main entry point. Pure function: inputs in, a full analysis out.
 */
export function analyzeDeal(inputs: PropertyInputs): DealAnalysis {
  const r = analyzeProperty(inputs);
  const score = scoreDeal(r);
  const verdict = verdictFromScore(score);

  const highlights: string[] = [];
  const risks: string[] = [];

  // ---- Highlights (what's working) ----
  if (r.monthlyCashFlow > 0)
    highlights.push(
      `Positive cash flow of ${formatCurrencyCents(r.monthlyCashFlow)}/month.`,
    );
  if (r.cashOnCashPercent >= 8)
    highlights.push(
      `Strong cash-on-cash return (${formatPercent(r.cashOnCashPercent)}).`,
    );
  if (r.dscr >= 1.25)
    highlights.push(`Healthy debt coverage (DSCR ${formatRatio(r.dscr)}).`);
  if (r.onePercentRulePercent >= 1)
    highlights.push("Meets the 1% rule (rent ≥ 1% of price).");
  if (r.capRatePercent >= 6)
    highlights.push(`Solid cap rate (${formatPercent(r.capRatePercent)}).`);

  // ---- Risks (what to worry about) ----
  if (r.monthlyCashFlow < 0)
    risks.push(
      `Negative cash flow: this property loses ${formatCurrencyCents(
        Math.abs(r.monthlyCashFlow),
      )}/month at these assumptions.`,
    );
  if (r.dscr < 1)
    risks.push(
      `Income doesn't cover the mortgage (DSCR ${formatRatio(
        r.dscr,
      )} < 1.0) — high risk of feeding the property each month.`,
    );
  else if (r.dscr < 1.25)
    risks.push(
      `Thin debt coverage (DSCR ${formatRatio(
        r.dscr,
      )}); lenders typically want ≥ 1.25, so there's little cushion if rents dip.`,
    );
  if (r.onePercentRulePercent < 1)
    risks.push(
      `Fails the 1% rule (rent is ${formatPercent(
        r.onePercentRulePercent,
        2,
      )} of price) — cash flow will be hard to achieve.`,
    );
  if (r.capRatePercent < 5)
    risks.push(
      `Low cap rate (${formatPercent(
        r.capRatePercent,
      )}) — you're paying a premium relative to the income.`,
    );
  if (inputs.downPaymentPercent < 20)
    risks.push(
      `Low down payment (${formatPercent(
        inputs.downPaymentPercent,
        0,
      )}) means higher leverage and bigger monthly debt service.`,
    );
  if (inputs.vacancyPercent < 5)
    risks.push(
      `Vacancy assumption (${formatPercent(
        inputs.vacancyPercent,
        0,
      )}) looks optimistic — underwrite at 5–8% to be safe.`,
    );
  // Operating-expense ratio: real-world rentals usually run 35–50% of income.
  const expenseRatio =
    r.effectiveGrossIncome > 0
      ? r.annualOperatingExpenses / r.effectiveGrossIncome
      : 0;
  if (expenseRatio < 0.35)
    risks.push(
      `Operating expenses are only ${formatPercent(
        expenseRatio * 100,
        0,
      )} of income — verify taxes, insurance, management, and reserves are fully included.`,
    );

  // ---- Seller questions (always useful for underwriting) ----
  const sellerQuestions = [
    "Can you provide a trailing-12-month (T12) income statement and a current rent roll with lease start/end dates?",
    "What is the actual (not pro-forma) vacancy and delinquency over the last 12 months?",
    "Are there any deferred maintenance items or upcoming capital expenditures (roof, HVAC, plumbing)?",
    "Are current rents at, above, or below market? Are any below-market leases rolling over soon?",
    "Why is the property being sold?",
  ];
  if (inputs.managementPercent === 0)
    sellerQuestions.push(
      "Is the property self-managed today? What would professional management cost?",
    );
  sellerQuestions.push(
    "Will property taxes reset to the new assessed value after the sale?",
  );

  const headline =
    verdict === "strong"
      ? "This looks like a strong deal on the numbers provided."
      : verdict === "fair"
        ? "This is a marginal deal — workable, but the assumptions need scrutiny."
        : "These numbers raise real concerns — proceed carefully.";

  return { verdict, score, headline, metrics: r, highlights, risks, sellerQuestions };
}

// -----------------------------------------------------------------------------
// FUTURE: AI-powered document analysis (kept here as the integration seam).
//
// When you add an Anthropic API key + a backend (Vercel serverless function),
// implement this to: upload the documents, have Claude EXTRACT a PropertyInputs
// object from them, run our trusted `analyzeDeal` on those numbers, and
// optionally let Claude expand the risks/questions with deal-specific insight.
//
//   export async function analyzeDealWithAI(files: File[]): Promise<DealAnalysis> {
//     const inputs = await extractInputsViaBackend(files); // calls /api/analyze
//     return analyzeDeal(inputs);                          // SAME trusted math
//   }
//
// Keeping the math in `analyzeDeal` means the AI can never hallucinate the
// financial figures — it only fills in the inputs and adds color.
// -----------------------------------------------------------------------------
