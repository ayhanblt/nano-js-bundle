import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

export default defineConfig({
  plugins: [
    react(),
    svgr({
      include: "**/*.svg?react",
    }),
    cssInjectedByJsPlugin(),
  ],
  build: {
    target: 'esnext',
    lib: {
      entry: 'src/main.tsx',
      name: 'NanoAIWidget',
      fileName: 'bundle',
      formats: ['iife']
    },
    rollupOptions: {
      // By omitting external, we bundle React and all dependencies inside the widget
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
})
