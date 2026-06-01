/** @type {import('tailwindcss').Config} */
export default {
  // Tell Tailwind which files to scan for class names so it can
  // generate only the CSS that's actually used.
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Use Inter everywhere, falling back to the system font stack.
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      // A subtle, layered card shadow that looks more refined than the default.
      boxShadow: {
        card: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)",
      },
    },
  },
  plugins: [],
};
