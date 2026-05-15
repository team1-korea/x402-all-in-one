/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Noto Sans KR', 'sans-serif'],
        serif: ['Playfair Display', 'Noto Serif KR', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        beige: '#F5F0E8',
        terracotta: '#C4714A',
        forest: '#3D6B4F',
        sage: '#7A9E87',
        cream: '#FFFDF9',
        dark: '#1A1A1A',
      },
    },
  },
  plugins: [],
}
