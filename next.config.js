/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // 警告やエラーがあってもビルドを成功させる
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig