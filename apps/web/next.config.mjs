/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Transpile the shared workspace packages (they ship raw TS/ESM).
  transpilePackages: [
    "@rubiks/core",
    "@rubiks/db",
    "@rubiks/renderer-three",
  ],
  webpack: (config) => {
    // The shared workspace packages are raw TypeScript ESM that import sibling
    // modules with explicit `.js` specifiers. Teach webpack to resolve those
    // to the `.ts`/`.tsx` sources.
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      ".js": [".ts", ".tsx", ".js"],
    };
    return config;
  },
};

export default nextConfig;
