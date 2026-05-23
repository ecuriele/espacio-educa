/** @type {import('tailwindcss').Config} */
export default {
  // Escanear todos los archivos JSX/JS para purgar clases no usadas
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  // dark mode controlado por clase en <html> (toggle manual)
  darkMode: 'class',
  theme: {
    extend: {
      // ─── Paleta de colores Espacio Educa ────────────────────────────
      colors: {
        brand: {
          50:  '#eff2f9',
          100: '#e1e5f4',
          200: '#c7ceea',
          300: '#a3b1db',
          400: '#7e90c8',
          500: '#6171b6',
          600: '#484b99',  // Color original del Brandboard SVG
          700: '#3e4082',
          800: '#34366b',
          900: '#2d3056',
          950: '#1b1c34',
        },
        accent: {
          400: '#f07659',
          500: '#ea5837',  // Color original del Brandboard SVG
          600: '#c84223',
        },
        warning: {
          400: '#fbbf24',  // Ámbar — advertencias/streaks
          500: '#f59e0b',
        },
        danger: {
          400: '#f87171',
          500: '#ef4444',
        },
        surface: {
          // Superficies en modo oscuro (estilo Codecademy / Original)
          dark:  '#0F111A',   // Fondo base
          card:  '#171A23',   // Tarjetas
          hover: '#2D3748',   // Hover estado
          border:'#4A5568',   // Bordes
        },
      },
      // ─── Tipografía ─────────────────────────────────────────────────
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        mono:  ['Fira Code', 'JetBrains Mono', 'monospace'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      // ─── Animaciones personalizadas ──────────────────────────────────
      keyframes: {
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-up': {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pulse-ring': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(37, 99, 235, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(37, 99, 235, 0)' },
        },
        'streak-flame': {
          '0%, 100%': { transform: 'scaleY(1) rotate(-3deg)', color: '#f97316' },
          '50%': { transform: 'scaleY(1.1) rotate(3deg)', color: '#fb923c' },
        },
        'badge-pop': {
          '0%':   { transform: 'scale(0) rotate(-12deg)', opacity: '0' },
          '70%':  { transform: 'scale(1.15) rotate(4deg)' },
          '100%': { transform: 'scale(1) rotate(0)', opacity: '1' },
        },
        'progress-fill': {
          '0%':   { width: '0%' },
          '100%': { width: 'var(--progress-width)' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left':  'slide-in-left 0.3s ease-out',
        'fade-up':        'fade-up 0.4s ease-out',
        'pulse-ring':     'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'streak-flame':   'streak-flame 0.8s ease-in-out infinite',
        'badge-pop':      'badge-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'progress-fill':  'progress-fill 1s ease-out forwards',
      },
      // ─── Espaciado extra ─────────────────────────────────────────────
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      // ─── Bordes redondeados ──────────────────────────────────────────
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      // ─── Sombras personalizadas ──────────────────────────────────────
      boxShadow: {
        'brand-sm': '0 0 0 1px rgba(37, 99, 235, 0.3)',
        'brand-md': '0 4px 24px -4px rgba(37, 99, 235, 0.5)',
        'brand-lg': '0 8px 40px -8px rgba(37, 99, 235, 0.6)',
        'card-dark': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'glow-accent': '0 0 20px rgba(249, 115, 22, 0.4)',
      },
    },
  },
  plugins: [],
};
// Force Vite rebuild
