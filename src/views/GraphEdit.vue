<template>
  <div class="graph-edit-container">

    <!-- vue-echarts 图表 -->
    <v-chart :option="chatOptions" ref="chartRef" />
    <NodeInfoPopup v-if="isPopupVisible" :nodeInfo="selectedNodeInfo" :position="popupPosition"
      @clickFile="handleClickFile" @clickEdit="handleClickEdit" />
    <!-- :loading="selectedNodeInfo.loading" -->

    <GraphBottom class="bottom" v-model="sliderValue" :disable-delete="!selectedLink && !selectedNodeInfo.id"
      @change="handleZoomChange" @icon-click="handleIconClick" :disable-connect="!selectedNodeInfo.id" />
    <!-- 搜索对话框 -->
    <el-dialog v-model="searchVisible" title="搜索节点" width="30%">
      <el-input v-model="searchKeyword" placeholder="输入节点名称" @keyup.enter="performSearch" />
      <template #footer>
        <el-button @click="searchVisible = false">取消</el-button>
        <el-button type="primary" @click="performSearch">搜索</el-button>
      </template>
    </el-dialog>


    <!-- 新建节点弹窗 -->
    <el-dialog v-model="showCreateDialog" align-center width="30%" :before-close="handleCreateDialogClose">
      <el-form :model="newNodeForm" label-width="100px" label-position="left">
        <el-form-item label="名称" class="create-item" style="margin-bottom: 50px;">
          <el-input v-model="newNodeForm.name" placeholder="输入节点名称" class="create-input" maxlength="10" />
        </el-form-item>
        <el-form-item label="描述" class="create-item" style="margin-bottom: 50px;">
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

    <!-- 选择文件对话框 -->
    <!-- <el-dialog v-model="showFileDialog" title="选择关联文件" width="40%" top="20vh">
      <el-tree :data="fileTreeData" :props="{ label: 'label', children: 'children' }" @node-click="handleFileSelect"
        :highlight-current="false" node-key="id" :show-checkbox="true" :check-strictly="true" />
      <template #footer>
        <el-button @click="showFileDialog = false">取消</el-button>
        <el-button type="primary" @click="showFileDialog = false">确定</el-button>
      </template>
    </el-dialog> -->
    <!-- <el-dialog v-model="showFileDialog" title="选择关联文件" width="40%" top="20vh">
      <el-tree :data="fileTreeData" :props="{ label: 'label', children: 'children' }"
        :filter-node-method="filterFileNode" node-key="id" show-checkbox check-strictly :default-expand-all="true"
        @check-change="handleFileCheckChange" ref="fileTreeRef">
        <template #default="{ node }">
          <span v-if="node.data.isFolder">
            <el-icon>
              <Folder />
            </el-icon>
            <span style="margin-left: 6px">{{ node.label }}</span>
          </span>
          <span v-else>
            <el-icon>
              <Document />
            </el-icon>
            <span style="margin-left: 6px">{{ node.label }}</span>
          </span>
        </template>
      </el-tree>
      <template #footer>
        <el-button @click="showFileDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmFileSelection">确定</el-button>
      </template>
    </el-dialog> -->

    <FileSelectorDialog v-model="showFileDialog" title="选择关联文件" :file-tree-data="fileTreeData" :file-types="[1]"
      @confirm="handleFileSelection" :multiple="true" />

    <!-- 右键菜单 -->
    <div v-if="contextMenuVisible" class="context-menu" :style="{
      left: `${contextMenuPosition.x}px`,
      top: `${contextMenuPosition.y}px`
    }" @click.stop>
      <div class="menu-item" @click="handleClickEdit">
        <Edit size="16" />
        <span>编辑</span>
      </div>

      <div class="menu-item" @click="handleConnect" :class="{ disabled: !selectedNodeInfo.id }">
        <Connect size="16" />
        <span>连线</span>
      </div>
      <div class="menu-item" @click="handleDelete">
        <DeleteRound size="16" />
        <span>删除</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDownloadHistoryStore } from '@/stores/downloadHistory'
