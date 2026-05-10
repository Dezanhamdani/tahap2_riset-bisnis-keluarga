/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'brand-orange': '#f59e0b',
        'brand-green': '#10b981',
      }
    },
  },
  plugins: [],
}