/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        timeline: {
          geopolitics: '#ef4444',
          economy: '#22c55e',
          technology: '#3b82f6',
          science: '#a855f7',
          culture: '#f97316',
          environment: '#14b8a6',
        },
        ui: {
          background: '#0a0a0a',
          surface: '#171717',
          primary: '#ffffff',
          secondary: '#a3a3a3',
          accent: '#6366f1',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
