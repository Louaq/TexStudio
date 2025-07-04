import { contextBridge, ipcRenderer } from 'electron';
import { ElectronAPI, ApiConfig, AppSettings, ScreenshotArea } from '../types';

// 定义 Electron API
const electronAPI: ElectronAPI = {
  selectFile: () => ipcRenderer.invoke('select-file'),
  saveFile: (content: string, filename: string) => ipcRenderer.invoke('save-file', content, filename),
  saveDocxFile: (content: string, filename: string) => ipcRenderer.invoke('save-docx-file', content, filename),
  saveTempFile: (buffer: Uint8Array, filename: string) => ipcRenderer.invoke('save-temp-file', buffer, filename),

  takeScreenshot: (area: ScreenshotArea) => ipcRenderer.invoke('take-screenshot', area),
  showScreenshotOverlay: () => ipcRenderer.invoke('show-screenshot-overlay'),
  forceTestSecondScreen: () => ipcRenderer.invoke('force-test-second-screen'),

  copyToClipboard: (text: string) => ipcRenderer.invoke('copy-to-clipboard', text),

  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: Partial<AppSettings>) => ipcRenderer.invoke('save-settings', settings),
  saveApiToSettingsFile: (apiConfig: ApiConfig) => ipcRenderer.invoke('save-api-to-settings-file', apiConfig),
  clearApiConfig: () => ipcRenderer.invoke('clear-api-config'),

  recognizeFormula: (imagePath: string, apiConfig: ApiConfig) => 
    ipcRenderer.invoke('recognize-formula', imagePath, apiConfig),

  registerGlobalShortcuts: (shortcuts: { capture: string; upload: string }) => 
    ipcRenderer.invoke('register-global-shortcuts', shortcuts),
  unregisterGlobalShortcuts: () => ipcRenderer.invoke('unregister-global-shortcuts'),

  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),

  onShortcutTriggered: (callback: (action: 'capture' | 'upload') => void) => {
    ipcRenderer.on('shortcut-triggered', (event, action) => callback(action));
  },
  onScreenshotComplete: (callback: (imagePath: string) => void) => {
    ipcRenderer.on('screenshot-complete', (event, imagePath) => callback(imagePath));
  },
  
  // 自动更新相关
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  onCheckingForUpdate: (callback: () => void) => {
    ipcRenderer.on('checking-for-update', () => callback());
  },
  onUpdateAvailable: (callback: (info: any) => void) => {
    ipcRenderer.on('update-available', (event, info) => callback(info));
  },
  onUpdateNotAvailable: (callback: (info: any) => void) => {
    ipcRenderer.on('update-not-available', (event, info) => callback(info));
  },
  onUpdateError: (callback: (error: string) => void) => {
    ipcRenderer.on('update-error', (event, error) => callback(error));
  },
  onDownloadProgress: (callback: (progressObj: any) => void) => {
    ipcRenderer.on('download-progress', (event, progressObj) => callback(progressObj));
  },
  onUpdateDownloaded: (callback: (info: any) => void) => {
    ipcRenderer.on('update-downloaded', (event, info) => callback(info));
  },

  cleanupTempFiles: () => ipcRenderer.invoke('cleanup-temp-files'),
  removeTempFile: (filePath: string) => ipcRenderer.invoke('remove-temp-file', filePath),
  getTempFilesCount: () => ipcRenderer.invoke('get-temp-files-count'),
  getDisplayInfo: () => ipcRenderer.invoke('get-display-info'),
  testDisplayScreenshot: (displayIndex: number, testArea?: ScreenshotArea) => 
    ipcRenderer.invoke('test-display-screenshot', displayIndex, testArea),
  diagnoseScreenSources: () => ipcRenderer.invoke('diagnose-screen-sources'),
  testAllDisplays: () => ipcRenderer.invoke('test-all-displays'),

  exportFormulaImage: (latexContent: string, format: 'svg' | 'png' | 'jpg') => 
    ipcRenderer.invoke('export-formula-image', latexContent, format),

  setAlwaysOnTop: (alwaysOnTop: boolean) => ipcRenderer.invoke('set-always-on-top', alwaysOnTop),
  getAlwaysOnTop: () => ipcRenderer.invoke('get-always-on-top')
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

const screenshotAPI = {
  takeScreenshot: (area: ScreenshotArea) => ipcRenderer.invoke('take-screenshot', area),
  takeSimpleScreenshot: (area: { x: number; y: number; width: number; height: number }) => 
    ipcRenderer.invoke('take-simple-screenshot', area),
  closeScreenshotWindow: () => ipcRenderer.invoke('close-screenshot-window'),
  screenshotComplete: (imagePath: string) => ipcRenderer.invoke('screenshot-complete', imagePath),

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
          // 错误处理已静默
        }
      } else if (arg.startsWith('--display-scale=')) {
        displayInfo.scaleFactor = parseFloat(arg.split('=')[1]);
      }
    });
    
    return displayInfo;
  }
};

contextBridge.exposeInMainWorld('screenshotAPI', screenshotAPI); 