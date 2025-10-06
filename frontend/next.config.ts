import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
  
// };

// export default nextConfig;

module.exports = {
  async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3001/:path*',
        },
      ]
    },
};
// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   // Enable experimental features
//   experimental: {
//     // Enable Turbopack for faster builds (already using in scripts)
//     turbo: {
//       rules: {
//         '*.svg': {
//           loaders: ['@svgr/webpack'],
//           as: '*.js',
//         },
//       },
//     },
//   },

//   // Image optimization
//   images: {
//     domains: ['localhost'],
//     formats: ['image/webp', 'image/avif'],
//   },

//   // Environment variables
//   env: {
//     CUSTOM_KEY: process.env.CUSTOM_KEY,
//   },

//   // API configuration
//   async rewrites() {
//     return [
//       {
//         source: '/api/:path*',
//         destination: 'http://localhost:3001/:path*',
//       },
//     ];
//   },

//   // Headers for security
//   async headers() {
//     return [
//       {
//         source: '/(.*)',
//         headers: [
//           {
//             key: 'X-Frame-Options',
//             value: 'DENY',
//           },
//           {
//             key: 'X-Content-Type-Options',
//             value: 'nosniff',
//           },
//           {
//             key: 'Referrer-Policy',
//             value: 'origin-when-cross-origin',
//           },
//         ],
//       },
//     ];
//   },

//   // Webpack configuration
//   webpack: (config, { dev, isServer }) => {
//     // Custom webpack config if needed
//     return config;
//   },

//   // TypeScript configuration
//   typescript: {
//     // Dangerously allow production builds to successfully complete even if
//     // your project has type errors.
//     ignoreBuildErrors: false,
//   },

//   // ESLint configuration
//   eslint: {
//     // Warning: This allows production builds to successfully complete even if
//     // your project has ESLint errors.
//     ignoreDuringBuilds: false,
//   },

//   // Output configuration
//   output: 'standalone',

//   // Compression
//   compress: true,

//   // PoweredByHeader
//   poweredByHeader: false,

//   // React strict mode
//   reactStrictMode: true,

//   // SWC minification
//   swcMinify: true,
// };

// export default nextConfig;
