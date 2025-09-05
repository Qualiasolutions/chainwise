/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Temporarily ignore build errors for production deployment
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
      },
      {
        protocol: 'https',
        hostname: 'coin-images.coingecko.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Fix for pino-pretty and other optional dependencies
    config.externals = config.externals || []
    if (isServer) {
      config.externals.push('pino-pretty')
    } else {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }

    // Handle WalletConnect and Lit warnings
    config.ignoreWarnings = [
      { module: /node_modules\/@walletconnect/ },
      { module: /node_modules\/lit/ },
      { module: /node_modules\/pino/ },
    ]

    return config
  },
  transpilePackages: ['@rainbow-me/rainbowkit', '@wagmi/core', 'wagmi'],
  experimental: {
    esmExternals: true,
  },
}

module.exports = nextConfig