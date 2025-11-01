import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';
import { AppState, HistoryItem, ApiConfig, CopyMode, SidebarConfig } from './types';
import { formatLatex, getCurrentTimestamp, validateApiConfig } from './utils/api';
import TitleBar from './components/TitleBar';
import Sidebar, { getDefaultSidebarConfig } from './components/Sidebar';
import HomeView from './views/HomeView';
import SettingsView from './views/SettingsView';
import HistoryView from './views/HistoryView';
import AboutView from './views/AboutView';
import UpdateDialog from './components/UpdateDialog';
import CopyOptionsDialog from './components/CopyOptionsDialog';
import ExportOptionsDialog from './components/ExportOptionsDialog';
import NotificationBar from './components/NotificationBar';
import * as path from 'path';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-background);
  font-family: "Segoe UI", "Microsoft YaHei", sans-serif;
  color: var(--color-text);
  overflow: hidden;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  overflow: hidden;
`;

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-background);
  background-image: 
    repeating-linear-gradient(
      45deg, 
      var(--color-backgroundPattern), 
      var(--color-backgroundPattern) 15px, 
      transparent 15px, 
      transparent 30px
    );
`;

// 删除所有旧的样式定义，新的视图组件中已包含

type UpdateStatus = 'idle' | 'checking' | 'available' | 'no-update' | 'downloading' | 'downloaded' | 'error';

interface UpdateInfoState {
  showDialog: boolean;
  showIndicator: boolean;
  status: UpdateStatus;
  version: string;
}

interface AppProps {
  onThemeChange?: (themeId: string) => void;
}

