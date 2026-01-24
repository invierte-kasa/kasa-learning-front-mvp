/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ui-avatars.com', 'images.unsplash.com'],
  },
  // Module Federation configuration
  // To enable Module Federation, set NEXT_PRIVATE_LOCAL_WEBPACK=true and uncomment below
  // webpack(config, options) {
  //   const NextFederationPlugin = require('@module-federation/nextjs-mf');
  //   const { isServer } = options;
  //
  //   config.plugins.push(
  //     new NextFederationPlugin({
  //       name: 'kasaLearning',
  //       filename: 'static/chunks/remoteEntry.js',
  //       exposes: {
  //         './Dashboard': './app/page.tsx',
  //         './Quiz': './components/quiz/QuizContainer.tsx',
  //       },
  //       remotes: {},
  //       shared: {
  //         react: { singleton: true, requiredVersion: false },
  //         'react-dom': { singleton: true, requiredVersion: false },
  //       },
  //       extraOptions: { exposePages: true },
  //     })
  //   );
  //
  //   return config;
  // },
};

module.exports = nextConfig;
