// 控制应用生命周期和创建原生浏览器窗口的模组
const electron = require('electron');
const { app, BrowserWindow, ipcMain, dialog } = electron;
const path = require('path');
const fs = require('fs');

// 导出PNG文件
ipcMain.handle('export-png', async (event, base64Data) => {
  try {
    // 1. 显示保存文件对话框
    const { filePath } = await dialog.showSaveDialog({
      title: '保存图谱为PNG',
      // 默认保存路径: 系统下载目录 + 带时间戳的文件名
      defaultPath: path.join(app.getPath('downloads'), `知识图谱_${new Date().toLocaleString().replace(/[/:]/g, '-')}.png`),
      filters: [{ name: 'PNG Images', extensions: ['png'] }] // 文件类型过滤器
    });

    if (filePath) {
      // 2. 处理base64数据: 移除前缀
      const base64DataWithoutPrefix = base64Data.replace(/^data:image\/png;base64,/, '');
      // 3. 将base64转为Buffer
      const buffer = Buffer.from(base64DataWithoutPrefix, 'base64');
      // 4. 同步写入文件
      fs.writeFileSync(filePath, buffer);
      // 5. 返回文件路径给渲染进程
      return filePath;
    }
    return null;
  } catch (error) {
    console.error('导出PNG失败:', error);
    return null;
  }
});

ipcMain.handle('open-folder', async (event, folderPath) => {
  try {
    const { shell } = require('electron')
    await shell.openPath(folderPath)
    return true
  } catch (error) {
    console.error('打开文件夹失败:', error)
    return false
  }
})

// 打开文件
ipcMain.handle('open-file', async (event, filePath) => {
  try {
    const { shell } = require('electron');
    await shell.openPath(filePath); // 直接使用文件路径，不需要再resolve
    return true;
  } catch (error) {
    console.error('打开文件失败:', error);
    return false;
  }
});

function createWindow() {
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 1085,//算上顶部功能栏高度
    //frame: false, // 去除顶部功能栏
    resizable: false, // 禁止调整窗口大小
    maximizable: false, // 可选：禁止最大化
    minimizable: true, // 允许最小化（可选）
    fullscreenable: false,
    webPreferences: {
      // 书写渲染进程中的配置
      nodeIntegration: true, //开启true这一步很重要,目的是为了vue文件中可以引入node和electron相关的API
      contextIsolation: false, // 可以使用require方法
      enableRemoteModule: true, // 可以使用remote方法
    },
  })

  let env = 'pro'
  // 配置热更新
  if (env == 'pro') {
    const elePath = path.join(__dirname, '../node_modules/electron')
    require('electron-reload')('../', {
      electron: require(elePath),
    })
    // 热更新监听窗口
    mainWindow.loadURL('http://localhost:8888')
    // 打开开发工具
    mainWindow.webContents.openDevTools()
  } else {
    // 生产环境中要加载文件，打包的版本
    // Menu.setApplicationMenu(null)
    // 加载 index.html
    mainWindow.loadFile(path.resolve(__dirname, '../dist/index.html')) // 新增
  }
}
// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // 通常在 macOS 上，当点击 dock 中的应用程序图标时，如果没有其他
    // 打开的窗口，那么程序会重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此，通常对程序和它们在
// 任务栏上的图标来说，应当保持活跃状态，直到用户使用 Cmd + Q 退出。
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
