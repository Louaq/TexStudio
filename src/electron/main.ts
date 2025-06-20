import { app, BrowserWindow, ipcMain, dialog, clipboard, globalShortcut, screen, nativeImage, desktopCapturer } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import Store from 'electron-store';
import { ScreenshotArea } from '../types';
import { getCurrentTimestamp } from '../utils/api';
import * as crypto from 'crypto';

// 定义应用设置类型
interface AppSettings {
  apiConfig: ApiConfig;
  shortcuts: {
    capture: string;
    upload: string;
  };
  history: HistoryItem[];
}

// 定义API配置类型
interface ApiConfig {
  appId: string;
  appSecret: string;
  endpoint: string;
}

// 定义历史记录项类型
interface HistoryItem {
  latex: string;
  date: string;
}

// 定义API响应类型
interface SimpletexResponse {
  status: boolean;
  res: {
    latex: string;
    conf: number;
  };
  request_id: string;
}

// 默认API配置
const DEFAULT_API_CONFIG: ApiConfig = {
  appId: 'vXSU9RyPMfUW4EQbgMWhzhQu',
  appSecret: 'GZiaGYq24U5evF9OXlcYIbZ2mwsuPbVu',
  endpoint: 'https://server.simpletex.cn/api/latex_ocr'
};

// 临时文件前缀
const TEMP_FILE_PREFIX = 'simpletex-';
const SCREENSHOT_PREFIX = 'screenshot-';

// 存储临时文件路径
const tempFiles = new Set<string>();

// 存储定期清理的定时器ID
let cleanupIntervalId: NodeJS.Timeout | null = null;

// 检测开发环境
const isDevelopment = process.env.NODE_ENV === 'development';

// Electron环境专用的API签名生成函数
function getReqData(reqData: Record<string, any> = {}, apiConfig: ApiConfig) {
  const header: Record<string, string> = {};
  header.timestamp = Math.floor(Date.now() / 1000).toString();
  header['random-str'] = randomStr(16);
  header['app-id'] = apiConfig.appId;

  // 构建签名字符串
  const params: string[] = [];
  
  // 添加请求参数
  const sortedReqKeys = Object.keys(reqData).sort();
  for (const key of sortedReqKeys) {
    params.push(`${key}=${reqData[key]}`);
  }
  
  // 添加头部参数
  const headerKeys = ['app-id', 'random-str', 'timestamp'];
  for (const key of headerKeys) {
    params.push(`${key}=${header[key]}`);
  }
  
  // 添加密钥
  params.push(`secret=${apiConfig.appSecret}`);
  
  // 生成签名
  const preSignString = params.join('&');
  header.sign = crypto.createHash('md5').update(preSignString).digest('hex');
  
  return { header, reqData };
}

