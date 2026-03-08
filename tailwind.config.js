/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4B7BE5',
        secondary: '#F97316',
        background: '#F9FAFB',
        foreground: '#111827',
        muted: '#6B7280',
      },
    },
  },
  plugins: [],
};
