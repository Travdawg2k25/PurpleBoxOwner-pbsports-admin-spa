/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx,html,scss}'],

  theme: {
    extend: {
      colors: {
        primary: '#1D4ED8', // Custom primary color
        // secondary: '#9333EA', // Custom secondary color
      },
      spacing: {
        // '128': '32rem', // Adds a spacing size
        // '144': '36rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Adds a custom font
      },
    },
  },
  plugins: [],
}

