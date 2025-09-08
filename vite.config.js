import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react()
  ],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.warn'],
        passes: 3,
        unsafe_arrows: true,
        unsafe_methods: true,
        unsafe_proto: true
      },
      mangle: {
        safari10: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Node modules chunking
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('lucide-react') || id.includes('react-hot-toast')) {
              return 'vendor-ui';
            }
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts';
            }
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'vendor-maps';
            }
            if (id.includes('axios')) {
              return 'vendor-http';
            }
            return 'vendor-utils';
          }
          
          // Application code chunking
          if (id.includes('/admin/')) {
            return 'admin';
          }
          
          if (id.includes('/components/')) {
            return 'components';
          }
          
          if (id.includes('/hooks/') || id.includes('hooks.jsx')) {
            return 'hooks';
          }
          
          if (id.includes('/utils/')) {
            return 'utils';
          }
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `images/[name]-[hash].${ext}`;
          }
          if (/\.(woff|woff2|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `fonts/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        }
      },
      external: [],
      treeshake: {
        moduleSideEffects: false
      }
    },
    chunkSizeWarningLimit: 800,
    reportCompressedSize: false,
    cssCodeSplit: true,
    assetsInlineLimit: 4096
  },
  resolve: {
    alias: {}
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'react-hot-toast',
      'react-helmet-async',
      'framer-motion'
    ]
  },
  server: {
    hmr: {
      overlay: false
    }
  }
});