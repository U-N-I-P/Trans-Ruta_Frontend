import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        logistics: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          700: "#1D4ED8",
          800: "#1E3A8A",
          900: "#172554"
        }
      },
      boxShadow: {
        panel: "0 10px 30px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
} satisfies Config;
