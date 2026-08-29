import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#FBF7EF',
          card: '#FFFDF9',
          tint: '#F3ECDF',
          deep: '#EDE3D2',
        },
        ink: {
          DEFAULT: '#1B1815',
          soft: '#5C554C',
          faint: '#8A8175',
        },
        rule: '#E4DACA',
        ember: {
          DEFAULT: '#B4471B',
          soft: '#FBE7DA',
          deep: '#8E3612',
        },
        desk: {
          rescue: '#33614A',
          revival: '#B4471B',
          healing: '#2A5A85',
          provision: '#8A6212',
          reunion: '#6A3358',
          kindness: '#A2384F',
          justice: '#3B4A8C',
          renewal: '#4A6A2B',
          underground: '#5A5140',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        broadsheet: '1280px',
        column: '68ch',
      },
      boxShadow: {
        lift: '0 1px 2px rgba(27,24,21,0.04), 0 8px 24px -12px rgba(27,24,21,0.18)',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.35', transform: 'scale(0.82)' },
        },
        riseIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        'pulse-dot': 'pulseDot 2.4s ease-in-out infinite',
        'rise-in': 'riseIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
};

export default config;
