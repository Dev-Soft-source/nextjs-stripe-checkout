const colors = require('tailwindcss/colors');

module.exports = {
  mode: 'jit',
  purge: ['./[lng]/pages/**/*.{js,ts,jsx,tsx}', './[lng]/components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        rose: colors.rose,
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
