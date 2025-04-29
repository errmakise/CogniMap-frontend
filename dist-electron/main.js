"use strict";
const electron = require("electron");
const { app, BrowserWindow, ipcMain, dialog } = electron;
const path = require("path");
const fs = require("fs");
ipcMain.handle("export-png", async (event, base64Data) => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      title: "保存图谱为PNG",
      // 默认保存路径: 系统下载目录 + 带时间戳的文件名
      defaultPath: path.join(app.getPath("downloads"), `知识图谱_${(/* @__PURE__ */ new Date()).toLocaleString().replace(/[/:]/g, "-")}.png`),
      filters: [{ name: "PNG Images", extensions: ["png"] }]
      // 文件类型过滤器
    });
    if (filePath) {
      const base64DataWithoutPrefix = base64Data.replace(/^data:image\/png;base64,/, "");
      const buffer = Buffer.from(base64DataWithoutPrefix, "base64");
      fs.writeFileSync(filePath, buffer);
      return filePath;
    }
    return null;
  } catch (error) {
    console.error("导出PNG失败:", error);
    return null;
  }
});
ipcMain.handle("open-folder", async (event, folderPath) => {
  try {
    const { shell } = require("electron");
    await shell.openPath(folderPath);
    return true;
  } catch (error) {
    console.error("打开文件夹失败:", error);
    return false;
  }
});
ipcMain.handle("open-file", async (event, filePath) => {
  try {
    const { shell } = require("electron");
    await shell.openPath(filePath);
    return true;
  } catch (error) {
    console.error("打开文件失败:", error);
    return false;
  }
});
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 1024,
    resizable: false,
    // 禁止调整窗口大小
    maximizable: false,
    // 可选：禁止最大化
    minimizable: true,
    // 允许最小化（可选）
    fullscreenable: false,
    webPreferences: {
      // 书写渲染进程中的配置
      nodeIntegration: true,
      //开启true这一步很重要,目的是为了vue文件中可以引入node和electron相关的API
      contextIsolation: false,
      // 可以使用require方法
      enableRemoteModule: true
      // 可以使用remote方法
    }
  });
  {
    const elePath = path.join(__dirname, "../node_modules/electron");
    require("electron-reload")("../", {
      electron: require(elePath)
    });
    mainWindow.loadURL("http://localhost:8888");
    mainWindow.webContents.openDevTools();
  }
}
app.whenReady().then(() => {
  createWindow();
  app.on("activate", function() {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", function() {
  if (process.platform !== "darwin") app.quit();
});
