import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // ─── Artisan palette ──────────────────────────────────────────────────
      colors: {
        // Core brand
        terracotta: {
          50: '#fdf3f0',
          100: '#fae5dd',
          200: '#f5c9b8',
          300: '#eda68c',
          400: '#e47a5c',
          500: '#c85c3a', // primary brand
          600: '#b04a2b',
          700: '#8f3a22',
          800: '#72301c',
          900: '#5c2818',
        },
        sand: {
          50: '#fdfaf3',
          100: '#f8f0db',
          200: '#f0dfb3',
          300: '#e6c97f',
          400: '#d9ae4f',
          500: '#c49530', // secondary
          600: '#a57825',
          700: '#845d1e',
          800: '#6b4b1a',
          900: '#573c16',
        },
        olive: {
          50: '#f4f6ee',
          100: '#e5ead4',
          200: '#ccd6ab',
          300: '#aabb7a',
          400: '#8ba04f',
          500: '#6d8038', // accent
          600: '#556630',
          700: '#435029',
          800: '#364023',
          900: '#2c3520',
        },
        // shadcn/ui compatible semantic tokens
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },

      // ─── Arabic-first typography ──────────────────────────────────────────
      fontFamily: {
        sans: ['Tajawal', 'IBM Plex Sans Arabic', 'Arial', 'sans-serif'],
        arabic: ['Tajawal', 'IBM Plex Sans Arabic', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },

      // ─── Border radius ────────────────────────────────────────────────────
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      // ─── Animations (shadcn) ──────────────────────────────────────────────
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [animate],
};

export default config;
