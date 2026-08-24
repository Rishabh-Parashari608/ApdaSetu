/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './js/**/*.js'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        emergency: {
          red: '#dc2626',
          amber: '#f59e0b',
          emerald: '#10b981',
          sky: '#0284c7'
        }
      }
    }
  },
  plugins: []
};
