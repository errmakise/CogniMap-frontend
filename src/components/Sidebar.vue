<template>
  <div class="bar-container">
    <div class="function-list">
      <HoverClickItem :activeKey="activeItem" itemKey="account" @clickItem="clickFunction">
        <Account />
        <div class="function-name">账号</div>
      </HoverClickItem>

      <HoverClickItem :activeKey="activeItem" itemKey="qa" @clickItem="clickFunction">
        <QA />
        <div class="function-name">问答</div>
      </HoverClickItem>

      <HoverClickItem :activeKey="activeItem" itemKey="graph" @clickItem="clickFunction">
        <Graph />
        <div class="function-name">图谱</div>
      </HoverClickItem>
    </div>

    <div class="connector-line">
      <div class="line"></div>
      <Fork @click="clearAllHistory()" />
    </div>

    <el-scrollbar class="scrollbar">
      <div class="files-list">
        <HoverClickItem v-for="item in visitHistory.history" :key="item.id" :activeKey="activeItem" :itemKey="item.id"
          @clickItem="openFile" :isFile="true" @clickFork="closeFile">
          <!-- 根据 fileType 动态渲染图标 -->
          <component :is="getFileIcon(item.type).component" :size="24" />
          <div class="file-name"> {{ item.name }}</div>
        </HoverClickItem>
      </div>
    </el-scrollbar>

    <div class="line" style="width: 100%;margin: 6px 0px;"></div>
    <HoverClickItem :activeKey="downloadDialogVisible" :itemKey="downloadFiles" @clickItem="openFilesList">
      <Download />
      <div class="function-name recent-file">最近文件</div>
    </HoverClickItem>
  </div>

  <!-- 添加下载记录对话框 -->
  <el-dialog v-model="downloadDialogVisible" title="下载记录" width="50%">
    <el-scrollbar height="400px">
      <div v-for="(record, index) in downloadHistoryStore.history" :key="index" class="download-item"
        @click="openDownloadedFile(record.path)">
        <div class="file-info">
          <span class="name">{{ record.name }}</span>
          <span class="path">{{ record.path }}</span>
          <span class="time">{{ record.time }}</span>
        </div>
        <el-icon class="delete-icon" @click.stop="deleteDownloadRecord(index)">
          <Delete />
        </el-icon>
      </div>
    </el-scrollbar>
  </el-dialog>

</template>

<script setup>
import { ref } from 'vue';
import HoverClickItem from './HoverClickItem.vue';
import GraphFile from './icons/GraphFile.vue';
import MdFile from './icons/MdFile.vue';
import Folder from './icons/Folder.vue';
import { useDownloadHistoryStore } from '@/stores/downloadHistory'
import { Delete } from '@element-plus/icons-vue'
import { ipcRenderer } from 'electron'
import path from 'path'
import { useVisitHistoryStore } from '@/stores/visitHistory'
const visitHistory = useVisitHistoryStore()
const { activeItem } = storeToRefs(visitHistory)

const downloadHistoryStore = useDownloadHistoryStore()
const downloadDialogVisible = ref(false);

const openDownloadedFile = async (filePath) => {
  console.log('打开下载文件:', filePath)
  try {
    // 修改为打开文件所在目录
    await ipcRenderer.invoke('open-folder', path.dirname(filePath))
  } catch (error) {
    console.error('打开文件夹失败:', error)
  }
}

const deleteDownloadRecord = (index) => {
  downloadHistoryStore.history.splice(index, 1)
}

const openFilesList = () => {
  downloadDialogVisible.value = !downloadDialogVisible.value;
  console.log('打开文件列表');
};

const handleClose = (done) => {
  done();
};

const router = useRouter();


// 打开文件
const openFile = (fileId) => {
  const file = visitHistory.history.find(item => item.id === fileId);
  if (!file) {
    console.log('文件不存在')
    return;
  }
  visitHistory.addRecord(file);

  visitHistory.setActiveItem(fileId);

  // 根据文件类型跳转到不同页面
  if (file.type === 0) { // 知识图谱
    router.push(`/graph/${file.id}`)
  } else if (file.type === 1) { // Markdown文件
    router.push(`/md/${file.id}`)
  }
};

// 关闭/删除单个文件
const closeFile = (fileId) => {
  visitHistory.removeRecord(fileId);
  console.log(activeItem.value)
  console.log('关闭文件:', fileId);
  // 如果当前打开的文件被删除，重置activeItem
  if (activeItem.value === fileId) {
    console.log('当前打开的文件被删除，重置activeItem')
    visitHistory.setActiveItem('graph');
    router.push({ name: 'files' })
  }
};

// 清空所有历史记录
const clearAllHistory = () => {
  visitHistory.clearAll();
  visitHistory.setActiveItem('graph');
  router.push({ name: 'files' })
};






const clickFunction = (itemName) => {

  visitHistory.setActiveItem(itemName);
  switch (itemName) {
    case 'account':
      console.log('点击 账号');
      router.push({ name: 'account' })
      break;
    case 'qa':
      console.log('点击 问答');
      router.push({ name: 'qa' })
      break;
    case 'graph':
      console.log('点击 图谱');
      router.push({ name: 'files' })
      break;
    default:
      console.log('点击 未知');
      break;
  }
};

// 根据 fileType 返回对应的图标组件
const fileIconConfig = {
  '1': {
    component: MdFile,
    color: '#FF0000', // 红色
    size: 24
  },
  '0': {
    component: GraphFile,
    color: '#00FF00', // 绿色
    size: 24
  },
  '-1': {
    component: Folder,
    color: '#0000FF', // 蓝色
    size: 24
  }
};
const getFileIcon = (type) => {
  return fileIconConfig[type] || MdFile;
};
const route = useRoute();
watch(() => route.name, (newRouteName) => {
  if (newRouteName === 'files' || newRouteName === 'graph-edit' || newRouteName === 'folder') {
    visitHistory.setActiveItem('graph')
  } else if (newRouteName === 'qa') {
    visitHistory.setActiveItem('qa')
  } else if (newRouteName === 'account') {
    visitHistory.setActiveItem('account')
  }
}, { immediate: true })
</script>

<style scoped>
.download-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  padding-right: 20px;
  border-bottom: 1px solid #eee;
}

.file-info {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  gap: 5px;
}

.name {
  font-weight: 600;
  font-size: 16px;
}

.time {
  font-size: 12px;
  color: #999;
}

.recent-file {
  padding: 10px 5px;
  margin-bottom: 5px;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 7px;

}

.connector-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
  margin-top: 5px;

}

.line {
  height: 1px;
  background-color: #9C9C9C;
  width: 90%;
}

.function-list {
  display: flex;
  flex-direction: column;
  gap: 10px;


}

.bar-container {
  background-color: transparent;
  width: 250px;
  height: 100%;
  padding: 15px 15px 10px 20px;
  display: flex;
  flex-direction: column;

}

.function-name {
  font-size: 20px;
  font-weight: 500;
}

.hover-click-item.active .function-name {
  font-weight: 600;
}

.file-name {
  width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.scrollbar {
  padding-right: 12px;
}
</style>
