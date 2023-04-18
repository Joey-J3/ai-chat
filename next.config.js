const { NextFederationPlugin } = require('@module-federation/nextjs-mf');

const mainAppUrl = process.env.MAIN_APP_URL
const chatGPTAppUrl = process.env.CHAT_GPT_APP_URL

const remotes = isServer => {
  const location = isServer ? 'ssr' : 'chunks';
  return {
    main: `main@${mainAppUrl}/_next/static/${location}/remoteEntry.js`,
    'chatgptNext': `chatgptNext@${chatGPTAppUrl}/_next/static/${location}/remoteEntry.js`,
  };
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config, { isServer }) {
    config.plugins.push(
      new NextFederationPlugin({
        name: 'chatgptNext',
        filename: 'static/chunks/remoteEntry.js',
        remotes: remotes(isServer),
        exposes: {
          './chat': './src/chatgpt/components/Chat.tsx',
        },
        shared: {
          '@mui/icons-material': {
            singleton: true,
            requiredVersion: '5.11.0',
          },
          '@mui/material': {
            singleton: true,
            requiredVersion: false,
          },
          'react-markdown/lib/react-markdown': {
            singleton: true,
            requiredVersion: false,
          },
          'remark-gfm': {
            singleton: true,
            requiredVersion: false,
          },
          'remark-math': {
            singleton: true,
            requiredVersion: false,
          },
          'remark-breaks': {
            singleton: true,
            requiredVersion: false,
          },
        },
        extraOptions:{
          automaticAsyncBoundary: true
        }
      })
    );

    // config.module.rules.push({
    //   test: /\.svg$/,
    //   use: ["@svgr/webpack"],
    // }); // 针对 SVG 的处理规则

    return config;
  }
};

if (process.env.DOCKER) {
  nextConfig.output = 'standalone';
}

module.exports = nextConfig;
