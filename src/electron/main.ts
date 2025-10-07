import { app, BrowserWindow, ipcMain, dialog, clipboard, globalShortcut, screen, nativeImage, desktopCapturer, Menu } from 'electron';
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
let isCheckingForUpdates = false; // 防止并发检查
let checkUpdateTimeout: NodeJS.Timeout | null = null;
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
    isCheckingForUpdates = false; // 重置检查状态
    if (checkUpdateTimeout) {
      clearTimeout(checkUpdateTimeout);
      checkUpdateTimeout = null;
    }
    if (mainWindow && !mainWindow.isDestroyed()) {
      // 提供更详细的错误信息
      let errorMsg = error.message || '未知错误';
      if (errorMsg.includes('net::')) {
        errorMsg = '网络连接失败，请检查网络后重试';
      } else if (errorMsg.includes('ENOTFOUND') || errorMsg.includes('EAI_AGAIN')) {
        errorMsg = 'DNS解析失败，请检查网络连接';
      } else if (errorMsg.includes('timeout')) {
        errorMsg = '连接超时，请稍后重试';
      } else if (errorMsg.includes('403') || errorMsg.includes('rate limit')) {
        errorMsg = 'GitHub API限流，请稍后再试';
      }
      mainWindow.webContents.send('update-error', errorMsg);
    }
  });
  autoUpdater.on('checking-for-update', () => {
    logger.log('正在检查更新...');
    isCheckingForUpdates = true;
    // 设置30秒超时
    if (checkUpdateTimeout) {
      clearTimeout(checkUpdateTimeout);
    }
    checkUpdateTimeout = setTimeout(() => {
      if (isCheckingForUpdates) {
        logger.error('检查更新超时（30秒）');
        isCheckingForUpdates = false;
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('update-error', '检查更新超时，请检查网络连接');
        }
      }
    }, 30000); // 30秒超时
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('checking-for-update');
    }
  });
  autoUpdater.on('update-available', (info) => {
    logger.log('发现新版本:', info);
    isCheckingForUpdates = false; // 重置检查状态
    if (checkUpdateTimeout) {
      clearTimeout(checkUpdateTimeout);
      checkUpdateTimeout = null;
    }
    if (mainWindow && !mainWindow.isDestroyed() && !hasShownUpdateNotice) {
      hasShownUpdateNotice = true;
      // 仅发送事件通知渲染进程，由渲染进程显示自己的对话框
      mainWindow.webContents.send('update-available', info);
    }
  });

  // 没有可用更新
  autoUpdater.on('update-not-available', (info) => {
    logger.log('当前已是最新版本:', info);
    isCheckingForUpdates = false; // 重置检查状态
    if (checkUpdateTimeout) {
      clearTimeout(checkUpdateTimeout);
      checkUpdateTimeout = null;
    }
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
      // 仅发送事件通知渲染进程，由渲染进程显示自己的对话框
      mainWindow.webContents.send('update-downloaded', info);
    }
  });
  return {
    shouldCheckForUpdates,
    checkForUpdates: () => {
      // 防止并发检查
      if (isCheckingForUpdates) {
        logger.log('已有检查更新任务在进行中，跳过本次请求');
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('update-error', '正在检查更新，请稍候...');
        }
        return;
      }
      
      try {
        logger.log('手动触发检查更新');
        autoUpdater.checkForUpdates().catch((error) => {
          logger.error('checkForUpdates promise rejected:', error);
          isCheckingForUpdates = false;
          if (checkUpdateTimeout) {
            clearTimeout(checkUpdateTimeout);
            checkUpdateTimeout = null;
          }
        });
      } catch (error) {
        logger.error('检查更新失败:', error);
        isCheckingForUpdates = false;
        if (checkUpdateTimeout) {
          clearTimeout(checkUpdateTimeout);
          checkUpdateTimeout = null;
        }
      }
    }
  };
}

