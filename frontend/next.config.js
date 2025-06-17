/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export", // Enables static HTML export
  basePath: "", // Explicitly set to empty string for root deployment, or keep it absent
  assetPrefix: "",
  trailingSlash: true, // Creates /about/index.html instead of /about.html
  images: {
    unoptimized: true, // Required for `next export` with `next/image`
  },
};

module.exports = nextConfig;
