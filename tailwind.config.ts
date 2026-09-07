import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0a0a0b',
          900: '#111113',
          800: '#19191c',
          700: '#232326',
          600: '#333338',
        },
        parchment: '#f3ecd9',
        gold: {
          200: '#f0dfa0',
          300: '#e6cd7e',
          400: '#d9bb5e',
          500: '#c9a227',
          600: '#a9821f',
          700: '#7d5f17',
        },
        clay: '#8a5a3b',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      backgroundImage: {
        'gold-foil': 'linear-gradient(135deg, #a9821f 0%, #e6cd7e 22%, #f0dfa0 45%, #c9a227 60%, #7d5f17 100%)',
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(217,187,94,0.15), 0 12px 30px -14px rgba(0,0,0,0.7)',
      },
      borderRadius: {
        xl2: '14px',
      },
    },
  },
  plugins: [],
};

export default config;
