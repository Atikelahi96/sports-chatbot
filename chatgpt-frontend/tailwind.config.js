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
        'chat-bg': '#343541',
        'chat-sidebar': '#202123',
        'chat-input': '#40414f',
        'chat-border': '#565869',
      },
      animation: {
        'typing': 'typing 1.4s infinite ease-in-out',
      },
      keyframes: {
        typing: {
          '0%, 60%, 100%': {
            transform: 'translateY(0px)',
            opacity: '0.75',
          },
          '30%': {
            transform: 'translateY(-10px)',
            opacity: '1',
          },
        },
      },
    },
  },
  plugins: [],
}