/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      colors: {
        background: '#0B0F19', // Deep slate background
        foreground: '#F1F5F9', // Light neutral 
        primary: {
          DEFAULT: '#3B82F6', // Vibrant blue
          hover: '#2563EB',
        },
        secondary: {
          DEFAULT: '#8B5CF6', // Purple accent
          hover: '#7C3AED',
        },
        card: {
          DEFAULT: 'rgba(30, 41, 59, 0.7)', // Glassmorphism base
          border: 'rgba(255, 255, 255, 0.1)',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
