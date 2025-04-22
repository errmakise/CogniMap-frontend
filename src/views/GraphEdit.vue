<template>
  <div class="graph-edit-container">
    <!-- vue-echarts 图表 -->
    <v-chart :option="chatOptions" ref="chartRef" />
    <NodeInfoPopup v-if="isPopupVisible" :nodeInfo="selectedNodeInfo" :position="popupPosition"
      @clickFile="handleClickFile" @clickEdit="handleClickEdit" />
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

onMounted(() => {
  // 可以在这里进行更多的初始化操作，例如监听图表事件
  const chart = chartRef.value?.chart;
  if (chart) {
    // 监听拖拽事件
    chart.on('graphRoam', () => {
      closePopup();
    });

    // 监听缩放事件
    chart.on('dataZoom', () => {
      closePopup();
    });

    chart.getZr().on('click', (params) => {
      closePopup();
      console.log('点击事件', params);

      // 获取点击的图形元素
      const target = params.target;
      const element = target.__ec_inner_0;

      const point = chart.convertFromPixel({ seriesIndex: 0 }, [params.offsetX, params.offsetY]);
      const nodeIndex = findNearestNodeIndex(chart, point); // 自定义查找函数

      console.log('nodeIndex', nodeIndex);
      // 判断是否点击了节点
      if (target && element
        && element.dataType === 'node') {

        // 查找点击的节点
        const series = chart.getModel().getSeries()[0];//本项目是力导向图，只有一个series
        const data = series.getData();
        console.log('series', series);
        console.log('data', data);

        let nodeData = data.getRawDataItem(element.dataIndex);


        if (nodeData) {
          showNodePopup(nodeData, params);
          console.log('点击了节点:', nodeData.name);
        }

        //要不要加个点击在节点附近，然后显示节点信息的功能？
      }
    });
  }
});

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
  isPopupVisible.value = false;
};
</script>

<style scoped>
.graph-edit-container {
  width: 100%;
  height: 100%;
}
</style>
