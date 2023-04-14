const path = require('path')
const { NextFederationPlugin } = require('@module-federation/nextjs-mf');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config, { isServer }) {
    config.plugins.push(
      new NextFederationPlugin({
        name: 'chatgptNext',
        filename: 'static/chunks/remoteEntry.js',
        remotes: {
          // main: `main@http://localhost:3000/_next/static/${isServer ? 'ssr' : 'chunks'}/remoteEntry.js`,
        },
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
