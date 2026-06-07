/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fbf9eb',
          100: '#f4efa9',
          200: '#eddf77',
          300: '#e3c847',
          400: '#d9b026',
          500: '#D4AF37', // Brand primary Gold
          600: '#b48a20',
          700: '#8e6518',
          800: '#6d4814',
          900: '#533310',
          950: '#2e1905',
        },
        dark: {
          DEFAULT: '#0a0a0a',
          card: '#121212',
          hover: '#1c1c1c',
          border: 'rgba(255, 255, 255, 0.1)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 0 15px rgba(212, 175, 55, 0.15)',
        'gold-lg': '0 0 25px rgba(212, 175, 55, 0.35)',
      }
    },
  },
  plugins: [],
}
