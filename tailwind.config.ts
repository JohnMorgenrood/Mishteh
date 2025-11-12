import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background - Warm cream
        background: '#faf8f5',
        // Primary - Rich copper/bronze (biblical & ancient)
        primary: {
          50: '#fef7f3',
          100: '#fceee3',
          200: '#f9dac5',
          300: '#f4bf9d',
          400: '#ed9a6b',
          500: '#e67c45',
          600: '#d6652f',
          700: '#b34e27',
          800: '#8f4025',
          900: '#743722',
          DEFAULT: '#d6652f', // Copper/bronze
        },
        // Secondary - Deep spiritual blue (night sky, ancient scrolls)
        secondary: {
          50: '#f3f6f9',
          100: '#e6ecf2',
          200: '#c8d7e7',
          300: '#98b5d4',
          400: '#608fbd',
          500: '#3d71a6',
          600: '#2d5a8c',
          700: '#254871',
          800: '#223d5e',
          900: '#1f3550',
          DEFAULT: '#254871', // Deep spiritual blue
        },
        // Accent colors - Biblical & ancient
        accent: {
          gold: '#c9a961',      // Ancient gold
          crimson: '#8b2635',   // Royal crimson
          olive: '#6b7553',     // Olive branch
          sand: '#d4c4a8',      // Desert sand
        },
      },
      backgroundColor: {
        'page': '#faf8f5', // Warm cream background
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(214, 101, 47, 0.1), 0 4px 6px -2px rgba(37, 72, 113, 0.05)',
        'soft-lg': '0 10px 40px -10px rgba(214, 101, 47, 0.2), 0 4px 20px -2px rgba(37, 72, 113, 0.1)',
      },
    },
  },
  plugins: [],
};
export default config;
