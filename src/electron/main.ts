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

// 设置控制台编码为UTF-8，解决中文乱码问题
if (process.platform === 'win32') {
  try {
    const { execSync } = require('child_process');
    execSync('chcp 65001', { windowsHide: true });
    console.log('Console code page set to UTF-8 (65001)');
  } catch (error) {
    console.error('Failed to set console code page:', error);
  }
}

// 创建自定义日志函数，确保中文正确显示
const logger = {
  log: (message: string, ...args: any[]) => {
    if (process.platform === 'win32') {
      if (/[\u4e00-\u9fa5]/.test(message)) {
        console.log('\ufeff' + message, ...args);
      } else {
        console.log(message, ...args);
      }
    } else {
      console.log(message, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    if (process.platform === 'win32') {
      if (/[\u4e00-\u9fa5]/.test(message)) {
        console.error('\ufeff' + message, ...args);
      } else {
        console.error(message, ...args);
      }
    } else {
      console.error(message, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    if (process.platform === 'win32') {
      if (/[\u4e00-\u9fa5]/.test(message)) {
        console.info('\ufeff' + message, ...args);
      } else {
        console.info(message, ...args);
      }
    } else {
      console.info(message, ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    if (process.platform === 'win32') {
      if (/[\u4e00-\u9fa5]/.test(message)) {
        console.warn('\ufeff' + message, ...args);
      } else {
        console.warn(message, ...args);
      }
    } else {
      console.warn(message, ...args);
    }
  },
  // electron-updater需要的属性
  silly: (message: string) => console.log(message),
  debug: (message: string) => console.debug(message),
  verbose: (message: string) => console.log(message),
  transports: {
    file: {
      level: 'info'
    }
  }
};

// 自动更新函数接口
interface AutoUpdaterFunctions {
  shouldCheckForUpdates: () => boolean;
  checkForUpdates: () => void;
}

// 全局变量存储自动更新函数
let autoUpdaterFunctions: AutoUpdaterFunctions;

// 配置自动更新
function setupAutoUpdater() {
  autoUpdater.logger = logger;
  
  // 修改默认自动更新行为
  autoUpdater.autoDownload = true;           // 自动下载更新
  autoUpdater.autoInstallOnAppQuit = true;   // 退出时自动安装
  autoUpdater.allowPrerelease = false;       // 不使用预发布版本
  autoUpdater.allowDowngrade = false;        // 不允许降级
  autoUpdater.forceDevUpdateConfig = false;  // 正式环境配置
  
  // 设置更新服务器地址 - 使用package.json中的配置
  logger.log('使用package.json中的publish配置进行自动更新');
  
  // 设置更新检查频率 - 每天只检查一次
  const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24小时
  let lastCheckTime = 0;
  
  // 检查是否应该检查更新
  function shouldCheckForUpdates() {
    // 开发模式下不检查
    if (!app.isPackaged) {
      return false;
    }
    
    const now = Date.now();
    
    // 如果从未检查过或已超过设定间隔，则应该检查
    if (lastCheckTime === 0 || (now - lastCheckTime) > CHECK_INTERVAL_MS) {
      lastCheckTime = now;
      return true;
    }
    
    return false;
  }

  // 检查更新错误
  autoUpdater.on('error', (error) => {
    logger.error('更新检查失败:', error);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-error', error.message);
    }
  });

  // 检查更新中
  autoUpdater.on('checking-for-update', () => {
    logger.log('正在检查更新...');
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('checking-for-update');
    }
  });

  // 有可用更新
  autoUpdater.on('update-available', (info) => {
    logger.log('发现新版本:', info);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-available', info);
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: '软件更新',
        message: `发现新版本 ${info.version}，正在下载更新...`,
        buttons: ['确定']
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

  // 更新下载完成
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
          autoUpdater.quitAndInstall(false, true);
        }
      });
    }
  });
  
  // 暴露公共方法
  return {
    shouldCheckForUpdates,
    checkForUpdates: () => {
      try {
        logger.log('手动触发检查更新');
        // 手动检查总是强制检查，不考虑时间间隔
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
  
  // 无论是否有autoUpdaterFunctions，都尝试直接检查更新
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
  console.log(`Added temporary file to management list: ${filePath}`);
}

function removeTempFile(filePath: string): boolean {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted temporary file: ${filePath}`);
    }
    tempFiles.delete(filePath);
    return true;
  } catch (error) {
    console.error(`Failed to delete temporary file: ${filePath}`, error);
    return false;
  }
}

function cleanupAllTempFiles(): void {
  console.log(`Starting cleanup of ${tempFiles.size} temporary files...`);
  
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
            console.log(`Deleted expired temporary file: ${fullPath}`);
          }
        } catch (error) {
          console.error(`Error processing temporary file: ${fullPath}`, error);
        }
      }
    }
  } catch (error) {
    console.error('Failed to scan temporary directory:', error);
  }
  
  console.log(`Temporary files cleanup completed: Success ${successCount}, Fail ${failCount}`);
  tempFiles.clear();
}

function forceGarbageCollection(): void {
  try {
    if (global.gc) {
      global.gc();
      logger.log('手动触发垃圾回收完成');
    }
    
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.session.clearCache().catch(() => {});
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
    if (heapUsedMB > 200) {
      logger.log('内存使用过高，触发垃圾回收');
      forceGarbageCollection();
    }
  } catch (error) {
    logger.error('内存监控失败:', error);
  }
}

// 定期清理临时文件和内存（每10分钟）
function startPeriodicCleanup(): void {
  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
  }
  
  cleanupIntervalId = setInterval(() => {
    console.log('Executing periodic cleanup...');
    monitorMemoryUsage();
    cleanupAllTempFiles();
    forceGarbageCollection();
  }, 10 * 60 * 1000); // 10 minutes - 更频繁的清理
  
  setTimeout(() => {
    monitorMemoryUsage();
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
      console.error('Failed to load dev server, falling back to build:', error);
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
    
    if (!isDev && process.platform === 'win32') {
      forceQuitApp();
    }
  });
  
  mainWindow.on('close', (event) => {
    
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
    
    console.log('Screenshot window loaded for display ${index}:', displayBounds);
    
    document.addEventListener('mousedown', (e) => {
      isSelecting = true;
      startX = e.clientX;
      startY = e.clientY;
      
      console.log('🖱️ Mouse down on display ${index} at window coords:', { x: startX, y: startY });
      console.log('🌍 Will become absolute coords:', { 
        x: startX + displayBounds.x, 
        y: startY + displayBounds.y 
      });
      
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
        
        console.log('Window coords:', { x: left, y: top, width, height });
        console.log('Display bounds:', displayBounds);
        console.log('Absolute coords:', absoluteArea);
        
        try {
          await window.screenshotAPI.takeSimpleScreenshot(absoluteArea);
        } catch (error) {
          console.error('Screenshot failed:', error);
        }
      }
      
      await window.screenshotAPI.closeScreenshotWindow();
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        console.log('ESC键被按下，关闭截图窗口');
        try {
          window.screenshotAPI.closeScreenshotWindow();
          console.log('截图窗口关闭请求已发送');
        } catch (error) {
          console.error('关闭截图窗口时出错:', error);
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
        logger.log('已创建默认的settings.json文件');
      } catch (error) {
        logger.error('创建默认settings.json文件失败:', error);
      }
    }
    
    
    const apiConfig = loadApiConfigFromSettings();
          logger.log('从settings.json加载的API配置:', apiConfig);
    
    
    if (apiConfig.appId && apiConfig.appSecret) {
      DEFAULT_API_CONFIG.appId = apiConfig.appId;
      DEFAULT_API_CONFIG.appSecret = apiConfig.appSecret;
      logger.log('已更新默认API配置');
    } else {
      logger.log('settings.json中的API配置无效或为空，不使用任何默认配置');
      
      DEFAULT_API_CONFIG.appId = '';
      DEFAULT_API_CONFIG.appSecret = '';
    }
    
    
    store.set('apiConfig', DEFAULT_API_CONFIG);
    
    
    logger.log('应用启动 - 中文日志测试');
    logger.log('Application started - English log test');
    
    killZombieProcesses();
    await createMainWindow();
    registerGlobalShortcuts();
    cleanupAllTempFiles();
    startPeriodicCleanup();
    
    // 设置自动更新
    autoUpdaterFunctions = setupAutoUpdater();
    
    // 检查更新（延迟启动后检查，避免影响启动速度）
    setTimeout(() => {
      autoUpdaterFunctions.checkForUpdates();
    }, 10000);

    app.on('activate', async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await createMainWindow();
      }
    });
  });
}


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    
    forceQuitApp();
  }
});


app.on('before-quit', () => {
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
      console.error('Failed to save file:', error);
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
  try {
    
    const displays = screen.getAllDisplays();
    console.log('📺 Available displays:', displays.map((d, i) => ({
      index: i,
      id: d.id,
      bounds: d.bounds,
      scaleFactor: d.scaleFactor,
      primary: d.id === screen.getPrimaryDisplay().id
    })));
    
    
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 16384, height: 16384 }  
    });

    console.log('🖼️ Available screen sources:', sources.map((s, i) => ({
      index: i,
      name: s.name,
      id: s.id,
      display_id: s.display_id,
      size: s.thumbnail.getSize()
    })));

    if (sources.length === 0) {
      throw new Error('No screen sources available');
    }

    
    const centerX = area.x + area.width / 2;
    const centerY = area.y + area.height / 2;
    
    
    let targetDisplay: Electron.Display | null = null;
    let displayIndex = -1;
    
    
    for (let i = 0; i < displays.length; i++) {
      const display = displays[i];
      const inX = centerX >= display.bounds.x && centerX < display.bounds.x + display.bounds.width;
      const inY = centerY >= display.bounds.y && centerY < display.bounds.y + display.bounds.height;
      
      console.log(`Display [${i}] (ID: ${display.id}):`, {
        bounds: display.bounds,
        centerInX: inX,
        centerInY: inY,
        isTarget: inX && inY
      });
      
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
    
    console.log(`🎯 Target display [${displayIndex}]:`, {
      id: targetDisplay.id,
      bounds: targetDisplay.bounds,
      scaleFactor: targetDisplay.scaleFactor
    });

    
    let selectedSource: Electron.DesktopCapturerSource | null = null;
    selectedSource = sources.find(s => s.display_id === targetDisplay!.id.toString()) || null;
    if (selectedSource) {
      console.log(`✅ Found exact display_id match: "${selectedSource.name}" for display ID ${targetDisplay.id}`);
    } else {
      console.log(`⚠️ No exact display_id match found for display ID ${targetDisplay.id}`);
      
      
      if (!targetDisplay.id.toString().includes(screen.getPrimaryDisplay().id.toString())) {
        
        const nonPrimarySources = sources.filter(s => s.display_id !== screen.getPrimaryDisplay().id.toString());
        if (nonPrimarySources.length > 0) {
          selectedSource = nonPrimarySources[0];
          console.log(`✅ Using non-primary source for secondary display: "${selectedSource.name}"`);
        }
      }

      if (!selectedSource && displayIndex < sources.length) {
        selectedSource = sources[displayIndex];
        console.log(`✅ Using index-based match for display ${displayIndex}: "${selectedSource.name}"`);
      }

      if (!selectedSource) {
        const expectedWidth = targetDisplay.bounds.width * targetDisplay.scaleFactor;
        const expectedHeight = targetDisplay.bounds.height * targetDisplay.scaleFactor;
        
        let bestMatch = sources[0];
        let bestScore = 0;
        
        console.log(`🔍 Looking for source matching ${expectedWidth}x${expectedHeight}...`);
        
        for (const source of sources) {
          const size = source.thumbnail.getSize();
          const widthDiff = Math.abs(size.width - expectedWidth);
          const heightDiff = Math.abs(size.height - expectedHeight);
          const score = 1 / (1 + widthDiff + heightDiff);  
          
          console.log(`  Source "${source.name}": ${size.width}x${size.height}, score=${score.toFixed(3)}`);
          
          if (score > bestScore) {
            bestScore = score;
            bestMatch = source;
          }
        }
        
        selectedSource = bestMatch;
        console.log(`✅ Using resolution-based match: "${selectedSource.name}" (score: ${bestScore.toFixed(3)})`);
      }
    }

    const sourceSize = selectedSource.thumbnail.getSize();
    console.log(`🖥️ Using source: "${selectedSource.name}" (${sourceSize.width}x${sourceSize.height})`);

    
    let cropArea: { x: number; y: number; width: number; height: number };
    
    if (displays.length === 1) {
      
      const scaleX = sourceSize.width / targetDisplay.bounds.width;
      const scaleY = sourceSize.height / targetDisplay.bounds.height;
      
      cropArea = {
        x: Math.round(area.x * scaleX),
        y: Math.round(area.y * scaleY),
        width: Math.round(area.width * scaleX),
        height: Math.round(area.height * scaleY)
      };
      
    } else {
      
      if (selectedSource.display_id === targetDisplay.id.toString()) {
        
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
        
        console.log('📐 Multi-display relative coords:', {
          relative: { x: relativeX, y: relativeY },
          scale: { x: scaleX, y: scaleY }
        });
      } else {

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
        
        console.log('📐 Multi-display absolute coords:', {
          virtualScreen: { width: totalWidth, height: totalHeight, offset: { x: minX, y: minY } },
          scale: { x: scaleX, y: scaleY }
        });
      }
    }
    cropArea.x = Math.max(0, Math.min(cropArea.x, sourceSize.width - 1));
    cropArea.y = Math.max(0, Math.min(cropArea.y, sourceSize.height - 1));
    cropArea.width = Math.max(1, Math.min(cropArea.width, sourceSize.width - cropArea.x));
    cropArea.height = Math.max(1, Math.min(cropArea.height, sourceSize.height - cropArea.y));
    const croppedImage = selectedSource.thumbnail.crop(cropArea);
    const resultSize = croppedImage.getSize();
    if (resultSize.width === 0 || resultSize.height === 0) {
      throw new Error('Cropped image is empty');
    }

    
    const timestamp = Date.now();
    const filename = `screenshot-${timestamp}.png`;
    const tempPath = path.join(app.getPath('temp'), filename);
    
    const buffer = croppedImage.toPNG();
    fs.writeFileSync(tempPath, buffer);
    addTempFile(tempPath);
  
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
    
  } catch (error) {
    closeScreenshotWindow();
    throw error;
  }
}


function closeScreenshotWindow(): void {
  screenshotWindows.forEach((window, index) => {
    if (!window.isDestroyed()) {
      window.removeAllListeners();
      window.webContents.removeAllListeners();
      window.webContents.session.clearCache().catch(() => {});
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

// 简化截图
ipcMain.handle('take-simple-screenshot', async (event, area: { x: number; y: number; width: number; height: number }) => {
  console.log('IPC: take-simple-screenshot called with area:', area);
  try {
    const tempPath = await takeSimpleScreenshot(area);
    console.log('IPC: Simple screenshot completed, file saved to:', tempPath);
    return tempPath;
  } catch (error) {
    console.error('IPC: take-simple-screenshot failed:', error);
    throw error;
  }
});

// 剪贴板操作
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

// 公式识别
ipcMain.handle('recognize-formula', async (event, imagePath: string, apiConfig: ApiConfig): Promise<SimpletexResponse> => {
  const MAX_RETRIES = 2;
  let retryCount = 0;
  let lastError: any = null;
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
          // 同样检查是否是有效的非空字符串
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
        console.error('图片文件不存在:', imagePath);
        return {
          status: false,
          res: { latex: '', conf: 0 },
          request_id: '',
          message: '图片文件不存在'
        };
      }
      const imageBuffer = fs.readFileSync(imagePath);
      if (!imageBuffer || imageBuffer.length === 0) {
        console.error('图片文件为空:', imagePath);
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

      return response.data;
    } catch (error) {
      console.error(`Formula recognition failed (attempt ${retryCount + 1}):`, error);
      lastError = error;
      
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);

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
    }
  };
  return tryRecognize();
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
  logger.log('收到关闭截图窗口请求');
  closeScreenshotWindow();
  logger.log('截图窗口已关闭，主窗口已显示');
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
           logger.log('API config saved to settings.json file');
    return true;
  } catch (error) {
    logger.error('保存API配置到settings.json文件失败:', error);
    return false;
  }
});

// 清除API配置
ipcMain.handle('clear-api-config', async (event) => {
  try {
    logger.log('开始清除API配置...');
    DEFAULT_API_CONFIG.appId = '';
    DEFAULT_API_CONFIG.appSecret = '';
    logger.log('1. 内存中的API配置已清除');
    store.set('apiConfig', {
      appId: '',
      appSecret: '',
      endpoint: DEFAULT_API_CONFIG.endpoint
    });
    logger.log('2. electron-store中的API配置已清除');

    const settingsPath = path.join(app.getAppPath(), 'settings.json');
    if (fs.existsSync(settingsPath)) {
      const settings = {
        app_id: '',
        app_secret: ''
      };
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
      logger.log('3. settings.json文件中的API配置已清除');
    } else {
      logger.log('settings.json文件不存在，无需清除');
    }
    if (mainWindow && !mainWindow.isDestroyed()) {
      try {
        await mainWindow.webContents.session.clearStorageData({
          storages: ['localstorage', 'cookies', 'indexdb', 'websql', 'serviceworkers', 'cachestorage']
        });
        logger.log('4. 浏览器存储数据已清除');
        await mainWindow.webContents.session.clearCache();
        logger.log('5. 浏览器HTTP缓存已清除');
        await mainWindow.webContents.session.clearHostResolverCache();
        logger.log('6. 主机解析缓存已清除');
        await mainWindow.webContents.session.clearAuthCache();
        logger.log('7. 授权缓存已清除');
        mainWindow.webContents.reloadIgnoringCache();
        logger.log('8. 窗口内容已强制刷新');
      } catch (e) {
        logger.error('清除缓存失败:', e);
      }
    }
    
    logger.log('API配置已完全清除');
    return true;
  } catch (error) {
    logger.error('清除API配置失败:', error);
    return false;
  }
});

// 在Windows平台上强制终止所有相关进程
function terminateAllProcesses(): void {
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

// 强制退出应用
function forceQuitApp(): void {
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
    mathjax.config({
      MathJax: {
        SVG: {
          scale: 1,
          font: 'TeX',
          useFontCache: true,
          useGlobalCache: false
        }
      }
    });
    await mathjax.start();
    let svgContent: string;
    try {
      const mjResult: any = await mathjax.typeset({
        math: latexContent,
        format: 'TeX',
        svg: true
      });
      
      if (!mjResult.svg) {
        throw new Error('LaTeX到SVG转换失败');
      }
      svgContent = mjResult.svg;
      logger.log('MathJax SVG生成成功，长度:', svgContent.length);
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
    ${latexContent.replace(/[<>&"']/g, function(match) {
      switch(match) {
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
      // 使用Sharp将SVG转换为PNG或JPG
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
            density: 300 
          });
          
          const metadata = await sharpInstance.metadata();
          logger.log(`图片元数据:`, metadata);
          
          if (format === 'png') {
            await sharpInstance
              .png({ 
                quality: 100, 
                compressionLevel: 0,
                adaptiveFiltering: false
              })
              .toFile(result.filePath);
          } else if (format === 'jpg') {
            await sharpInstance
              .flatten({ background: { r: 255, g: 255, b: 255 } })
              .jpeg({ 
                quality: 95,
                progressive: true
              })
              .toFile(result.filePath);
          }
          
          fs.unlinkSync(tempSvgPath);
          
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
              await fallbackInstance.png({ quality: 100 }).toFile(result.filePath);
            } else if (format === 'jpg') {
              await fallbackInstance.jpeg({ quality: 95 }).toFile(result.filePath);
            }
            
            fs.unlinkSync(simplifiedPath);
            
            logger.log(`${format.toUpperCase()}文件（简化版本）已保存到: ${result.filePath}`);
            return { success: true, filePath: result.filePath, message: `${format.toUpperCase()}文件导出成功（简化版本）` };
            
          } catch (fallbackError) {
            if (fs.existsSync(simplifiedPath)) {
              fs.unlinkSync(simplifiedPath);
            }
            throw fallbackError;
          }
        }
        
      } catch (error) {
        logger.error(`最终转换失败:`, error);
        throw error;
      }
    }
    
  } catch (error) {
    logger.error(`导出${format.toUpperCase()}失败:`, error);
    return { 
      success: false, 
      message: `导出失败: ${error instanceof Error ? error.message : '未知错误'}` 
    };
  }
});