import { ipcRenderer } from 'electron'
import { ElLoading, ElMessage } from 'element-plus';
import path from 'path'
import {
  fetchGraphNodes,
  fetchGraphLinks,
  updateGraphNode,
  createGraphNode,
  deleteGraphNode,
  createGraphLink,
  deleteGraphLink,
  getFileTree,
  fetchNodeDetails
} from '@/api'
import { color } from 'echarts'
import { create } from 'domain'
import { useVisitHistoryStore } from '@/stores/visitHistory'


const router = useRouter()
const visitHistory = useVisitHistoryStore()

const downloadHistoryStore = useDownloadHistoryStore()

const props = defineProps({
  graphId: {
    type: String,
    required: true
  }
})



const mockDataStore = ref({
  nodes: [
    {
      id: '1',
      name: '人工智能',
      description: '模拟AI节点数据',
      files: [],
      symbolSize: 10,
      _detailLoaded: true,
      _loading: false,
      createTime: '2025.1.1',
      updateTime: '2025.1.1'
    },
    {
      id: '2',
      name: '机器学习',
      description: '模拟ML节点数据',
      files: [],
      symbolSize: 10,
      _detailLoaded: true,
      _loading: false,
      createTime: '2025.1.1',
      updateTime: '2025.1.1'
    }
  ],
  links: [
    { source: '1', target: '2', id: 'link1' }
  ]
})



const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString()
}

// 在现有状态变量后添加
const contextMenuVisible = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const contextMenuNode = ref(null)

// 添加右键菜单处理
const handleNodeRightClick = (params) => {
  const chart = chartRef.value?.chart
  if (!chart) return

  const point = chart.convertFromPixel({ seriesIndex: 0 }, [params.offsetX, params.offsetY])
  const nodeData = findNearestNode(chart, point)

  if (nodeData) {
    contextMenuNode.value = nodeData
    contextMenuPosition.value = {
      x: params.event.clientX,
      y: params.event.clientY
    }
    contextMenuVisible.value = true
    selectedNodeInfo.value = nodeData
  }
}

const isConnectingMode = ref(false) // 是否处于连线模式
const firstSelectedNode = ref(null) // 第一个选中的节点



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
    // if (!nodeData._detailLoaded && !nodeData._loading) {
    //   nodeData._loading = true;
    //   try {
    //     const res = await fetchNodeDetails(nodeData.id);
    //     console.log('获取节点详情成功', res)
    //     const details = {
    //       createTime: formatDate(res.createTime),
    //       updateTime: formatDate(res.updateTime),

    //       description: res.description || '暂无描述',
    //       files: res.files || []
    //     }
    //     Object.assign(nodeData, {
    //       ...details,
    //       _detailLoaded: true,
    //       _loading: false
    //     });
    //   } catch (e) {
    //     nodeData._loading = false;
    //   }
    // }

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
    }]
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
    { filename: '文件名1', fileId: '1' },
    { filename: '文件名2', fileId: '2' }
  ]
});
// 弹窗位置
const popupPosition = ref([0, 0]);
const route = useRoute()






// 处理文件点击事件
const handleClickFile = (file) => {
  console.log('点击了文件:', file);
  visitHistory.addRecord({
    id: file.fileId,
    name: file.filename,
    type: 1,
  })
  visitHistory.setActiveItem(file.fileId)
  router.push(`/md/${file.fileId}`)
};

const isEditMode = ref(false) // 区分是编辑还是创建
const currentNode = ref(null) // 当前编辑的节点ID
// 编辑节点
const handleClickEdit = () => {
  console.log('点击了编辑', selectedNodeInfo.value);


  showCreateDialog.value = true;
  isEditMode.value = true;
  currentNode.value = selectedNodeInfo.value;
  console.log('currentNode', currentNode.value);
  closePopup();
  newNodeForm.value = {
    name: currentNode.value.name,
    description: currentNode.value.description,
    files: currentNode.value.files
  };
  selectedFiles.value = currentNode.value.files.map(file => ({
    id: file.fileId,
    label: file.filename
  }));
};

