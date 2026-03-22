/** @type {import('tailwindcss').Config} */
const path = require('path');

// Forward slashes in globs — on Windows `path.join` backslashes can break Tailwind's content scanner.
const root = path.join(__dirname, 'src').replace(/\\/g, '/');

module.exports = {
  content: [
    `${root}/pages/**/*.{js,ts,jsx,tsx,mdx}`,
    `${root}/components/**/*.{js,ts,jsx,tsx,mdx}`,
    `${root}/app/**/*.{js,ts,jsx,tsx,mdx}`,
    `${root}/lib/**/*.{js,ts,jsx,tsx,mdx}`,
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        brand: {
          bg: '#020617',
          card: '#0B1220',
          primary: '#22d3ee',
          secondary: '#2563eb',
          accent: '#a855f7',
        },
        fintech: {
          primary: '#0EA5E9',
          accent: '#06B6D4',
          surface: '#0F172A',
          card: '#1E293B',
          muted: '#64748B',
        },
      },
      boxShadow: {
        brand: '0 0 20px rgba(34, 211, 238, 0.15)',
        'brand-lg': '0 0 32px rgba(34, 211, 238, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-step': 'fadeIn 0.45s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
