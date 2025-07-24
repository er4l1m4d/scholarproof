// postcss.config.js
module.exports = {
  plugins: {
    'tailwindcss': {},
    'postcss-preset-env': {
      stage: 3,
      features: {
        'oklch-function': true,
      },
    },
    'autoprefixer': {},
  },
};