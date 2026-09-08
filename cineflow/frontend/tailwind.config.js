/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        obsidian: '#09090b',
        charcoal: '#121214',
        panel: '#18181b',
        panelAlt: '#27272a',
        soft: '#f4f4f5',
        muted: '#a1a1aa',
        accent: '#ffffff',
        accentDeep: '#e4e4e7',
        accentWarm: '#71717a',
        line: '#27272a',
        neonPurple: '#ffffff',
        neonTeal: '#d4d4d8',
      },
      boxShadow: {
        soft: '0 4px 20px rgba(0, 0, 0, 0.5)',
        glow: '0 0 0 1px rgba(255, 255, 255, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