// 生成随机字符串
function randomStr(length: number = 16): string {
  const chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 临时文件管理函数
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
  
  // 额外清理：扫描临时目录中的旧文件
  try {
    const tempDir = app.getPath('temp');
    const files = fs.readdirSync(tempDir);
    
    for (const file of files) {
      if (file.startsWith(TEMP_FILE_PREFIX)) {
        const fullPath = path.join(tempDir, file);
        try {
          const stats = fs.statSync(fullPath);
          const fileAge = Date.now() - stats.mtime.getTime();
          
          // 删除超过1小时的临时文件
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

// 定期清理临时文件（每30分钟）
function startPeriodicCleanup(): void {
  // 清除之前的定时器（如果存在）
  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
  }
  
  cleanupIntervalId = setInterval(() => {
    console.log('Executing periodic temporary file cleanup...');
    cleanupAllTempFiles();
  }, 30 * 60 * 1000); // 30 minutes
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
    width: 830,
    height: 715,
    minWidth: 700,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
    },
    icon: path.join(__dirname, '../../assets/icon.png'),
    title: 'LaTeX formula recognition tool',
    show: false,
    // 禁用系统菜单栏
    autoHideMenuBar: true
  });

  // 完全移除菜单栏
  mainWindow.setMenuBarVisibility(false);
  mainWindow.setAutoHideMenuBar(true);

  // 开发模式下加载本地服务器，生产模式下加载打包后的文件
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    try {
      await mainWindow.loadURL('http://localhost:3000');
      mainWindow.webContents.openDevTools();
    } catch (error) {
      console.error('Failed to load dev server, falling back to build:', error);
      // 从 dist/electron/electron/ 回到项目根目录的 build 文件夹
      mainWindow.loadFile(path.join(__dirname, '../../../build/index.html'));
    }
  } else {
    // 从 dist/electron/electron/ 回到项目根目录的 build 文件夹
    mainWindow.loadFile(path.join(__dirname, '../../../build/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // 监听窗口关闭事件
  mainWindow.on('closed', () => {
    mainWindow = null;
    
    // 在非开发模式下，窗口关闭时强制退出应用
    if (!isDev && process.platform === 'win32') {
      console.log('主窗口关闭，强制退出应用');
      forceQuitApp();
    }
  });
  
  // 监听窗口关闭请求
  mainWindow.on('close', (event) => {
    console.log('收到窗口关闭请求');
    
    // 在非开发模式下，确保应用完全退出
    if (!isDev && process.platform === 'win32') {
      event.preventDefault(); // 阻止默认关闭行为
      forceQuitApp();
    }
  });
}

// 存储多个截图窗口
const screenshotWindows: BrowserWindow[] = [];

// ===== 简化截图系统 =====

// 重写简单的截图系统
function createSimpleScreenshotWindow(): void {
  try {
    // 清理现有窗口
    screenshotWindows.forEach(window => {
      if (!window.isDestroyed()) {
        window.close();
      }
    });
    screenshotWindows.length = 0;

    const displays = screen.getAllDisplays();
    console.log('🖥️ Creating screenshot windows for displays:', displays.length);

    // 为每个显示器创建独立的截图窗口
    displays.forEach((display, index) => {
      console.log(`📐 Display [${index}]: ${display.bounds.width}x${display.bounds.height} at (${display.bounds.x}, ${display.bounds.y})`);
      
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
          preload: path.join(__dirname, 'preload.js')
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
    
    document.addEventListener('keydown', async (e) => {
      if (e.key === 'Escape') {
        await window.screenshotAPI.closeScreenshotWindow();
      }
    });
  </script>
</body>
</html>`;
      
      screenshotWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(screenshotHTML)}`);
      screenshotWindows.push(screenshotWindow);
      
      console.log(`✅ Screenshot window created for display ${index}`);
    });
    
    console.log(`✅ All ${displays.length} screenshot windows created`);
    
  } catch (error) {
    console.error('❌ Failed to create screenshot windows:', error);
  }
}

// 显示截图窗口
function showSimpleScreenshotOverlay(): void {
  if (screenshotWindows.length === 0) {
    createSimpleScreenshotWindow();
  }
  // 显示所有截图窗口
  screenshotWindows.forEach((window, index) => {
    if (!window.isDestroyed()) {
      window.show();
      window.focus();
      console.log(`📱 Screenshot window ${index} shown`);
    }
  });
}

// 删除其他复杂的截图函数
function createUnifiedScreenshotWindow(): void {
  console.log('🔄 Using simple screenshot system...');
  createSimpleScreenshotWindow();
}

function showUnifiedScreenshotOverlay(): void {
  showSimpleScreenshotOverlay();
}

// 重新设计截图窗口创建 - 作为备用方案
function createScreenshotWindows(): void {
  // 现在默认使用简单窗口方案
  console.log('🔄 Redirecting to simple screenshot system...');
  createSimpleScreenshotWindow();
}

// 禁用硬件加速以解决GPU问题
if (process.platform === 'win32') {
  app.disableHardwareAcceleration();
  
  // 禁用GPU进程
  app.commandLine.appendSwitch('disable-gpu');
  app.commandLine.appendSwitch('disable-gpu-compositing');
  
  // 禁用持久化缓存，避免后台进程
  app.commandLine.appendSwitch('disable-http-cache');
  app.commandLine.appendSwitch('disable-background-networking');
  app.commandLine.appendSwitch('disable-background-timer-throttling');
}

// 设置用户数据目录以解决权限问题
app.setPath('userData', path.join(app.getPath('appData'), 'SimpleTex-OCR'));

// 确保只有一个实例在运行
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log('另一个实例已经在运行，退出当前实例');
  app.exit(0);
} else {
  // 当第二个实例启动时，聚焦到第一个实例的窗口
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    console.log('检测到第二个实例启动，聚焦到当前窗口');
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
      mainWindow.focus();
    }
  });
  
  // 应用程序就绪时
  app.whenReady().then(async () => {
    // 检测和终止可能的僵尸进程
    killZombieProcesses();
    
    await createMainWindow();
    registerGlobalShortcuts();
    
    // 启动时清理旧的临时文件
    console.log('Application started, cleaning old temporary files...');
    cleanupAllTempFiles();
    
    // 启动定期清理
    startPeriodicCleanup();

    app.on('activate', async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await createMainWindow();
      }
    });
  });
}

