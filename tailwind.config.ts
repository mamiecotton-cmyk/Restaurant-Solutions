import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: '#D4AF37',
        'deep-red': '#8B0000',
        brand: {
          black: '#0a0a0a',
          gold: '#D4AF37',
          red: '#8B0000',
        },
      },
      fontFamily: {
        heading: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
