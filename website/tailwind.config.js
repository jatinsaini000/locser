/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface-container-lowest": "#ffffff",
        "surface": "#faf8ff",
        "outline-variant": "#c3c6d7",
        "surface-container-low": "#f2f3ff",
        "on-tertiary": "#ffffff",
        "outline": "#737686",
        "primary": "#004ac6",
        "surface-variant": "#dae2fd",
        "on-surface-variant": "#434655",
        "on-surface": "#131b2e",
        "surface-container-high": "#e2e7ff",
        "background": "#faf8ff",
        "on-background": "#131b2e"
      },
      spacing: {
        "margin-desktop": "40px",
        "margin-mobile": "16px",
        "xl": "32px",
        "lg": "24px",
        "md": "16px",
        "sm": "12px",
        "xs": "8px"
      }
    },
  },
  plugins: [],
}
