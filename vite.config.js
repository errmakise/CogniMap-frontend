import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import electron from 'vite-plugin-electron'
import electron_render from "vite-plugin-electron-renderer";

export default defineConfig({
  // Vite 插件
  plugins: [
    electron({
      entry: 'electron/main.js', // 主进程文件
    }),
    electron_render(),
    Components({
      dts: true, // 生成类型声明文件
      dirs: ['src/components'], // 自动导入的组件目录
    }),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: true, // 生成类型声明文件
      eslintrc: {
        enabled: true, // 生成 eslint 配置
      },
    }),
    vue(),
    vueDevTools(),
    electron_render(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://49.234.192.196:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        secure: false // http协议需要添加这个
      }
    },
    port: 8888,
    cors: true, // 允许跨域
    hmr: true, // 开启热更新
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    rollupOptions: {
      external: ['electron'],
    },
  },
})
