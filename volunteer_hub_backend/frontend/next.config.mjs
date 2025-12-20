/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
        search: '',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  reactStrictMode: false, // Disable in dev for faster HMR
  swcMinify: true,
  // Disable source maps in dev for faster builds
  productionBrowserSourceMaps: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    // Optimize large package imports - tree-shake unused exports
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'lodash.get',
      'react-icons',
      'react-icons/fa',
      'react-icons/md',
      'react-icons/fi',
      'react-icons/bs',
      'react-icons/ci',
      'react-icons/gi',
      'react-icons/ri',
      '@mui/material',
      'recharts',
      'framer-motion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
    ],
  },
  modularizeImports: {
    'react-icons/fa': {
      transform: 'react-icons/fa/{{member}}',
    },
    'react-icons/md': {
      transform: 'react-icons/md/{{member}}',
    },
    'react-icons/fi': {
      transform: 'react-icons/fi/{{member}}',
    },
    'react-icons/bs': {
      transform: 'react-icons/bs/{{member}}',
    },
    'react-icons/ci': {
      transform: 'react-icons/ci/{{member}}',
    },
    'react-icons/hi': {
      transform: 'react-icons/hi/{{member}}',
    },
    'react-icons/gi': {
      transform: 'react-icons/gi/{{member}}',
    },
    'react-icons/ri': {
      transform: 'react-icons/ri/{{member}}',
    },
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
      skipDefaultConversion: true,
    },
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
  },
  onDemandEntries: {
    // Keep pages in memory longer to reduce recompilation
    maxInactiveAge: 120 * 1000,
    pagesBufferLength: 8,
  },
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Faster source maps in development
      config.devtool = 'eval-cheap-module-source-map';
      
      // Cache for faster rebuilds
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    
    // Ignore moment.js locales (if used)
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    return config;
  },
};

export default nextConfig;
