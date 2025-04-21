<template>
  <NodeInfoPopup />
  <div class="graph-edit-container">
    <!-- vue-echarts 图表 -->
    <v-chart :option="chatOptions" ref="chartRef" />

  </div>
</template>

<script setup>
import * as echarts from 'echarts';

// 定义图表配置
const chatOptions = ref({
  tooltip: {
    trigger: 'item',
    formatter: function (params) {
      if (params.dataType === 'node') {
        return `
          <div>
          <p>节点名称：${params.data.name}</p>
          <p>节点ID：${params.data.id}</p>
        </div >
        `;
      }
      return ''
    }
  },
  animationDuration: 1500,
  series: [
    {
      name: '知识图谱',
      type: 'graph',
      layout: 'force',
      force: {
        repulsion: 1000,
        edgeLength: 200,
        gravity: 0.1,
        friction: 0.9
      },
      data: [
        { name: '人工智能', symbolSize: 10, id: '1' },
        { name: '机器学习', symbolSize: 10, id: '2' },
      ],
      links: [
        { source: '1', target: '2' },
      ],
      roam: true,
      label: {
        show: true,
        position: 'top',
        color: '#333'
      },
      lineStyle: {
        opacity: 0.9,
        width: 2,
        curveness: 0.1
      }
    }
  ]
});
// 图表引用
const chartRef = ref(null);

onMounted(() => {
  // 可以在这里进行更多的初始化操作，例如监听图表事件
  const chart = chartRef.value?.chart;
  if (chart) {
    chart.on('click', (params) => {
      console.log('点击了节点:', params.data.name);
    });
  }
});
</script>

<style scoped>
.graph-edit-container {
  width: 100%;
  height: 100%;
}
</style>
