import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ElementPlusConfigForm',
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`
    },
    rollupOptions: {
      external: ['vue', 'element-plus', 'vue-i18n'],
      output: {
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus',
          'vue-i18n': 'VueI18n'
        }
      }
    }
  },
  server: {
    port: 3000
  }
}) 