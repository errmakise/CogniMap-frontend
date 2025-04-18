<template>
  <v-chart class="chart" :option="option" autoresize style="height: 400px; width: 100%" />
</template>

<script setup>
import { ref } from 'vue'
import * as echarts from 'echarts'

const option = ref({
  title: {
    text: '销售数据'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['线上', '线下']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '线上',
      type: 'line',
      data: [120, 132, 101, 134, 90, 230, 210]
    },
    {
      name: '线下',
      type: 'line',
      data: [220, 182, 191, 234, 290, 330, 310]
    }
  ]
})

// 如果需要手动操作图表实例
const chartRef = ref(null)

const getInstance = () => {
  if (chartRef.value) {
    const instance = chartRef.value.getEchartsInstance()
    console.log('图表实例:', instance)
    // 可以调用实例方法，例如: instance.resize()
  }
}
</script>

<style scoped>
.chart {
  /* 确保图表容器有明确的高度 */
  height: 400px;
}
</style>