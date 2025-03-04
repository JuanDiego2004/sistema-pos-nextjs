import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.pngwing.com",
        pathname: "/**/*.png", // Solo imágenes PNG
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**/*.png", // Imágenes JPG de Unsplash
      },
    ],
    domains: ['acxbeymnpkkexnplcwjf.supabase.co', "www.pngwing.com", "images.unsplash.com"]
  },
  
};

export default nextConfig;
