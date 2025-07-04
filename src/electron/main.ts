import { app, BrowserWindow, ipcMain, dialog, clipboard, globalShortcut, screen, nativeImage, desktopCapturer } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import Store from 'electron-store';
import { ScreenshotArea } from '../types';
import { getCurrentTimestamp } from '../utils/api';
import * as crypto from 'crypto';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
const officegen = require('officegen');
const mammoth = require('mammoth');
import * as mathjax from 'mathjax-node';
const sharp = require('sharp');
import { autoUpdater } from 'electron-updater';

if (process.platform === 'win32') {
  try {
    const { execSync } = require('child_process');
    execSync('chcp 65001', { windowsHide: true });
  } catch (error) {
  }
}
const logger = {
  log: (message: string, ...args: any[]) => {
    
  },
  error: (message: string, ...args: any[]) => {
    
  },
  info: (message: string, ...args: any[]) => {
    
  },
  warn: (message: string, ...args: any[]) => {
    
  },
  silly: (message: string) => {
  
  },
  debug: (message: string) => {

  },
  verbose: (message: string) => {

  },
  transports: {
    file: {
      level: 'info'
    }
  }
};

interface AutoUpdaterFunctions {
  shouldCheckForUpdates: () => boolean;
  checkForUpdates: () => void;
}

let autoUpdaterFunctions: AutoUpdaterFunctions;
let isUpdating = false;
let hasShownUpdateNotice = false;
function setupAutoUpdater() {
  autoUpdater.logger = logger;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowPrerelease = false;
  autoUpdater.allowDowngrade = false;
  autoUpdater.forceDevUpdateConfig = false;
  hasShownUpdateNotice = false;
  logger.log('使用package.json中的publish配置进行自动更新');
  let lastCheckTime = 0;
  function shouldCheckForUpdates() {
    return false;
  }
  autoUpdater.on('error', (error) => {
    logger.error('更新检查失败:', error);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-error', error.message);
    }
  });
  autoUpdater.on('checking-for-update', () => {
    logger.log('正在检查更新...');
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('checking-for-update');
    }
  });
  autoUpdater.on('update-available', (info) => {
    logger.log('发现新版本:', info);
    if (mainWindow && !mainWindow.isDestroyed() && !hasShownUpdateNotice) {
      hasShownUpdateNotice = true;
      mainWindow.webContents.send('update-available', info);
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: '软件更新',
        message: `发现新版本 ${info.version}，是否下载更新？`,
        buttons: ['下载', '取消']
      }).then(result => {
        if (result.response === 0) {
          logger.log('用户选择下载更新');
          autoUpdater.downloadUpdate();
        } else {
          logger.log('用户取消下载更新');
        }
      });
    }
  });

  // 没有可用更新
  autoUpdater.on('update-not-available', (info) => {
    logger.log('当前已是最新版本:', info);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-not-available', info);
    }
  });

  // 下载进度
  autoUpdater.on('download-progress', (progressObj) => {
    const logMsg = `下载速度: ${progressObj.bytesPerSecond} - 已下载 ${progressObj.percent.toFixed(2)}% (${progressObj.transferred}/${progressObj.total})`;
    logger.log(logMsg);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('download-progress', progressObj);
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    logger.log('更新下载完成，将在退出时安装');
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-downloaded', info);
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: '安装更新',
        message: '更新已下载，应用将退出并安装',
        buttons: ['现在重启', '稍后再说']
      }).then(result => {
        if (result.response === 0) {
          logger.log('用户选择立即重启安装更新');
          isUpdating = true;
          app.removeAllListeners('before-quit');
          app.removeAllListeners('will-quit');
          globalShortcut.unregisterAll();
          screenshotWindows.forEach(window => {
            if (!window.isDestroyed()) {
              window.removeAllListeners();
              window.close();
            }
          });
          screenshotWindows.length = 0;
          setTimeout(() => {
            logger.log('正在执行quitAndInstall...');
            try {
              autoUpdater.quitAndInstall(false, true);
            } catch (error) {
              logger.error('执行quitAndInstall失败:', error);
              app.quit();
            }
          }, 500);
        }
      });
    }
  });
  return {
    shouldCheckForUpdates,
    checkForUpdates: () => {
      try {
        logger.log('手动触发检查更新');
        autoUpdater.checkForUpdates();
      } catch (error) {
        logger.error('检查更新失败:', error);
      }
    }
  };
}

// 手动检查更新
function checkForUpdates() {
  if (!app.isPackaged) {
    logger.log('开发模式不检查更新');
    return;
  }
  try {
    logger.log('手动触发检查更新');
    autoUpdater.checkForUpdates()
      .then(result => {
        if (result && result.updateInfo) {
          logger.log(`检查更新返回结果: 版本 ${result.updateInfo.version} 可用`);
        } else {
          logger.log('检查更新返回结果: 没有可用更新');
        }
      })
      .catch(error => {
        logger.error('检查更新出错:', error);
      });
  } catch (error) {
    logger.error('检查更新失败:', error);
  }
}

// 定义API配置读取函数
function loadApiConfigFromSettings(): { appId: string; appSecret: string } {
  const config = {
    appId: '',
    appSecret: ''
  };

  try {
    const settingsPath = path.join(app.getAppPath(), 'settings.json');
    if (fs.existsSync(settingsPath)) {
      const settingsContent = fs.readFileSync(settingsPath, 'utf8');
      const settings = JSON.parse(settingsContent);
      if (settings.app_id && settings.app_secret) {
        config.appId = settings.app_id;
        config.appSecret = settings.app_secret;
        logger.log('成功从settings.json加载API配置');
      } else {
        logger.log('settings.json中未找到有效的API配置');
      }
    } else {
      logger.log('未找到settings.json文件，将使用空的API配置');
    }
  } catch (error) {
    logger.error('读取settings.json文件失败:', error);
  }

  return config;
}
interface AppSettings {
  apiConfig: ApiConfig;
  shortcuts: {
    capture: string;
    upload: string;
  };
  history: HistoryItem[];
}

interface ApiConfig {
  appId: string;
  appSecret: string;
  endpoint: string;
}

interface HistoryItem {
  latex: string;
  date: string;
}

interface SimpletexResponse {
  status: boolean;
  res: {
    latex: string;
    conf: number;
  };
  request_id: string;
  message?: string;
  error_code?: string;
}

