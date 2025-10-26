// 历史记录项类型
export interface HistoryItem {
  date: string;
  latex: string;
}

// AI模型提供商配置
export interface ModelScopeConfig {
  apiKey: string;
  enabled: boolean;
  model: string; // 选中的模型名称
}

// 扩展 API 配置，支持魔搭
export interface ApiConfig {
  appId: string;
  appSecret: string;
  endpoint?: string;
  modelScope?: ModelScopeConfig;
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
// 侧边栏菜单项配置
export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  visible: boolean;
  order: number;
  type: 'view' | 'action';
}

export interface SidebarConfig {
  items: SidebarItem[];
}

export interface AppSettings {
  apiConfig: ApiConfig;
  shortcuts: ShortcutConfig;
  history: HistoryItem[];
  theme?: string; // 主题ID
  sidebarConfig?: SidebarConfig; // 侧边栏配置
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
  history: HistoryItem[];
  statusMessage: string | null;
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
  // 新增：获取文件大小（字节）
  getFileSize?: (filePath: string) => Promise<number>;
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
  
  // 打开外部链接和开发者工具
  openExternal: (url: string) => Promise<void>;
  openDevTools: () => Promise<void>;
  
  // 更新窗口主题颜色
  updateWindowTheme: (backgroundColor: string, textColor: string) => Promise<{ success: boolean; message?: string }>;
  
  // 窗口控制
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  isWindowMaximized: () => Promise<boolean>;
  onWindowStateChange: (callback: (maximized: boolean) => void) => (() => void) | undefined;
  
  // 数据管理
  getDataPaths: () => Promise<{ dataPath: string; logPath: string }>;
  getCacheSize: () => Promise<{ size: string }>;
  backupData: (simple: boolean) => Promise<{ success: boolean; filePath?: string; message?: string }>;
  restoreData: () => Promise<{ success: boolean; message?: string }>;
  openDataFolder: () => Promise<void>;
  openLogFolder: () => Promise<void>;
  clearKnowledge: () => Promise<{ success: boolean; count?: number; message?: string }>;
  clearCache: () => Promise<{ success: boolean; size?: string; message?: string }>;
  resetAllData: () => Promise<{ success: boolean; message?: string }>;
  restartApp: () => Promise<void>;
  
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