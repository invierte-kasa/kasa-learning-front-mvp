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
        bounceFeedback: {
          '0%':   { transform: 'translateY(100%)' },
          '60%':  { transform: 'translateY(-10px)' },
          '80%':  { transform: 'translateY(4px)' },
          '100%': { transform: 'translateY(0)' },
        },
        popIcon: {
          '0%':   { transform: 'scale(0)' },
          '70%':  { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        shakeX: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%':      { transform: 'translateX(-4px)' },
          '40%':      { transform: 'translateX(4px)' },
          '60%':      { transform: 'translateX(-3px)' },
          '80%':      { transform: 'translateX(3px)' },
        },
      },
      animation: {
        'spin-fast': 'spinFast 1s linear infinite',
        'pulse-simple': 'pulseSimple 1.5s infinite',
        'bounce-feedback': 'bounceFeedback 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'pop-icon': 'popIcon 0.4s 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'shake-x': 'shakeX 0.4s ease-in-out',
      },
    },
  },
  plugins: [],
}
