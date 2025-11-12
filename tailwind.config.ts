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
        // Background - Soft blush white
        background: '#fdf8fc',
        // Primary - Vibrant girly pink
        primary: {
          50: '#fef5ff',
          100: '#fce7fe',
          200: '#fad4fd',
          300: '#f7b0fa',
          400: '#f27ef5',
          500: '#e74eeb',
          600: '#d12fd5',
          700: '#b021b3',
          800: '#911e92',
          900: '#781f76',
          DEFAULT: '#e74eeb', // Bright girly pink
        },
        // Secondary - Soft periwinkle blue
        secondary: {
          50: '#f4f6ff',
          100: '#ebeeff',
          200: '#dce1ff',
          300: '#c0c9ff',
          400: '#a0a7ff',
          500: '#8187ff',
          600: '#6b5ef7',
          700: '#5a4de3',
          800: '#4941bc',
          900: '#3d3b95',
          DEFAULT: '#8187ff', // Periwinkle blue
        },
        // Accent colors - Modern girly palette
        accent: {
          lavender: '#d4c5f9',   // Soft lavender
          mint: '#b8f4dc',       // Fresh mint
          peach: '#ffd4c4',      // Peachy pink
          skyblue: '#c7e9ff',    // Sky blue
          rose: '#ffcce0',       // Rose pink
          lilac: '#e6d5ff',      // Lilac purple
        },
      },
      backgroundColor: {
        'page': '#fdf8fc', // Blush white background
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
        'soft': '0 2px 15px -3px rgba(231, 78, 235, 0.1), 0 4px 6px -2px rgba(129, 135, 255, 0.05)',
        'soft-lg': '0 10px 40px -10px rgba(231, 78, 235, 0.15), 0 4px 20px -2px rgba(129, 135, 255, 0.1)',
      },
    },
  },
  plugins: [],
};
export default config;
