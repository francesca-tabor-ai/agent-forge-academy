/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Create Academy palette
        'ca-green': '#13321C',
        'ca-navy': '#121E35',
        'ca-gold': '#E3AA4F',
        'ca-bg': '#FFFFFF',
        'ca-bg-warm': '#F3F1ED',
        'ca-text': '#030303',
        'ca-neutral-700': '#453D2E',
        'ca-neutral-500': '#80796B',
        'ca-neutral-300': '#CECAC3',
        'ca-neutral-200': '#B4AA90',
        // Legacy brand colors (for backward compatibility)
        'brand-dark': '#121E35', // Updated to ca-navy
        'brand-light': '#E3AA4F', // Updated to ca-gold
        'brand-yellow': '#E3AA4F', // Updated to ca-gold
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        sans: ['Nunito', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'pill': '999px',
        'hero': '24px',
      },
      spacing: {
        'section': '64px',
        'section-lg': '96px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'ripple': 'ripple 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(227, 170, 79, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(227, 170, 79, 0.8), 0 0 30px rgba(227, 170, 79, 0.4)' },
        },
      },
    },
  },
  plugins: [],
}

