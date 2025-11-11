import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/**", // Allows all paths under this domain
      },
    ],
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: '/Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-client-next',
  },
}

export default nextConfig
