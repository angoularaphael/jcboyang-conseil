/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0b1f3a',
          light: '#122b50',
          dark: '#060f1f',
        },
        gold: {
          DEFAULT: '#d4a762',
          light: '#e8c88a',
          dark: '#b8893f',
        },
        offwhite: '#f8f6f2',
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Inter"', 'Helvetica Neue', 'sans-serif'],
        accent: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      animation: {
        'scroll-down': 'scrollDown 1.5s ease-in-out infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        scrollDown: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(12px)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212,167,98,0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(212,167,98,0)' },
        },
      },
    },
  },
  plugins: [],
};
