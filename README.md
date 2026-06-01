# 🏠 Rental Property Analyzer

A web app that helps real-estate investors instantly evaluate a rental property.
Enter the purchase price, rent, and expenses, and it calculates the key return
metrics — **cash flow, cap rate, cash-on-cash return, NOI** — plus a **30-year
projection** of equity and ROI.

> Built as a portfolio project combining finance/accounting knowledge with
> software. The financial math lives in a clean, unit-tested module
> (`src/lib/finance.ts`) — the part that demonstrates real domain expertise.

---

## Demo at a glance

- **Live recalculation:** every metric updates as you type.
- **Investor metrics:** cash flow, cap rate, cash-on-cash, NOI, DSCR, GRM, 1% rule.
- **Long-term outlook:** a chart and table projecting equity, cumulative cash
  flow, and total ROI across the life of the loan.
- **Save & compare deals:** name and save properties (stored in your browser),
  then view them side-by-side with the strongest numbers highlighted.
- **Shareable links:** the whole analysis is encoded in the URL, so you can send
  someone a link and they see your exact numbers — no account needed.
- **No backend required:** everything runs in the browser, so it's free to host.

---

## Getting started (step by step)

You'll need [Node.js](https://nodejs.org) (version 18 or newer) installed.

```bash
# 1. Install the project's dependencies (only needed once)
npm install

# 2. Start the local development server
npm run dev
#    Then open the URL it prints (usually http://localhost:5173)

# 3. Run the tests that verify the financial math
npm run test

# 4. Build the optimized version for deployment
npm run build
```

### Deploying it (free)

The build output is a static site, so you can host it for free:
1. Push this repo to GitHub.
2. Sign up at [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
3. "Import" the repo — it auto-detects Vite. Build command `npm run build`,
   output directory `dist`. Done.

---

## What the numbers mean (plain English)

| Metric | What it answers | Formula |
| --- | --- | --- |
| **NOI** (Net Operating Income) | Income after expenses, *before* the mortgage | rent (after vacancy) − operating expenses |
| **Cap Rate** | The property's unleveraged yield | NOI ÷ purchase price |
| **Cash Flow** | Money left in your pocket each month | NOI − mortgage payment |
| **Cash-on-Cash** | Return on the *actual cash* you invested | annual cash flow ÷ cash invested |
| **DSCR** | Can the rent cover the loan? (lenders care) | NOI ÷ annual debt service |
| **GRM** (Gross Rent Multiplier) | A quick price-vs-rent sniff test | price ÷ annual gross rent |
| **1% Rule** | Rule of thumb: monthly rent ≥ 1% of price | monthly rent ÷ price |

"Operating expenses" deliberately exclude the mortgage — that's what lets cap
rate and NOI compare two properties regardless of how each is financed.

---

## How the code is organized

```
src/
  lib/
    finance.ts        # ALL the calculations (the core logic) — pure & commented
    finance.test.ts   # unit tests that check every formula by hand
    share.ts          # encode/decode inputs to a shareable URL
    share.test.ts     # round-trip tests for shareable links
    storage.ts        # save/load deals in the browser (localStorage)
    types.ts          # the shape of the inputs, deals, and results
    format.ts         # currency / percent formatting helpers
  components/
    InputForm.tsx        # the property-details form
    ResultsPanel.tsx     # the metric cards
    ProjectionChart.tsx  # the equity / cash-flow chart
    ProjectionTable.tsx  # the year-by-year table
    DealManager.tsx      # save / load / delete deals + share link
    ComparisonTable.tsx  # side-by-side comparison of saved deals
  App.tsx             # ties the form to the results
  main.tsx            # app entry point
```

**Built with:** Vite + React + TypeScript, Tailwind CSS, Recharts, and Vitest.

See [`ROADMAP.md`](./ROADMAP.md) for the plan to turn this into a paid product.

---

_Estimates only — not financial advice. Always verify numbers before investing._
