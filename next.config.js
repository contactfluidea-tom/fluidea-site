const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Le paquet Spline est livré en ESM (champ `exports` sans condition `require`) :
  // on le laisse transpiler par Next pour une résolution fiable au build.
  transpilePackages: ["@splinetool/react-spline", "@splinetool/runtime"],
  // Le champ `exports` de `@splinetool/react-spline` bloque la résolution webpack
  // (`Package path . is not exported`). On pointe directement vers le fichier ESM.
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@splinetool/react-spline$": path.resolve(
        __dirname,
        "node_modules/@splinetool/react-spline/dist/react-spline.js"
      ),
    };
    return config;
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "prod.spline.design",
      },
    ],
  },
};

module.exports = nextConfig;
