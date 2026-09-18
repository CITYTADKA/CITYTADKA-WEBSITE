import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        page: '#FAFAF7',       // City Paper
        card: '#FFFFFF',
        ink: '#1C2438',        // City Ink
        'ink-dark': '#AEB6C8', // Soft Grey — dark-surface secondary text only
        'ink-light': '#34405A',// Line Navy — light-surface secondary text
        brand: '#ED1C24',      // Tadka Red
        food: '#E56B2F',
        fashion: '#6D214F',
        heritage: '#C9993A',
        business: '#16856B',
        updates: '#246BFD'
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '20px',
        pill: '999px'
      }
    }
  },
  plugins: []
};

export default config;
