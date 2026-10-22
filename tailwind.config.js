/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#4F46E5", fg: "#FFFFFF" },
        surface: { DEFAULT: "#FFFFFF", dark: "#0B0B0F" },
        "surface-muted": { DEFAULT: "#F4F4F7", dark: "#16161D" },
        ink: { DEFAULT: "#111827", dark: "#F3F4F6" },
        "ink-muted": { DEFAULT: "#6B7280", dark: "#9CA3AF" },
        danger: "#DC2626",
        warning: "#D97706",
        success: "#16A34A",
      },
      borderRadius: { xl2: "20px" },
    },
  },
  plugins: [],
};
