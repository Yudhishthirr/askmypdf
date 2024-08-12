/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (
        config,
        { buildId, dev, isServer, defaultLoaders, webpack }
      ) => {
        config.resolve.alias.canvas = false
        config.resolve.alias.encoding = false
        return config
      },
      eslint:{
        ignoreDuringBuilds:true
      },
      // images: {
      //   remotePatterns: [
      //     {
      //       protocol: 'https',
      //       hostname: 'localhost',
      //       pathname: '/images/**',
      //       port: '3001',
      //     }
      //   ]
      // }
};

export default nextConfig;
