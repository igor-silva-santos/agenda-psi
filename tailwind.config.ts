import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0F766E',
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        accent: {
          DEFAULT: '#0EA5E9',
          600: '#0284C7',
        },
        surface: '#F8FAFC',
        ink: '#0F172A',
        muted: '#E2E8F0',
      },
      fontFamily: {
        heading: ['var(--font-archivo)', 'system-ui', 'sans-serif'],
        body: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
