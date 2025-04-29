<template>
  <div class="graph-edit-container">

    <!-- vue-echarts 图表 -->
    <v-chart :option="chatOptions" ref="chartRef" />
    <NodeInfoPopup v-if="isPopupVisible" :nodeInfo="selectedNodeInfo" :position="popupPosition"
      @clickFile="handleClickFile" @clickEdit="handleClickEdit" />

    <GraphBottom class="bottom" v-model="sliderValue" @change="handleZoomChange" @icon-click="handleIconClick" />
    <!-- 搜索对话框 -->
    <el-dialog v-model="searchVisible" title="搜索节点" width="30%">
      <el-input v-model="searchKeyword" placeholder="输入节点名称" @keyup.enter="performSearch" />
      <template #footer>
        <el-button @click="searchVisible = false">取消</el-button>
        <el-button type="primary" @click="performSearch">搜索</el-button>
      </template>
    </el-dialog>


    <!-- 新建节点弹窗 -->
    <el-dialog v-model="showCreateDialog" align-center width="30%">
      <el-form :model="newNodeForm" label-width="100px" label-position="left">
        <el-form-item label="名称" class="create-item" style="margin-bottom: 50px;">
          <el-input v-model="newNodeForm.name" placeholder="输入节点名称" class="create-input" maxlength="10" />
        </el-form-item>
        <el-form-item label="描述11" class="create-item" style="margin-bottom: 50px;">
          <el-input v-model="newNodeForm.description" type="textarea" placeholder="输入节点描述" maxlength="50"
            show-word-limit="true" :autosize="{ minRows: 4, maxRows: 8 }" class="create-input" resize="none" />
        </el-form-item>

        <el-form-item label="关联的文件" class="create-item">
          <div style="display: block;">
            <el-button type="primary" @click="chooseFile" round color="#000000" style="display: block;">
              选择文件(已选{{ selectedFiles.length }}个)
            </el-button>
            <div v-if="selectedFiles.length > 0" style="margin-top: 5px;">
              <el-tag v-for="file in selectedFiles" :key="file.id" style="margin-right: 8px; margin-top: 8px;" closable
                type="info" @close="selectedFiles = selectedFiles.filter(f => f.id !== file.id)">
                {{ file.label }}
              </el-tag>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false" round color="#DBDBDB">取消</el-button>
        <el-button type="primary" @click="createNewNode" round color="#000000">创建</el-button>
      </template>
    </el-dialog>

    <!-- 删除节点弹窗 -->
    <el-dialog v-model="showFileDialog" title="选择关联文件" width="40%" top="20vh">
      <el-tree :data="fileTreeData" :props="{ label: 'label', children: 'children' }" @node-click="handleFileSelect"
        :highlight-current="false" node-key="id" :show-checkbox="true" :check-strictly="true" />
      <template #footer>
        <el-button @click="showFileDialog = false">取消</el-button>
        <el-button type="primary" @click="showFileDialog = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { useDownloadHistoryStore } from '@/stores/downloadHistory'
import { ipcRenderer } from 'electron'
import path from 'path'

const downloadHistoryStore = useDownloadHistoryStore()


// 模拟数据 - 替换API调用
const mockNodes = [
  { name: '人工智能', symbolSize: 10, id: '1', description: '模拟AI节点数据' },
  { name: '机器学习', symbolSize: 10, id: '2', description: '模拟ML节点数据' },
  { name: '深度学习', symbolSize: 10, id: '3', description: '模拟DL节点数据' },
  { name: '神经网络', symbolSize: 10, id: '4', description: '模拟NN节点数据' }
]

const mockLinks = [
  { source: '1', target: '2' },
  { source: '2', target: '3' },
  { source: '3', target: '4' }
]

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
      focusNodeAdjacency: true,
      draggable: true, //每个节点的拖拉
      legendHoverLink: true, //是否启用图例 hover(悬停) 时的联动高亮。
      force: {
        repulsion: 1000,
        edgeLength: 200,
        gravity: 0.1,
        friction: 0.9
      },
      data: mockNodes,
      links: mockLinks,
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


// 导出为 PNG
const exportToPNG = async (chart) => {
  if (!chart) return;
  try {
    const dataURL = chart.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff'
    });
    const filePath = await ipcRenderer.invoke('export-png', dataURL);
    if (filePath) {
      addToDownloadHistory(filePath);
    }
  } catch (error) {
    console.error('导出PNG失败:', error);
  }
  console.log(downloadHistoryStore.history)
};


// 添加到下载历史
const addToDownloadHistory = (filePath) => {
  downloadHistoryStore.addRecord({
    name: path.basename(filePath), // 使用path模块更规范
    path: filePath,
    time: new Date().toLocaleString(),
    dir: path.dirname(filePath)
  });
};




