/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#fdfaf7',
          100: '#f4ede6',
          200: '#e8dcce',
          300: '#d5c2ad',
          400: '#bca188',
          500: '#a38165',
          600: '#876348',
          700: '#6d4c35',
          800: '#4a2c1d',
          900: '#3c2415',
          950: '#26160c',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
