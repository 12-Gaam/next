/** @type {import('next').NextConfig} */
const { randomUUID } = require('crypto')

console.log('Loading next.config.js')

const nextConfig = () => ({
  // appDir is now stable in Next.js 14, no need for experimental flag
  generateBuildId: async () => {
    return randomUUID()
  }
})

module.exports = nextConfig
