/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['DM Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        border:     'hsl(var(--border))',
        input:      'hsl(var(--input))',
        ring:       'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // SaPyme Brand
        navy: {
          50:  '#EEF4FB',
          100: '#D8E6F7',
          200: '#B0C9EE',
          300: '#7AA3DC',
          400: '#4A78C8',
          500: '#2E5BA8',
          600: '#1E4080',
          700: '#163058',
          800: '#0F2040',
          900: '#0A1628',
          950: '#050D1F',
        },
        amber: {
          50:  '#FEF5E8',
          100: '#FDE8CC',
          200: '#FAD4A8',
          300: '#F8BC78',
          400: '#F5A04A',
          500: '#F08020',
          600: '#D96A00',
          700: '#B85200',
          800: '#8A3D00',
        },
        sage: {
          50:  '#E8F6ED',
          100: '#D0EDD9',
          200: '#A8DAB8',
          300: '#7DC49A',
          400: '#5AA677',
          500: '#3F885C',
          600: '#306E4A',
          700: '#235438',
        },
      },
      borderRadius: {
        lg:  'calc(var(--radius) + 2px)',
        md:  'var(--radius)',
        sm:  'calc(var(--radius) - 2px)',
        xl:  '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        xs:  'var(--shadow-xs)',
        sm:  'var(--shadow-sm)',
        md:  'var(--shadow-md)',
        lg:  'var(--shadow-lg)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'modal-in': {
          from: { opacity: '0', transform: 'scale(0.96) translateY(8px)' },
          to:   { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'shimmer': {
          from: { backgroundPosition: '-468px 0' },
          to:   { backgroundPosition: '468px 0' },
        },
      },
      animation: {
        'fade-in':   'fade-in 0.2s ease-out',
        'modal-in':  'modal-in 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        'shimmer':   'shimmer 1.4s infinite linear',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};