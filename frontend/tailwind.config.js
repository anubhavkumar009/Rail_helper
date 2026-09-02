/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        rail: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#36abf7',
          500: '#0c8fe9',
          600: '#0270c7',
          700: '#0359a1',
          800: '#074b85',
          900: '#0c3f6e',
          950: '#082849',
        },
        irctc: {
          blue: '#0B3B60',
          orange: '#FF7722',
          gold: '#F59E0B',
          dark: '#0a101d',
          card: '#111928',
          border: '#1f2a3e'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'train-move': 'train 2s ease-in-out infinite alternate',
      },
      keyframes: {
        train: {
          '0%': { transform: 'translateX(0px)' },
          '100%': { transform: 'translateX(8px)' },
        }
      }
    },
  },
  plugins: [],
}