// 创建或更新节点
const createNewNode = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.7)'
  });
  try {
    const nodedata = {
      name: newNodeForm.value.name,
      description: newNodeForm.value.description,
      fileId: selectedFiles.value.map(f => f.id),
      filename: selectedFiles.value.map(f => f.label),

      size: 10,
      color: "#000000"
    }
    console.log('保存的nodedata', nodedata)
    if (isEditMode.value) {
      const res = await updateGraphNode(currentNode.value.id, nodedata)
      console.log('update操作成功:', res);
      console.log('currentNode', currentNode.value);
      // 更新现有节点数据
      const nodeIndex = chatOptions.value.series[0].data.findIndex(n => n.id === currentNode.value.id);
      console.log('nodeIndex', nodeIndex);
      if (nodeIndex !== -1) {
        const updatedNode = {
          ...chatOptions.value.series[0].data[nodeIndex],

          name: newNodeForm.value.name,
          description: newNodeForm.value.description,
          files: selectedFiles.value.map(file => ({
            filename: file.label,
            fileId: file.id
          }))
        }
        console.log('updatedNode', updatedNode);
        chatOptions.value.series[0].data[nodeIndex] = updatedNode;
      }
    } else {
      // 调用创建节点API
      console.log(selectedFiles.value)
      const newNode = await createGraphNode(props.graphId, nodedata)
      console.log('newNode', newNode)
      // 添加到图表数据
      chatOptions.value.series[0].data.push({
        createTime: formatDate(newNode.createTime),
        updateTime: formatDate(newNode.updateTime),
        description: newNode.description || '暂无描述',
        files: newNode.fileId ? newNode.fileId.map((id, index) => ({
          fileId: id,
          filename: newNode.filename[index]
        })) : [],

        blogTitle: newNode.blogTitle,
        blogUrls: newNode.blogUrls,
        id: newNode.id,
        name: newNode.name,
        graphId: newNode.graphId,
        color: newNode.color,
        symbolSize: 10, //注意
        _detailLoaded: false,
        _loading: false,


        // files: selectedFiles.value.map(file => ({
        //   filename: file.label,
        //   fileId: file.id
        // }))
      });
    }

    // 重置状态
    resetForm();
  } catch (error) {
    console.error('create操作失败:', error);

  } finally {
    loading.close();
  }
}


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
    ElMessage.success('导出成功');
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
  console.log('导出成功', downloadHistoryStore.history)
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

// 获取用户文件列表
const fetchUserFiles = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.7)'
  });
  try {
    fileTreeData.value = await getFileTree() // 需要实现的API
    // const response = [
    //   {
    //     id: '1',
    //     name: '笔记目录',
    //     isFolder: true,
    //     parentId: null
    //   },
    //   {
    //     id: '2',
    //     name: 'AI基础.md',
    //     isFolder: false,
    //     parentId: '1'
    //   },
    //   {
    //     id: '1-2',
    //     name: '深度学习',
    //     isFolder: true,
    //     parentId: '1'
    //   },
    //   {
    //     id: '1-2-1',
    //     name: '神经网络.md',
    //     isFolder: false,
    //     parentId: '1-2'
    //   }

    // ]
    //fileTreeData.value = formatFileTree(response)
  } catch (error) {
    console.error('获取文件列表失败:', error)
    ElMessage.error('获取文件列表失败')
  } finally {
    loading.close();
  }
}

// 处理文件选择
const handleFileSelection = (files) => {
  if (!files || files.length === 0) {
    ElMessage.warning('请至少选择一个文件')
    return
  }


  // 更新已选文件列表
  selectedFiles.value = files.map(file => ({
    id: file.id,
    label: file.name,
    type: file.type
  }))

  showFileDialog.value = false
  ElMessage.success(`已选择 ${files.length} 个文件`)
}



// 添加文件选择方法
const chooseFile = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: '加载文件列表中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  try {
    await fetchUserFiles()
    showFileDialog.value = true
  } catch (error) {
    ElMessage.error('加载文件列表失败')
  } finally {
    loading.close()
  }
}


