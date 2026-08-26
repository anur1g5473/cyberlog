/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0a0a0a',
          card: '#111111',
          hover: '#161616',
          border: '#222222',
        },
        terminal: {
          green: '#00ff41',
          'green-dim': '#00bb30',
          'green-glow': '#00ff4133',
          red: '#ff3b3b',
          'red-dim': '#b32424',
          amber: '#ffb703',
          muted: '#888888',
          text: '#e0e0e0',
        },
      },
      fontFamily: {
        mono: ['Fira Code', 'JetBrains Mono', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', filter: 'drop-shadow(0 0 8px rgba(0, 255, 65, 0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 16px rgba(0, 255, 65, 0.8))' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
      },
      boxShadow: {
        'terminal-glow': '0 0 20px -5px rgba(0, 255, 65, 0.25)',
        'red-glow': '0 0 20px -5px rgba(255, 59, 59, 0.3)',
      },
    },
  },
  plugins: [],
}