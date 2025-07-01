// 历史记录项类型
export interface HistoryItem {
  date: string;
  latex: string;
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
export interface ApiConfig {
  appId: string;
  appSecret: string;
  endpoint?: string;
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
  

  registerGlobalShortcuts: (shortcuts: { capture: string; upload: string }) => Promise<boolean>;
  unregisterGlobalShortcuts: () => Promise<void>;
  

  minimizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;

  onShortcutTriggered: (callback: (action: 'capture' | 'upload') => void) => void;
  onScreenshotComplete: (callback: (imagePath: string) => void) => void;

  cleanupTempFiles: () => Promise<void>;
  removeTempFile: (filePath: string) => Promise<boolean>;
  getTempFilesCount: () => Promise<number>;
  getDisplayInfo: () => Promise<any>;
  testDisplayScreenshot: (displayIndex: number, testArea?: ScreenshotArea) => Promise<any>;
  diagnoseScreenSources: () => Promise<any>;
  testAllDisplays: () => Promise<any>;

  exportFormulaImage: (latexContent: string, format: 'svg' | 'png' | 'jpg') => Promise<{
    success: boolean;
    filePath?: string;
    message: string;
  }>;

  setAlwaysOnTop: (alwaysOnTop: boolean) => Promise<{ success: boolean; alwaysOnTop?: boolean; message?: string }>;
  getAlwaysOnTop: () => Promise<{ success: boolean; alwaysOnTop: boolean }>;
  
  // 自动更新相关API
  checkForUpdates: () => Promise<{ success: boolean; message: string }>;
  onCheckingForUpdate: (callback: () => void) => void;
  onUpdateAvailable: (callback: (info: UpdateInfo) => void) => void;
  onUpdateNotAvailable: (callback: (info: UpdateInfo) => void) => void;
  onUpdateError: (callback: (error: string) => void) => void;
  onDownloadProgress: (callback: (progressObj: ProgressInfo) => void) => void;
  onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => void;
}

// 自动更新相关类型
export interface UpdateInfo {
  version: string;
  releaseDate?: string;
  releaseNotes?: string;
  path?: string;
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