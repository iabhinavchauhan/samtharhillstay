export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#0e2a23',
        pine: '#1a4337',
        moss: '#3c6658',
        cream: '#f7f0e4',
        sand: '#d3bb8d',
        mocha: '#422d1d',
        gold: '#caa86d',
        smoke: '#e9e5de',
      },
      boxShadow: {
        soft: '0 24px 80px rgba(15, 23, 42, 0.16)',
      },
      fontFamily: {
        // The site is sans-serif only; the serif alias resolves to a sans stack
        // so any remaining `font-serif` utility still renders sans-serif.
        serif: ['DM Sans', 'system-ui', 'sans-serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(180deg, rgba(7,16,12,0.12), rgba(7,16,12,0.78))',
      },
    },
  },
  plugins: [],
}
