// InputForm.tsx
// The left-hand panel where the user enters all the property numbers.
// It's a "controlled" form: the current values live in App's state, and every
// keystroke calls `onChange` so the results recalculate instantly.

import type { PropertyInputs } from "../lib/types";

interface InputFormProps {
  values: PropertyInputs;
  onChange: (next: PropertyInputs) => void;
  onReset: () => void;
}

// A single labeled number input. We define it once and reuse it for every
// field so the form stays consistent and short.
interface FieldProps {
  label: string;
  field: keyof PropertyInputs;
  values: PropertyInputs;
  onChange: (next: PropertyInputs) => void;
  suffix?: string; // e.g. "%" or "/mo"
  prefix?: string; // e.g. "$"
  step?: number;
}

function NumberField({
  label,
  field,
  values,
  onChange,
  suffix,
  prefix,
  step = 1,
}: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <div className="mt-1 flex items-center rounded-md border border-slate-300 bg-white focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
        {prefix && <span className="pl-2 text-slate-400">{prefix}</span>}
        <input
          type="number"
          step={step}
          value={values[field]}
          onChange={(e) =>
            // Update just this one field, keeping the rest unchanged.
            // `Number(...)` converts the text input to a number; empty -> 0.
            onChange({ ...values, [field]: Number(e.target.value) })
          }
          className="w-full bg-transparent px-2 py-1.5 text-right outline-none"
        />
        {suffix && <span className="pr-2 text-slate-400">{suffix}</span>}
      </div>
    </label>
  );
}

// A titled group of fields, e.g. "Purchase & Financing".
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
        {title}
      </legend>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </fieldset>
  );
}

export default function InputForm({
  values,
  onChange,
  onReset,
}: InputFormProps) {
  // Shorthand so each field below reads cleanly.
  const common = { values, onChange };

  return (
    <form className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">Property Details</h2>
        <button
          type="button"
          onClick={onReset}
          className="text-sm text-indigo-600 hover:underline"
        >
          Reset to example
        </button>
      </div>

      <Section title="Purchase & Financing">
        <NumberField label="Purchase price" field="purchasePrice" prefix="$" step={1000} {...common} />
        <NumberField label="Down payment" field="downPaymentPercent" suffix="%" {...common} />
        <NumberField label="Closing costs" field="closingCosts" prefix="$" step={100} {...common} />
        <NumberField label="Rehab budget" field="rehabBudget" prefix="$" step={100} {...common} />
        <NumberField label="Interest rate" field="interestRate" suffix="%" step={0.1} {...common} />
        <NumberField label="Loan term" field="loanTermYears" suffix="yr" {...common} />
      </Section>

      <Section title="Income">
        <NumberField label="Monthly rent" field="monthlyRent" prefix="$" step={50} {...common} />
        <NumberField label="Vacancy" field="vacancyPercent" suffix="%" step={0.5} {...common} />
      </Section>

      <Section title="Operating Expenses">
        <NumberField label="Property tax (yr)" field="propertyTaxAnnual" prefix="$" step={100} {...common} />
        <NumberField label="Insurance (yr)" field="insuranceAnnual" prefix="$" step={100} {...common} />
        <NumberField label="Maintenance" field="maintenancePercent" suffix="%" step={0.5} {...common} />
        <NumberField label="Management" field="managementPercent" suffix="%" step={0.5} {...common} />
        <NumberField label="HOA (mo)" field="hoaMonthly" prefix="$" step={10} {...common} />
        <NumberField label="Other (mo)" field="otherMonthly" prefix="$" step={10} {...common} />
      </Section>

      <Section title="Growth Assumptions">
        <NumberField label="Appreciation" field="appreciationPercent" suffix="%" step={0.5} {...common} />
        <NumberField label="Rent growth" field="rentGrowthPercent" suffix="%" step={0.5} {...common} />
        <NumberField label="Expense growth" field="expenseGrowthPercent" suffix="%" step={0.5} {...common} />
      </Section>
    </form>
  );
}