// 所有窗口关闭时
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // 在Windows平台上强制退出应用
    forceQuitApp();
  }
});

// 应用退出前清理
app.on('before-quit', () => {
  console.log('Application is about to exit, starting cleanup...');
  
  // 取消注册所有全局快捷键
  globalShortcut.unregisterAll();
  
  // 停止定期清理定时器
  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
  }
  
  // 关闭所有截图窗口
  screenshotWindows.forEach(window => {
    if (!window.isDestroyed()) {
      window.removeAllListeners();
      window.close();
    }
  });
  screenshotWindows.length = 0;
  
  // 清理所有临时文件
  cleanupAllTempFiles();
  
  // 确保所有后台任务都被终止
  setTimeout(() => {
    process.exit(0);
  }, 500);
});

// 应用退出时的最终清理
app.on('will-quit', (event) => {
  console.log('Application is exiting, executing final cleanup...');
  
  // 如果还有未清理的临时文件，再次尝试清理
  if (tempFiles.size > 0) {
    console.log(`Still ${tempFiles.size} temporary files need to be cleaned`);
    cleanupAllTempFiles();
  }
  
  // 释放主窗口资源
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.removeAllListeners();
    mainWindow = null;
  }
  
  // 确保应用完全退出
  setTimeout(() => {
    if (process.platform === 'win32') {
      terminateAllProcesses();
    } else {
      process.exit(0);
    }
  }, 100);
});

// 注册全局快捷键
function registerGlobalShortcuts(): void {
  const shortcuts = store.get('shortcuts');
  
  // 注册截图快捷键
  globalShortcut.register(shortcuts.capture, () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
    setTimeout(() => {
      showUnifiedScreenshotOverlay();
    }, 200);
  });

  // 注册上传快捷键
  globalShortcut.register(shortcuts.upload, () => {
    if (mainWindow && !mainWindow.isFocused()) {
      mainWindow.show();
      mainWindow.focus();
    }
    mainWindow?.webContents.send('shortcut-triggered', 'upload');
  });
}

// IPC 处理器

// 文件选择
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

// 文件保存
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

// 保存临时文件
ipcMain.handle('save-temp-file', async (event, buffer: Uint8Array, filename: string) => {
  try {
    const ext = path.extname(filename) || '.png';
    const tempPath = path.join(app.getPath('temp'), `${TEMP_FILE_PREFIX}${Date.now()}${ext}`);
    fs.writeFileSync(tempPath, buffer);
    addTempFile(tempPath); // 添加到临时文件管理列表
    return tempPath;
  } catch (error) {
    console.error('Failed to save temporary file:', error);
    throw error;
  }
});

// 简化的测试功能
ipcMain.handle('force-test-second-screen', async () => {
  console.log('简化截图系统：测试功能已禁用');
  return { message: '简化截图系统已启用，测试功能已禁用' };
});

// ===== 清理旧截图系统，现在使用简化版本 =====

// 显示截图覆盖层
ipcMain.handle('show-screenshot-overlay', () => {
  showUnifiedScreenshotOverlay();
});

