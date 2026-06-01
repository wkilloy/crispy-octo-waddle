/** @type {import('tailwindcss').Config} */
export default {
  // Tell Tailwind which files to scan for class names so it can
  // generate only the CSS that's actually used.
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
