// 历史记录项类型
export interface HistoryItem {
  date: string;
  latex: string;
}

// API响应类型
export interface SimpletexResponse {
  status: boolean;
  message?: string;
  error_code?: string;
  request_id?: string;
  res?: {
    latex: string;
    conf?: number;
  };
}

// API配置类型
export interface ApiConfig {
  appId: string;
  appSecret: string;
  endpoint?: string;
}

// 应用设置类型
export interface AppSettings {
  apiConfig: ApiConfig;
  shortcuts: ShortcutConfig;
  history: HistoryItem[];
}

// 快捷键配置类型
export interface ShortcutConfig {
  capture: string;
  upload: string;
}

// 复制模式类型
export type CopyMode = 'normal' | 'inline' | 'display' | 'mathml';

// 应用状态类型
export interface AppState {
  currentImage: string | null;
  latexCode: string;
  isRecognizing: boolean;
  statusMessage: string;
  history: HistoryItem[];
}

// 截图区域类型
export interface ScreenshotArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Electron API类型
export interface ElectronAPI {
  // 文件操作
  selectFile: () => Promise<string | null>;
  saveFile: (content: string, filename: string) => Promise<boolean>;
  saveDocxFile: (content: string, filename: string) => Promise<boolean>;
  saveTempFile: (buffer: Uint8Array, filename: string) => Promise<string>;
  
  // 截图相关
  takeScreenshot: (area: ScreenshotArea) => Promise<string>;
  showScreenshotOverlay: () => Promise<void>;
  forceTestSecondScreen: () => Promise<any>;
  
  // 剪贴板操作
  copyToClipboard: (text: string) => Promise<void>;
  
  // 存储操作
  getSettings: () => Promise<AppSettings>;
  saveSettings: (settings: Partial<AppSettings>) => Promise<void>;
  saveApiToSettingsFile: (apiConfig: ApiConfig) => Promise<boolean>;
  clearApiConfig: () => Promise<boolean>;
  
  // 网络请求
  recognizeFormula: (imagePath: string, apiConfig: ApiConfig) => Promise<SimpletexResponse>;
  
  // 全局快捷键
  registerGlobalShortcuts: (shortcuts: { capture: string; upload: string }) => Promise<boolean>;
  unregisterGlobalShortcuts: () => Promise<void>;
  
  // 窗口操作
  minimizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  
  // 事件监听
  onShortcutTriggered: (callback: (action: 'capture' | 'upload') => void) => void;
  onScreenshotComplete: (callback: (imagePath: string) => void) => void;
  
  // 临时文件管理
  cleanupTempFiles: () => Promise<void>;
  removeTempFile: (filePath: string) => Promise<boolean>;
  getTempFilesCount: () => Promise<number>;

  // 调试功能
  getDisplayInfo: () => Promise<any>;
  testDisplayScreenshot: (displayIndex: number, testArea?: ScreenshotArea) => Promise<any>;
  diagnoseScreenSources: () => Promise<any>;
  testAllDisplays: () => Promise<any>;
}

// 扩展全局Window接口
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
} 