// 初始默认API配置
let DEFAULT_API_CONFIG: ApiConfig = {
  appId: '',
  appSecret: '',
  endpoint: 'https://server.simpletex.cn/api/latex_ocr'
};

const TEMP_FILE_PREFIX = 'simpletex-';
const SCREENSHOT_PREFIX = 'screenshot-';

const tempFiles = new Set<string>();

let cleanupIntervalId: NodeJS.Timeout | null = null;

const isDevelopment = process.env.NODE_ENV === 'development';

function getReqData(reqData: Record<string, any> = {}, apiConfig: ApiConfig) {
  const header: Record<string, string> = {};
  header.timestamp = Math.floor(Date.now() / 1000).toString();
  header['random-str'] = randomStr(16);
  header['app-id'] = apiConfig.appId;

  const params: string[] = [];

  const sortedReqKeys = Object.keys(reqData).sort();
  for (const key of sortedReqKeys) {
    params.push(`${key}=${reqData[key]}`);
  }
  const headerKeys = ['app-id', 'random-str', 'timestamp'];
  for (const key of headerKeys) {
    params.push(`${key}=${header[key]}`);
  }

  params.push(`secret=${apiConfig.appSecret}`);

  const preSignString = params.join('&');
  header.sign = crypto.createHash('md5').update(preSignString).digest('hex');

  return { header, reqData };
}
function randomStr(length: number = 16): string {
  const chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
function addTempFile(filePath: string): void {
  tempFiles.add(filePath);
}

function removeTempFile(filePath: string): boolean {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    tempFiles.delete(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

function cleanupAllTempFiles(): void {
  let successCount = 0;
  let failCount = 0;

  for (const filePath of tempFiles) {
    if (removeTempFile(filePath)) {
      successCount++;
    } else {
      failCount++;
    }
  }

  try {
    const tempDir = app.getPath('temp');
    const files = fs.readdirSync(tempDir);

    for (const file of files) {
      if (file.startsWith(TEMP_FILE_PREFIX)) {
        const fullPath = path.join(tempDir, file);
        try {
          const stats = fs.statSync(fullPath);
          const fileAge = Date.now() - stats.mtime.getTime();

          if (fileAge > 60 * 60 * 1000) {
            fs.unlinkSync(fullPath);
          }
        } catch (error) {
          // 错误处理已静默
        }
      }
    }
  } catch (error) {
    // 错误处理已静默
  }
  tempFiles.clear();
}

// 在文件顶部添加全局类型声明
declare global {
  namespace NodeJS {
    interface Global {
      MathJaxSubscriptions?: any;
    }
  }
}

// 将forceGarbageCollection函数中的代码修改为
function forceGarbageCollection(): void {
  try {
    // 先进行内存释放操作
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.session.clearCache().catch(() => { });

      // 尝试清理渲染进程的内存
      mainWindow.webContents.send('trigger-renderer-gc');
    }

    // 清理未使用的截图窗口
    screenshotWindows.forEach((window, index) => {
      if (window && !window.isDestroyed() && !window.isVisible()) {
        try {
          window.webContents.session.clearCache().catch(() => { });
          window.close();
          screenshotWindows.splice(index, 1);
        } catch (error) {
          logger.error('清理截图窗口失败:', error);
        }
      }
    });

    // 清空可能占用内存的大型变量
    try {
      // 使用类型断言
      const globalAny = global as any;
      if (globalAny.MathJaxSubscriptions) {
        globalAny.MathJaxSubscriptions = undefined;
      }
    } catch (e) {
      // 忽略清理过程中的错误
    }

    // 强制V8垃圾回收
    if (global.gc) {
      global.gc();
      logger.log('手动触发垃圾回收完成');
    }
  } catch (error) {
    logger.error('垃圾回收失败:', error);
  }
}

// 内存监控函数
function monitorMemoryUsage(): void {
  try {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const rssMB = Math.round(memoryUsage.rss / 1024 / 1024);

    logger.log(`内存使用情况: 堆内存 ${heapUsedMB}/${heapTotalMB} MB, 常驻内存 ${rssMB} MB`);
    if (heapUsedMB > 150) {
      logger.log('内存使用过高，触发垃圾回收');
      forceGarbageCollection();
    }
  } catch (error) {
    logger.error('内存监控失败:', error);
  }
}

function startPeriodicCleanup(): void {
  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
  }
  cleanupIntervalId = setInterval(() => {
    monitorMemoryUsage();
    cleanupAllTempFiles();
    forceGarbageCollection();
  }, 5 * 60 * 1000);
  setTimeout(() => {
    monitorMemoryUsage();
    cleanupAllTempFiles();
  }, 5000);
}

// 存储管理
const store = new Store<AppSettings>({
  defaults: {
    apiConfig: DEFAULT_API_CONFIG,
    shortcuts: {
      capture: 'Alt+C',
      upload: 'Alt+U'
    },
    history: []
  }
});

let mainWindow: BrowserWindow | null = null;

// 创建主窗口
async function createMainWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1051,
    height: 780,
    minWidth: 1051,
    minHeight: 780,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
      sandbox: false,
      spellcheck: false,
      backgroundThrottling: false,
      v8CacheOptions: 'none',
      enableWebSQL: false,
      experimentalFeatures: false
    },
    title: 'SimpleTex OCR - 数学公式识别工具',
    show: false,
    autoHideMenuBar: true
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.setAutoHideMenuBar(true);

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    try {
      await mainWindow.loadURL('http://localhost:3000');
      mainWindow.webContents.openDevTools();
    } catch (error) {
      // 开发服务器加载失败
      mainWindow.loadFile(path.join(__dirname, '../../../build/index.html'));
    }
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../../build/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;

    if (!isDev && process.platform === 'win32' && !isUpdating) {
      forceQuitApp();
    }
  });

  mainWindow.on('close', (event) => {
    // 如果正在更新，允许窗口关闭
    if (isUpdating) {
      return;
    }

    if (!isDev && process.platform === 'win32') {
      event.preventDefault();
      forceQuitApp();
    }
  });
}

const screenshotWindows: BrowserWindow[] = [];

