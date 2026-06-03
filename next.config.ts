import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.peercheck.africa",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