// 重置表单状态
const resetForm = () => {
  newNodeForm.value = { name: '', description: '', files: [] };
  selectedFiles.value = [];
  showCreateDialog.value = false;
  isEditMode.value = false;
  currentNode.value = null;
};
const handleCreateDialogClose = (done) => {
  resetForm()
  done()
}


// const createNewNode = async () => {
//   const newNodeId = `node-${Date.now()}`
//   const newNode = {
//     id: newNodeId,
//     name: newNodeForm.value.name,
//     description: newNodeForm.value.description,
//     files: selectedFiles.value.map(f => ({
//       fileId: f.id,
//       name: f.label
//     })),
//     symbolSize: 10,
//     _detailLoaded: true
//   }

//   mockDataStore.value.nodes.push(newNode)
//   chatOptions.value.series[0].data.push(newNode)
//   resetForm()
// }



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



// 在现有状态变量后添加
const selectedLink = ref(null) // 当前选中的连线
const hasSelection = computed(() => !!selectedNodeInfo.value.id || !!selectedLink.value)


const deleteConnection = async () => {
  if (!selectedLink.value) return;
  const loading = ElLoading.service({
    lock: true,
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.7)'
  });
  try {
    // 实际开发中调用API删除连线
    const res = await deleteGraphLink(selectedLink.value.id);
    console.log('删除连线成功', res)
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
  } finally {
    loading.close();
  }

};

// 删除节点
const deleteNode = async () => {
  if (selectedNodeInfo.value.id) {
    const loading = ElLoading.service({
      lock: true,
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.7)'
    });
    try {
      const res = await deleteGraphNode(selectedNodeInfo.value.id)
      console.log('删除节点成功', res)
      // 从图表数据中移除节点
      const index = chatOptions.value.series[0].data.findIndex(
        n => n.id === selectedNodeInfo.value.id
      );
      if (index !== -1) {
        chatOptions.value.series[0].data.splice(index, 1);
        // 同时移除相关连线
        // chatOptions.value.series[0].links = chatOptions.value.series[0].links.filter(
        //   link => link.source !== selectedNodeInfo.value.id && link.target !== selectedNodeInfo.value.id
        // );
        if (res && Array.isArray(res)) {
          chatOptions.value.series[0].links = chatOptions.value.series[0].links.filter(
            link => !res.includes(link.id) // 过滤掉返回的关系ID
          );
        }
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
    } finally {
      loading.close();
    }
  }
}

// const deleteNode = async () => {
//   const nodeId = selectedNodeInfo.value.id
//   mockDataStore.value.nodes = mockDataStore.value.nodes.filter(n => n.id !== nodeId)
//   mockDataStore.value.links = mockDataStore.value.links.filter(
//     link => link.source !== nodeId && link.target !== nodeId
//   )

//   // 更新图表
//   chatOptions.value.series[0].data = chatOptions.value.series[0].data.filter(
//     n => n.id !== nodeId
//   )
//   chatOptions.value.series[0].links = mockDataStore.value.links

//   closePopup()
//   ElMessage.success('节点删除成功')
// }

// 统一删除处理
const handleDelete = () => {
  if (selectedNodeInfo.value.id) {
    deleteNode();
  } else if (selectedLink.value) {
    deleteConnection();
  }
};

// 连接节点
const handleConnect = () => {
  if (!selectedNodeInfo.value.id && !isConnectingMode.value) {
    ElMessage.warning('请先选择一个节点')
    return
  }
  isConnectingMode.value = !isConnectingMode.value
  if (isConnectingMode.value) {
    firstSelectedNode.value = selectedNodeInfo.value
    ElMessage.info('请选择要连接的节点')
  } else {
    firstSelectedNode.value = null
  }
  closePopup()
}