function createSimpleScreenshotWindow(): void {
  try {
    screenshotWindows.forEach(window => {
      if (!window.isDestroyed()) {
        window.close();
      }
    });
    screenshotWindows.length = 0;

    const displays = screen.getAllDisplays();

    displays.forEach((display, index) => {

      const screenshotWindow = new BrowserWindow({
        x: display.bounds.x,
        y: display.bounds.y,
        width: display.bounds.width,
        height: display.bounds.height,
        frame: false,
        alwaysOnTop: true,
        transparent: true,
        skipTaskbar: true,
        resizable: false,
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          preload: path.join(__dirname, 'preload.js'),
          v8CacheOptions: 'none',
          spellcheck: false,
          backgroundThrottling: false,
          enableWebSQL: false,
          experimentalFeatures: false
        }
      });

      const screenshotHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: rgba(0, 0, 0, 0.1);
      cursor: crosshair;
      user-select: none;
      overflow: hidden;
      width: 100vw;
      height: 100vh;
    }
    .selection-box {
      position: absolute;
      border: 2px solid #007bff;
      background: rgba(0, 123, 255, 0.1);
      pointer-events: none;
    }
    .info {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      font-family: Arial, sans-serif;
      z-index: 9999;
    }
  </style>
</head>
<body>
  <div class="info">拖拽选择截图区域 | ESC取消 | 显示器 ${index + 1}</div>
  <script>
    // 此窗口对应的显示器信息
    const displayBounds = {
      x: ${display.bounds.x},
      y: ${display.bounds.y},
      width: ${display.bounds.width},
      height: ${display.bounds.height}
    };
    
    let isSelecting = false;
    let startX, startY;
    let selectionBox = null;
    
    document.addEventListener('mousedown', (e) => {
      isSelecting = true;
      startX = e.clientX;
      startY = e.clientY;
      
      if (selectionBox) selectionBox.remove();
      
      selectionBox = document.createElement('div');
      selectionBox.className = 'selection-box';
      selectionBox.style.left = startX + 'px';
      selectionBox.style.top = startY + 'px';
      document.body.appendChild(selectionBox);
      
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isSelecting || !selectionBox) return;
      
      const left = Math.min(startX, e.clientX);
      const top = Math.min(startY, e.clientY);
      const width = Math.abs(e.clientX - startX);
      const height = Math.abs(e.clientY - startY);
      
      selectionBox.style.left = left + 'px';
      selectionBox.style.top = top + 'px';
      selectionBox.style.width = width + 'px';
      selectionBox.style.height = height + 'px';
    });
    
    document.addEventListener('mouseup', async (e) => {
      if (!isSelecting || !selectionBox) return;
      
      const left = Math.min(startX, e.clientX);
      const top = Math.min(startY, e.clientY);
      const width = Math.abs(e.clientX - startX);
      const height = Math.abs(e.clientY - startY);
      
      // 清理选择框
      if (selectionBox) {
        selectionBox.remove();
        selectionBox = null;
      }
      isSelecting = false;
      
      if (width > 10 && height > 10) {
        // 转换为绝对屏幕坐标
        const absoluteArea = {
          x: left + displayBounds.x,
          y: top + displayBounds.y,
          width: width,
          height: height
        };
        
        try {
          await window.screenshotAPI.takeSimpleScreenshot(absoluteArea);
        } catch (error) {
          // 截图失败处理
        }
      }
      
      await window.screenshotAPI.closeScreenshotWindow();
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        try {
          window.screenshotAPI.closeScreenshotWindow();
        } catch (error) {
          // 关闭窗口错误处理
        }
      }
    });
  </script>
</body>
</html>`;

      screenshotWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(screenshotHTML)}`);
      screenshotWindows.push(screenshotWindow);

    });


  } catch (error) {
  }
}

function showSimpleScreenshotOverlay(): void {
  if (screenshotWindows.length === 0) {
    createSimpleScreenshotWindow();
  }

  screenshotWindows.forEach((window, index) => {
    if (!window.isDestroyed()) {
      window.show();
      window.focus();
    }
  });
}


function createUnifiedScreenshotWindow(): void {
  createSimpleScreenshotWindow();
}

function showUnifiedScreenshotOverlay(): void {
  showSimpleScreenshotOverlay();
}


function createScreenshotWindows(): void {

  createSimpleScreenshotWindow();
}


if (process.platform === 'win32') {

  app.disableHardwareAcceleration();
  app.commandLine.appendSwitch('disable-gpu');
  app.commandLine.appendSwitch('disable-gpu-compositing');
  app.commandLine.appendSwitch('disable-gpu-sandbox');


  app.commandLine.appendSwitch('disable-http-cache');
  app.commandLine.appendSwitch('disable-background-networking');
  app.commandLine.appendSwitch('disable-background-timer-throttling');


  app.commandLine.appendSwitch('max-old-space-size', '512');
  app.commandLine.appendSwitch('max-semi-space-size', '64');
  app.commandLine.appendSwitch('disable-extensions');
  app.commandLine.appendSwitch('disable-plugins');
  app.commandLine.appendSwitch('disable-dev-shm-usage');
  app.commandLine.appendSwitch('disable-software-rasterizer');
  app.commandLine.appendSwitch('disable-features', 'VizDisplayCompositor');


  app.commandLine.appendSwitch('memory-pressure-off');
  app.commandLine.appendSwitch('disable-background-mode');
  app.commandLine.appendSwitch('expose-gc');
  app.commandLine.appendSwitch('enable-precise-memory-info');
}


app.setPath('userData', path.join(app.getPath('appData'), 'SimpleTex-OCR'));


const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.exit(0);
} else {

  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {

    const settingsPath = path.join(app.getAppPath(), 'settings.json');
    if (!fs.existsSync(settingsPath)) {
      try {

        const defaultSettings = {
          app_id: '',
          app_secret: ''
        };
        fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2), 'utf8');
      } catch (error) {
      }
    }


    const apiConfig = loadApiConfigFromSettings();
    if (apiConfig.appId && apiConfig.appSecret) {
      DEFAULT_API_CONFIG.appId = apiConfig.appId;
      DEFAULT_API_CONFIG.appSecret = apiConfig.appSecret;
    } else {

      DEFAULT_API_CONFIG.appId = '';
      DEFAULT_API_CONFIG.appSecret = '';
    }


    store.set('apiConfig', DEFAULT_API_CONFIG);
    killZombieProcesses();
    await createMainWindow();
    registerGlobalShortcuts();
    cleanupAllTempFiles();
    startPeriodicCleanup();

    autoUpdaterFunctions = setupAutoUpdater();

    app.on('activate', async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await createMainWindow();
      }
    });
  });
}