// 简化的截图功能
async function takeSimpleScreenshot(area: { x: number; y: number; width: number; height: number }): Promise<string> {
  try {
    console.log('📸 Taking screenshot with area:', area);
    
    // 获取显示器信息
    const displays = screen.getAllDisplays();
    console.log('📺 Available displays:', displays.map((d, i) => ({
      index: i,
      id: d.id,
      bounds: d.bounds,
      scaleFactor: d.scaleFactor,
      primary: d.id === screen.getPrimaryDisplay().id
    })));
    
    // 获取屏幕源
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 16384, height: 16384 }  // 使用高分辨率
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

    // 确定截图区域在哪个显示器上
    const centerX = area.x + area.width / 2;
    const centerY = area.y + area.height / 2;
    
    console.log(`📍 Selection center: (${centerX}, ${centerY})`);
    console.log('🔍 Checking displays for selection area...');
    
    let targetDisplay: Electron.Display | null = null;
    let displayIndex = -1;
    
    // 详细检查每个显示器
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
      // 如果找不到，使用主显示器
      targetDisplay = screen.getPrimaryDisplay();
      displayIndex = displays.findIndex(d => d.id === targetDisplay!.id);
      console.log('⚠️ Cannot determine target display, using primary');
    }
    
    console.log(`🎯 Target display [${displayIndex}]:`, {
      id: targetDisplay.id,
      bounds: targetDisplay.bounds,
      scaleFactor: targetDisplay.scaleFactor
    });

    // 智能选择屏幕源
    let selectedSource: Electron.DesktopCapturerSource | null = null;
    
    // 策略1: 通过display_id精确匹配
    selectedSource = sources.find(s => s.display_id === targetDisplay!.id.toString()) || null;
    if (selectedSource) {
      console.log(`✅ Found exact display_id match: "${selectedSource.name}" for display ID ${targetDisplay.id}`);
    } else {
      console.log(`⚠️ No exact display_id match found for display ID ${targetDisplay.id}`);
      
      // 策略2: 特殊处理第二显示器（非主屏幕）
      if (!targetDisplay.id.toString().includes(screen.getPrimaryDisplay().id.toString())) {
        // 这是第二屏幕，优先选择非主屏幕源
        const nonPrimarySources = sources.filter(s => s.display_id !== screen.getPrimaryDisplay().id.toString());
        if (nonPrimarySources.length > 0) {
          selectedSource = nonPrimarySources[0];
          console.log(`✅ Using non-primary source for secondary display: "${selectedSource.name}"`);
        }
      }
      
      // 策略3: 如果还没找到，按索引匹配
      if (!selectedSource && displayIndex < sources.length) {
        selectedSource = sources[displayIndex];
        console.log(`✅ Using index-based match for display ${displayIndex}: "${selectedSource.name}"`);
      }
      
      // 策略4: 按分辨率匹配
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
          const score = 1 / (1 + widthDiff + heightDiff);  // 越接近分数越高
          
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

    // 改进的坐标转换
    let cropArea: { x: number; y: number; width: number; height: number };
    
    if (displays.length === 1) {
      // 单显示器：简单缩放
      const scaleX = sourceSize.width / targetDisplay.bounds.width;
      const scaleY = sourceSize.height / targetDisplay.bounds.height;
      
      cropArea = {
        x: Math.round(area.x * scaleX),
        y: Math.round(area.y * scaleY),
        width: Math.round(area.width * scaleX),
        height: Math.round(area.height * scaleY)
      };
      
      console.log('📐 Single display scaling:', { scaleX, scaleY });
    } else {
      // 多显示器：需要考虑显示器相对位置
      if (selectedSource.display_id === targetDisplay.id.toString()) {
        // 如果源和目标显示器匹配，使用相对坐标
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
        // 如果源包含多个显示器，使用绝对坐标
        // 计算总虚拟屏幕尺寸
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

    // 边界检查
    cropArea.x = Math.max(0, Math.min(cropArea.x, sourceSize.width - 1));
    cropArea.y = Math.max(0, Math.min(cropArea.y, sourceSize.height - 1));
    cropArea.width = Math.max(1, Math.min(cropArea.width, sourceSize.width - cropArea.x));
    cropArea.height = Math.max(1, Math.min(cropArea.height, sourceSize.height - cropArea.y));

    console.log('✂️ Final crop area:', cropArea);

    // 裁剪图片
    const croppedImage = selectedSource.thumbnail.crop(cropArea);

    // 验证结果
    const resultSize = croppedImage.getSize();
    if (resultSize.width === 0 || resultSize.height === 0) {
      throw new Error('Cropped image is empty');
    }

    // 保存截图
    const timestamp = Date.now();
    const filename = `screenshot-${timestamp}.png`;
    const tempPath = path.join(app.getPath('temp'), filename);
    
    const buffer = croppedImage.toPNG();
    fs.writeFileSync(tempPath, buffer);
    addTempFile(tempPath);
    
    console.log(`✅ Screenshot saved: ${tempPath}`);
    console.log(`📊 Result: ${resultSize.width}x${resultSize.height} (${(buffer.length/1024).toFixed(1)}KB)`);
    
    // 关闭截图窗口
    closeScreenshotWindow();
    
    // 发送完成事件
    if (mainWindow && !mainWindow.isDestroyed()) {
      console.log('📤 Sending screenshot-complete event');
      mainWindow.show();
      mainWindow.focus();
      
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('screenshot-complete', tempPath);
          console.log('✅ Event sent successfully');
        }
      }, 100);
    }
    
    return tempPath;
    
  } catch (error) {
    console.error('❌ Screenshot failed:', error);
    closeScreenshotWindow();
    throw error;
  }
}

