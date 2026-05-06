/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1f3b7c',
        success: '#2a7f2a',
        danger: '#b22222',
        warning: '#ff4d4d',
      }
    },
  },
  plugins: [],
}
