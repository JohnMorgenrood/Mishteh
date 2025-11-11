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
        // Background color - warm beige from logo
        background: '#d4c4a3',
        // Primary accent - dark teal from logo (SWAPPED)
        primary: {
          50: '#e8eef0',
          100: '#d1dde1',
          200: '#a3bbc3',
          300: '#7599a5',
          400: '#477787',
          500: '#195569',
          600: '#144454',
          700: '#0f333f',
          800: '#0a222a',
          900: '#051115',
          DEFAULT: '#0e1f29', // Main accent - dark teal/blue
        },
        // Secondary accent - gold/tan from logo (SWAPPED)
        secondary: {
          50: '#fdf8f3',
          100: '#faf0e6',
          200: '#f5ddc4',
          300: '#efc49f',
          400: '#e3a46d',
          500: '#d68a4c',
          600: '#c67540',
          700: '#a76238',
          800: '#865035',
          900: '#6d432e',
          DEFAULT: '#a16238', // Gold/tan accent
        },
      },
      backgroundColor: {
        'page': '#d4c4a3', // Default page background
      },
    },
  },
  plugins: [],
};
export default config;