// 手动检查更新（带重试机制）
function checkForUpdates(retryCount: number = 0) {
  if (!app.isPackaged) {
    logger.log('开发模式不检查更新');
    return;
  }
  
  // 防止并发检查
  if (isCheckingForUpdates) {
    logger.log('已有检查更新任务在进行中，跳过本次请求');
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-error', '正在检查更新，请稍候...');
    }
    return;
  }
  
  const maxRetries = 3;
  const retryDelayMs = 2000; // 2秒后重试
  
  try {
    logger.log(`手动触发检查更新 (尝试 ${retryCount + 1}/${maxRetries})`);
    
    autoUpdater.checkForUpdates()
      .then(result => {
        if (result && result.updateInfo) {
          logger.log(`检查更新返回结果: 版本 ${result.updateInfo.version} 可用`);
        } else {
          logger.log('检查更新返回结果: 没有可用更新');
        }
      })
      .catch(error => {
        logger.error(`检查更新出错 (尝试 ${retryCount + 1}/${maxRetries}):`, error);
        isCheckingForUpdates = false;
        if (checkUpdateTimeout) {
          clearTimeout(checkUpdateTimeout);
          checkUpdateTimeout = null;
        }
        
        // 如果还有重试次数，则自动重试
        if (retryCount < maxRetries - 1) {
          logger.log(`${retryDelayMs / 1000}秒后重试...`);
          setTimeout(() => {
            checkForUpdates(retryCount + 1);
          }, retryDelayMs);
        } else {
          logger.error('已达到最大重试次数，检查更新失败');
          if (mainWindow && !mainWindow.isDestroyed()) {
            let errorMsg = '检查更新失败，请稍后重试';
            if (error.message) {
              if (error.message.includes('net::') || error.message.includes('ENOTFOUND')) {
                errorMsg = '网络连接失败，请检查网络后重试';
              } else if (error.message.includes('timeout')) {
                errorMsg = '连接超时，请检查网络后重试';
              } else if (error.message.includes('403') || error.message.includes('rate limit')) {
                errorMsg = 'GitHub API限流，请稍后再试';
              }
            }
            mainWindow.webContents.send('update-error', errorMsg);
          }
        }
      });
  } catch (error) {
    logger.error('检查更新失败:', error);
    isCheckingForUpdates = false;
    if (checkUpdateTimeout) {
      clearTimeout(checkUpdateTimeout);
      checkUpdateTimeout = null;
    }
    
    // 同样的重试逻辑
    if (retryCount < maxRetries - 1) {
      logger.log(`${retryDelayMs / 1000}秒后重试...`);
      setTimeout(() => {
        checkForUpdates(retryCount + 1);
      }, retryDelayMs);
    }
  }
}

// 定义API配置读取函数
function loadApiConfigFromSettings(): { appId: string; appSecret: string; deepSeek?: { apiKey: string; enabled: boolean } } {
  const config = {
    appId: '',
    appSecret: '',
    deepSeek: {
      apiKey: '',
      enabled: false
    }
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
      
      // 加载DeepSeek配置
      if (settings.deepseek_api_key !== undefined || settings.deepseek_enabled !== undefined) {
        config.deepSeek = {
          apiKey: settings.deepseek_api_key || '',
          enabled: settings.deepseek_enabled || false
        };
        logger.log('成功从settings.json加载DeepSeek配置');
      } else {
        logger.log('settings.json中使用默认DeepSeek配置');
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
  theme?: string; // 主题ID
}

interface ApiConfig {
  appId: string;
  appSecret: string;
  endpoint: string;
  deepSeek?: {
    apiKey: string;
    enabled: boolean;
  };
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
  endpoint: 'https://server.simpletex.cn/api/latex_ocr',
  deepSeek: {
    apiKey: '',
    enabled: false
  }
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

function cleanupAllTempFiles(): { success: boolean; count: number } {
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
            successCount++;
          }
        } catch (error) {
          failCount++;
        }
      }
    }
  } catch (error) {
    failCount++;
  }
  
  tempFiles.clear();
  
  return {
    success: failCount === 0,
    count: successCount
  };
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
      upload: 'Alt+S' 
    },
    history: [],
    theme: 'green' // 默认使用清新绿色主题
  }
});

let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;

// 创建主窗口
async function createMainWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1051,
    height: 820,
    minWidth: 1051,
    minHeight: 820,
    frame: false, // 移除默认标题栏，使用自定义标题栏
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
    title: 'TexStudio OCR',
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#f3f8f5' // 清新绿色主题的背景色
  });

  // 完全禁用菜单栏
  Menu.setApplicationMenu(null);
  mainWindow.setMenuBarVisibility(false);
  mainWindow.setAutoHideMenuBar(true);

  // 添加键盘事件监听，阻止Alt键呼出菜单
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // 阻止单独的Alt键和Alt+字母的组合（除了已注册的全局快捷键）
    if (input.key === 'Alt' || (input.alt && !input.control && !input.meta && !input.shift)) {
      event.preventDefault();
    }
  });

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
    if (splashWindow && !splashWindow.isDestroyed()) {
      try {
        splashWindow.close();
      } catch (e) {}
      splashWindow = null;
    }
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

  // 监听窗口最大化/还原事件
  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window-state-changed', true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window-state-changed', false);
  });
}