// 搜索相关状态
const searchVisible = ref(false)
const searchKeyword = ref('')
const searchResults = ref([])

// 执行搜索
const performSearch = () => {
  if (!searchKeyword.value.trim()) return

  const chart = chartRef.value?.chart
  if (!chart) return

  const series = chart.getModel().getSeries()[0]
  const allNodes = []

  // 正确遍历ECharts数据
  series.getData().each((idx) => {
    const node = series.getData().getRawDataItem(idx)
    if (node.name.includes(searchKeyword.value)) {
      allNodes.push({ node, idx })
    }
  })

  searchResults.value = allNodes

  // 如果有搜索结果，聚焦到第一个节点
  if (searchResults.value.length > 0) {
    focusOnNode(searchResults.value[0].node, searchResults.value[0].idx)
  }
  searchVisible.value = false
}

// 聚焦到指定节点
const focusOnNode = (node, nodeIdx) => {
  const chart = chartRef.value?.chart
  if (!chart) return
  console.log('node', node)
  // 1. 获取节点位置
  const pos = chart.getModel().getSeries()[0].getData().getItemLayout(nodeIdx)
  console.log('pos', pos)

  chart.dispatchAction({
    type: 'focusNodeAdjacency',
    seriesIndex: 0,
    dataIndex: nodeIdx // 要聚焦的节点索引
  });


  chart.setOption({
    series: [{
      center: [pos[0], pos[1]],
      zoom: 1
    }]
  });


  const newPos = chart.getModel().getSeries()[0].getData().getItemLayout(nodeIdx)
  const pixelPos = chart.convertToPixel({ seriesIndex: 0 }, newPos);

  console.log('newPos', pixelPos)
  // 6. 显示节点信息
  showNodePopup(node, { offsetX: pixelPos[0], offsetY: pixelPos[1] })
}


const handleIconClick = (icon) => {
  console.log('点击了图标:', icon);
  const chart = chartRef.value?.chart;

  switch (icon) {
    case 'download':
      console.log('下载');
      exportToPNG(chart);
      break;
    case 'search':
      searchVisible.value = true
      console.log('搜索');
      break;
    case 'add':
      showCreateDialog.value = true
      console.log('添加');
      break;
    case 'delete':
      console.log('删除');
      break;
    case 'connect':
      console.log('连接');
      break;
    case 'cancel':
      console.log('取消');
      break;
    default:
      console.log('未知图标');
      break;
  }
}

// 模拟API获取数据函数
const fetchGraphData = async () => {
  // 实际开发中这里会是API调用
  // const response = await fetch('/api/graph-data')
  // return await response.json()

  // 开发阶段返回模拟数据
  return {
    nodes: mockNodes,
    links: mockLinks
  }
}


onMounted(async () => {
  // 获取图表数据
  const graphData = await fetchGraphData()

  // 更新图表配置
  chatOptions.value.series[0].data = graphData.nodes
  chatOptions.value.series[0].links = graphData.links
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

    //eventParams的坐标就是相对于v-chart的位置
    popupPosition.value = [
      eventParams.offsetX,
      eventParams.offsetY
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


const showCreateDialog = ref(false)
const newNodeForm = ref({
  name: '',
  description: '',
  files: []
})

const showFileDialog = ref(false)
const fileTreeData = ref([
  {
    id: '1',
    label: '笔记目录',
    children: [
      { id: '1-1', label: 'AI基础.md' },
      { id: '1-2', label: '机器学习.md' },
      {
        id: '1-3',
        label: '深度学习',
        children: [
          { id: '1-3-1', label: '神经网络.md' },
          { id: '1-3-2', label: 'CNN.md' }
        ]
      }
    ]
  }
])
const selectedFiles = ref([])

// 添加文件选择方法
const chooseFile = () => {
  showFileDialog.value = true
}

const handleFileSelect = (node) => {
  if (!node.children) { // 只选择文件，不选择目录
    // 检查是否已选择
    const index = selectedFiles.value.findIndex(f => f.id === node.id)
    if (index === -1) {
      selectedFiles.value.push(node)
    } else {
      selectedFiles.value.splice(index, 1)
    }
  }
}

// 修改createNewNode方法
const createNewNode = () => {
  const newNode = {
    id: Date.now().toString(),
    name: newNodeForm.value.name,
    description: newNodeForm.value.description,
    symbolSize: 10,
    files: selectedFiles.value.map(file => ({
      name: file.label,
      fileId: file.id
    }))
  }

  // 添加到图表数据
  chatOptions.value.series[0].data.push(newNode)
  // 重置表单
  newNodeForm.value = { name: '', description: '', files: [] }
  selectedFiles.value = []
  showCreateDialog.value = false
}
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

.create-item {
  font-weight: 600;
  margin-left: 10px;
}

.create-input {
  background-color: #E8E8E8;
  width: 80%;
}
</style>