const fetchGraphData = async () => {
  // return {
  //   nodes: mockDataStore.value.nodes.map(node => ({
  //     ...node,
  //     _detailLoaded: false,
  //     _loading: false
  //   })),
  //   links: mockDataStore.value.links
  // }


  const graphData = { nodes: [], links: [] }
  const loading = ElLoading.service({
    lock: true,
    text: '加载图谱信息中...',
    background: 'rgba(0, 0, 0, 0.7)'
  });
  try {


    const nodesRes = await fetchGraphNodes(props.graphId)
    console.log('获取图谱node成功', nodesRes)



    if (nodesRes.length > 0) {
      graphData.nodes = nodesRes.map(node => ({

        createTime: formatDate(node.createTime),
        updateTime: formatDate(node.updateTime),
        description: node.description || '暂无描述',
        files: node.fileId ? node.fileId.map((id, index) => ({
          fileId: id,
          filename: node.filename[index]
        })) : [],

        blogTitle: node.blogTitle,
        blogUrls: node.blogUrls,
        id: node.id,
        name: node.name,
        graphId: node.graphId,
        color: node.color,
        symbolSize: 10, //注意
        _detailLoaded: false,
        _loading: false,
      }))
    }

    const linksRes = await fetchGraphLinks(props.graphId)
    console.log('获取图谱link成功', linksRes)

    if (linksRes.length > 0) {
      graphData.links = linksRes.map(link => ({
        source: String(link.node1), // 转换为字符串
        target: String(link.node2),
        id: link.id,
        _loading: false
      }))
    }
    return graphData
  } catch (error) {
    console.error('获取图谱数据失败', error)
    return { nodes: [], links: [] }
  } finally {
    loading.close();
  }
}

// 刷新图表数据
const refreshGraph = async () => {
  // 获取图表数据
  const graphData = await fetchGraphData()

  // 更新图表配置
  chatOptions.value.series[0].data = graphData.nodes
  chatOptions.value.series[0].links = graphData.links


  console.log('chatOptions', chatOptions.value.series[0].links)
  console.log('chatOptions node', chatOptions.value.series[0].data)

}


onMounted(async () => {
  refreshGraph();

  const chart = chartRef.value?.chart;
  if (chart) {
    chart.getZr().on('contextmenu', handleNodeRightClick)
    // 监听拖拽事件
    chart.on('graphRoam', (params) => {
      if (isPopupVisible.value === true) {
        closePopup();
      }
      console.log('拖拽事件', params);
      const zoom = chart.getOption().series[0].zoom || 1;
      sliderValue.value = zoom * 100;
    });


    chart.getZr().on('click', async (params) => {
      closePopup();
      console.log('点击事件', params);

      const point = chart.convertFromPixel({ seriesIndex: 0 }, [params.offsetX, params.offsetY]);

      // 如果是连线模式
      if (isConnectingMode.value) {
        const nodeData = findNearestNode(chart, point);
        if (nodeData && nodeData.id !== firstSelectedNode.value.id) {
          // 创建新连线
          // const newLink = {
          //   source: firstSelectedNode.value.id,
          //   target: nodeData.id,
          //   id: `${firstSelectedNode.value.id}-${nodeData.id}-${Date.now()}`
          // }

          const newLink = await createGraphLink(props.graphId, {
            node1: firstSelectedNode.value.id,
            node2: nodeData.id,
          })
          console.log('newLink', newLink)
          chatOptions.value.series[0].links.push({
            source: String(firstSelectedNode.value.id),
            target: String(nodeData.id),
            id: newLink
          })
          ElMessage.success('连线创建成功')
        } else if (nodeData) {
          ElMessage.warning('不能连接同一个节点')
        }
        isConnectingMode.value = false
        firstSelectedNode.value = null
        return
      }


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
      handleConnect();
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


// 关闭弹窗
const closePopup = () => {
  console.log('关闭弹窗');
  selectedNodeInfo.value = {};
  isPopupVisible.value = false;
  contextMenuVisible.value = false
};

// 添加路由监听
watch(() => route.params.graphId, (newVal) => {
  if (newVal) {
    refreshGraph()
  }
}, { immediate: true })


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

.context-menu {
  position: fixed;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  padding: 4px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.menu-item span {
  margin-left: 8px;
}
</style>
