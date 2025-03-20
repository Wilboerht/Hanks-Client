import type { NextConfig } from "next";
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

// 获取环境变量
const isAnalyze = process.env.ANALYZE === 'true';

const nextConfig: NextConfig = {
  /* config options here */
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    optimizeCss: true,
    optimisticClientCache: true,
  },
  // 服务器外部包
  serverExternalPackages: [],
  webpack: (config, { isServer }) => {
    // 优化文件大小
    config.optimization.moduleIds = 'deterministic';
    // 将大型依赖包拆分为单独的chunk
    config.optimization.splitChunks = {
      chunks: 'all',
      maxInitialRequests: 25,
      minSize: 20000
    };
    
    // 添加bundle分析插件（仅在ANALYZE=true时运行）
    if (isAnalyze) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: isServer ? 8888 : 8889,
          openAnalyzer: true,
        })
      );
    }
    
    return config;
  },
};

export default nextConfig;
