/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Cozy anime study room palette
        // Midnight navy backgrounds, soft dark-blue surfaces, lavender + cyan accents
        navy: {
          50: '#F8FAFC',   // primary text — warm white
          100: '#CBD5E1',  // secondary text
          200: '#AAB8CA',  // muted text
          300: '#8B9BB0',  // dimmed labels
          400: '#5C6B82',  // borders, placeholders
          500: '#3A4660',  // input borders
          600: '#2A3450',  // subtle borders
          700: '#1E2840',  // elevated surfaces (sidebar)
          800: '#151D30',  // card background — soft dark blue
          900: '#0F1525',  // secondary surface
          950: '#0B1020',  // page background — midnight navy
        },
        neon: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#78E5F5',  // soft cyan — primary accent
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        lavender: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#B9A5FF',  // lavender accent — secondary highlights
          400: '#a88bfc',
          500: '#9272f0',
          600: '#7e57e0',
          700: '#6c47cf',
          800: '#5a37b8',
          900: '#4a2c9e',
        },
        lamp: {
          50: '#ffeed4',
          100: '#fce4be',
          200: '#F6D7A7',  // warm lamp glow — cozy details
          300: '#f0c885',
          400: '#e9b76a',
          500: '#dca450',
          600: '#c8903c',
          700: '#a8772e',
          800: '#886028',
          900: '#6a4a22',
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#B9A5FF',  // maps to lavender for consistency
          400: '#a88bfc',
          500: '#9272f0',
          600: '#7e57e0',
          700: '#6c47cf',
          800: '#5a37b8',
          900: '#4a2c9e',
        },
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
      },
      boxShadow: {
        card: '0 2px 8px -2px rgba(0,0,0,0.3), 0 1px 3px -1px rgba(0,0,0,0.2)',
        'card-hover': '0 8px 24px -8px rgba(120,229,245,0.15), 0 2px 8px -2px rgba(0,0,0,0.3)',
        glow: '0 0 0 1px rgba(120,229,245,0.12), 0 8px 32px -8px rgba(120,229,245,0.2)',
        'neon-glow': '0 0 20px rgba(120,229,245,0.2)',
        'purple-glow': '0 0 20px rgba(185,165,255,0.2)',
        'lamp-glow': '0 0 40px rgba(246,215,167,0.15), 0 0 80px rgba(246,215,167,0.08)',
        'cozy': '0 4px 16px -4px rgba(0,0,0,0.35), 0 1px 4px -1px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'sparkle': 'sparkle 0.6s ease-out',
        'celebrate': 'celebrate 0.5s ease-out',
        'float': 'float 4s ease-in-out infinite',
        'rain': 'rain 0.8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(120,229,245,0.15)' },
          '50%': { boxShadow: '0 0 30px rgba(120,229,245,0.25)' },
        },
        sparkle: {
          '0%': { opacity: '0', transform: 'scale(0) rotate(0deg)' },
          '50%': { opacity: '1', transform: 'scale(1.2) rotate(180deg)' },
          '100%': { opacity: '0', transform: 'scale(0.8) rotate(360deg)' },
        },
        celebrate: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        rain: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '20%': { opacity: '0.4' },
          '100%': { transform: 'translateY(60px)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
