import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        holly: '#0f3d2e',
        berry: '#8b1e2d',
        garland: '#14532d',
        gold: '#d4a017',
        cream: '#fff8eb',
      },
      boxShadow: {
        festive: '0 24px 80px rgba(15, 61, 46, 0.22)',
      },
      backgroundImage: {
        sparkle:
          'radial-gradient(circle at top, rgba(212, 160, 23, 0.18), transparent 45%), radial-gradient(circle at bottom, rgba(139, 30, 45, 0.18), transparent 35%)',
      },
    },
  },
  plugins: [],
};

export default config;
