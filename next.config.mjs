
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    BACKEND_URI: process.env.BACKEND_URI,
  },

  experimental: {
    agentUpgrade: "security",
    agentFeedback: true,
  },
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