app.on('window-all-closed', () => {
  if (isUpdating) {
    return;
  }

  if (process.platform !== 'darwin') {
    forceQuitApp();
  }
});


app.on('before-quit', () => {
  if (isUpdating) {
    return;
  }

  globalShortcut.unregisterAll();

  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
  }


  screenshotWindows.forEach(window => {
    if (!window.isDestroyed()) {
      window.removeAllListeners();
      window.close();
    }
  });
  screenshotWindows.length = 0;

  cleanupAllTempFiles();

  setTimeout(() => {
    process.exit(0);
  }, 500);
});


app.on('will-quit', (event) => {
  if (isUpdating) {
    return;
  }

  if (tempFiles.size > 0) {
    cleanupAllTempFiles();
  }

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.removeAllListeners();
    mainWindow = null;
  }
  setTimeout(() => {
    if (process.platform === 'win32') {
      terminateAllProcesses();
    } else {
      process.exit(0);
    }
  }, 100);
});


function registerGlobalShortcuts(): void {
  const shortcuts = store.get('shortcuts');


  globalShortcut.register(shortcuts.capture, () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.hide();
    }
    setTimeout(() => {
      showUnifiedScreenshotOverlay();
    }, 200);
  });


  globalShortcut.register(shortcuts.upload, () => {
    if (mainWindow && !mainWindow.isFocused()) {
      mainWindow.show();
      mainWindow.focus();
    }
    mainWindow?.webContents.send('shortcut-triggered', 'upload');
  });
}



ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [
      { name: 'Image files', extensions: ['png', 'jpg', 'jpeg', 'bmp', 'gif'] },
      { name: 'All files', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});


ipcMain.handle('save-file', async (event, content: string, filename: string) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    defaultPath: filename,
    filters: [
      { name: 'Text file', extensions: ['txt'] },
      { name: 'All files', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePath) {
    try {
      fs.writeFileSync(result.filePath, content, 'utf8');
      return true;
    } catch (error) {
      // 文件保存失败
      return false;
    }
  }
  return false;
});


ipcMain.handle('save-temp-file', async (event, buffer: Uint8Array, filename: string) => {
  try {
    const ext = path.extname(filename) || '.png';
    const tempPath = path.join(app.getPath('temp'), `${TEMP_FILE_PREFIX}${Date.now()}${ext}`);
    fs.writeFileSync(tempPath, buffer);
    addTempFile(tempPath);
    return tempPath;
  } catch (error) {
    throw error;
  }
});


ipcMain.handle('force-test-second-screen', async () => {
  return { message: '简化截图系统已启用，测试功能已禁用' };
});



ipcMain.handle('show-screenshot-overlay', () => {

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.hide();
  }


  showUnifiedScreenshotOverlay();
});


async function takeSimpleScreenshot(area: { x: number; y: number; width: number; height: number }): Promise<string> {
  let selectedSource: Electron.DesktopCapturerSource | null = null;
  let croppedImage: Electron.NativeImage | null = null;
  let sources: Electron.DesktopCapturerSource[] = [];

  try {
    // 获取所有显示器信息
    const displays = screen.getAllDisplays();
    
    // 获取屏幕捕获源
    sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 16384, height: 16384 }
    });

    if (sources.length === 0) {
      throw new Error('No screen sources available');
    }

    // 计算选择区域中心点
    const centerX = area.x + area.width / 2;
    const centerY = area.y + area.height / 2;

    // 寻找包含选择区域中心点的显示器
    let targetDisplay: Electron.Display | null = null;
    let displayIndex = -1;

    // 查找目标显示器
    for (let i = 0; i < displays.length; i++) {
      const display = displays[i];
      const inX = centerX >= display.bounds.x && centerX < display.bounds.x + display.bounds.width;
      const inY = centerY >= display.bounds.y && centerY < display.bounds.y + display.bounds.height;

      if (inX && inY) {
        targetDisplay = display;
        displayIndex = i;
        break;
      }
    }

    if (!targetDisplay) {
      targetDisplay = screen.getPrimaryDisplay();
      displayIndex = displays.findIndex(d => d.id === targetDisplay!.id);
    }

    selectedSource = sources.find(s => s.display_id === targetDisplay!.id.toString()) || null;
    if (selectedSource) {
      // 找到了匹配的源
    } else {
      if (!targetDisplay.id.toString().includes(screen.getPrimaryDisplay().id.toString())) {
        const nonPrimarySources = sources.filter(s => s.display_id !== screen.getPrimaryDisplay().id.toString());
        if (nonPrimarySources.length > 0) {
          selectedSource = nonPrimarySources[0];
        }
      }

      if (!selectedSource && displayIndex < sources.length) {
        selectedSource = sources[displayIndex];
      }

      if (!selectedSource) {
        const expectedWidth = targetDisplay.bounds.width * targetDisplay.scaleFactor;
        const expectedHeight = targetDisplay.bounds.height * targetDisplay.scaleFactor;

        let bestMatch = sources[0];
        let bestScore = 0;

        // 找到最佳匹配
        for (const source of sources) {
          const size = source.thumbnail.getSize();
          const widthDiff = Math.abs(size.width - expectedWidth);
          const heightDiff = Math.abs(size.height - expectedHeight);
          const score = 1 / (1 + widthDiff + heightDiff);

          // 更新最佳匹配
          if (score > bestScore) {
            bestScore = score;
            bestMatch = source;
          }
        }

        selectedSource = bestMatch;
      }
    }

    const sourceSize = selectedSource.thumbnail.getSize();

    // 计算剪裁区域
    let cropArea: { x: number; y: number; width: number; height: number };

    if (displays.length === 1) {
      // 单屏幕情况
      const scaleX = sourceSize.width / targetDisplay.bounds.width;
      const scaleY = sourceSize.height / targetDisplay.bounds.height;

      cropArea = {
        x: Math.round(area.x * scaleX),
        y: Math.round(area.y * scaleY),
        width: Math.round(area.width * scaleX),
        height: Math.round(area.height * scaleY)
      };

    } else {
      // 多屏幕情况
      if (selectedSource.display_id === targetDisplay.id.toString()) {
        // 直接匹配的显示器
        const relativeX = area.x - targetDisplay.bounds.x;
        const relativeY = area.y - targetDisplay.bounds.y;

        const scaleX = sourceSize.width / targetDisplay.bounds.width;
        const scaleY = sourceSize.height / targetDisplay.bounds.height;

        cropArea = {
          x: Math.round(relativeX * scaleX),
          y: Math.round(relativeY * scaleY),
          width: Math.round(area.width * scaleX),
          height: Math.round(area.height * scaleY)
        };
      } else {
        // 未直接匹配的显示器，使用绝对坐标
        let minX = Math.min(...displays.map(d => d.bounds.x));
        let minY = Math.min(...displays.map(d => d.bounds.y));
        let maxX = Math.max(...displays.map(d => d.bounds.x + d.bounds.width));
        let maxY = Math.max(...displays.map(d => d.bounds.y + d.bounds.height));

        const totalWidth = maxX - minX;
        const totalHeight = maxY - minY;

        const scaleX = sourceSize.width / totalWidth;
        const scaleY = sourceSize.height / totalHeight;

        cropArea = {
          x: Math.round((area.x - minX) * scaleX),
          y: Math.round((area.y - minY) * scaleY),
          width: Math.round(area.width * scaleX),
          height: Math.round(area.height * scaleY)
        };
      }
    }
    cropArea.x = Math.max(0, Math.min(cropArea.x, sourceSize.width - 1));
    cropArea.y = Math.max(0, Math.min(cropArea.y, sourceSize.height - 1));
    cropArea.width = Math.max(1, Math.min(cropArea.width, sourceSize.width - cropArea.x));
    cropArea.height = Math.max(1, Math.min(cropArea.height, sourceSize.height - cropArea.y));
    croppedImage = selectedSource.thumbnail.crop(cropArea);
    const resultSize = croppedImage.getSize();
    if (resultSize.width === 0 || resultSize.height === 0) {
      throw new Error('Cropped image is empty');
    }

    const timestamp = Date.now();
    const filename = `screenshot-${timestamp}.png`;
    const tempPath = path.join(app.getPath('temp'), filename);

    try {
      const buffer = croppedImage.toPNG();
      fs.writeFileSync(tempPath, buffer);
      addTempFile(tempPath);
      if (selectedSource && selectedSource.thumbnail) {
        (selectedSource as any).thumbnail = null;
      }
      croppedImage = null;

      closeScreenshotWindow();
      await new Promise(resolve => setTimeout(resolve, 100));

      if (fs.existsSync(tempPath)) {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.show();
          mainWindow.focus();

          mainWindow.webContents.send('screenshot-complete', tempPath);
        }

        return tempPath;
      } else {
        throw new Error('截图文件未能正确保存');
      }
    } finally {
      // 确保资源被释放
      selectedSource = null;
      croppedImage = null;
      sources = [];
      forceGarbageCollection();
    }

  } catch (error) {
    closeScreenshotWindow();
    forceGarbageCollection();
    throw error;
  }
}











