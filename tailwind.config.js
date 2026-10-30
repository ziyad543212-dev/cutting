/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#0f172a",
        muted: "#475569",
        canvas: "#f1f5f9",
        accent: "#2563eb",
      },
      boxShadow: {
        card: "0 12px 35px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [],
};