// 关闭截图窗口
function closeScreenshotWindow(): void {
  console.log('Closing screenshot windows...');
  
  // 关闭所有截图窗口
  screenshotWindows.forEach((window, index) => {
    if (!window.isDestroyed()) {
      window.hide();
      console.log(`✅ Screenshot window [${index}] hidden`);
    }
  });
  
  console.log(`✅ All ${screenshotWindows.length} screenshot windows hidden`);
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

// 获取设置
ipcMain.handle('get-settings', () => {
  return store.store;
});

// 保存设置
ipcMain.handle('save-settings', (event, settings: Partial<AppSettings>) => {
  for (const [key, value] of Object.entries(settings)) {
    store.set(key as keyof AppSettings, value);
  }
  
  // 如果快捷键发生变化，重新注册
  if (settings.shortcuts) {
    globalShortcut.unregisterAll();
    registerGlobalShortcuts();
  }
});

// 公式识别
ipcMain.handle('recognize-formula', async (event, imagePath: string, apiConfig: ApiConfig): Promise<SimpletexResponse> => {
  try {
    console.log('Starting formula recognition:', imagePath);
    
    const imageBuffer = fs.readFileSync(imagePath);
    const { header, reqData } = getReqData({}, apiConfig);
    
    console.log('Generated header:', header);
    console.log('Generated reqData:', reqData);
    
    // 构建签名字符串来验证
    const params: string[] = [];
    for (const key of Object.keys(reqData).sort()) {
      params.push(`${key}=${reqData[key]}`);
    }
    for (const key of ['app-id', 'random-str', 'timestamp']) {
      params.push(`${key}=${header[key]}`);
    }
    params.push(`secret=${apiConfig.appSecret}`);
    const preSignString = params.join('&');
    console.log('TypeScript signed string:', preSignString);
    
    // 使用 form-data 包创建表单数据，只包含文件和普通数据
    const formData = new FormData();
    formData.append('file', imageBuffer, {
      filename: path.basename(imagePath),
      contentType: 'image/png'
    });
    
    // 添加普通数据字段（如果有的话）
    for (const [key, value] of Object.entries(reqData)) {
      formData.append(key, value);
    }
    
    console.log('Sending API request...');
    console.log('Request headers:', {
      ...formData.getHeaders(),
      ...header
    });
    
    const response = await axios.post('https://server.simpletex.cn/api/latex_ocr', formData, {
      headers: {
        ...formData.getHeaders(),
        ...header
      },
      timeout: 30000
    });

    console.log('API response status:', response.status);
    console.log('API response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Formula recognition failed:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Request config:', error.config);
    }
    throw error;
  }
});

