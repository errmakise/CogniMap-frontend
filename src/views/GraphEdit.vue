<template>
  <div class="graph-edit-container">

    <!-- vue-echarts 图表 -->
    <v-chart :option="chatOptions" ref="chartRef" />
    <NodeInfoPopup v-if="isPopupVisible" :nodeInfo="selectedNodeInfo" :position="popupPosition"
      @clickFile="handleClickFile" @clickEdit="handleClickEdit" />
    <!-- :loading="selectedNodeInfo.loading" -->

    <GraphBottom class="bottom" v-model="sliderValue" :disable-delete="!hasSelection"
     @change="handleZoomChange" @icon-click="handleIconClick" />
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
        <el-button type="primary" @click="createNewNode" round color="#000000">添加</el-button>
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

const props = defineProps({
  graphId: {
    type: String,
    required: true
  }
})

// 模拟数据 - 替换API调用
const mockNodes = [
  {
    name: '人工智能', symbolSize: 10, id: '1', description: '模拟AI节点数据',
    // 基础属性结束，以下是需要按需加载的字段
    _detailLoaded: false,
    _loading: false
  },
  {
    name: '机器学习', symbolSize: 10, id: '2', description: '模拟ML节点数据',
    // 基础属性结束，以下是需要按需加载的字段
    _detailLoaded: false,
    _loading: false
  },
  {
    name: '深度学习', symbolSize: 10, id: '3', description: '模拟DL节点数据',
    // 基础属性结束，以下是需要按需加载的字段
    _detailLoaded: false,
    _loading: false
  },
  {
    name: '神经网络', symbolSize: 10, id: '4', description: '模拟NN节点数据',
    // 基础属性结束，以下是需要按需加载的字段
    _detailLoaded: false,
    _loading: false
  }
]

const mockLinks = [
  { source: '1', target: '2', id: '1' },
  { source: '2', target: '3', id: '2' },
  { source: '3', target: '4', id: '3' }
]

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



// 显示节点信息弹窗
const showNodePopup = async (nodeData, eventParams) => {
  const chart = chartRef.value?.chart;

  // const details = await loadNodeDetails(nodeData.id);
  // selectedNodeInfo.value = { ...nodeData, ...details };

  if (chart) {
    // 显示基础信息
    selectedNodeInfo.value = {
      name: nodeData.name,
      loading: true  // 显示加载状态
    };


    // 如果未加载过详情，则请求数据
    if (!nodeData._detailLoaded && !nodeData._loading) {
      nodeData._loading = true;
      try {
        //const details = await fetchNodeDetails(nodeData.id);
        const details = {
          createTime: '2025.1.1',
          updateTime: '2025.1.1',

          description: '描述内容',
          files: [
            { name: '文件名1', fileId: '1' },
            { name: '文件名2', fileId: '2' }
          ]
        }
        Object.assign(nodeData, {
          ...details,
          _detailLoaded: true,
          _loading: false
        });
      } catch (e) {
        nodeData._loading = false;
      }
    }

    selectedNodeInfo.value = {
      name: nodeData.name,
      id: nodeData.id,
      createTime: nodeData.createTime || '2025.1.1',
      updateTime: nodeData.updateTime || '2025.1.1',

      description: nodeData.description || '描述内容',
      files: nodeData.files || [],
      _loading: false
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
      },
      emphasis: {
        lineStyle: {
          width: 4,
          color: '#FF6B6B'
        }
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







// 处理文件点击事件
const handleClickFile = (fileId) => {
  console.log('点击了文件:', fileId);
};

const isEditMode = ref(false) // 区分是编辑还是创建
const currentNodeId = ref(null) // 当前编辑的节点ID
// 编辑节点
const handleClickEdit = () => {
  console.log('点击了编辑', selectedNodeInfo.value.name);
  closePopup();
  showCreateDialog.value = true;
  isEditMode.value = true;
  currentNodeId.value = selectedNodeInfo.value.id;
  newNodeForm.value = {
    name: selectedNodeInfo.value.name,
    description: selectedNodeInfo.value.description,
    files: selectedNodeInfo.value.files
  };
  selectedFiles.value = selectedNodeInfo.value.files.map(file => ({
    id: file.fileId,
    label: file.name
  }));
};

// 关闭弹窗
const closePopup = () => {
  console.log('关闭弹窗');
  isPopupVisible.value = false;
  selectedNodeInfo.value = {};
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

// 选择文件方法
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

// 重置表单状态
const resetForm = () => {
  newNodeForm.value = { name: '', description: '', files: [] };
  selectedFiles.value = [];
  showCreateDialog.value = false;
  isEditMode.value = false;
  currentNodeId.value = null;
};

// 修改createNewNode方法
const createNewNode = async () => {
  try {
    if (isEditMode.value) {
      // 调用更新节点API
      // await updateNode({
      //   id: currentNodeId.value,
      //   name: newNodeForm.value.name,
      //   description: newNodeForm.value.description,
      //   files: selectedFiles.value.map(f => f.id)
      // });
      console.log('currentNodeId', currentNodeId.value);
      // 更新现有节点数据
      const nodeIndex = chatOptions.value.series[0].data.findIndex(n => n.id === currentNodeId.value);
      console.log('nodeIndex', nodeIndex);
      if (nodeIndex !== -1) {
        chatOptions.value.series[0].data[nodeIndex] = {
          ...chatOptions.value.series[0].data[nodeIndex],
          name: newNodeForm.value.name,
          description: newNodeForm.value.description,
          files: selectedFiles.value.map(file => ({
            name: file.label,
            fileId: file.id
          }))
        };
      }
    } else {
      // 调用创建节点API
      const newNode = await createNode({
        name: newNodeForm.value.name,
        description: newNodeForm.value.description,
        files: selectedFiles.value.map(f => f.id),
        graphId: props.graphId
      });

      // 添加到图表数据
      chatOptions.value.series[0].data.push({
        ...newNode,
        symbolSize: 10 //注意
      });
    }

    // 重置状态
    resetForm();
  } catch (error) {
    console.error('操作失败:', error);
  }
}

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

import { ElMessage } from 'element-plus';
// 在现有状态变量后添加
const selectedLink = ref(null) // 当前选中的连线
const hasSelection = computed(() => !!selectedNodeInfo.value.id || !!selectedLink.value) // 是否有选中项

const deleteConnection = () => {
  if (!selectedLink.value) return;
  try {
    // 实际开发中调用API删除连线
    // await deleteConnectionAPI(selectedNodeInfo.value.id);

    // 从图表数据中移除连线
    chatOptions.value.series[0].links = chatOptions.value.series[0].links.filter(
      link => link.id !== selectedLink.value.id
    );
    ElMessage.success({
      message: '连线删除成功',
      offset: 80  // 设置距离顶部80像素
    });
    selectedLink.value = null;
  } catch (error) {
    ElMessage.error({
      message: '连线删除失败',
      offset: 80  // 保持位置一致
    });
    console.error('删除连线失败:', error);
  }

};

// 删除节点
const deleteNode = async () => {
  if (selectedNodeInfo.value.id) {
    try {
      //await deleteNode(selectedNodeInfo.value.id);

      // 从图表数据中移除节点
      const index = chatOptions.value.series[0].data.findIndex(
        n => n.id === selectedNodeInfo.value.id
      );
      if (index !== -1) {
        chatOptions.value.series[0].data.splice(index, 1);
        // 同时移除相关连线
        chatOptions.value.series[0].links = chatOptions.value.series[0].links.filter(
          link => link.source !== selectedNodeInfo.value.id && link.target !== selectedNodeInfo.value.id
        );
      }
      closePopup();
      ElMessage.success({
        message: '节点删除成功',
        offset: 80  // 设置距离顶部80像素
      });
    } catch (error) {
      ElMessage.error({
        message: '节点删除失败',
        offset: 80  // 保持位置一致
      });
      console.error('删除节点失败:', error);
    }
  }
}

// 统一删除处理
const handleDelete = () => {
  if (selectedNodeInfo.value.id) {
    deleteNode();
  } else if (selectedLink.value) {
    deleteConnection();
  }
};

// 处理图标点击事件
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
      handleDelete();
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


const sliderValue = ref(100); // 初始值 100% (1x)
// 缩放事件处理
const handleZoomChange = (zoom) => {
  console.log('缩放事件', zoom);
  const chart = chartRef.value?.chart;
  chart.setOption({ series: [{ zoom: zoom }] });
};

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
      if (nodeData) {
        selectedNodeInfo.value = nodeData;
        selectedLink.value = null; // 清空连线选择
        showNodePopup(nodeData, params);
        console.log('nodeData', nodeData);
        return;
      }

      const link = findNearestLink(chart, point);
      selectedLink.value = link;
      selectedNodeInfo.value = {}; // 清空节点选择
    });
  }
});

