<template>
  <div class="echarts-container">
    <div ref="chartContainer" class="chart"></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, shallowRef } from 'vue'
import * as echarts from 'echarts'

const chartContainer = ref(null)
const chart = shallowRef(null)

onMounted(() => {
  if (!chartContainer.value) return

  // 初始化图表
  chart.value = echarts.init(chartContainer.value)

  // 配置项
  const option = {
    title: {
      text: 'ECharts 入门示例'
    },
    tooltip: {},
    legend: {
      data: ['销量']
    },
    xAxis: {
      data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
    },
    yAxis: {},
    series: [
      {
        name: '销量',
        type: 'bar',
        data: [5, 20, 36, 10, 10, 20]
      }
    ]
  }

  // 设置配置项
  chart.value.setOption(option)

  // 响应式调整大小
  window.addEventListener('resize', handleResize)
})

// 处理窗口大小变化
const handleResize = () => {
  chart.value?.resize()
}

onUnmounted(() => {
  // 清理资源
  window.removeEventListener('resize', handleResize)
  chart.value?.dispose()
})
</script>

<style scoped>
.echarts-container {
  width: 100%;
  height: 100%;
}

.chart {
  width: 100%;
  height: 400px;
}
</style>