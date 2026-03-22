const path = require('path');

/** Pin config path so PostCSS/Tailwind resolve correctly when cwd is the monorepo root (turbo, etc.). */
module.exports = {
  plugins: {
    tailwindcss: {
      config: path.join(__dirname, 'tailwind.config.js'),
    },
    autoprefixer: {},
  },
};
