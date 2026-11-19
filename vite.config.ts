import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // 把体积大且不常变动的库单独拆出，避免首屏拉一个大包
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) return 'charts'
          if (id.includes('katex')) return 'katex'
          if (id.includes('react-router')) return 'router'
          if (id.includes('react')) return 'react'
        },
      },
    },
  },
})