function App({ onThemeChange: onThemeChangeFromIndex }: AppProps = {}) {
  const [appState, setAppState] = useState<AppState>({
    currentImage: null,
    latexCode: '',
    isRecognizing: false,
    history: [],
    statusMessage: null
  });

  // 添加更新状态管理
  const [updateInfo, setUpdateInfo] = useState<UpdateInfoState>({
    showDialog: false,
    showIndicator: false,
    status: 'idle', // 'checking', 'available', 'no-update', 'downloading', 'downloaded', 'error'
    version: '',
  });
  const [downloadProgress, setDownloadProgress] = useState(0);

  // 移除之前添加的防抖状态
  // const [isUploadInProgress, setIsUploadInProgress] = useState(false);
  // 使用useRef存储事件处理函数，避免创建多个实例
  const eventHandlersRef = useRef<{
    handleShortcut: ((action: 'capture' | 'upload') => Promise<void>) | null;
    handleScreenshotComplete: ((path: string) => Promise<void>) | null;
  }>({
    handleShortcut: null,
    handleScreenshotComplete: null,
  });

  const [settings, setSettings] = useState<{
    apiConfig: ApiConfig;
    shortcuts: { capture: string; upload: string };
    theme?: string;
    sidebarConfig?: SidebarConfig;
    minimizeToTray?: boolean;
  } | null>(null);

  type ViewType = 'home' | 'settings' | 'history' | 'about';
  const [currentView, setCurrentView] = useState<ViewType>('home');
  
  const [showCopyOptions, setShowCopyOptions] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  
  // 添加AI解释重置控制
  const [explanationResetKey, setExplanationResetKey] = useState(0);
  
  // 重置AI解释的函数
  const resetAIExplanation = () => {
    setExplanationResetKey(prev => prev + 1);
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // 检查是否在 Electron 环境中
        if (window.electronAPI) {
          const appSettings = await window.electronAPI.getSettings();
          console.log('从Electron加载的设置:', appSettings);
          const selectedTheme = appSettings.theme || 'green';
          setSettings({
            apiConfig: appSettings.apiConfig,
            shortcuts: appSettings.shortcuts,
            theme: selectedTheme,
            sidebarConfig: appSettings.sidebarConfig || getDefaultSidebarConfig(),
            minimizeToTray: appSettings.minimizeToTray !== undefined ? appSettings.minimizeToTray : true
          });
          setAppState(prev => ({ ...prev, history: appSettings.history }));
          
          // 应用主题（首次安装时使用默认的 green 主题）
          const { applyTheme, getTheme } = await import('./theme/themes');
          const theme = getTheme(selectedTheme);
          applyTheme(theme);
          
          // 如果是首次安装（没有保存的主题），保存默认主题
          if (!appSettings.theme && window.electronAPI) {
            await window.electronAPI.saveSettings({ theme: 'green' });
            console.log('首次启动，已保存默认主题: green');
          }
        } else {
          const defaultSettings = {
            apiConfig: {
              appId: '',
              appSecret: '',
              endpoint: 'https://server.simpletex.cn/api/latex_ocr',
              modelScope: {
                apiKey: '',
                enabled: false,
                model: 'Qwen/Qwen2.5-7B-Instruct'
              }
            },
            shortcuts: {
              capture: 'Alt+C',
              upload: 'Alt+U'
            }
          };
          
          try {
            const response = await fetch('./settings.json');
            if (response.ok) {
              const settings = await response.json();
              if (settings.app_id && settings.app_secret) {
                defaultSettings.apiConfig.appId = settings.app_id;
                defaultSettings.apiConfig.appSecret = settings.app_secret;
                console.log('从settings.json加载API配置成功');
              } else {
                console.warn('settings.json中未找到有效的API配置');
              }
              
              // 加载魔搭配置
              if (settings.modelscope_api_key !== undefined || settings.modelscope_enabled !== undefined) {
                defaultSettings.apiConfig.modelScope = {
                  apiKey: settings.modelscope_api_key || '',
                  enabled: settings.modelscope_enabled || false,
                  model: settings.modelscope_model || 'Qwen/Qwen2.5-7B-Instruct'
                };
                console.log('从settings.json加载魔搭配置成功');
              } else {
                console.log('settings.json中使用默认魔搭配置');
              }
            } else {
              console.warn('无法加载settings.json文件');
            }
          } catch (error) {
            console.error('加载settings.json失败:', error);
          }
          
          setSettings({
            ...defaultSettings,
            theme: 'green',
            sidebarConfig: getDefaultSidebarConfig()
          });
          console.warn('运行在浏览器模式下，使用默认设置');
          
          // 应用默认主题
          const { applyTheme, getTheme } = await import('./theme/themes');
          const theme = getTheme('green');
          applyTheme(theme);
        }
      } catch (error) {
        console.error('加载设置失败:', error);
      }
    };

    loadSettings();

    // 创建更新事件处理函数
    const handleCheckingForUpdate = () => {
      console.log('正在检查更新...');
      setUpdateInfo({ showDialog: false, showIndicator: false, status: 'checking', version: '' });
      setDownloadProgress(0);
      // 在顶部显示检查更新的消息
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: '🔄 正在检查更新...'
      }));
    };

    const handleUpdateAvailable = (info: any) => {
      console.log('发现新版本:', info);
      // 直接开始下载，不显示对话框
      setUpdateInfo(prev => ({ ...prev, showDialog: false, showIndicator: false, status: 'available', version: info.version }));
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: `✨ 发现新版本 ${info.version}，正在自动下载...`
      }));
      // 自动开始下载
      if (window.electronAPI) {
        window.electronAPI.downloadUpdate();
      }
    };

    const handleUpdateNotAvailable = (info: any) => {
      console.log('已是最新版本:', info);
      setUpdateInfo(prev => ({ ...prev, showDialog: false, status: 'no-update' }));
      // 在顶部显示已是最新版本的消息
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: '✅ 已是最新版本'
      }));
      // 3秒后自动隐藏消息
      setTimeout(() => {
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: null
        }));
      }, 3000);
    };

    const handleUpdateError = (error: string) => {
      console.error('更新错误:', error);
      setUpdateInfo({
        showDialog: false, // 不显示对话框
        showIndicator: false,
        status: 'error',
        version: ''
      });
      setDownloadProgress(0);
      // 在顶部显示错误消息
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: `❌ 检查更新失败: ${error}`
      }));
      // 5秒后自动隐藏消息
      setTimeout(() => {
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: null
        }));
      }, 5000);
    };

    const handleDownloadProgress = (progressObj: any) => {
      console.log(`下载进度: ${progressObj.percent}%`);
      const percent = Math.round(progressObj.percent || 0);
      setDownloadProgress(percent);
      // 更新下载进度消息
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: `📥 正在下载更新... ${percent}%`
      }));
    };

    const handleUpdateDownloaded = (info: any) => {
      setDownloadProgress(100);
      // 下载完成后显示对话框，让用户选择是否立即重启
      setUpdateInfo({
        showDialog: true,
        showIndicator: false,
        status: 'downloaded',
        version: info.version,
      });
      // 清除下载进度消息
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: null
      }));
    };

    // 注册自动更新事件处理程序
    if (window.electronAPI) {
      window.electronAPI.onCheckingForUpdate(handleCheckingForUpdate);
      window.electronAPI.onUpdateAvailable(handleUpdateAvailable);
      window.electronAPI.onUpdateNotAvailable(handleUpdateNotAvailable);
      window.electronAPI.onUpdateError(handleUpdateError);
      window.electronAPI.onDownloadProgress(handleDownloadProgress);
      window.electronAPI.onUpdateDownloaded(handleUpdateDownloaded);
    }

    // 清理函数 - 移除事件监听器
    return () => {
      if (window.electronAPI) {
        // 移除所有相关的事件监听器
        window.electronAPI.removeUpdateListeners();
      }
    };
  }, []);

  // 分离出事件处理器初始化和清理逻辑
  useEffect(() => {
    if (!window.electronAPI) {
      console.log('electronAPI不可用，跳过事件监听器设置');
      return;
    }

    console.log('设置Electron事件监听器...');

    // 创建事件处理函数实例，并存储在ref中
    eventHandlersRef.current.handleShortcut = async (action: 'capture' | 'upload') => {
      console.log('收到快捷键事件:', action);
      if (action === 'capture') {
        if (!window.electronAPI) {
          setAppState(prev => ({ 
            ...prev, 
            statusMessage: '❌ 截图功能仅在 Electron 应用中可用'
          }));
          return;
        }

        try {
          console.log('通过快捷键启动统一截图功能...');
          await window.electronAPI.showScreenshotOverlay();
          setAppState(prev => ({ 
            ...prev, 
            statusMessage: '请在屏幕上选择区域进行截图'
          }));
        } catch (error) {
          console.error('启动截图失败:', error);
          setAppState(prev => ({ 
            ...prev, 
            statusMessage: '❌ 截图失败'
          }));
        }
      } else if (action === 'upload') {
        // 文件上传处理
        if (!window.electronAPI) {
          setAppState(prev => ({ 
            ...prev, 
            statusMessage: '❌ 文件上传功能仅在 Electron 应用中可用，请使用拖拽上传'
          }));
          return;
        }

        try {
          const filePath = await window.electronAPI.selectFile();
          if (filePath) {
            // 选择文件后进行大小检测
            try {
              const size = await window.electronAPI.getFileSize?.(filePath);
              const maxSizeBytes = 10 * 1024 * 1024;
              if (typeof size === 'number' && size > maxSizeBytes) {
                setAppState(prev => ({
                  ...prev,
                  statusMessage: '❌ 图片过大，最大支持 10MB'
                }));
                return;
              }
            } catch (e) {}
            setAppState(prev => ({ 
              ...prev, 
              currentImage: `file://${filePath}`,
              statusMessage: '🔄 准备识别...'
            }));
            
            if (settings) {
              // 清空AI解释区域
              resetAIExplanation();
              
              setAppState(prev => ({ 
                ...prev, 
                isRecognizing: true, 
                latexCode: '',
                statusMessage: '🤖 正在识别公式...'
              }));

              try {
                const apiConfig = settings.apiConfig;
                if (!apiConfig || !apiConfig.appId || !apiConfig.appSecret || 
                    !apiConfig.appId.trim() || !apiConfig.appSecret.trim()) {
                  console.log('API配置无效，无法识别');
                  setAppState(prev => ({ 
                    ...prev, 
                    latexCode: '',
                    statusMessage: '❌ 请先在设置中配置API密钥'
                  }));
                  return;
                }
                
                console.log('调用API识别，配置:', settings.apiConfig);
                const result = await window.electronAPI.recognizeFormula(filePath, settings.apiConfig);
                console.log('API识别结果:', result);
                
                if (result.status && result.res?.latex) {
                  const latex = result.res.latex;
                  console.log('识别成功，LaTeX:', latex);
                  setAppState(prev => ({ 
                    ...prev, 
                    latexCode: latex,
                    statusMessage: '✅ 识别完成！'
                  }));
                  
                  const newItem = {
                    date: getCurrentTimestamp(),
                    latex: latex.trim()
                  };
                  
                  setAppState(prev => {
                    const exists = prev.history.some(item => item.latex === newItem.latex);
                    if (!exists) {
                      const newHistory = [newItem, ...prev.history];
                      if (window.electronAPI) {
                        window.electronAPI.saveSettings({ history: newHistory }).catch(console.error);
                      }
                      return { ...prev, history: newHistory };
                    }
                    return prev;
                  });
                } else {
                  console.log('识别失败，错误信息:', result.message);
                  if (result.error_code === 'NO_API_CONFIG') {
                    setAppState(prev => ({ 
                      ...prev, 
                      latexCode: '',
                      statusMessage: `❌ ${result.message || '请先在设置中配置API密钥'}`
                    }));
                  } else {
                    setAppState(prev => ({ 
                      ...prev, 
                      latexCode: '',
                      statusMessage: `❌ 识别失败: ${result.message || '未知错误'}`
                    }));
                  }
                }
              } catch (error) {
                console.error('公式识别失败:', error);
                setAppState(prev => ({ 
                  ...prev, 
                  latexCode: '',
                  statusMessage: '❌ 识别出错'
                }));
              } finally {
                setAppState(prev => ({ ...prev, isRecognizing: false }));
              }
            }
          }
        } catch (error) {
          console.error('上传文件失败:', error);
          setAppState(prev => ({ 
            ...prev, 
            statusMessage: '❌ 上传失败'
          }));
        }
      }
    };

    eventHandlersRef.current.handleScreenshotComplete = async (imagePath: string) => {
      // 处理截图完成事件...
      console.log('=== React收到截图完成事件 ===');
      console.log('收到截图完成事件，图片路径:', imagePath);
      // 保持现有逻辑不变
      if (window.electronAPI && imagePath) {
        const taskId = Date.now();
        console.log(`开始识别任务 ID: ${taskId}`);
        
        setAppState(prev => ({ 
          ...prev, 
          currentImage: `file://${imagePath}`
        }));
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 清空AI解释区域
        resetAIExplanation();
        
        setAppState(prev => ({ 
          ...prev, 
          latexCode: '',
          statusMessage: '🔄 准备自动识别...'
        }));
        
        // 自动开始识别
        await recognizeFormula(imagePath);
      } else {
        console.error('无效的图片路径或electronAPI不可用');
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: '❌ 截图路径无效'
        }));
      }
    };

    // 使用固定的引用注册事件处理器，避免重复注册
    if (eventHandlersRef.current.handleShortcut) {
      window.electronAPI.onShortcutTriggered(eventHandlersRef.current.handleShortcut);
      console.log('成功注册快捷键事件处理器');
    }

    if (eventHandlersRef.current.handleScreenshotComplete) {
      window.electronAPI.onScreenshotComplete(eventHandlersRef.current.handleScreenshotComplete);
      console.log('成功注册截图完成事件处理器');
    }
    
    // 增加最大监听器数量，避免警告
    if (window.electronAPI.setMaxListeners) {
      window.electronAPI.setMaxListeners(20);
    }

    // 其他更新事件处理器...
    // 保持代码不变

    // 清理函数 - 重要: 移除所有事件监听器
    return () => {
      console.log('清理事件监听器');
      if (window.electronAPI) {
        if (eventHandlersRef.current.handleShortcut) {
          window.electronAPI.removeShortcutTriggeredListener(eventHandlersRef.current.handleShortcut);
        }
        if (eventHandlersRef.current.handleScreenshotComplete) {
          window.electronAPI.removeScreenshotCompleteListener(eventHandlersRef.current.handleScreenshotComplete);
        }
      }
    };
  }, [settings]); // 依赖于settings

  // 拖拽上传
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('=== 拖拽文件处理开始 ===');
    console.log('接收到文件:', acceptedFiles);
    
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      console.log('文件类型:', file.type);
      console.log('文件名:', file.name);
      console.log('文件大小:', file.size);
      
      if (file.type.startsWith('image/')) {
        // 大小限制：10MB
        const maxSizeBytes = 10 * 1024 * 1024;
        if (file.size > maxSizeBytes) {
          setAppState(prev => ({
            ...prev,
            statusMessage: '❌ 图片过大，最大支持 10MB'
          }));
          return;
        }
        const handleDraggedFile = async () => {
          if (!window.electronAPI) {
            setAppState(prev => ({ 
              ...prev, 
              statusMessage: '❌ 拖拽识别功能仅在 Electron 应用中可用'
            }));
            return;
          }

          console.log('开始处理拖拽图片识别...');
          console.log('当前settings:', settings);

          try {
            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            const tempPath = await window.electronAPI.saveTempFile(uint8Array, file.name);
            console.log('临时文件保存到:', tempPath);
            
            // 使用文件路径而不是 data URL
            setAppState(prev => ({ ...prev, currentImage: `file://${tempPath}` }));
            
            // 清空AI解释区域
            resetAIExplanation();
            
            setAppState(prev => ({ 
              ...prev, 
              latexCode: '',
              statusMessage: '🔄 准备自动识别...'
            }));
            
            // 自动开始识别
            await recognizeFormula(tempPath);
          } catch (error) {
            console.error('处理拖拽图片失败:', error);
            setAppState(prev => ({ 
              ...prev, 
              statusMessage: '❌ 处理图片失败'
            }));
          }
        };
        
        handleDraggedFile();
      } else {
        console.log('文件类型不支持:', file.type);
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: '❌ 请拖拽图片文件'
        }));
      }
    }
  }, [settings, resetAIExplanation]);

  const { getRootProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.bmp', '.gif']
    },
    multiple: false
  });

  const handleCapture = async () => {
    if (!window.electronAPI) {
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: '❌ 截图功能仅在 Electron 应用中可用'
      }));
      return;
    }

    try {
      console.log('启动统一截图功能...');
      await window.electronAPI.showScreenshotOverlay();
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: '请在屏幕上选择区域进行截图'
      }));
    } catch (error) {
      console.error('启动截图失败:', error);
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: '❌ 截图失败'
      }));
    }
  };

  const handleUpload = async () => {
    if (!window.electronAPI) {
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: '❌ 文件上传功能仅在 Electron 应用中可用，请使用拖拽上传'
      }));
      return;
    }

    try {
      const filePath = await window.electronAPI.selectFile();
      if (filePath) {
        // 选择文件后进行大小检测
        try {
          const size = await window.electronAPI.getFileSize?.(filePath);
          const maxSizeBytes = 10 * 1024 * 1024;
          if (typeof size === 'number' && size > maxSizeBytes) {
            setAppState(prev => ({
              ...prev,
              statusMessage: '❌ 图片过大，最大支持 10MB'
            }));
            return;
          }
        } catch (e) {
          // 失败时不阻塞，但也给出提示
        }
        // 清空AI解释区域
        resetAIExplanation();
        
        setAppState(prev => ({ 
          ...prev, 
          currentImage: `file://${filePath}`,
          latexCode: '',
          statusMessage: '🔄 准备自动识别...'
        }));
        
        // 自动开始识别
        await recognizeFormula(filePath);
      }
    } catch (error) {
      console.error('上传文件失败:', error);
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: '❌ 上传失败'
      }));
    }
  };

  const addToHistory = useCallback(async (latex: string) => {
    if (!latex.trim()) return;

    const newItem: HistoryItem = {
      date: getCurrentTimestamp(),
      latex: latex.trim()
    };
    const exists = appState.history.some(item => item.latex === newItem.latex);
    if (exists) return;

    const newHistory = [newItem, ...appState.history];
    setAppState(prev => ({ ...prev, history: newHistory }));

    if (window.electronAPI) {
      try {
        await window.electronAPI.saveSettings({ history: newHistory });
      } catch (error) {
        console.error('保存历史记录失败:', error);
      }
    }
  }, [appState.history]);

  const recognizeFormula = useCallback(async (imagePath: string) => {
    console.log('recognizeFormula被调用，图片路径:', imagePath);
    
    if (!settings) {
      console.log('settings未加载');
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: '❌ 设置未加载，请重试'
      }));
      return;
    }

    const currentSettings = settings;
    console.log('当前使用的设置:', currentSettings);

    if (!window.electronAPI) {
      console.error('公式识别功能仅在 Electron 应用中可用');
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: '❌ 公式识别功能仅在桌面应用中可用'
      }));
      return;
    }

    // 检查API配置
    if (!currentSettings?.apiConfig?.appId || !currentSettings?.apiConfig?.appSecret) {
      console.error('请先在设置中配置API密钥');
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: '⚠️ 请先在设置中配置API密钥'
      }));
      return;
    }

    setAppState(prev => ({ 
      ...prev, 
      isRecognizing: true,
      statusMessage: '🔄 正在识别公式...'
    }));

    // 调用API识别公式
    try {
      const result = await window.electronAPI.recognizeFormula(
        imagePath,
        currentSettings.apiConfig
      );

      console.log('识别结果:', result);

      if (result.status && result.res?.latex) {
        // 格式化LaTeX代码
        const formattedLatex = formatLatex(result.res.latex);
        
        // 更新状态并添加到历史记录
        setAppState(prev => {
          let newHistory = prev.history;
          
          // 只有在识别成功且有结果时才添加到历史记录
          if (formattedLatex.trim()) {
            const newItem = {
              date: getCurrentTimestamp(),
              latex: formattedLatex.trim()
            };
            
            // 检查是否已存在相同的公式，避免重复
            const exists = prev.history.some(item => item.latex === newItem.latex);
            if (!exists) {
              // 添加到历史记录的开头
              newHistory = [newItem, ...prev.history];
              
              // 保存到设置
              if (window.electronAPI) {
                window.electronAPI.saveSettings({ history: newHistory }).catch(console.error);
              }
            }
          }
          
          return { 
            ...prev, 
            latexCode: formattedLatex,
            isRecognizing: false,
            history: newHistory,
            statusMessage: '✅ 公式识别成功！'
          };
        });
        
        // 重置AI解释区域
        resetAIExplanation();
      } else {
        console.log('识别失败，错误信息:', result.message);
        if (result.error_code === 'NO_API_CONFIG') {
          setAppState(prev => ({ 
            ...prev, 
            latexCode: '',
            isRecognizing: false,
            statusMessage: `❌ ${result.message || '请先在设置中配置API密钥'}`
          }));
        } else {
          setAppState(prev => ({ 
            ...prev, 
            latexCode: '',
            isRecognizing: false,
            statusMessage: `❌ 公式识别失败: ${result.message || '未知错误'}`
          }));
        }
      }
    } catch (error) {
      console.error('识别出错:', error);
      setAppState(prev => ({ 
        ...prev, 
        latexCode: '',
        isRecognizing: false,
        statusMessage: '❌ 公式识别出错，请重试'
      }));
    }
  }, [settings, resetAIExplanation]);
  const handleCopy = async (mode: CopyMode = 'normal') => {
    if (!appState.latexCode.trim()) return;

    if (mode === 'mathml') {
      if (!window.electronAPI) {
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: '❌ MathML转换功能仅在桌面应用中可用'
        }));
        return;
      }

      try {
        const tempFilename = `temp-${Date.now()}`;
        await window.electronAPI.saveDocxFile(appState.latexCode, tempFilename);
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: '📋 MathML公式已复制到剪贴板'
        }));
      } catch (error) {
        console.error('转换为MathML失败:', error);
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: '❌ MathML转换失败'
        }));
      }
      setTimeout(() => {
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: null
        }));
      }, 2000);
      return;
    }

    const formattedLatex = formatLatex(appState.latexCode, mode);
    
    if (window.electronAPI) {
      await window.electronAPI.copyToClipboard(formattedLatex);
    } else {
      try {
        await navigator.clipboard.writeText(formattedLatex);
      } catch (error) {
        console.error('复制到剪贴板失败:', error);
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: '❌ 复制失败'
        }));
        return;
      }
    }
    
    setAppState(prev => ({ 
      ...prev, 
      statusMessage: '📋 已复制到剪贴板'
    }));
    setTimeout(() => {
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: null
      }));
    }, 2000);
  };

  const handleUseHistory = (latex: string) => {
    try {
      console.log('使用历史记录项:', latex);
      
      // 清空AI解释区域
      resetAIExplanation();
      
      // 切换回主视图
      setCurrentView('home');
      
      // 确保latex是有效的
      if (typeof latex === 'string' && latex.trim()) {
        // 直接设置LaTeX代码
        setAppState(prev => ({ 
          ...prev, 
          latexCode: latex
        }));
      } else {
        console.error('无效的LaTeX内容');
      }
    } catch (error) {
      console.error('使用历史记录项失败:', error);
    }
  };

  const handleClearHistory = async () => {
    setAppState(prev => ({ ...prev, history: [] }));
    if (window.electronAPI) {
      try {
        await window.electronAPI.saveSettings({ history: [] });
      } catch (error) {
        console.error('清空历史记录失败:', error);
      }
    }
  };
  const handleDeleteHistoryItem = async (latex: string) => {
    const newHistory = appState.history.filter(item => item.latex !== latex);
    setAppState(prev => ({ ...prev, history: newHistory }));
    if (window.electronAPI) {
      try {
        await window.electronAPI.saveSettings({ history: newHistory });
      } catch (error) {
        console.error('删除历史记录失败:', error);
      }
    }
  };
  const handleSaveApiSettings = async (apiConfig: ApiConfig) => {
    if (window.electronAPI) {
      try {
        const isClearing = !apiConfig.appId || !apiConfig.appSecret || 
                          !apiConfig.appId.trim() || !apiConfig.appSecret.trim();
        
        if (isClearing) {
          console.log('检测到清除API配置操作');
          const result = await window.electronAPI.clearApiConfig();
          console.log('清除API配置结果:', result);
          
          if (result) {
            setSettings(prev => prev ? { 
              ...prev, 
              apiConfig: { appId: '', appSecret: '' }
            } : null);
            setAppState(prev => ({ 
              ...prev, 
              statusMessage: '✅ API配置已清除' 
            }));
            setAppState(prev => ({
              ...prev,
              currentImage: null,
              latexCode: ''
            }));
          } else {
            setAppState(prev => ({ 
              ...prev, 
              statusMessage: '❌ API配置清除失败' 
            }));
          }
        } else {
          await window.electronAPI.saveSettings({ apiConfig });
          await window.electronAPI.saveApiToSettingsFile(apiConfig);
          setSettings(prev => prev ? { ...prev, apiConfig } : null);
          setAppState(prev => ({ 
            ...prev, 
            statusMessage: '✅ API设置已保存' 
          }));
        }
        console.log('API设置已更新', apiConfig);
        setAppState(prev => ({
          ...prev,
          currentImage: null,
          latexCode: ''
        }));
        setTimeout(() => {
          setAppState(prev => ({ 
            ...prev, 
            statusMessage: isClearing ? '请先设置API密钥' : '请重新截图或上传图片' 
          }));
        }, 2000);
      } catch (error) {
        console.error('保存API设置失败:', error);
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: '❌ API设置保存失败' 
        }));
      }
    } else {
      const isClearing = !apiConfig.appId || !apiConfig.appSecret || 
                        !apiConfig.appId.trim() || !apiConfig.appSecret.trim();
      if (isClearing) {
        setSettings(prev => prev ? { 
          ...prev, 
          apiConfig: { appId: '', appSecret: '' }
        } : null);
      } else {
        setSettings(prev => prev ? { ...prev, apiConfig } : null);
      }
    }
  };
  const handleSaveShortcutSettings = async (shortcuts: { capture: string; upload: string }) => {
    if (window.electronAPI) {
      try {
        await window.electronAPI.saveSettings({ shortcuts });
        await window.electronAPI.registerGlobalShortcuts(shortcuts);
      } catch (error) {
        console.error('保存快捷键设置失败:', error);
      }
    }
    setSettings(prev => prev ? { ...prev, shortcuts } : null);
  };

  const handleThemeChange = (themeId: string) => {
    try {
      // 动态导入主题模块并立即应用
      import('./theme/themes').then(({ getTheme, applyTheme }) => {
        const theme = getTheme(themeId);
        
        // 🔥 立即应用主题 - 不需要重启
        applyTheme(theme);
        
        // 保存主题设置到localStorage（确保下次启动时也使用该主题）
        localStorage.setItem('selectedTheme', themeId);
        
        // 更新应用状态
        setSettings(prev => prev ? { ...prev, theme: themeId } : null);
        
        // 如果在Electron环境中，也保存到设置文件
        if (window.electronAPI) {
          window.electronAPI.saveSettings({ theme: themeId }).catch(console.error);
        }
        
        // 显示成功提示
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: `✅ 主题已切换为 ${theme.name}`
        }));
        
        // 2秒后清除提示
        setTimeout(() => {
          setAppState(prev => ({ 
            ...prev, 
            statusMessage: null
          }));
        }, 2000);
      });
    } catch (error) {
      console.error('切换主题失败:', error);
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: '❌ 主题切换失败'
      }));
    }
  };

  const handleSaveSidebarConfig = async (sidebarConfig: SidebarConfig) => {
    if (window.electronAPI) {
      try {
        await window.electronAPI.saveSettings({ sidebarConfig });
        setSettings(prev => prev ? { ...prev, sidebarConfig } : null);
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: '✅ 侧边栏配置已保存' 
        }));
        setTimeout(() => {
          setAppState(prev => ({ 
            ...prev, 
            statusMessage: null
          }));
        }, 2000);
      } catch (error) {
        console.error('保存侧边栏配置失败:', error);
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: '❌ 侧边栏配置保存失败' 
        }));
      }
    } else {
      setSettings(prev => prev ? { ...prev, sidebarConfig } : null);
    }
  };

  const handleSaveMinimizeToTray = async (minimizeToTray: boolean) => {
    if (window.electronAPI) {
      try {
        await window.electronAPI.saveSettings({ minimizeToTray });
        setSettings(prev => prev ? { ...prev, minimizeToTray } : null);
        console.log('最小化到托盘设置已保存:', minimizeToTray);
      } catch (error) {
        console.error('保存最小化到托盘设置失败:', error);
      }
    } else {
      setSettings(prev => prev ? { ...prev, minimizeToTray } : null);
    }
  };

  const handleCheckForUpdates = async () => {
    if (!window.electronAPI) {
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: '❌ 自动更新仅在 Electron 应用中可用'
      }));
      return;
    }
    
    try {
      setUpdateInfo({ showDialog: false, showIndicator: false, status: 'checking', version: '' });
      setDownloadProgress(0);
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: '🔄 正在检查更新...'
      }));
      await window.electronAPI.checkForUpdates();
    } catch (error) {
      console.error('检查更新失败:', error);
      setAppState(prev => ({
        ...prev,
        statusMessage: '❌ 检查更新失败'
      }));
      setUpdateInfo(prev => ({ ...prev, showDialog: false, status: 'error' }));
      // 3秒后自动隐藏消息
      setTimeout(() => {
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: null
        }));
      }, 3000);
    }
  };

  const handleDownloadUpdate = () => {
    if (!window.electronAPI) return;
    
    try {
      // 触发主进程下载更新
      window.electronAPI.downloadUpdate();
      // 更新UI状态为“下载中”
      setUpdateInfo(prev => ({
        ...prev,
        status: 'downloading'
      }));
    } catch (error) {
      console.error('下载更新失败:', error);
      setAppState(prev => ({
        ...prev,
        statusMessage: '❌ 下载更新失败'
      }));
    }
  };

  const handleRestartAndInstall = () => {
    if (!window.electronAPI) return;
    
    try {
      // 这个函数会发送IPC消息到主进程，让主进程重启并安装更新
      window.electronAPI.quitAndInstall();
    } catch (error) {
      console.error('重启安装更新失败:', error);
    }
  };

  const handleCloseUpdateDialog = () => {
    // 只关闭对话框，不改变更新状态，除非是'no-update'或'checking'
    setUpdateInfo(prev => ({
      ...prev,
      showDialog: false
    }));
  };


  const handleExportFormula = async (format: 'svg' | 'png' | 'jpg') => {
    if (!appState.latexCode.trim()) {
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: '❌ 请先识别或输入数学公式'
      }));
      return;
    }

    if (!window.electronAPI) {
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: '❌ 图片导出功能仅在桌面应用中可用'
      }));
      return;
    }

    try {
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: `🔄 正在导出为${format.toUpperCase()}格式...`
      }));

      const result = await window.electronAPI.exportFormulaImage(appState.latexCode, format);
      
      if (result.success) {
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: `✅ ${result.message || `导出${format.toUpperCase()}成功`}`
        }));
      } else {
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: `❌ ${result.message || `导出${format.toUpperCase()}失败`}`
        }));
      }
      
      setTimeout(() => {
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: null
        }));
      }, 3000);
    } catch (error) {
      console.error(`导出${format.toUpperCase()}失败:`, error);
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: `❌ 导出${format.toUpperCase()}失败`
      }));
      setTimeout(() => {
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: null
        }));
      }, 3000);
    }
  };

  return (
    <AppContainer>
      {/* 自定义标题栏 */}
      <TitleBar title="TexStudio OCR" />
      
      <MainContent>
        {/* 左侧导航栏 */}
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          onCapture={handleCapture}
          onUpload={handleUpload}
          onCopy={() => {
            if (appState.latexCode.trim() && !appState.isRecognizing) {
              setShowCopyOptions(true);
            }
          }}
          onExport={() => {
            if (appState.latexCode.trim() && !appState.isRecognizing) {
              setShowExportOptions(true);
            }
          }}
          copyDisabled={!appState.latexCode.trim() || appState.isRecognizing}
          exportDisabled={!appState.latexCode.trim() || appState.isRecognizing}
          sidebarConfig={settings?.sidebarConfig}
      />

      {/* 右侧内容区 */}
      <ContentContainer>
        {/* 通知栏 */}
        <NotificationBar 
          message={appState.statusMessage}
          onClose={() => setAppState(prev => ({ ...prev, statusMessage: null }))}
        />

        {/* 根据当前视图显示不同内容 */}
        {currentView === 'home' && (
          <HomeView
            currentImage={appState.currentImage}
            latexCode={appState.latexCode}
            isRecognizing={appState.isRecognizing}
            isDragActive={isDragActive}
            apiConfig={settings?.apiConfig}
            explanationResetKey={explanationResetKey}
            onUpload={handleUpload}
            onLatexChange={(code: string) => {
              setAppState(prev => ({ 
                ...prev, 
                latexCode: code,
                statusMessage: (!prev.latexCode && code) ? 'ℹ️ 正在手动编辑LaTeX代码' : prev.statusMessage
              }));
              if (code !== appState.latexCode) {
                resetAIExplanation();
              }
            }}
            getRootProps={getRootProps}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            apiConfig={settings?.apiConfig || { appId: '', appSecret: '', endpoint: '' }}
            shortcuts={settings?.shortcuts || { capture: '', upload: '' }}
            currentTheme={settings?.theme || 'green'}
            sidebarConfig={settings?.sidebarConfig}
            minimizeToTray={settings?.minimizeToTray !== undefined ? settings.minimizeToTray : true}
            onSaveApi={handleSaveApiSettings}
            onSaveShortcuts={handleSaveShortcutSettings}
            onThemeChange={handleThemeChange}
            onCheckForUpdates={handleCheckForUpdates}
            onSaveSidebarConfig={handleSaveSidebarConfig}
            onSaveMinimizeToTray={handleSaveMinimizeToTray}
          />
        )}

        {currentView === 'history' && (
          <HistoryView
            history={appState.history}
            onUse={handleUseHistory}
            onDelete={handleDeleteHistoryItem}
            onClear={handleClearHistory}
          />
        )}

        {currentView === 'about' && (
          <AboutView onCheckForUpdates={handleCheckForUpdates} />
        )}
      </ContentContainer>

      {/* 保留的对话框（复制选项、导出选项、更新对话框） */}

      <CopyOptionsDialog
        isOpen={showCopyOptions}
        onClose={() => setShowCopyOptions(false)}
        onCopy={handleCopy}
      />

      <ExportOptionsDialog
        isOpen={showExportOptions}
        onClose={() => setShowExportOptions(false)}
        onExport={handleExportFormula}
      />

      </MainContent>

      <UpdateDialog
        isOpen={updateInfo.showDialog}
        onClose={handleCloseUpdateDialog}
        status={updateInfo.status as Exclude<UpdateStatus, 'idle'>}
        progress={downloadProgress}
        version={updateInfo.version}
        onDownload={handleDownloadUpdate}
        onRestart={handleRestartAndInstall}
        onBackgroundDownload={() => {}}
      />
    </AppContainer>
  );
}

export default App;