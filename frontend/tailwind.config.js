// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',              // Inclus le fichier HTML principal
    './src/**/*.{js,ts,jsx,tsx}', // Inclus TOUS les fichiers source React
  ],
  theme: {
    extend: {}, // Tu peux ajouter des extensions de thème ici plus tard
  },
  plugins: [], // Tu peux ajouter des plugins Tailwind ici plus tard
}