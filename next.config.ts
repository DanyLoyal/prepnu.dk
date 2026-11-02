import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components (PPR/dynamicIO) er slået fra: butikken viser altid
  // lagerstatus/priser live fra databasen, så der er ikke noget at vinde
  // ved aggressiv statisk caching, og det forenkler render-modellen.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cf.cjdropshipping.com" },
      { protocol: "https", hostname: "oss-cf.cjdropshipping.com" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
