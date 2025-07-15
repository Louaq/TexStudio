export interface HistoryItem {
    date: string;
    latex: string;
}
export interface SimpletexResponse {
    status: boolean;
    message?: string;
    res?: {
        latex: string;
    };
}
export interface ApiConfig {
    appId: string;
    appSecret: string;
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
    history: HistoryItem[];
}
export interface ScreenshotArea {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface ElectronAPI {
    selectFile: () => Promise<string | null>;
    saveFile: (content: string, filename: string) => Promise<boolean>;
    takeScreenshot: (area: ScreenshotArea) => Promise<string>;
    showScreenshotOverlay: () => void;
    copyToClipboard: (text: string) => void;
    getSettings: () => Promise<AppSettings>;
    saveSettings: (settings: Partial<AppSettings>) => Promise<void>;
    recognizeFormula: (imagePath: string, apiConfig: ApiConfig) => Promise<SimpletexResponse>;
    registerGlobalShortcuts: (shortcuts: ShortcutConfig) => Promise<void>;
    unregisterGlobalShortcuts: () => Promise<void>;
    minimizeWindow: () => void;
    closeWindow: () => void;
    onShortcutTriggered: (callback: (action: 'capture' | 'upload') => void) => void;
    onScreenshotComplete: (callback: (imagePath: string) => void) => void;
}
declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}
//# sourceMappingURL=index.d.ts.map