// 创建启动页窗口（Splash）
function createSplashWindow(): void {
  try {
    splashWindow = new BrowserWindow({
      width: 420,
      height: 280,
      frame: false,
      resizable: false,
      movable: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      transparent: false,
      show: false,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        backgroundThrottling: false
      }
    });

    let logoDataUrl = '';
    try {
      const primaryLogoPath = path.join(__dirname, '../../../build/logo192.png');
      const fallbackLogoPath = path.join(__dirname, '../../../build/icons/icon-128.png');
      let logoBuffer: Buffer | null = null;
      if (fs.existsSync(primaryLogoPath)) {
        logoBuffer = fs.readFileSync(primaryLogoPath);
      } else if (fs.existsSync(fallbackLogoPath)) {
        logoBuffer = fs.readFileSync(fallbackLogoPath);
      }
      if (logoBuffer && logoBuffer.length > 0) {
        logoDataUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      }
    } catch (e) {
    }

    const splashHTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TexStudio 启动中</title>
  <style>
    * { box-sizing: border-box; }
    html, body { width: 100%; height: 100%; margin: 0; }
    body {
      background: #ffffff;
      color: #2c3e50;
      font-family: "Segoe UI", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      width: 100%;
      height: 100%;
      border-radius: 0;
      box-shadow: none;
      border: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: transparent;
      position: relative;
      overflow: hidden;
      padding-bottom: 18px;
    }
    .ring {
      width: 64px; height: 64px; border-radius: 50%;
      border: 4px solid #e6eef7; border-top-color: #4a90e2;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .title { font-size: 18px; font-weight: 700; letter-spacing: 0.3px; }
    .sub { font-size: 12px; color: #6b7c93; margin-top: 2px; }
    .content { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; }
    .logo { width: 56px; height: 56px; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.08)); }
    .shine {
      position: absolute; inset: 0;
      background: radial-gradient(120px 60px at 20% 0%, rgba(74,144,226,0.12), transparent 60%),
                  radial-gradient(160px 80px at 90% 80%, rgba(100,181,246,0.12), transparent 60%);
      pointer-events: none;
      animation: float 4s ease-in-out infinite alternate;
    }
    @keyframes float { to { transform: translateY(-6px); filter: hue-rotate(10deg); } }
    /* 底部条状进度条（不定进度动画） */
    .progress {
      position: absolute;
      left: 0; right: 0; bottom: 0;
      height: 6px;
      background: #eef2f7;
      overflow: hidden;
    }
    .progress-bar {
      position: absolute;
      top: 0; left: -30%;
      height: 100%; width: 30%;
      background: linear-gradient(90deg, #4a90e2 0%, #64b5f6 100%);
      animation: indeterminate 1.2s ease-in-out infinite;
    }
    @keyframes indeterminate {
      0% { left: -30%; }
      100% { left: 100%; }
    }
  </style>
  </head>
  <body>
    <div class="card">
      <div class="shine"></div>
      <div class="content">
        ${logoDataUrl ? `<img class="logo" src="${logoDataUrl}" alt="Logo" />` : ''}
        <div class="title">TexStudio OCR</div>
        <div class="sub">正在启动，请稍候…</div>
      </div>
      <div class="progress"><div class="progress-bar"></div></div>
    </div>
  </body>
  </html>`;

    splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(splashHTML)}`);
    splashWindow.once('ready-to-show', () => {
      splashWindow?.show();
    });

    // 保险超时：最长显示6秒，避免异常阻塞
    setTimeout(() => {
      if (splashWindow && !splashWindow.isDestroyed()) {
        try { splashWindow.close(); } catch (e) {}
        splashWindow = null;
      }
    }, 6000);
  } catch (e) {
  }
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
    .coordinates {
      position: fixed;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 5px 6px 5px 6px;
      border-radius: 3px;
      font-family: monospace;
      font-size: 12px;
      pointer-events: none;
      z-index: 10000;
      white-space: nowrap;
      width: fit-content;
      display: inline-block;
      box-sizing: border-box;
      margin: 0;
      line-height: 1;
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
    let coordinatesBox = null;
    
    // 创建坐标信息显示元素
    function createCoordinatesBox() {
      coordinatesBox = document.createElement('div');
      coordinatesBox.className = 'coordinates';
      document.body.appendChild(coordinatesBox);
      return coordinatesBox;
    }
    
    // 更新坐标信息
    function updateCoordinates(left, top, width, height) {
      if (!coordinatesBox) {
        coordinatesBox = createCoordinatesBox();
      }
      
      // 计算绝对坐标
      const absX = left + displayBounds.x;
      const absY = top + displayBounds.y;
      
      coordinatesBox.innerHTML = "X:" + absX + " Y:" + absY + " | W:" + width + " H:" + height;
      
      // 信息框放在截图框上方
      const infoHeight = 22; // 估计信息框高度
      coordinatesBox.style.top = (top - infoHeight) + 'px';
      coordinatesBox.style.left = left + 'px';
      coordinatesBox.style.right = 'auto';
      
      // 如果太靠近顶部，改为放在截图框内部顶部
      if (top < infoHeight + 5) {
        coordinatesBox.style.top = top + 'px';
      }
    }
    
    document.addEventListener('mousedown', (e) => {
      isSelecting = true;
      startX = e.clientX;
      startY = e.clientY;
      
      if (selectionBox) selectionBox.remove();
      if (coordinatesBox) coordinatesBox.remove();
      
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
      
      // 更新坐标信息显示
      updateCoordinates(left, top, width, height);
    });
    
    document.addEventListener('mouseup', async (e) => {
      if (!isSelecting || !selectionBox) return;
      
      const left = Math.min(startX, e.clientX);
      const top = Math.min(startY, e.clientY);
      const width = Math.abs(e.clientX - startX);
      const height = Math.abs(e.clientY - startY);
      
      // 清理选择框和坐标信息框
      if (selectionBox) {
        selectionBox.remove();
        selectionBox = null;
      }
      if (coordinatesBox) {
        coordinatesBox.remove();
        coordinatesBox = null;
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

// 默认禁用硬件加速以避免某些图形问题
app.disableHardwareAcceleration();
if (process.platform === 'win32') {
  app.commandLine.appendSwitch('disable-gpu');
  app.commandLine.appendSwitch('disable-gpu-compositing');
  app.commandLine.appendSwitch('disable-gpu-sandbox');
}

if (process.platform === 'win32') {
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


    app.setPath('userData', path.join(app.getPath('appData'), 'TexStudio'));


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
    createSplashWindow();

    const settingsPath = path.join(app.getAppPath(), 'settings.json');
    if (!fs.existsSync(settingsPath)) {
      try {

        const defaultSettings = {
          app_id: '',
          app_secret: '',
          deepseek_api_key: '',
          deepseek_enabled: false
        };
        fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2), 'utf8');
      } catch (error) {
      }
    }

    // 优先从electron-store加载配置，如果store中没有配置，则从settings.json加载
    let currentApiConfig = store.get('apiConfig');

    // 检查store中是否有有效的API配置
    const hasValidStoreConfig = currentApiConfig &&
      currentApiConfig.appId &&
      currentApiConfig.appSecret &&
      currentApiConfig.appId.trim() !== '' &&
      currentApiConfig.appSecret.trim() !== '';

    if (!hasValidStoreConfig) {
      // 如果store中没有有效配置，尝试从settings.json加载
      const apiConfig = loadApiConfigFromSettings();
      if (apiConfig.appId && apiConfig.appSecret) {
        DEFAULT_API_CONFIG.appId = apiConfig.appId;
        DEFAULT_API_CONFIG.appSecret = apiConfig.appSecret;
        logger.log('从settings.json加载API配置到store');
      } else {
        DEFAULT_API_CONFIG.appId = '';
        DEFAULT_API_CONFIG.appSecret = '';
      }

      // 应用 DeepSeek 配置
      if (apiConfig.deepSeek) {
        DEFAULT_API_CONFIG.deepSeek = {
          apiKey: apiConfig.deepSeek.apiKey,
          enabled: apiConfig.deepSeek.enabled
        };
      }

      // 只有在store中没有有效配置时才更新store
      store.set('apiConfig', DEFAULT_API_CONFIG);
    } else {
      // 使用store中的配置更新DEFAULT_API_CONFIG
      DEFAULT_API_CONFIG = { ...currentApiConfig };
      logger.log('使用electron-store中的API配置');
    }
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
    const result = cleanupAllTempFiles();
    logger.log(`退出时清理了 ${result.count} 个临时文件`);
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
  // 如果对话框已经打开，直接返回null
  if (isFileDialogOpen) {
    return null;
  }

  try {
    isFileDialogOpen = true;
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
  } finally {
    isFileDialogOpen = false;
    // 添加一点延时，确保锁定完全释放
    setTimeout(() => {}, 200);
  }
});

// 新增：获取文件大小
ipcMain.handle('get-file-size', async (event, filePath: string) => {
  try {
    const stats = fs.statSync(filePath);
    return stats.size; // bytes
  } catch (e) {
    return -1;
  }
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
ipcMain.handle('save-settings', async (event, settings: Partial<AppSettings>) => {
  for (const [key, value] of Object.entries(settings)) {
    store.set(key as keyof AppSettings, value);
  }

  // 如果保存的是API配置，同时更新settings.json文件
  if (settings.apiConfig) {
    try {
      const settingsPath = path.join(app.getAppPath(), 'settings.json');
      const fileSettings: any = {
        app_id: settings.apiConfig.appId,
        app_secret: settings.apiConfig.appSecret
      };

      // 保存DeepSeek配置
      if (settings.apiConfig.deepSeek) {
        fileSettings.deepseek_api_key = settings.apiConfig.deepSeek.apiKey;
        fileSettings.deepseek_enabled = settings.apiConfig.deepSeek.enabled;
      } else {
        fileSettings.deepseek_api_key = '';
        fileSettings.deepseek_enabled = false;
      }

      fs.writeFileSync(settingsPath, JSON.stringify(fileSettings, null, 2), 'utf8');
      logger.log('API配置已同步保存到settings.json');
    } catch (error) {
      logger.error('同步保存API配置到settings.json失败:', error);
    }
  }

  if (settings.shortcuts) {
    globalShortcut.unregisterAll();
    registerGlobalShortcuts();
  }
});
// 处理手写公式识别
ipcMain.handle('recognize-handwriting', async (event, dataUrl: string, apiConfig: ApiConfig): Promise<SimpletexResponse> => {
  const MAX_RETRIES = 2;
  let retryCount = 0;
  let lastError: any = null;
  let imageBuffer: Buffer | null = null;
  let tempFilePath: string | null = null;

  try {
    // 将 Data URL 转换为临时文件
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    imageBuffer = Buffer.from(base64Data, 'base64');
    
    // 创建临时文件
    tempFilePath = path.join(app.getPath('temp'), `${TEMP_FILE_PREFIX}handwriting-${Date.now()}.png`);
    fs.writeFileSync(tempFilePath, imageBuffer);
    addTempFile(tempFilePath);
    
    logger.log('手写公式图像已保存到临时文件:', tempFilePath);
    
    // 直接调用函数，而不是通过IPC
    return await tryRecognizeFormula(tempFilePath, apiConfig);
  } catch (error) {
    logger.error('手写公式识别失败:', error);
    return {
      status: false,
      res: { latex: '', conf: 0 },
      request_id: '',
      message: error instanceof Error ? error.message : '未知错误'
    };
  } finally {
    // 释放资源
    imageBuffer = null;
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        removeTempFile(tempFilePath);
      } catch (e) {
        // 忽略删除临时文件的错误
      }
    }
    forceGarbageCollection();
  }
});

// 封装公式识别逻辑为可复用函数
async function tryRecognizeFormula(imagePath: string, apiConfig: ApiConfig): Promise<SimpletexResponse> {
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
}

// 修改原来的recognize-formula处理函数，使用共享逻辑
ipcMain.handle('recognize-formula', async (event, imagePath: string, apiConfig: ApiConfig): Promise<SimpletexResponse> => {
  return await tryRecognizeFormula(imagePath, apiConfig);
});

// 保存手写公式为临时文件
ipcMain.handle('save-handwriting-image', async (event, dataUrl: string): Promise<string> => {
  try {
    // 将 Data URL 转换为 Buffer
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // 创建临时文件
    const tempFilePath = path.join(app.getPath('temp'), `${TEMP_FILE_PREFIX}handwriting-${Date.now()}.png`);
    fs.writeFileSync(tempFilePath, buffer);
    addTempFile(tempFilePath);
    
    logger.log('手写公式图像已保存到临时文件:', tempFilePath);
    return tempFilePath;
  } catch (error) {
    logger.error('保存手写公式图像失败:', error);
    throw error;
  }
});

// 移除之前添加的防抖变量
// let uploadInProgress = false;
// let uploadDebounceTimer: NodeJS.Timeout | null = null;

// 添加一个可靠的锁定机制
let isFileDialogOpen = false;
let lastShortcutTime = 0;

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
      // 确保文件对话框未打开 + 时间间隔检查（至少500ms）
      const now = Date.now();
      if (isFileDialogOpen || (now - lastShortcutTime) < 1000) {
        return;
      }
      
      // 更新最后触发时间
      lastShortcutTime = now;
      
      // 聚焦主窗口
      if (mainWindow && !mainWindow.isFocused()) {
        mainWindow.show();
        mainWindow.focus();
      }
      
      // 发送事件给渲染进程，但不立即打开文件选择器
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

ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('is-window-maximized', () => {
  return mainWindow?.isMaximized() || false;
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
  return cleanupAllTempFiles();
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
    const settings: any = {
      app_id: apiConfig.appId,
      app_secret: apiConfig.appSecret
    };
    
    // 保存DeepSeek配置
    if (apiConfig.deepSeek) {
      settings.deepseek_api_key = apiConfig.deepSeek.apiKey;
      settings.deepseek_enabled = apiConfig.deepSeek.enabled;
    } else {
      settings.deepseek_api_key = '';
      settings.deepseek_enabled = false;
    }
    
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (error) {
    return false;
  }
});

// 清除API配置
ipcMain.handle('clear-api-config', async (event) => {
  try {
    // 清除内存中的配置
    DEFAULT_API_CONFIG.appId = '';
    DEFAULT_API_CONFIG.appSecret = '';
    if (DEFAULT_API_CONFIG.deepSeek) {
      DEFAULT_API_CONFIG.deepSeek.apiKey = '';
      DEFAULT_API_CONFIG.deepSeek.enabled = false;
    }

    // 清除electron-store中的配置
    const clearedConfig = {
      appId: '',
      appSecret: '',
      endpoint: DEFAULT_API_CONFIG.endpoint,
      deepSeek: {
        apiKey: '',
        enabled: false
      }
    };
    store.set('apiConfig', clearedConfig);

    // 清除settings.json中的配置
    const settingsPath = path.join(app.getAppPath(), 'settings.json');
    if (fs.existsSync(settingsPath)) {
      const settings = {
        app_id: '',
        app_secret: '',
        deepseek_api_key: '',
        deepseek_enabled: false
      };
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
    }

    logger.log('API配置已清除，同时更新了electron-store和settings.json');
    return true;
  } catch (error) {
    logger.error('清除API配置失败:', error);
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
        'TexStudio.exe',
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
        'TexStudio.exe'
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

// 打开外部链接
ipcMain.handle('open-external', async (event, url: string) => {
  try {
    const { shell } = require('electron');
    await shell.openExternal(url);
    logger.log(`已使用系统默认浏览器打开链接: ${url}`);
  } catch (error) {
    logger.error('打开外部链接失败:', error);
    throw error;
  }
});

// 打开开发者工具
ipcMain.handle('open-dev-tools', async (event) => {
  try {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
        logger.log('已关闭开发者工具');
      } else {
        mainWindow.webContents.openDevTools();
        logger.log('已打开开发者工具');
      }
    } else {
      logger.error('主窗口不存在或已销毁');
    }
  } catch (error) {
    logger.error('打开开发者工具失败:', error);
    throw error;
  }
});

// 更新窗口主题颜色
ipcMain.handle('update-window-theme', async (event, backgroundColor: string, textColor: string) => {
  try {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setBackgroundColor(backgroundColor);
      
      // 更新 Windows 标题栏颜色
      if (process.platform === 'win32') {
        mainWindow.setTitleBarOverlay({
          color: backgroundColor,
          symbolColor: textColor
        });
      }
      
      logger.log(`窗口主题颜色已更新: 背景=${backgroundColor}, 文字=${textColor}`);
      return { success: true };
    } else {
      logger.error('主窗口不存在或已销毁');
      return { success: false, message: '主窗口不存在' };
    }
  } catch (error) {
    logger.error('更新窗口主题颜色失败:', error);
    return { success: false, message: '更新失败' };
  }
});

// 手动检查更新
let lastCheckTime = 0;
const CHECK_UPDATE_DEBOUNCE_MS = 5000; // 5秒防抖
ipcMain.handle('check-for-updates', async (event) => {
  try {
    logger.log('手动触发检查更新');
    if (!app.isPackaged) {
      logger.log('开发模式下不检查更新');
      return { success: false, message: '开发模式下不检查更新' };
    }

    // 防抖：限制检查频率
    const now = Date.now();
    if (now - lastCheckTime < CHECK_UPDATE_DEBOUNCE_MS) {
      const remainingTime = Math.ceil((CHECK_UPDATE_DEBOUNCE_MS - (now - lastCheckTime)) / 1000);
      logger.log(`检查更新过于频繁，请等待 ${remainingTime} 秒`);
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('update-error', `请等待 ${remainingTime} 秒后再试`);
      }
      return { success: false, message: `请等待 ${remainingTime} 秒后再试` };
    }
    lastCheckTime = now;

    // 重置更新通知标志，确保手动检查时可以显示通知
    hasShownUpdateNotice = false;

    if (autoUpdaterFunctions) {
      autoUpdaterFunctions.checkForUpdates();
    } else {
      checkForUpdates(0); // 从第0次重试开始
    }
    return { success: true, message: '已开始检查更新' };
  } catch (error) {
    logger.error('手动检查更新失败:', error);
    return { success: false, message: '检查更新失败' };
  }
});

