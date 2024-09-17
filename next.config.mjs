/** @type {import('next').NextConfig} */
const nextConfig = {
    // Disable source maps in production
    productionBrowserSourceMaps: false,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'img.clerk.com',
          
         
        },
      ],
    },
    // Modify the webpack configuration to ignore `.map` files
    webpack: (config) => {
      config.module.rules.push({
        test: /\.map$/,
        use: 'ignore-loader',
      });
      
      return config;
    },

    
  };
  
  export default nextConfig;
  