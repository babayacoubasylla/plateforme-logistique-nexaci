// tailwind.config.js - Thème Ivoirien 🇨🇮
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',              // Inclus le fichier HTML principal
    './src/**/*.{js,ts,jsx,tsx}', // Inclus TOUS les fichiers source React
  ],
  theme: {
    extend: {
      // 🇨🇮 Couleurs du drapeau ivoirien
      colors: {
        'orange-ivoirien': {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#ff7300',  // Couleur principale
          600: '#e65100',  // Plus foncé
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        'vert-ivoirien': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#009639',  // Couleur principale
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        'blanc-ivoirien': '#ffffff',
      },
      // Dégradés ivoiriens
      backgroundImage: {
        'gradient-ivoirien': 'linear-gradient(135deg, #ff7300, #009639)',
        'gradient-orange': 'linear-gradient(135deg, #ff7300, #ffb347)',
        'gradient-vert': 'linear-gradient(135deg, #009639, #22c55e)',
      },
      // Ombres avec couleurs ivoiriennes
      boxShadow: {
        'orange': '0 4px 15px rgba(255, 115, 0, 0.2)',
        'vert': '0 4px 15px rgba(0, 150, 57, 0.2)',
        'ivoirien': '0 8px 25px rgba(255, 115, 0, 0.15)',
      }
    },
  },
  plugins: [], // Tu peux ajouter des plugins Tailwind ici plus tard
}