// 手动下载更新
ipcMain.handle('download-update', async (event) => {
  try {
    logger.log('手动触发下载更新');
    if (!app.isPackaged) {
      logger.log('开发模式下不支持下载更新');
      return { success: false, message: '开发模式下不支持下载更新' };
    }

    try {
      autoUpdater.downloadUpdate();
      return { success: true, message: '已开始下载更新' };
    } catch (err) {
      logger.error('下载更新失败:', err);
      return { success: false, message: '下载更新失败' };
    }
  } catch (error) {
    logger.error('手动下载更新失败:', error);
    return { success: false, message: '下载更新处理失败' };
  }
});

// 重启并安装更新
ipcMain.handle('quit-and-install', async (event) => {
  try {
    logger.log('手动触发重启安装');
    if (!app.isPackaged) {
      logger.log('开发模式下不支持安装更新');
      return;
    }

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
  } catch (error) {
    logger.error('重启安装更新失败:', error);
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
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
  ${format === 'jpg' ? '<rect width="100%" height="100%" fill="white"/>' : ''}
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
              await fallbackInstance
                .flatten({ background: { r: 255, g: 255, b: 255 } })
                .jpeg({ quality: 85 })
                .toFile(result.filePath);
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

// ==================== 数据管理 IPC 处理器 ====================

// 获取数据路径
ipcMain.handle('get-data-paths', async () => {
  const dataPath = app.getPath('userData');
  const logPath = path.join(dataPath, 'logs');
  return { dataPath, logPath };
});

// 获取缓存大小
ipcMain.handle('get-cache-size', async () => {
  try {
    const tempDir = app.getPath('temp');
    let totalSize = 0;

    // 计算所有临时文件的大小
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      for (const file of files) {
        // 只统计应用创建的临时文件
        if (file.startsWith(TEMP_FILE_PREFIX) || file.startsWith(SCREENSHOT_PREFIX)) {
          try {
            const filePath = path.join(tempDir, file);
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
              totalSize += stats.size;
            }
          } catch (error) {
            // 忽略单个文件的错误（可能文件已被删除）
            continue;
          }
        }
      }
    }

    const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
    return { size: `${sizeMB}MB` };
  } catch (error) {
    logger.error('获取缓存大小失败:', error);
    return { size: '0MB' };
  }
});

// 备份数据
ipcMain.handle('backup-data', async (event, simple: boolean) => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      title: '选择备份保存位置',
      defaultPath: `texstudio-backup-${Date.now()}.zip`,
      filters: [{ name: 'ZIP文件', extensions: ['zip'] }]
    });

    if (!filePath) {
      return { success: false, message: '用户取消' };
    }

    const archiver = require('archiver');
    const output = fs.createWriteStream(filePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);

    const userData = app.getPath('userData');
    const settingsPath = path.join(userData, 'config.json');
    const historyPath = path.join(userData, 'history.json');

    let fileCount = 0;

    // 始终备份设置和历史
    if (fs.existsSync(settingsPath)) {
      archive.file(settingsPath, { name: 'config.json' });
      fileCount++;
      logger.log('已添加 config.json 到备份');
    } else {
      logger.warn('config.json 不存在，跳过备份');
    }
    
    if (fs.existsSync(historyPath)) {
      archive.file(historyPath, { name: 'history.json' });
      fileCount++;
      logger.log('已添加 history.json 到备份');
    } else {
      logger.warn('history.json 不存在，跳过备份');
    }

    // 非精简备份：备份临时文件（截图等）
    if (!simple) {
      const tempDir = app.getPath('temp');
      if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir);
        let tempFileCount = 0;
        
        for (const file of files) {
          // 只备份应用创建的临时文件
          if (file.startsWith(TEMP_FILE_PREFIX) || file.startsWith(SCREENSHOT_PREFIX)) {
            try {
              const tempFilePath = path.join(tempDir, file);
              const stats = fs.statSync(tempFilePath);
              if (stats.isFile()) {
                archive.file(tempFilePath, { name: `temp/${file}` });
                tempFileCount++;
              }
            } catch (error) {
              // 忽略单个文件的错误
              logger.error('备份临时文件失败:', file, error);
              continue;
            }
          }
        }
        
        fileCount += tempFileCount;
        logger.log(`已添加 ${tempFileCount} 个临时文件到备份`);
      }
    } else {
      logger.log('精简备份模式：跳过临时文件');
    }

    await archive.finalize();

    logger.log(`备份完成，共 ${fileCount} 个文件，保存至: ${filePath}`);

    return new Promise<{ success: boolean; filePath?: string; message?: string }>((resolve) => {
      output.on('close', () => {
        const totalBytes = archive.pointer();
        const totalMB = (totalBytes / 1024 / 1024).toFixed(2);
        logger.log(`备份文件大小: ${totalMB}MB`);
        resolve({ success: true, filePath });
      });
      archive.on('error', (err: Error) => {
        logger.error('创建备份压缩包失败:', err);
        resolve({ success: false, message: err.message });
      });
      output.on('error', (err: Error) => {
        logger.error('写入备份文件失败:', err);
        resolve({ success: false, message: err.message });
      });
    });
  } catch (error) {
    logger.error('备份数据失败:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    };
  }
});

