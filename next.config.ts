import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components (PPR/dynamicIO) er slået fra: butikken viser altid
  // lagerstatus/priser live fra databasen, så der er ikke noget at vinde
  // ved aggressiv statisk caching, og det forenkler render-modellen.
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
