/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        smart: {
          50: '#F0F6FE',
          100: '#E1EDFD',
          200: '#C7DEFC',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
          800: '#1E3A8A',
          900: '#0F172A',
          navy: '#0F1E36',
          activeNav: '#E8F1FC',
          activeText: '#1D4ED8',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 14px 0 rgba(15, 23, 42, 0.04)',
        'card-hover': '0 8px 24px 0 rgba(15, 23, 42, 0.08)',
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.03)',
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '18px',
        '3xl': '24px',
      }
    },
  },
  plugins: [],
}
