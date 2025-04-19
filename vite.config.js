import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  // Vite 插件
  plugins: [
    Components({
      dts: true, // 生成类型声明文件
      dirs: ['src/components'], // 自动导入的组件目录
      // // 可以配置 UI 库的解析器，如 Element Plus, Ant Design Vue 等
      // resolvers: [
      //   // 例如 Element Plus
      //   (name) => {
      //     if (name.startsWith('El')) {
      //       return { importName: name.slice(2), path: 'element-plus' }
      //     }
      //   },
      // ],
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
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
