export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        comfortaa: ['Comfortaa', 'cursive'],
      },
      colors: {
        primary: '#6D28D9',
        secondary: '#4C1D95',
        dark: {
          DEFAULT: '#0F172A',
          lighter: '#1E293B',
        },
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
};
