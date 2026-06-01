# Roadmap: From Free Tool to Paid Product

This document is the business plan for the Rental Property Analyzer. The current
MVP is a free, browser-only calculator. The steps below turn it into a
monetizable SaaS — and each step is a self-contained learning milestone you can
talk about in an interview.

> **Why this order?** Each phase adds the *minimum* needed to unlock the next
> source of value: first give users a reason to come back (save deals), then a
> reason to pay (Pro features), then collect the money (payments).

---

## Phase 0 — MVP (done ✅)

A working, deployable analyzer with tested financial math. This alone is a
strong portfolio piece: it proves you can ship real software *and* that you
understand real-estate finance.

**Resume framing:** "Built and deployed a React/TypeScript rental-property
underwriting tool with a unit-tested financial engine (cap rate, cash-on-cash,
DSCR, multi-year ROI projection)."

---

## Phase 1 — Accounts & saved properties

Let users create an account and save the deals they analyze.

- **Tech:** [Supabase](https://supabase.com) — free tier, gives you auth +
  a Postgres database with very little code. Beginner-friendly.
- **What to build:** sign up / log in, a "Save this property" button, and a "My
  Properties" list.
- **Why it matters:** saved data is what makes a tool *sticky* — users return,
  which is the precondition for charging them.

## Phase 2 — Free vs. Pro tiers

Define what's free and what's worth paying for.

| Free | Pro |
| --- | --- |
| Analyze any property | Everything in Free |
| Save up to 3 properties | **Unlimited** saved properties |
| On-screen results | **PDF investor reports** (shareable / for lenders) |
| | **Side-by-side comparison** of multiple deals |
| | **Rent & comp estimates** (via a data API) |

The PDF report and deal comparison are the features investors will actually pay
for, because they save real time when evaluating many properties.

## Phase 3 — Payments

Charge for Pro.

- **Tech:** [Stripe Checkout](https://stripe.com) + a subscription product.
  Stripe is the industry standard and recognizable to any employer.
- **Pricing to test:** **$9–$19 / month** (or a discounted annual plan).
- **What to build:** a "Upgrade to Pro" button → Stripe Checkout → a webhook
  that flips the user's account to Pro.

## Phase 4 — Growth features (later)

- Shareable read-only report links (great for word-of-mouth).
- CSV import / bulk analysis for users screening many properties.
- Integrations with market-data APIs (rent estimates, tax records).
- A simple landing page with SEO content ("how to calculate cap rate") to bring
  in organic traffic.

---

## How to find your first users (the non-code part)

Monetization needs users, not just features. Cheap, beginner-friendly channels:

- **Reddit / forums:** r/realestateinvesting, BiggerPockets — share the free
  tool when it genuinely helps answer someone's question (don't spam).
- **Local REIA meetups:** real-estate investor associations love practical tools.
- **Content:** short posts/videos walking through analyzing a real listing.

---

## Suggested build order (next session)

1. Deploy the current MVP to Vercel and get a public link. *(Validates it works
   for real users and gives you something to share immediately.)*
2. Add Supabase auth + save/load properties (Phase 1).
3. Add the PDF report — the single most compelling Pro feature (Phase 2).
4. Wire up Stripe for subscriptions (Phase 3).

Tackle them one at a time; each is a clean, demonstrable addition to the repo.
