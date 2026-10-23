/** @type {import('next').NextConfig} */
const nextConfig = {
  // BACKEND_URI is an intentionally public API base URL used by client components.
  env: {
    BACKEND_URI: process.env.BACKEND_URI,
  },
  /* config options here */
  experimental: {
    agentUpgrade: "security",
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
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
