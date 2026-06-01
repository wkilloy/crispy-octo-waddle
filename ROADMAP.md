# Roadmap: The AI Deal Analyst

**Product vision:** *"ChatGPT for real estate underwriting."* An investor uploads
the deal documents (offering memorandum, rent roll, T12, financial statements)
and instantly gets a verdict — good deal / bad deal, cap rate, cash-on-cash
return, the biggest risks, and the questions to ask the seller.

**Target users:** real estate investors, house flippers, and small developers —
high-value users who lose hours per deal on manual underwriting.

**Why it can charge $99–$499/month:** it saves expensive people real time, the
analysis quality reflects genuine finance expertise, and it needs no MLS access.

> **The core design principle (say this in interviews):** the AI never does the
> arithmetic. Our verified, unit-tested finance engine computes every number;
> the AI only *extracts* figures from documents and *adds judgment*. That makes
> the financial output trustworthy — the #1 objection to "AI for finance."

---

## Phase 0 — Foundation (done ✅)

- A deployed React/TypeScript app with a **unit-tested finance engine** (cap
  rate, cash-on-cash, NOI, DSCR, amortization, multi-year projection).
- **Save / compare / share** deals.
- A working **rules-based Deal Analyst** (`src/lib/analyst.ts`): verdict, score,
  risks, and seller questions derived from the verified metrics.
- A **document-upload UI** and an `analyzeDealWithAI` integration seam, ready for
  the AI layer to drop in.

**Resume framing today:** "Built and deployed an AI-ready real-estate
underwriting tool with a unit-tested financial engine and a rules-based deal
analyst; architected so document-reading AI plugs in without touching the math."

---

## Phase 1 — Turn on the AI (the headline feature)

This is what makes it "ChatGPT for underwriting." Build it in this order:

1. **Backend function.** Add a Vercel serverless function (`/api/analyze`). This
   is where the Anthropic API key lives — it must *never* be in browser code.
2. **Document → numbers.** Send the uploaded PDFs/spreadsheets to **Claude**
   (the Anthropic API can read PDFs directly). Ask it to return a structured
   `PropertyInputs` JSON object — the rents, expenses, price, etc.
3. **Trusted math.** Feed those extracted numbers into the existing
   `analyzeDeal()` — so cap rate / cash-on-cash come from *our* engine.
4. **AI judgment.** Have Claude expand the risks and seller questions with
   deal-specific insight from the documents (e.g. "three leases expire in Q1").
5. **Use prompt caching** to keep costs and latency down on repeat analyses.

**What you'll need:** an Anthropic API key (`console.anthropic.com`, free credits
to start), added to Vercel as an environment variable. Cost is roughly a few
cents per analysis — add a simple per-IP rate limit so a public demo can't run
up a bill.

## Phase 2 — Accounts & saved analyses

- **Supabase** auth (free tier) so users can log in and revisit past analyses.
- Store each uploaded deal + its AI report against the user's account.
- This is what makes the product *sticky* — and is the precondition for charging.

## Phase 3 — Monetize (Pro tiers + payments)

| Free | Pro ($99–$499/mo) |
| --- | --- |
| A few analyses / month | Unlimited analyses |
| On-screen report | **Exportable PDF underwriting memos** |
| Single property | **Portfolio comparison & tracking** |
| | **Side-by-side scenario modeling** |

- **Stripe Checkout** subscriptions — the industry-standard way to bill.
- Gate AI analyses behind plan limits enforced in the backend function.

## Phase 4 — Moat & growth (later)

- Deal-specific comps and market context via data APIs.
- Shareable read-only report links (word-of-mouth growth).
- A library of prior analyses → benchmarks ("this cap rate vs. your last 10 deals").
- Team accounts for small investment shops.

---

## How to find your first users (the non-code part)

- **BiggerPockets** forums and **r/realestateinvesting** — share the free tool
  when it genuinely answers someone's underwriting question.
- **Local REIA meetups** — investors love practical tools and talk to each other.
- **Content:** short walkthroughs analyzing a real listing end-to-end.

---

## Suggested next session

1. Decide on cost approach (your API key behind a backend vs. bring-your-own-key).
2. Build the `/api/analyze` Vercel function + wire `analyzeDealWithAI`.
3. Start with **one document type** (a PDF offering memo) end-to-end, then add
   rent roll / T12 parsing.

Each step is a clean, demonstrable addition — and Phase 1 alone turns this from a
calculator into the product in the vision statement above.
