/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
}

module.exports = nextConfig