<template>
  <div class="graph-edit-container">

    <!-- vue-echarts 图表 -->
    <v-chart :option="chatOptions" ref="chartRef" />
    <NodeInfoPopup v-if="isPopupVisible" :nodeInfo="selectedNodeInfo" :position="popupPosition"
      @clickFile="handleClickFile" @clickEdit="handleClickEdit" />

    <GraphBottom class="bottom" v-model="sliderValue" @change="handleZoomChange" />
  </div>
</template>

<script setup>

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
  dataZoom: [
    {
      type: 'inside', // 启用鼠标滚轮缩放
      zoomOnMouseWheel: true, // 允许鼠标滚轮缩放
      moveOnMouseMove: true, // 允许鼠标移动平移
    }
  ],
  series: [
    {
      name: '知识图谱',
      type: 'graph',
      layout: 'force',
      draggable: true, //每个节点的拖拉
      legendHoverLink: true, //是否启用图例 hover(悬停) 时的联动高亮。
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
      zoom: 1,
      scaleLimit: { min: 0.1, max: 5 },
      label: {
        show: true,
        position: 'top',
        color: '#333'
      },
      lineStyle: {
        opacity: 0.9,
        width: 2,
        curveness: 0.1 // 边的曲度，支持从 0 到 1 的值，值越大曲度越大。
      }
    }
  ]

});
// 图表引用
const chartRef = ref(null);

const isPopupVisible = ref(false);
const selectedNodeInfo = ref({
  name: '节点名',
  createTime: '2025.1.1',
  updateTime: '2025.1.1',
  description: '描述内容',
  files: [
    { name: '文件名1', fileId: '1' },
    { name: '文件名2', fileId: '2' }
  ]
});
// 弹窗位置
const popupPosition = ref([0, 0]);

const findNearestNode = (chart, point, threshold = 20) => {
  const series = chart.getModel().getSeries()[0];
  let minDist = Infinity, nearestNode = null;

  series.getData().each((idx) => {
    const nodePos = series.getData().getItemLayout(idx);

    const dist = Math.sqrt(Math.pow(nodePos[0] - point[0], 2) +
      Math.pow(nodePos[1] - point[1], 2));

    if (dist < threshold && dist < minDist) {
      minDist = dist;
      nearestNode = series.getData().getRawDataItem(idx);
    }
  });
  return nearestNode;
}
const sliderValue = ref(100); // 初始值 100% (1x)


onMounted(() => {
  const chart = chartRef.value?.chart;
  if (chart) {

    // 监听拖拽事件
    chart.on('graphRoam', (params) => {
      if (isPopupVisible.value === true) {
        closePopup();
      }
      console.log('拖拽事件', params);
      const zoom = chart.getOption().series[0].zoom || 1;
      sliderValue.value = zoom * 100;
    });


    chart.getZr().on('click', (params) => {
      closePopup();
      console.log('点击事件', params);

      const point = chart.convertFromPixel({ seriesIndex: 0 }, [params.offsetX, params.offsetY]);
      let nodeData = findNearestNode(chart, point);
      console.log('nodeData', nodeData);

      if (nodeData) {
        showNodePopup(nodeData, params);
        console.log('点击了节点:', nodeData.name);
      }
    });
  }
});

const handleZoomChange = (zoom) => {
  console.log('缩放事件', zoom);
  const chart = chartRef.value?.chart;
  chart.setOption({ series: [{ zoom: zoom }] });


};

// 显示节点信息弹窗
const showNodePopup = (nodeData, eventParams) => {
  const chart = chartRef.value?.chart;

  if (chart) {
    selectedNodeInfo.value = {
      name: nodeData.name,
      createTime: '2025.1.1',
      updateTime: '2025.1.1',

      description: '描述内容',
      files: [
        { name: '文件名1', fileId: '1' },
        { name: '文件名2', fileId: '2' }
      ]
    };

    // 转换为页面绝对位置
    const containerPos = chart.getDom().getBoundingClientRect();
    popupPosition.value = [
      eventParams.offsetX + containerPos.left + 10,
      eventParams.offsetY + containerPos.top + 10
    ];

    console.log('popupPosition', popupPosition.value);
    console.log('eventParams', eventParams);
    isPopupVisible.value = true;
  }


}

const handleClickFile = (fileId) => {
  console.log('点击了文件:', fileId);
};

const handleClickEdit = () => {
  console.log('点击了编辑', selectedNodeInfo.value.name);
};

const closePopup = () => {
  console.log('关闭弹窗');
  isPopupVisible.value = false;
};
</script>

<style scoped>
.graph-edit-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.bottom {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
}
</style>
