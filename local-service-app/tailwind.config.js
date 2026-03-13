/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "primary": "#1754cf",
        "background-light": "#f6f6f8",
        "background-dark": "#111621",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
    },
  },
  plugins: [],
}