function closeScreenshotWindow(): void {
  screenshotWindows.forEach((window, index) => {
    if (!window.isDestroyed()) {
      window.removeAllListeners();
      window.webContents.removeAllListeners();
      window.webContents.session.clearCache().catch(() => { });
      window.close();
      window.destroy();
    }
  });
  screenshotWindows.length = 0;
  setTimeout(() => {
    forceGarbageCollection();
  }, 100);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
    mainWindow.focus();
  }
}
ipcMain.handle('take-simple-screenshot', async (event, area: { x: number; y: number; width: number; height: number }) => {
  try {
    const tempPath = await takeSimpleScreenshot(area);
    return tempPath;
  } catch (error) {
    throw error;
  }
});


ipcMain.handle('copy-to-clipboard', (event, text: string) => {
  clipboard.writeText(text);
});

ipcMain.handle('get-settings', () => {
  return store.store;
});
ipcMain.handle('save-settings', (event, settings: Partial<AppSettings>) => {
  for (const [key, value] of Object.entries(settings)) {
    store.set(key as keyof AppSettings, value);
  }
  if (settings.shortcuts) {
    globalShortcut.unregisterAll();
    registerGlobalShortcuts();
  }
});
ipcMain.handle('recognize-formula', async (event, imagePath: string, apiConfig: ApiConfig): Promise<SimpletexResponse> => {
  const MAX_RETRIES = 2;
  let retryCount = 0;
  let lastError: any = null;
  let imageBuffer: Buffer | null = null;

  const tryRecognize = async (): Promise<SimpletexResponse> => {
    try {
      let hasValidConfig = false;

      if (apiConfig && apiConfig.appId && apiConfig.appSecret) {
        if (apiConfig.appId.trim() && apiConfig.appSecret.trim()) {
          hasValidConfig = true;
          logger.log('使用传入的API配置');
        }
      }
      if (!hasValidConfig) {
        const settingsConfig = loadApiConfigFromSettings();
        if (settingsConfig.appId && settingsConfig.appSecret) {
          if (settingsConfig.appId.trim() && settingsConfig.appSecret.trim()) {
            logger.log('使用settings.json中的API配置');
            apiConfig = {
              ...apiConfig,
              appId: settingsConfig.appId,
              appSecret: settingsConfig.appSecret
            };
            hasValidConfig = true;
          }
        }
      }
      if (!hasValidConfig) {
        logger.error('API配置为空，无法进行公式识别');
        return {
          status: false,
          res: { latex: '', conf: 0 },
          request_id: '',
          message: '请先在设置中配置API密钥',
          error_code: 'NO_API_CONFIG'
        };
      }
      if (!fs.existsSync(imagePath)) {
        // 图片文件不存在
        return {
          status: false,
          res: { latex: '', conf: 0 },
          request_id: '',
          message: '图片文件不存在'
        };
      }
      try {
        imageBuffer = fs.readFileSync(imagePath);
        if (!imageBuffer || imageBuffer.length === 0) {
          // 图片文件为空
          return {
            status: false,
            res: { latex: '', conf: 0 },
            request_id: '',
            message: '图片文件为空'
          };
        }
        if (!apiConfig || !apiConfig.appId || !apiConfig.appSecret ||
          !apiConfig.appId.trim() || !apiConfig.appSecret.trim()) {
          logger.error('API配置无效，无法进行公式识别');
          return {
            status: false,
            res: { latex: '', conf: 0 },
            request_id: '',
            message: '请先在设置中配置API密钥',
            error_code: 'NO_API_CONFIG'
          };
        }
        const { header, reqData } = getReqData({}, apiConfig);
        const formData = new FormData();
        formData.append('file', imageBuffer, {
          filename: path.basename(imagePath),
          contentType: 'image/png'
        });

        for (const [key, value] of Object.entries(reqData)) {
          formData.append(key, value);
        }
        logger.log(`API请求准备完成，使用的API配置: appId=${apiConfig.appId.substring(0, 4)}...，重试次数: ${retryCount}`);
        const response = await axios.post('https://server.simpletex.cn/api/latex_ocr', formData, {
          headers: {
            ...formData.getHeaders(),
            ...header
          },
          timeout: 30000
        });

        formData.getHeaders = null as any;

        return response.data;
      } finally {
        imageBuffer = null;
        if (global.gc) {
          global.gc();
        }
      }
    } catch (error) {
      // 公式识别失败
      lastError = error;

      if (axios.isAxiosError(error)) {
        // 响应错误信息处理

        if (error.response?.status === 429) {
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            logger.log(`遇到429错误，等待后重试 (${retryCount}/${MAX_RETRIES})...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return tryRecognize();
          }
        }
        return {
          status: false,
          res: { latex: '', conf: 0 },
          request_id: '',
          message: error.response?.data?.message || error.message || '网络请求失败'
        };
      }
      return {
        status: false,
        res: { latex: '', conf: 0 },
        request_id: '',
        message: error instanceof Error ? error.message : '未知错误'
      };
    } finally {
      // 确保在任何情况下都释放资源
      imageBuffer = null;
      if (retryCount >= MAX_RETRIES) {
        forceGarbageCollection();
      }
    }
  };

  try {
    return await tryRecognize();
  } finally {
    imageBuffer = null;
    forceGarbageCollection();
  }
});

// 注册全局快捷键
ipcMain.handle('register-global-shortcuts', (event, shortcuts: { capture: string; upload: string }) => {
  globalShortcut.unregisterAll();

  try {
    globalShortcut.register(shortcuts.capture, () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.hide();
      }
      setTimeout(() => {
        showUnifiedScreenshotOverlay();
      }, 200);
    });

    globalShortcut.register(shortcuts.upload, () => {
      if (mainWindow && !mainWindow.isFocused()) {
        mainWindow.show();
        mainWindow.focus();
      }
      mainWindow?.webContents.send('shortcut-triggered', 'upload');
    });

    return true;
  } catch (error) {
    return false;
  }
});
ipcMain.handle('unregister-global-shortcuts', () => {
  globalShortcut.unregisterAll();
});
ipcMain.handle('minimize-window', () => {
  mainWindow?.minimize();
});

ipcMain.handle('close-window', () => {
  forceQuitApp();
  return true;
});

ipcMain.handle('close-screenshot-window', () => {
  closeScreenshotWindow();
  return true;
});

// 截图完成
ipcMain.handle('screenshot-complete', (event, imagePath: string) => {
  closeScreenshotWindow();
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('screenshot-complete', imagePath);
  }
});

ipcMain.handle('cleanup-temp-files', () => {
  cleanupAllTempFiles();
});

ipcMain.handle('remove-temp-file', (event, filePath: string) => {
  return removeTempFile(filePath);
});

ipcMain.handle('get-temp-files-count', () => {
  return tempFiles.size;
});
ipcMain.handle('get-display-info', async () => {
  try {
    const displays = screen.getAllDisplays();
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 150, height: 150 }
    });

    const displayInfo = displays.map((display, index) => ({
      index,
      id: display.id,
      bounds: display.bounds,
      scaleFactor: display.scaleFactor,
      workArea: display.workArea,
      isPrimary: index === 0,
      label: display.label || `Display ${index + 1}`
    }));

    const sourceInfo = sources.map((source, index) => ({
      index,
      id: source.id,
      name: source.name,
      display_id: source.display_id,
      thumbnailSize: source.thumbnail.getSize()
    }));
    const matchingAnalysis = displays.map((display, displayIndex) => {
      const potentialSources = sources.filter(s => s.display_id === display.id.toString());
      const nameMatchSources = sources.filter(s => {
        if (displayIndex === 0) {
          return s.name.includes('Primary') || s.name.includes('Main') || !/\d+/.test(s.name);
        } else {
          return !s.name.includes('Primary') && !s.name.includes('Main');
        }
      });

      return {
        display: { index: displayIndex, id: display.id, name: `Display ${displayIndex}` },
        exactMatches: potentialSources,
        nameMatches: nameMatchSources,
        recommendedSource: potentialSources[0] || nameMatchSources[0] || sources[displayIndex] || null
      };
    });

    return {
      displays: displayInfo,
      sources: sourceInfo,
      matchingAnalysis,
      screenshotWindowsCount: screenshotWindows.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('test-display-screenshot', async (event, displayIndex: number) => {
  return { message: '简化截图系统已启用，复杂测试功能已禁用' };
});

ipcMain.handle('save-api-to-settings-file', async (event, apiConfig: ApiConfig) => {
  try {
    const settingsPath = path.join(app.getAppPath(), 'settings.json');
    const settings = {
      app_id: apiConfig.appId,
      app_secret: apiConfig.appSecret
    };
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (error) {
    return false;
  }
});

// 清除API配置
ipcMain.handle('clear-api-config', async (event) => {
  try {
    DEFAULT_API_CONFIG.appId = '';
    DEFAULT_API_CONFIG.appSecret = '';
    store.set('apiConfig', {
      appId: '',
      appSecret: '',
      endpoint: DEFAULT_API_CONFIG.endpoint
    });

    const settingsPath = path.join(app.getAppPath(), 'settings.json');
    if (fs.existsSync(settingsPath)) {
      const settings = {
        app_id: '',
        app_secret: ''
      };
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
    }
    if (mainWindow && !mainWindow.isDestroyed()) {
      try {
        await mainWindow.webContents.session.clearStorageData({
          storages: ['localstorage', 'cookies', 'indexdb', 'websql', 'serviceworkers', 'cachestorage']
        });
        await mainWindow.webContents.session.clearCache();
        await mainWindow.webContents.session.clearHostResolverCache();
        await mainWindow.webContents.session.clearAuthCache();
        mainWindow.webContents.reloadIgnoringCache();
      } catch (e) {
        logger.error('清除缓存失败:', e);
      }
    }
    return true;
  } catch (error) {
    return false;
  }
});

function terminateAllProcesses(): void {
  if (isUpdating) {
    return;
  }

  if (process.platform === 'win32') {
    try {
      const { execSync } = require('child_process');

      const possibleProcessNames = [
        'LaTeX公式识别工具.exe',
        'electron.exe',
        'SimpleTex-OCR.exe',
        'node.exe'
      ];
      for (const processName of possibleProcessNames) {
        try {
          execSync(`taskkill /F /IM "${processName}" /T`, { windowsHide: true });
        } catch (err) {
          // 忽略错误
        }
      }
      process.exit(0);
    } catch (error) {
      process.exit(0);
    }
  }
}

function killZombieProcesses(): void {
  if (process.platform === 'win32') {
    try {
      const { execSync } = require('child_process');
      const possibleProcessNames = [
        'LaTeX公式识别工具.exe',
        'electron.exe',
        'SimpleTex-OCR.exe'
      ];
      const currentPid = process.pid;
      for (const processName of possibleProcessNames) {
        try {
          const output = execSync(`wmic process where "name='${processName}'" get processid`, { encoding: 'utf8' });
          const lines = output.split('\n').filter((line: string) => line.trim() !== '' && line.trim().toLowerCase() !== 'processid');
          for (const line of lines) {
            const pid = line.trim();
            if (pid && pid !== String(currentPid)) {
              try {
                execSync(`taskkill /F /PID ${pid}`, { windowsHide: true });
              } catch (killErr) {
              }
            }
          }
        } catch (err) {
        }
      }

    } catch (error) {
    }
  }
}

function forceQuitApp(): void {
  if (isUpdating) {
    return;
  }

  globalShortcut.unregisterAll();
  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
  }

  BrowserWindow.getAllWindows().forEach(window => {
    if (!window.isDestroyed()) {
      try {
        window.removeAllListeners();
        window.webContents.removeAllListeners();
        if (window.webContents.isDevToolsOpened()) {
          window.webContents.closeDevTools();
        }
        window.close();
      } catch (e) {
      }
    }
  });

  cleanupAllTempFiles();

  if (mainWindow && !mainWindow.isDestroyed()) {
    try {
      mainWindow.webContents.session.clearCache();
      mainWindow.webContents.session.clearStorageData();
    } catch (e) {
    }
  }

  app.removeAllListeners();
  app.releaseSingleInstanceLock();

  if (process.platform === 'win32') {
    terminateAllProcesses();
  } else {
    app.quit();
    app.exit(0);
    process.exit(0);
  }
}

// 窗口置顶功能
ipcMain.handle('set-always-on-top', async (event, alwaysOnTop: boolean) => {
  try {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setAlwaysOnTop(alwaysOnTop);
      logger.log(`窗口置顶状态已设置为: ${alwaysOnTop}`);
      return { success: true, alwaysOnTop };
    } else {
      logger.error('主窗口不存在或已销毁');
      return { success: false, message: '主窗口不存在' };
    }
  } catch (error) {
    logger.error('设置窗口置顶状态失败:', error);
    return { success: false, message: '设置失败' };
  }
});

// 获取窗口置顶状态
ipcMain.handle('get-always-on-top', async (event) => {
  try {
    if (mainWindow && !mainWindow.isDestroyed()) {
      const alwaysOnTop = mainWindow.isAlwaysOnTop();
      return { success: true, alwaysOnTop };
    } else {
      return { success: false, alwaysOnTop: false };
    }
  } catch (error) {
    logger.error('获取窗口置顶状态失败:', error);
    return { success: false, alwaysOnTop: false };
  }
});

// 手动检查更新
ipcMain.handle('check-for-updates', async (event) => {
  try {
    logger.log('手动触发检查更新');
    if (!app.isPackaged) {
      logger.log('开发模式下不检查更新');
      return { success: false, message: '开发模式下不检查更新' };
    }

    // 重置更新通知标志，确保手动检查时可以显示通知
    hasShownUpdateNotice = false;

    if (autoUpdaterFunctions) {
      autoUpdaterFunctions.checkForUpdates();
    } else {
      checkForUpdates();
    }
    return { success: true, message: '已开始检查更新' };
  } catch (error) {
    logger.error('手动检查更新失败:', error);
    return { success: false, message: '检查更新失败' };
  }
});

ipcMain.handle('save-docx-file', async (event, latexContent: string, filename: string) => {
  try {
    mathjax.config({
      MathJax: {}
    });
    await mathjax.start();
    const mjResult = await mathjax.typeset({
      math: latexContent,
      format: 'TeX',
      mml: true
    });

    if (!mjResult.mml) {
      throw new Error('LaTeX到MathML转换失败');
    }
    let mathML = mjResult.mml;

    clipboard.writeText(mathML);
    logger.log('MathML格式公式已复制到剪贴板');
    return true;
  } catch (error) {
    logger.error('转换为MathML失败:', error);
    return false;
  }
});

// 导出数学公式为图片
ipcMain.handle('export-formula-image', async (event, latexContent: string, format: 'svg' | 'png' | 'jpg') => {
  try {
    logger.log(`开始导出数学公式为${format.toUpperCase()}格式`);
    forceGarbageCollection();
    mathjaxExt.config({
      MathJax: {
        SVG: {
          scale: 1,
          font: 'TeX',
          useFontCache: true,
          useGlobalCache: false,
          minScaleAdjust: 0.5
        }
      }
    });

    await mathjaxExt.start();
    let svgContent: string;
    try {
      const maxLength = 5000;
      if (latexContent.length > maxLength) {
        latexContent = latexContent.substring(0, maxLength) + '...';
        logger.log(`LaTeX内容过长，已截断至${maxLength}字符`);
      }

      const mjResult: any = await mathjaxExt.typeset({
        math: latexContent,
        format: 'TeX',
        svg: true
      });

      if (!mjResult.svg) {
        throw new Error('LaTeX到SVG转换失败');
      }
      svgContent = mjResult.svg;
      logger.log('MathJax SVG生成成功，长度:', svgContent.length);
      if (mathjaxExt.typesetClear) {
        mathjaxExt.typesetClear();
      }
      const svgTagCount = (svgContent.match(/<svg/g) || []).length;
      const svgCloseTagCount = (svgContent.match(/<\/svg>/g) || []).length;
      if (svgTagCount !== svgCloseTagCount) {
        logger.log(`SVG标签不匹配：开始标签${svgTagCount}个，结束标签${svgCloseTagCount}个`);
        throw new Error('SVG标签不匹配');
      }
      if (!svgContent.trim().startsWith('<?xml')) {
        svgContent = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgContent;
      }

    } catch (mathJaxError) {
      logger.error('MathJax渲染失败，使用备用SVG:', mathJaxError);

      // 创建一个简单但有效的备用SVG
      svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="100" viewBox="0 0 400 100">
  <rect width="100%" height="100%" fill="white" stroke="#ddd" stroke-width="1"/>
  <text x="200" y="50" text-anchor="middle" dominant-baseline="central" 
        font-family="Times, serif" font-size="18" fill="black">
    ${latexContent.replace(/[<>&"']/g, function (match) {
        switch (match) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case '"': return '&quot;';
          case "'": return '&#39;';
          default: return match;
        }
      })}
  </text>
</svg>`;

      logger.log('使用备用SVG，长度:', svgContent.length);
    } finally {
      if (mathjaxExt.typesetClear) {
        mathjaxExt.typesetClear();
      }
      forceGarbageCollection();
    }

    // 选择保存位置
    const result = await dialog.showSaveDialog(mainWindow!, {
      defaultPath: `formula.${format}`,
      filters: [
        { name: `${format.toUpperCase()} files`, extensions: [format] },
        { name: 'All files', extensions: ['*'] }
      ]
    });

    if (result.canceled || !result.filePath) {
      return { success: false, message: '用户取消保存' };
    }

    if (format === 'svg') {
      fs.writeFileSync(result.filePath, svgContent, 'utf8');
      logger.log(`SVG文件已保存到: ${result.filePath}`);
      return { success: true, filePath: result.filePath, message: 'SVG文件导出成功' };
    } else {
      try {
        logger.log(`准备转换为${format.toUpperCase()}格式`);

        if (!svgContent.includes('<svg') || !svgContent.includes('</svg>')) {
          throw new Error('SVG内容格式无效：缺少必要的svg标签');
        }

        const tempSvgPath = result.filePath.replace(/\.(png|jpg)$/, '.temp.svg');
        fs.writeFileSync(tempSvgPath, svgContent, 'utf8');
        logger.log(`SVG临时文件已保存: ${tempSvgPath}`);

        try {
          let sharpInstance = sharp(tempSvgPath, {
            density: 300,
            limitInputPixels: 30000 * 30000
          });

          const metadata = await sharpInstance.metadata();
          logger.log(`图片元数据:`, metadata);

          if (format === 'png') {
            await sharpInstance
              .png({
                quality: 90,
                compressionLevel: 6,
                adaptiveFiltering: true
              })
              .toFile(result.filePath);
          } else if (format === 'jpg') {
            await sharpInstance
              .flatten({ background: { r: 255, g: 255, b: 255 } })
              .jpeg({
                quality: 85,
                progressive: true
              })
              .toFile(result.filePath);
          }

          sharpInstance = null as any;

          if (fs.existsSync(tempSvgPath)) {
            fs.unlinkSync(tempSvgPath);
          }

          logger.log(`${format.toUpperCase()}文件已保存到: ${result.filePath}`);
          return { success: true, filePath: result.filePath, message: `${format.toUpperCase()}文件导出成功` };

        } catch (sharpError) {
          logger.error(`Sharp转换失败:`, sharpError);
          if (fs.existsSync(tempSvgPath)) {
            fs.unlinkSync(tempSvgPath);
          }

          logger.log('尝试使用简化的SVG重新转换...');
          const simplifiedSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200" style="background-color: white;">
  <rect width="100%" height="100%" fill="white"/>
  <text x="200" y="100" text-anchor="middle" dominant-baseline="central" font-family="serif" font-size="16">
    无法渲染公式: ${latexContent.substring(0, 50)}${latexContent.length > 50 ? '...' : ''}
  </text>
</svg>`;

          const simplifiedPath = result.filePath.replace(/\.(png|jpg)$/, '.simplified.svg');
          fs.writeFileSync(simplifiedPath, simplifiedSvg, 'utf8');

          try {
            let fallbackInstance = sharp(simplifiedPath, { density: 300 });

            if (format === 'png') {
              await fallbackInstance.png({ quality: 90 }).toFile(result.filePath);
            } else if (format === 'jpg') {
              await fallbackInstance.jpeg({ quality: 85 }).toFile(result.filePath);
            }

            fallbackInstance = null as any;

            if (fs.existsSync(simplifiedPath)) {
              fs.unlinkSync(simplifiedPath);
            }

            logger.log(`${format.toUpperCase()}文件（简化版本）已保存到: ${result.filePath}`);
            return { success: true, filePath: result.filePath, message: `${format.toUpperCase()}文件导出成功（简化版本）` };

          } catch (fallbackError) {
            if (fs.existsSync(simplifiedPath)) {
              fs.unlinkSync(simplifiedPath);
            }

            forceGarbageCollection();
            throw fallbackError;
          }
        } finally {
          if (fs.existsSync(tempSvgPath)) {
            fs.unlinkSync(tempSvgPath);
          }
        }

      } catch (error) {
        logger.error(`最终转换失败:`, error);
        forceGarbageCollection();
        throw error;
      }
    }

  } catch (error) {
    logger.error(`导出${format.toUpperCase()}失败:`, error);
    return {
      success: false,
      message: `导出失败: ${error instanceof Error ? error.message : '未知错误'}`
    };
  } finally {
    if (mathjaxExt.typesetClear) {
      mathjaxExt.typesetClear();
    }
    forceGarbageCollection();
  }
});

interface ExtendedMathJax {
  config: Function;
  start: Function;
  typeset: Function;
  typesetClear?: Function; // 我们自定义的方法
}

const mathjaxExt: ExtendedMathJax = mathjax as any;

if (typeof mathjaxExt.typesetClear !== 'function') {
  mathjaxExt.typesetClear = function () {
    try {
      if (mathjaxExt.start) {
        mathjaxExt.start();
      }
      if (global.gc) {
        global.gc();
      }
    } catch (error) {
      logger.error('清理MathJax资源失败:', error);
    }
  };
}