// 获取节点信息
const findNearestNode = (chart, point, threshold = 20) => {
  const series = chart.getModel().getSeries()[0];
  let minDist = Infinity, nearestNode = null;

  // idx是节点在graph中的索引，非是节点id
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

// 添加查找最近连线的方法
const findNearestLink = (chart, point, threshold = 10) => {
  const series = chart.getModel().getSeries()[0];
  let nearestLink = null;
  let minDist = Infinity;
  series.getGraph().eachEdge((edge) => {
    const linePoints = edge.getLayout();
    // 简单计算点到线段的距离
    for (let i = 0; i < linePoints.length - 1; i++) {
      const dist = pointToLineDistance(
        point,
        linePoints[i],
        linePoints[i + 1]
      );
      if (dist < threshold && dist < minDist) {
        minDist = dist;
        nearestLink = series.getGraph().edgeData.getRawDataItem(edge.dataIndex);
        console.log('nearestLink', nearestLink);
      }
    }
  });
  return nearestLink;
};

// 点到线段的距离计算
const pointToLineDistance = (point, linePoint1, linePoint2) => {
  // 线段长度平方
  const l2 = Math.pow(linePoint1[0] - linePoint2[0], 2) +
             Math.pow(linePoint1[1] - linePoint2[1], 2);

  // 如果线段长度接近0，则直接计算点到端点的距离
  if (l2 === 0) {
    return Math.sqrt(
      Math.pow(point[0] - linePoint1[0], 2) +
      Math.pow(point[1] - linePoint1[1], 2)
    );
  }

  // 计算投影比例 t
  let t = ((point[0] - linePoint1[0]) * (linePoint2[0] - linePoint1[0]) +
          (point[1] - linePoint1[1]) * (linePoint2[1] - linePoint1[1])) / l2;

  // 限制 t 在 [0,1] 范围内
  t = Math.max(0, Math.min(1, t));

  // 计算投影点坐标
  const projection = [
    linePoint1[0] + t * (linePoint2[0] - linePoint1[0]),
    linePoint1[1] + t * (linePoint2[1] - linePoint1[1])
  ];

  // 返回点到投影点的距离
  return Math.sqrt(
    Math.pow(point[0] - projection[0], 2) +
    Math.pow(point[1] - projection[1], 2)
  );
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

.create-item {
  font-weight: 600;
  margin-left: 10px;
}

.create-input {
  background-color: #E8E8E8;
  width: 80%;
}
</style>
