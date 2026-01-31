/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        kasa: {
          body: '#0F172A',
          card: '#1E293B',
          hover: '#334155',
          primary: '#10B981',
          'primary-dark': '#059669',
          border: '#334155',
          'icon-dim': 'rgba(255, 255, 255, 0.05)',
        },
        text: {
          main: '#F8FAFC',
          muted: '#94A3B8',
          disabled: '#64748B',
        },
        podium: {
          gold: '#FDB022',
          silver: '#98A2B3',
          bronze: '#B692F6',
        },
        feedback: {
          error: '#EF4444',
          'error-dark': '#7f1d1d',
          'success-dark': '#064e3b',
        },
      },
      borderRadius: {
        card: '1.5rem',
        item: '1rem',
      },
      spacing: {
        'nav-mobile': '80px',
        'sidebar-desktop': '260px',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        spinFast: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        pulseSimple: {
          '75%, 100%': { transform: 'scale(3)', opacity: '0' },
        },
      },
      animation: {
        'spin-fast': 'spinFast 1s linear infinite',
        'pulse-simple': 'pulseSimple 1.5s infinite',
      },
    },
  },
  plugins: [],
}
