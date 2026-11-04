/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        comic: {
          bg: '#0F172A',
          card: '#1E293B',
          cardBorder: '#334155',
          accent: '#F59E0B',
          accentHover: '#D97706',
          success: '#10B981',
          danger: '#EF4444',
          textMuted: '#94A3B8'
        }
      }
    },
  },
  plugins: [],
}