// 恢复数据
ipcMain.handle('restore-data', async () => {
  try {
    const { filePaths } = await dialog.showOpenDialog({
      title: '选择备份文件',
      filters: [{ name: 'ZIP文件', extensions: ['zip'] }],
      properties: ['openFile']
    });

    if (!filePaths || filePaths.length === 0) {
      return { success: false, message: '用户取消' };
    }

    logger.log('开始恢复数据，备份文件:', filePaths[0]);

    const extract = require('extract-zip');
    const userData = app.getPath('userData');
    const tempExtractDir = path.join(app.getPath('temp'), `texstudio-restore-${Date.now()}`);

    // 解压备份文件
    logger.log('正在解压备份文件到:', tempExtractDir);
    await extract(filePaths[0], { dir: tempExtractDir });
    logger.log('备份文件解压完成');

    let restoredCount = 0;

    // 恢复配置文件
    const configSrc = path.join(tempExtractDir, 'config.json');
    const historySrc = path.join(tempExtractDir, 'history.json');
    
    if (fs.existsSync(configSrc)) {
      const configDest = path.join(userData, 'config.json');
      fs.copyFileSync(configSrc, configDest);
      restoredCount++;
      logger.log('已恢复 config.json');
    } else {
      logger.warn('备份中不包含 config.json');
    }
    
    if (fs.existsSync(historySrc)) {
      const historyDest = path.join(userData, 'history.json');
      fs.copyFileSync(historySrc, historyDest);
      restoredCount++;
      logger.log('已恢复 history.json');
    } else {
      logger.warn('备份中不包含 history.json');
    }

    // 恢复临时文件（如果备份中包含）
    const tempBackupDir = path.join(tempExtractDir, 'temp');
    if (fs.existsSync(tempBackupDir)) {
      const tempDir = app.getPath('temp');
      const tempFiles = fs.readdirSync(tempBackupDir);
      let tempFileCount = 0;
      
      logger.log(`发现 ${tempFiles.length} 个临时文件，开始恢复...`);
      
      for (const file of tempFiles) {
        try {
          const srcPath = path.join(tempBackupDir, file);
          const destPath = path.join(tempDir, file);
          
          // 只恢复应用相关的临时文件
          if (file.startsWith(TEMP_FILE_PREFIX) || file.startsWith(SCREENSHOT_PREFIX)) {
            const stats = fs.statSync(srcPath);
            if (stats.isFile()) {
              fs.copyFileSync(srcPath, destPath);
              tempFileCount++;
            }
          }
        } catch (error) {
          // 忽略单个文件的错误，继续恢复其他文件
          logger.error('恢复临时文件失败:', file, error);
          continue;
        }
      }
      
      restoredCount += tempFileCount;
      logger.log(`已恢复 ${tempFileCount} 个临时文件`);
    } else {
      logger.log('备份中不包含临时文件（可能是精简备份）');
    }

    // 清理临时解压目录
    try {
      fs.rmSync(tempExtractDir, { recursive: true, force: true });
      logger.log('已清理临时解压目录');
    } catch (error) {
      // 清理失败不影响恢复结果
      logger.error('清理临时目录失败:', error);
    }

    logger.log(`数据恢复完成，共恢复 ${restoredCount} 个文件`);

    return { 
      success: true,
      message: `成功恢复 ${restoredCount} 个文件`
    };
  } catch (error) {
    logger.error('恢复数据失败:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    };
  }
});

// 打开数据文件夹
ipcMain.handle('open-data-folder', async () => {
  const userData = app.getPath('userData');
  require('electron').shell.openPath(userData);
});

// 打开日志文件夹
ipcMain.handle('open-log-folder', async () => {
  const logPath = path.join(app.getPath('userData'), 'logs');
  if (!fs.existsSync(logPath)) {
    fs.mkdirSync(logPath, { recursive: true });
  }
  require('electron').shell.openPath(logPath);
});

// 清除缓存
ipcMain.handle('clear-cache', async () => {
  try {
    const tempDir = app.getPath('temp');
    let totalSize = 0;
    let deletedCount = 0;

    // 计算并删除所有临时文件
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      for (const file of files) {
        // 只删除应用创建的临时文件
        if (file.startsWith(TEMP_FILE_PREFIX) || file.startsWith(SCREENSHOT_PREFIX)) {
          try {
            const filePath = path.join(tempDir, file);
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
              totalSize += stats.size;
              fs.unlinkSync(filePath);
              deletedCount++;
            }
          } catch (error) {
            // 忽略单个文件的错误（可能文件已被删除）
            logger.error('删除临时文件失败:', file, error);
            continue;
          }
        }
      }
    }

    // 清空临时文件追踪集合
    tempFiles.clear();

    const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
    logger.log(`清除缓存成功：删除了 ${deletedCount} 个文件，释放了 ${sizeMB}MB 空间`);
    return { success: true, size: `${sizeMB}MB` };
  } catch (error) {
    logger.error('清除缓存失败:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    };
  }
});

// 重置所有数据
ipcMain.handle('reset-all-data', async () => {
  try {
    const userData = app.getPath('userData');
    const tempDir = app.getPath('temp');

    // 删除配置文件
    const configPath = path.join(userData, 'config.json');
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }

    // 删除历史记录
    const historyPath = path.join(userData, 'history.json');
    if (fs.existsSync(historyPath)) {
      fs.unlinkSync(historyPath);
    }

    // 删除临时文件（缓存）
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      for (const file of files) {
        if (file.startsWith(TEMP_FILE_PREFIX) || file.startsWith(SCREENSHOT_PREFIX)) {
          try {
            const filePath = path.join(tempDir, file);
            fs.unlinkSync(filePath);
          } catch (error) {
            logger.error('删除临时文件失败:', file, error);
            continue;
          }
        }
      }
    }

    tempFiles.clear();

    return { success: true };
  } catch (error) {
    logger.error('重置数据失败:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    };
  }
});

// 重启应用
ipcMain.handle('restart-app', async () => {
  app.relaunch();
  app.exit(0);
});