// 注册全局快捷键
ipcMain.handle('register-global-shortcuts', (event, shortcuts: { capture: string; upload: string }) => {
  globalShortcut.unregisterAll();
  
  try {
    globalShortcut.register(shortcuts.capture, () => {
      if (mainWindow) {
        mainWindow.minimize();
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
    console.error('Failed to register global shortcuts:', error);
    return false;
  }
});

// 取消注册全局快捷键
ipcMain.handle('unregister-global-shortcuts', () => {
  globalShortcut.unregisterAll();
});

// 窗口操作
ipcMain.handle('minimize-window', () => {
  mainWindow?.minimize();
});

ipcMain.handle('close-window', () => {
  // 使用强制退出函数确保应用完全退出
  forceQuitApp();
  return true;
});

// 关闭截图窗口
ipcMain.handle('close-screenshot-window', () => {
  console.log('IPC: close-screenshot-window called');
  closeScreenshotWindow();
});

// 截图完成
ipcMain.handle('screenshot-complete', (event, imagePath: string) => {
  console.log('=== Processing screenshot completed ===');
  console.log('Screenshot completed, image path:', imagePath);
  
  // 关闭截图窗口
  screenshotWindows.forEach(window => {
    if (!window.isDestroyed()) {
      window.close();
    }
  });
  screenshotWindows.length = 0;
  console.log('Closed all screenshot windows');
  
  if (mainWindow) {
    console.log('Show main window and get focus');
    mainWindow.show();
    mainWindow.focus();
    
    // 等待一下确保窗口完全显示
    setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        console.log('Sending screenshot completed event to main window:', imagePath);
        mainWindow.webContents.send('screenshot-complete', imagePath);
        console.log('Screenshot completed event sent');
        
        // 检查webContents状态
        console.log('Main window webContents state:');
        console.log('- isLoading:', mainWindow.webContents.isLoading());
        console.log('- getURL:', mainWindow.webContents.getURL());
      }
    }, 100);
  } else {
    console.error('Main window does not exist, cannot send screenshot completed event');
  }
});

// 临时文件管理
ipcMain.handle('cleanup-temp-files', () => {
  cleanupAllTempFiles();
});

ipcMain.handle('remove-temp-file', (event, filePath: string) => {
  return removeTempFile(filePath);
});

ipcMain.handle('get-temp-files-count', () => {
  return tempFiles.size;
});

// 获取显示器调试信息
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
    
    // 分析屏幕源和显示器的匹配关系
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
    console.error('Failed to get display information:', error);
    throw error;
  }
});

// 简化的测试功能（暂时禁用复杂测试）
ipcMain.handle('test-display-screenshot', async (event, displayIndex: number) => {
  console.log(`简化截图系统：测试显示器 ${displayIndex}`);
  return { message: '简化截图系统已启用，复杂测试功能已禁用' };
});

// 添加诊断屏幕源的函数
ipcMain.handle('diagnose-screen-sources', async () => {
  try {
    console.log('\n🔍 ===== SCREEN SOURCE DIAGNOSIS =====');
    
    const displays = screen.getAllDisplays();
    console.log(`🖥️ System displays: ${displays.length}`);
    
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 8192, height: 8192 }
    });
    console.log(`📺 Available sources: ${sources.length}`);
    
    const diagnosis = {
      displays: displays.map((d, i) => ({
        index: i,
        id: d.id,
        bounds: d.bounds,
        scaleFactor: d.scaleFactor,
        primary: d.id === screen.getPrimaryDisplay().id
      })),
      sources: sources.map((s, i) => ({
        index: i,
        name: s.name,
        id: s.id,
        display_id: s.display_id,
        size: s.thumbnail.getSize()
      })),
      matching: [] as Array<{
        displayIndex: number;
        displayId: number;
        matchingSourceIndices: number[];
      }>
    };
    
    // 分析匹配关系
    displays.forEach((display, di) => {
      const matchingSources = sources.filter(s => s.display_id === display.id.toString());
      diagnosis.matching.push({
        displayIndex: di,
        displayId: display.id,
        matchingSourceIndices: matchingSources.map(s => sources.findIndex(src => src.id === s.id))
      });
    });
    
    console.log('📊 Diagnosis completed:', JSON.stringify(diagnosis, null, 2));
    console.log('🔍 ===== SCREEN SOURCE DIAGNOSIS END =====\n');
    
    return diagnosis;
    
  } catch (error) {
    console.error('❌ Screen source diagnosis failed:', error);
    throw error;
  }
});

// 测试所有显示器的截图功能（简化版本）
ipcMain.handle('test-all-displays', async () => {
  try {
    console.log('\n🧪 ===== TESTING ALL DISPLAYS (SIMPLIFIED) =====');
    
    const displays = screen.getAllDisplays();
    console.log(`🖥️ Found ${displays.length} displays`);
    
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 150, height: 150 }
    });
    console.log(`📺 Found ${sources.length} sources`);
    
    return {
      totalDisplays: displays.length,
      totalSources: sources.length,
      message: '简化截图系统已启用，详细测试功能已禁用',
      displays: displays.map((d, i) => ({
        index: i,
        id: d.id,
        bounds: d.bounds,
        scaleFactor: d.scaleFactor
      })),
      sources: sources.map((s, i) => ({
        index: i,
        name: s.name,
        id: s.id,
        display_id: s.display_id
      }))
    };
    
  } catch (error) {
    console.error('❌ Simplified test failed:', error);
    throw error;
  }
});

