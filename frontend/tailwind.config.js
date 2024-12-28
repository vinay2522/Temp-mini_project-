/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ffe5e5',
          100: '#ffcccc',
          200: '#ff9999',
          300: '#ff6666',
          400: '#ff3333',
          500: '#FF4136', // Main primary color (red)
          600: '#ff1a1a',
          700: '#e60000',
          800: '#cc0000',
          900: '#b30000',
        },
        secondary: {
          50: '#e5f2ff',
          100: '#cce5ff',
          200: '#99ccff',
          300: '#66b2ff',
          400: '#3399ff',
          500: '#0074D9', // Main secondary color (blue)
          600: '#0066cc',
          700: '#0052a3',
          800: '#004080',
          900: '#003366',
        },
        seva: {
          red: '#FF4136',
          blue: '#0074D9',
          gray: '#AAAAAA',
          light: '#F8F9FA',
          dark: '#343A40',
          green: '#2ECC40',
          yellow: '#FFDC00',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
