// 历史记录项类型
export interface HistoryItem {
  date: string;
  latex: string;
}

// DeepSeek API 配置
export interface DeepSeekConfig {
  apiKey: string;
  enabled: boolean;
}

// 扩展 API 配置，支持 DeepSeek
export interface ApiConfig {
  appId: string;
  appSecret: string;
  endpoint?: string;
  deepSeek?: DeepSeekConfig;
}

// 公式解释结果
export interface FormulaExplanation {
  content: string;
  timestamp: string;
  isLoading: boolean;
  error?: string;
}

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
export interface AppSettings {
  apiConfig: ApiConfig;
  shortcuts: ShortcutConfig;
  history: HistoryItem[];
}
export interface ShortcutConfig {
  capture: string;
  upload: string;
}

export type CopyMode = 'normal' | 'inline' | 'display' | 'equation' | 'mathml';
export interface AppState {
  currentImage: string | null;
  latexCode: string;
  isRecognizing: boolean;
  statusMessage: string;
  history: HistoryItem[];
}
export interface ScreenshotArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

// 添加RecognitionResult接口定义
export interface RecognitionResult {
  status: boolean;
  message?: string;
  error_code?: string;
  res?: {
    latex: string;
    [key: string]: any;
  };
}

// Electron API类型
export interface ElectronAPI {
  selectFile: () => Promise<string | null>;
  saveFile: (content: string, filename: string) => Promise<boolean>;
  saveDocxFile: (content: string, filename: string) => Promise<boolean>;
  saveTempFile: (buffer: Uint8Array, filename: string) => Promise<string>;
  
  takeScreenshot: (area: ScreenshotArea) => Promise<string>;
  showScreenshotOverlay: () => Promise<void>;
  forceTestSecondScreen: () => Promise<any>;
  
  copyToClipboard: (text: string) => Promise<void>;
  
  getSettings: () => Promise<AppSettings>;
  saveSettings: (settings: Partial<AppSettings>) => Promise<void>;
  saveApiToSettingsFile: (apiConfig: ApiConfig) => Promise<boolean>;
  clearApiConfig: () => Promise<boolean>;
  
  recognizeFormula: (imagePath: string, apiConfig: ApiConfig) => Promise<SimpletexResponse>;
  recognizeHandwriting: (imageData: string, apiConfig: ApiConfig) => Promise<SimpletexResponse>;
  saveHandwritingImage: (imageData: string) => Promise<string>;
  
  registerGlobalShortcuts: (shortcuts: { capture: string; upload: string }) => Promise<boolean>;
  unregisterGlobalShortcuts: () => Promise<void>;
  
  minimizeWindow: () => Promise<void>;
  closeWindow: () => Promise<boolean>;
  
  onShortcutTriggered: (callback: (action: 'capture' | 'upload') => void) => void;
  removeShortcutTriggeredListener: (callback: (action: 'capture' | 'upload') => void) => void;
  
  onScreenshotComplete: (callback: (imagePath: string) => void) => void;
  removeScreenshotCompleteListener: (callback: (imagePath: string) => void) => void;
  
  // 自动更新相关
  checkForUpdates: () => Promise<{ success: boolean; message: string }>;
  downloadUpdate: () => Promise<{ success: boolean; message: string }>;
  quitAndInstall: () => Promise<void>;
  onCheckingForUpdate: (callback: () => void) => void;
  onUpdateAvailable: (callback: (info: any) => void) => void;
  onUpdateNotAvailable: (callback: (info: any) => void) => void;
  onUpdateError: (callback: (error: string) => void) => void;
  onDownloadProgress: (callback: (progressObj: any) => void) => void;
  onUpdateDownloaded: (callback: (info: any) => void) => void;
  removeUpdateListeners: () => void;
  
  cleanupTempFiles: () => Promise<{ success: boolean; count: number }>;
  removeTempFile: (filePath: string) => Promise<boolean>;
  getTempFilesCount: () => Promise<{ count: number }>;
  
  // 诊断屏幕相关
  getDisplayInfo: () => Promise<any>;
  testDisplayScreenshot: (displayIndex: number, testArea?: ScreenshotArea) => Promise<string>;
  diagnoseScreenSources: () => Promise<any>;
  testAllDisplays: () => Promise<any>;
  
  // 导出公式图片
  exportFormulaImage: (latexContent: string, format: 'svg' | 'png' | 'jpg') => Promise<{
    success: boolean;
    filePath?: string;
    message: string;
  }>;
  
  // 窗口置顶
  setAlwaysOnTop: (alwaysOnTop: boolean) => Promise<{ success: boolean; alwaysOnTop: boolean }>;
  getAlwaysOnTop: () => Promise<{ success: boolean; alwaysOnTop: boolean }>;
  
  // IPC设置
  setMaxListeners: (count: number) => void;
}

// 自动更新相关类型
export interface UpdateInfo {
  version: string;
  files?: Array<{
    url: string;
    sha512?: string;
    size?: number;
    blockMapSize?: number;
  }>;
  path?: string;
  sha512?: string;
  releaseDate?: string;
  releaseName?: string;
  releaseNotes?: string;
  stagingPercentage?: number;
  isPrerelease?: boolean;
  tag?: string;
}

export interface ProgressInfo {
  bytesPerSecond: number;
  percent: number;
  transferred: number;
  total: number;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
} 