// 在Windows平台上强制终止所有相关进程
function terminateAllProcesses(): void {
  if (process.platform === 'win32') {
    try {
      // 在Windows上使用taskkill命令强制终止所有相关进程
      const { execSync } = require('child_process');
      
      // 可能的进程名称列表
      const possibleProcessNames = [
        'LaTeX公式识别工具.exe',
        'electron.exe',
        'SimpleTex-OCR.exe',
        'node.exe'
      ];
      
      console.log('尝试终止所有相关进程...');
      
      // 尝试终止每个可能的进程
      for (const processName of possibleProcessNames) {
        try {
          console.log(`尝试终止进程: ${processName}`);
          // /F 强制终止 /IM 按进程名称 /T 终止指定的进程和由它启动的子进程
          execSync(`taskkill /F /IM "${processName}" /T`, { windowsHide: true });
          console.log(`成功发送终止命令: ${processName}`);
        } catch (err) {
          // 忽略错误，可能是进程已经不存在
          console.log(`终止进程 ${processName} 时出现错误，可能进程已不存在`);
        }
      }
      
      // 终止当前进程
      process.exit(0);
    } catch (error) {
      console.error('终止进程失败:', error);
      // 确保最终退出
      process.exit(0);
    }
  }
}

// 检测和终止可能的僵尸进程
function killZombieProcesses(): void {
  if (process.platform === 'win32') {
    try {
      console.log('检测和终止可能的僵尸进程...');
      const { execSync } = require('child_process');
      
      // 可能的进程名称列表
      const possibleProcessNames = [
        'LaTeX公式识别工具.exe',
        'electron.exe',
        'SimpleTex-OCR.exe'
      ];
      
      // 获取当前进程ID
      const currentPid = process.pid;
      console.log(`当前进程ID: ${currentPid}`);
      
      // 尝试终止除当前进程外的所有相关进程
      for (const processName of possibleProcessNames) {
        try {
          // 获取所有匹配的进程ID
          const output = execSync(`wmic process where "name='${processName}'" get processid`, { encoding: 'utf8' });
          const lines = output.split('\n').filter((line: string) => line.trim() !== '' && line.trim().toLowerCase() !== 'processid');
          
          for (const line of lines) {
            const pid = line.trim();
            if (pid && pid !== String(currentPid)) {
              console.log(`发现可能的僵尸进程: ${processName} (PID: ${pid}), 尝试终止...`);
              try {
                execSync(`taskkill /F /PID ${pid}`, { windowsHide: true });
                console.log(`成功终止进程 PID: ${pid}`);
              } catch (killErr) {
                console.log(`终止进程 PID: ${pid} 失败`);
              }
            }
          }
        } catch (err) {
          // 忽略错误
          console.log(`查找进程 ${processName} 时出错`);
        }
      }
      
      console.log('僵尸进程检查完成');
    } catch (error) {
      console.error('检测僵尸进程时出错:', error);
    }
  }
}

// 强制退出应用
function forceQuitApp(): void {
  console.log('强制退出应用...');
  
  // 清理资源
  globalShortcut.unregisterAll();
  
  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
  }
  
  // 关闭所有窗口
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
        console.error('关闭窗口时出错');
      }
    }
  });
  
  // 清理临时文件
  cleanupAllTempFiles();
  
  // 释放其他资源
  if (mainWindow && !mainWindow.isDestroyed()) {
    try {
      mainWindow.webContents.session.clearCache();
      mainWindow.webContents.session.clearStorageData();
    } catch (e) {
      console.error('清理缓存时出错');
    }
  }
  
  // 强制退出
  console.log('执行强制退出...');
  app.removeAllListeners();
  app.releaseSingleInstanceLock();  // 释放单例锁
  
  // 在Windows平台上，直接使用终止进程函数
  if (process.platform === 'win32') {
    console.log('Windows平台，使用terminateAllProcesses终止所有进程');
    terminateAllProcesses();
  } else {
    // 非Windows平台，使用常规方法退出
    console.log('非Windows平台，使用常规方法退出');
    app.quit();
    app.exit(0);
    process.exit(0);
  }
}