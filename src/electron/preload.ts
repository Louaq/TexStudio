import { contextBridge, ipcRenderer } from 'electron';
import { ElectronAPI, ApiConfig, AppSettings, ScreenshotArea } from '../types';

// 定义 Electron API
const electronAPI: ElectronAPI = {
  // 文件操作
  selectFile: () => ipcRenderer.invoke('select-file'),
  saveFile: (content: string, filename: string) => ipcRenderer.invoke('save-file', content, filename),
  saveDocxFile: (content: string, filename: string) => ipcRenderer.invoke('save-docx-file', content, filename),
  saveTempFile: (buffer: Uint8Array, filename: string) => ipcRenderer.invoke('save-temp-file', buffer, filename),

  // 截图相关
  takeScreenshot: (area: ScreenshotArea) => ipcRenderer.invoke('take-screenshot', area),
  showScreenshotOverlay: () => ipcRenderer.invoke('show-screenshot-overlay'),
  forceTestSecondScreen: () => ipcRenderer.invoke('force-test-second-screen'),

  // 剪贴板操作
  copyToClipboard: (text: string) => ipcRenderer.invoke('copy-to-clipboard', text),

  // 存储操作
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: Partial<AppSettings>) => ipcRenderer.invoke('save-settings', settings),
  saveApiToSettingsFile: (apiConfig: ApiConfig) => ipcRenderer.invoke('save-api-to-settings-file', apiConfig),
  clearApiConfig: () => ipcRenderer.invoke('clear-api-config'),

  // 网络请求
  recognizeFormula: (imagePath: string, apiConfig: ApiConfig) => 
    ipcRenderer.invoke('recognize-formula', imagePath, apiConfig),

  // 全局快捷键
  registerGlobalShortcuts: (shortcuts: { capture: string; upload: string }) => 
    ipcRenderer.invoke('register-global-shortcuts', shortcuts),
  unregisterGlobalShortcuts: () => ipcRenderer.invoke('unregister-global-shortcuts'),

  // 窗口操作
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),

  // 事件监听
  onShortcutTriggered: (callback: (action: 'capture' | 'upload') => void) => {
    ipcRenderer.on('shortcut-triggered', (event, action) => callback(action));
  },
  onScreenshotComplete: (callback: (imagePath: string) => void) => {
    ipcRenderer.on('screenshot-complete', (event, imagePath) => callback(imagePath));
  },
  
  // 临时文件管理
  cleanupTempFiles: () => ipcRenderer.invoke('cleanup-temp-files'),
  removeTempFile: (filePath: string) => ipcRenderer.invoke('remove-temp-file', filePath),
  getTempFilesCount: () => ipcRenderer.invoke('get-temp-files-count'),

  // 调试功能
  getDisplayInfo: () => ipcRenderer.invoke('get-display-info'),
  testDisplayScreenshot: (displayIndex: number, testArea?: ScreenshotArea) => 
    ipcRenderer.invoke('test-display-screenshot', displayIndex, testArea),
  diagnoseScreenSources: () => ipcRenderer.invoke('diagnose-screen-sources'),
  testAllDisplays: () => ipcRenderer.invoke('test-all-displays'),

  // 数学公式导出
  exportFormulaImage: (latexContent: string, format: 'svg' | 'png' | 'jpg') => 
    ipcRenderer.invoke('export-formula-image', latexContent, format),

  // 窗口置顶功能
  setAlwaysOnTop: (alwaysOnTop: boolean) => ipcRenderer.invoke('set-always-on-top', alwaysOnTop),
  getAlwaysOnTop: () => ipcRenderer.invoke('get-always-on-top')
};

// 将 API 暴露给渲染进程
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// 截图窗口特有的API
const screenshotAPI = {
  takeScreenshot: (area: ScreenshotArea) => ipcRenderer.invoke('take-screenshot', area),
  takeSimpleScreenshot: (area: { x: number; y: number; width: number; height: number }) => 
    ipcRenderer.invoke('take-simple-screenshot', area),
  closeScreenshotWindow: () => ipcRenderer.invoke('close-screenshot-window'),
  screenshotComplete: (imagePath: string) => ipcRenderer.invoke('screenshot-complete', imagePath),
  
  // 获取显示器信息（从命令行参数）
  getDisplayInfo: () => {
    const args = process.argv;
    const displayInfo: any = {};
    
    args.forEach(arg => {
      if (arg.startsWith('--display-id=')) {
        displayInfo.id = parseInt(arg.split('=')[1]);
      } else if (arg.startsWith('--display-index=')) {
        displayInfo.index = parseInt(arg.split('=')[1]);
      } else if (arg.startsWith('--display-bounds=')) {
        try {
          displayInfo.bounds = JSON.parse(arg.split('=')[1]);
        } catch (e) {
          console.error('解析显示器边界失败:', e);
        }
      } else if (arg.startsWith('--display-scale=')) {
        displayInfo.scaleFactor = parseFloat(arg.split('=')[1]);
      }
    });
    
    return displayInfo;
  }
};

contextBridge.exposeInMainWorld('screenshotAPI', screenshotAPI); 