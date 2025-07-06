import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';
import { AppState, HistoryItem, ApiConfig, CopyMode } from './types';
import { formatLatex, getCurrentTimestamp, validateApiConfig } from './utils/api';
import MenuBar from './components/MenuBar';
import ImageDisplay from './components/ImageDisplay';
import LatexEditor from './components/LatexEditor';
import FormulaPreview from './components/FormulaPreview';
import StatusBar from './components/StatusBar';
import CopyButton from './components/CopyButton';
import ExportButton from './components/ExportButton';
import ApiSettingsDialog from './components/ApiSettingsDialog';
import ShortcutSettingsDialog from './components/ShortcutSettingsDialog';
import HistoryDialog from './components/HistoryDialog';
import AboutDialog from './components/AboutDialog';
import * as path from 'path';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8f9fa;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)),
    repeating-linear-gradient(
      45deg, 
      rgba(240, 240, 245, 0.3), 
      rgba(240, 240, 245, 0.3) 15px, 
      transparent 15px, 
      transparent 30px
    );
  font-family: "Segoe UI", "Microsoft YaHei", sans-serif;
  color: #2c3e50;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  padding-bottom: 8px; /* 减少底部内边距 */
  gap: 16px;
  overflow: hidden;
  /* 禁用滚动条，内容自适应窗口大小 */
  height: calc(100vh - 50px); /* 减去菜单栏的高度 */
  background-color: rgba(255, 255, 255, 0.7);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  
  /* 确保有足够的间距，但不要过多 */
  @media (min-height: 900px) {
    gap: 20px;
  }
`;

const TopSection = styled.div`
  flex: 1;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  /* 确保图片区域有合理的最小高度，虚线完全可见 */
  overflow: visible;
  /* 确保虚线边框不被裁切 */
  padding: 2px;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  
  /* 根据不同屏幕大小调整比例 */
  @media (min-height: 768px) {
    flex: 1.5;
  }
  
  @media (min-height: 900px) {
    flex: 2;
  }
  
  @media (min-height: 1080px) {
    flex: 2.5;
  }
`;

const BottomSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  /* 保持固定高度，自适应内容大小 */
  min-height: 300px;
  max-height: 340px;
  height: auto;
  /* 确保不会覆盖图片区域的虚线 */
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  padding: 10px 10px 6px 10px; /* 减少底部内边距 */
`;

const PreviewAndEditorContainer = styled.div`
  display: flex;
  gap: 12px;
  height: 220px; /* 固定高度，包含标题和内容区域 */
  margin-bottom: 0; /* 移除下方间距 */

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
  }
  
  /* 在大屏幕上自适应调整高度 */
  @media (min-height: 900px) {
    height: 240px;
  }
  
  /* 在更大屏幕上进一步调整高度 */
  @media (min-height: 1080px) {
    height: 260px;
  }
`;

const EditorWrapper = styled.div`
  flex: 1;
  min-width: 0;
  height: 220px;
  overflow: hidden;
  position: relative;
`;

const PreviewWrapper = styled.div`
  flex: 1;
  min-width: 0;
  height: 220px;
  overflow: hidden;
  position: relative;
`;

// 需要调整ButtonContainer的样式，确保按钮区域紧凑
const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 2px;
  margin-bottom: 0;
  padding: 0;
  height: 36px; /* 固定高度，避免计算错误 */
`;

// 修改StatusBarWrapper样式，减少边距
const StatusBarWrapper = styled.div`
  margin: 0;
  position: relative;
  z-index: 10; /* 确保状态栏位于较高层级 */
  flex-shrink: 0; /* 防止被压缩 */
  height: 38px; /* 固定状态栏高度 */
`;

function App() {
  const [appState, setAppState] = useState<AppState>({
    currentImage: null,
    latexCode: '',
    isRecognizing: false,
    statusMessage: '⚡ 准备就绪',
    history: []
  });

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
  } | null>(null);

  const [showApiSettings, setShowApiSettings] = useState(false);
  const [showShortcutSettings, setShowShortcutSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // 检查是否在 Electron 环境中
        if (window.electronAPI) {
          const appSettings = await window.electronAPI.getSettings();
          console.log('从Electron加载的设置:', appSettings);
          setSettings({
            apiConfig: appSettings.apiConfig,
            shortcuts: appSettings.shortcuts
          });
          setAppState(prev => ({ ...prev, history: appSettings.history }));
        } else {
          const defaultSettings = {
            apiConfig: {
              appId: '',
              appSecret: '',
              endpoint: 'https://server.simpletex.cn/api/latex_ocr'
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
            } else {
              console.warn('无法加载settings.json文件');
            }
          } catch (error) {
            console.error('加载settings.json失败:', error);
          }
          
          setSettings(defaultSettings);
          console.warn('运行在浏览器模式下，使用默认设置');
        }
      } catch (error) {
        console.error('加载设置失败:', error);
      }
    };

    loadSettings();

    // 创建更新事件处理函数
    const handleCheckingForUpdate = () => {
      console.log('正在检查更新...');
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: '🔄 正在检查更新...'
      }));
    };

    const handleUpdateAvailable = (info: any) => {
      console.log('发现新版本:', info);
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: `✅ 发现新版本: ${info.version}`
      }));
    };

    const handleUpdateNotAvailable = (info: any) => {
      console.log('当前已是最新版本:', info);
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: '✅ 当前已是最新版本'
      }));
      // 3秒后恢复状态
      setTimeout(() => {
        setAppState(prev => ({ ...prev, statusMessage: '⚡ 准备就绪' }));
      }, 3000);
    };

    const handleUpdateError = (error: string) => {
      console.error('更新检查失败:', error);
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: `❌ 检查更新失败: ${error}`
      }));
      // 5秒后恢复状态
      setTimeout(() => {
        setAppState(prev => ({ ...prev, statusMessage: '⚡ 准备就绪' }));
      }, 5000);
    };

    const handleDownloadProgress = (progressObj: any) => {
      const percent = progressObj.percent.toFixed(2);
      console.log(`下载进度: ${percent}%`);
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: `⬇️ 正在下载更新: ${percent}%`
      }));
    };

    const handleUpdateDownloaded = (info: any) => {
      console.log('更新下载完成:', info);
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: '✅ 更新下载完成，将在重启后安装'
      }));
      // 5秒后恢复状态
      setTimeout(() => {
        setAppState(prev => ({ ...prev, statusMessage: '⚡ 准备就绪' }));
      }, 5000);
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

      useEffect(() => {
        const loadAlwaysOnTopState = async () => {
          if (window.electronAPI) {
            try {
              const result = await window.electronAPI.getAlwaysOnTop();
              if (result.success) {
                setIsAlwaysOnTop(result.alwaysOnTop);
              }
            } catch (error) {
              console.error('获取窗口置顶状态失败:', error);
            }
          }
        };

        loadAlwaysOnTopState();
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
            setAppState(prev => ({ 
              ...prev, 
              currentImage: `file://${filePath}`,
              statusMessage: '🔄 准备识别...'
            }));
            
            if (settings) {
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
                      const newHistory = [newItem, ...prev.history.slice(0, 4)];
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
        
        console.log('开始识别截图...');
        const currentSettings = settings;
        console.log('当前使用的设置:', currentSettings);
        if (currentSettings) {
          // 现有的识别逻辑...
          setAppState(prev => ({ 
            ...prev, 
            isRecognizing: true, 
            latexCode: '',
            statusMessage: '🤖 正在识别公式...'
          }));

          try {
            const apiConfig = currentSettings.apiConfig;
            if (!validateApiConfig(apiConfig)) {
              console.log(`任务 ${taskId}: API配置无效，无法识别`);
              setAppState(prev => ({ 
                ...prev, 
                latexCode: '',
                isRecognizing: false,
                statusMessage: '❌ 请先在设置中配置API密钥'
              }));
              return;
            }
            
            console.log(`任务 ${taskId}: 调用API识别，配置:`, currentSettings.apiConfig);
            const result = await window.electronAPI.recognizeFormula(imagePath, currentSettings.apiConfig);
            console.log(`任务 ${taskId}: API识别结果:`, result);
            
            if (result.status && result.res?.latex) {
              const latex = result.res.latex;
              console.log(`任务 ${taskId}: 识别成功，LaTeX:`, latex);
              
              setAppState(prev => {
                const newItem = {
                  date: getCurrentTimestamp(),
                  latex: latex.trim()
                };
                
                let newHistory = prev.history;
                const exists = prev.history.some(item => item.latex === newItem.latex);
                if (!exists) {
                  newHistory = [newItem, ...prev.history.slice(0, 4)];
                  if (window.electronAPI) {
                    window.electronAPI.saveSettings({ history: newHistory }).catch(console.error);
                  }
                }
                
                return { 
                  ...prev, 
                  latexCode: latex,
                  isRecognizing: false,
                  statusMessage: '✅ 识别完成！',
                  history: newHistory
                };
              });
            } else {
              console.log(`任务 ${taskId}: 识别失败，错误信息:`, result.message);
              setAppState(prev => ({ 
                ...prev, 
                latexCode: '',
                isRecognizing: false,
                statusMessage: `❌ 识别失败: ${result.message || '未知错误'}`
              }));
            }
          } catch (error) {
            console.error(`任务 ${taskId}: 公式识别失败:`, error);
            setAppState(prev => ({ 
              ...prev, 
              latexCode: '',
              isRecognizing: false,
              statusMessage: '❌ 识别出错'
            }));
          }
        }
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
  }, [settings]); // 只依赖于settings

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
        const reader = new FileReader();
        reader.onload = async () => {
          if (reader.result) {
            console.log('文件读取完成，设置图片显示');
            setAppState(prev => ({ ...prev, currentImage: reader.result as string }));
            
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
              
              if (settings) {
                const currentSettings = settings;
                console.log('当前使用的设置:', currentSettings);
                
                const taskId = Date.now();
                console.log(`开始拖拽识别任务 ID: ${taskId}`);
                
                setAppState(prev => ({ 
                  ...prev, 
                  isRecognizing: true, 
                  latexCode: '',
                  statusMessage: '🤖 正在识别公式...'
                }));

                try {
                  const apiConfig = currentSettings.apiConfig;
                  if (!validateApiConfig(apiConfig)) {
                    console.log(`任务 ${taskId}: API配置无效，无法识别`);
                    setAppState(prev => ({ 
                      ...prev, 
                      latexCode: '',
                      isRecognizing: false,
                      statusMessage: '❌ 请先在设置中配置API密钥'
                    }));
                    return;
                  }
                  
                  console.log(`任务 ${taskId}: 调用API识别，配置:`, currentSettings.apiConfig);
                  const result = await window.electronAPI.recognizeFormula(tempPath, currentSettings.apiConfig);
                  console.log(`任务 ${taskId}: API识别结果:`, result);
                  
                  if (result.status && result.res?.latex) {
                    const latex = result.res.latex;
                    console.log(`任务 ${taskId}: 识别成功，LaTeX:`, latex);
                    
                    setAppState(prev => {
                      const newItem = {
                        date: getCurrentTimestamp(),
                        latex: latex.trim()
                      };
                      
                      let newHistory = prev.history;
                      const exists = prev.history.some(item => item.latex === newItem.latex);
                      if (!exists) {
                        newHistory = [newItem, ...prev.history.slice(0, 4)];
                        if (window.electronAPI) {
                          window.electronAPI.saveSettings({ history: newHistory }).catch(console.error);
                        }
                      }
                      
                      return { 
                        ...prev, 
                        latexCode: latex,
                        isRecognizing: false,
                        statusMessage: '✅ 识别完成！',
                        history: newHistory
                      };
                    });
                  } else {
                    console.log(`任务 ${taskId}: 识别失败，错误信息:`, result.message);
                    
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
                        statusMessage: `❌ 识别失败: ${result.message || '未知错误'}`
                      }));
                    }
                  }
                } catch (error) {
                  console.error(`任务 ${taskId}: 公式识别失败:`, error);
                  setAppState(prev => ({ 
                    ...prev, 
                    latexCode: '',
                    isRecognizing: false,
                    statusMessage: '❌ 识别出错'
                  }));
                }
              } else {
                console.error('settings未加载，无法进行识别');
                setAppState(prev => ({ 
                  ...prev, 
                  statusMessage: '❌ 设置未加载，请稍后重试'
                }));
              }
            } catch (error) {
              console.error('处理拖拽图片失败:', error);
              setAppState(prev => ({ 
                ...prev, 
                statusMessage: '❌ 处理图片失败'
              }));
            }
          }
        };
        reader.readAsDataURL(file);
      } else {
        console.log('文件类型不支持:', file.type);
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: '❌ 请拖拽图片文件'
        }));
      }
    }
  }, [settings]);

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
        const taskId = Date.now();
        
        setAppState(prev => ({ 
          ...prev, 
          currentImage: `file://${filePath}`,
          statusMessage: '🔄 准备识别...'
        }));
        
        if (settings) {
          const currentSettings = settings;
          console.log('当前使用的设置:', currentSettings);
          
          const taskId = Date.now();
          console.log(`开始上传识别任务 ID: ${taskId}`);
          
          setAppState(prev => ({ 
            ...prev, 
            isRecognizing: true, 
            latexCode: '',
            statusMessage: '🤖 正在识别公式...'
          }));

          try {
            const apiConfig = currentSettings.apiConfig;
            if (!validateApiConfig(apiConfig)) {
              console.log(`任务 ${taskId}: API配置无效，无法识别`);
              setAppState(prev => ({ 
                ...prev, 
                latexCode: '',
                isRecognizing: false,
                statusMessage: '❌ 请先在设置中配置API密钥'
              }));
              return;
            }
            
            console.log(`任务 ${taskId}: 调用API识别，配置:`, currentSettings.apiConfig);
            const result = await window.electronAPI.recognizeFormula(filePath, currentSettings.apiConfig);
            console.log(`任务 ${taskId}: API识别结果:`, result);
            
            if (result.status && result.res?.latex) {
              const latex = result.res.latex;
              console.log(`任务 ${taskId}: 识别成功，LaTeX:`, latex);
              
              setAppState(prev => {
                const newItem = {
                  date: getCurrentTimestamp(),
                  latex: latex.trim()
                };
                
                let newHistory = prev.history;
                const exists = prev.history.some(item => item.latex === newItem.latex);
                if (!exists) {
                  newHistory = [newItem, ...prev.history.slice(0, 4)];
                  if (window.electronAPI) {
                    window.electronAPI.saveSettings({ history: newHistory }).catch(console.error);
                  }
                }
                
                return { 
                  ...prev, 
                  latexCode: latex,
                  isRecognizing: false,
                  statusMessage: '✅ 识别完成！',
                  history: newHistory
                };
              });
            } else {
              console.log(`任务 ${taskId}: 识别失败，错误信息:`, result.message);
              
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
                  statusMessage: `❌ 识别失败: ${result.message || '未知错误'}`
                }));
              }
            }
          } catch (error) {
            console.error(`任务 ${taskId}: 公式识别失败:`, error);
            setAppState(prev => ({ 
              ...prev, 
              latexCode: '',
              isRecognizing: false,
              statusMessage: '❌ 识别出错'
            }));
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
  };

  const addToHistory = useCallback(async (latex: string) => {
    if (!latex.trim()) return;

    const newItem: HistoryItem = {
      date: getCurrentTimestamp(),
      latex: latex.trim()
    };
    const exists = appState.history.some(item => item.latex === newItem.latex);
    if (exists) return;

    const newHistory = [newItem, ...appState.history.slice(0, 4)];
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
      return;
    }

    const currentSettings = settings;
    console.log('当前使用的设置:', currentSettings);

    if (!window.electronAPI) {
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: '❌ 公式识别功能仅在 Electron 应用中可用'
      }));
      return;
    }

    const taskId = Date.now();
    console.log(`开始通用识别任务 ID: ${taskId}`);

    setAppState(prev => ({ 
      ...prev, 
      isRecognizing: true, 
      latexCode: '',
      statusMessage: '🤖 正在识别公式...'
    }));

    try {
      const apiConfig = currentSettings.apiConfig;
      if (!validateApiConfig(apiConfig)) {
        console.log(`任务 ${taskId}: API配置无效，无法识别`);
        setAppState(prev => ({ 
          ...prev, 
          latexCode: '',
          isRecognizing: false,
          statusMessage: '❌ 请先在设置中配置API密钥'
        }));
        return;
      }
      
      console.log(`任务 ${taskId}: 调用API识别，配置:`, currentSettings.apiConfig);
      const result = await window.electronAPI.recognizeFormula(imagePath, currentSettings.apiConfig);
      console.log(`任务 ${taskId}: API识别结果:`, result);
      if (result.status && result.res?.latex) {
        const latex = result.res.latex;
        console.log(`任务 ${taskId}: 识别成功，LaTeX:`, latex);
        
        setAppState(prev => {
          let newHistory = prev.history;
          if (latex.trim()) {
            const newItem = {
              date: getCurrentTimestamp(),
              latex: latex.trim()
            };
            
            const exists = prev.history.some(item => item.latex === newItem.latex);
            if (!exists) {
              newHistory = [newItem, ...prev.history.slice(0, 4)];
              if (window.electronAPI) {
                window.electronAPI.saveSettings({ history: newHistory }).catch(console.error);
              }
            }
          }
          
          return { 
            ...prev, 
            latexCode: latex,
            isRecognizing: false,
            statusMessage: '✅ 识别完成！',
            history: newHistory
          };
        });
      } else {
        console.log(`任务 ${taskId}: 识别失败，错误信息:`, result.message);
        
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
            statusMessage: `❌ 识别失败: ${result.message || '未知错误'}`
          }));
        }
      }
    } catch (error) {
      console.error(`任务 ${taskId}: 公式识别失败:`, error);
      setAppState(prev => ({ 
        ...prev, 
        latexCode: '',
        isRecognizing: false,
        statusMessage: '❌ 识别出错'
      }));
    }
  }, [settings]);
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
          statusMessage: '⚡ 准备就绪'
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
        statusMessage: '⚡ 准备就绪'
      }));
    }, 2000);
  };

  const handleUseHistory = (latex: string) => {
    try {
      console.log('使用历史记录项:', latex);
      
      // 先关闭历史记录对话框
      setShowHistory(false);
      
      // 确保latex是有效的
      if (typeof latex === 'string' && latex.trim()) {
        // 直接设置LaTeX代码
        setAppState(prev => ({ 
          ...prev, 
          latexCode: latex,
          statusMessage: '✅ 已加载历史公式'
        }));
          
        // 2秒后恢复状态消息
        setTimeout(() => {
          setAppState(prev => ({ 
            ...prev, 
            statusMessage: '⚡ 准备就绪'
          }));
        }, 2000);
      } else {
        console.error('无效的LaTeX内容');
      }
    } catch (error) {
      console.error('使用历史记录项失败:', error);
      // 确保即使出错也能关闭历史记录对话框
      setShowHistory(false);
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
    setShowHistory(false);
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
            statusMessage: isClearing ? '⚡ 请先设置API密钥' : '⚡ 准备就绪，请重新截图或上传图片' 
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
    setShowApiSettings(false);
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
    setShowShortcutSettings(false);
  };
  const handleToggleAlwaysOnTop = async () => {
    if (!window.electronAPI) {
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: '❌ 窗口置顶功能仅在桌面应用中可用'
      }));
      return;
    }

    try {
      const newAlwaysOnTop = !isAlwaysOnTop;
      const result = await window.electronAPI.setAlwaysOnTop(newAlwaysOnTop);
      
      if (result.success) {
        setIsAlwaysOnTop(newAlwaysOnTop);
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: newAlwaysOnTop ? '窗口已置顶' : '已取消置顶'
        }));
        setTimeout(() => {
          setAppState(prev => ({ 
            ...prev, 
            statusMessage: '⚡ 准备就绪'
          }));
        }, 2000);
      } else {
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: '❌ 设置窗口置顶失败'
        }));
      }
    } catch (error) {
      console.error('切换窗口置顶状态失败:', error);
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: '❌ 窗口置顶设置失败'
      }));
    }
  };
  const handleCleanupTempFiles = async () => {
    if (!window.electronAPI) {
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: '❌ 临时文件清理功能仅在 Electron 应用中可用'
      }));
      return;
    }

    try {
      const count = await window.electronAPI.getTempFilesCount();
      if (count === 0) {
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: '✅ 没有需要清理的临时文件'
        }));
        return;
      }

      await window.electronAPI.cleanupTempFiles();
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: `✅ 已清理 ${count} 个临时文件`
      }));
      setTimeout(() => {
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: '⚡ 准备就绪'
        }));
      }, 3000);
    } catch (error) {
      console.error('清理临时文件失败:', error);
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: '❌ 清理临时文件失败'
      }));
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
      console.log('手动触发检查更新');
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: '🔄 正在检查更新...'
      }));
      
      const result = await window.electronAPI.checkForUpdates();
      if (result.success) {
        console.log('开始检查更新:', result.message);
      } else {
        console.error('检查更新失败:', result.message);
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: `❌ ${result.message}`
        }));
        setTimeout(() => {
          setAppState(prev => ({ 
            ...prev, 
            statusMessage: '⚡ 准备就绪'
          }));
        }, 3000);
      }
    } catch (error) {
      console.error('检查更新出错:', error);
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: '❌ 检查更新失败'
      }));
      setTimeout(() => {
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: '⚡ 准备就绪'
        }));
      }, 3000);
    }
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
          statusMessage: `✅ ${result.message}`
        }));
      } else {
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: `❌ ${result.message}`
        }));
      }
      setTimeout(() => {
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: '⚡ 准备就绪'
        }));
      }, 3000);
    } catch (error) {
      console.error(`导出${format.toUpperCase()}失败:`, error);
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: `❌ 导出${format.toUpperCase()}失败`
      }));
    }
  };

  if (!settings) {
    return <div>加载中...</div>;
  }

  return (
    <AppContainer {...getRootProps()} className="simpletex-app">
      <MenuBar
        onCapture={handleCapture}
        onUpload={handleUpload}
        onShowApiSettings={() => setShowApiSettings(true)}
        onShowShortcutSettings={() => setShowShortcutSettings(true)}
        onShowHistory={() => setShowHistory(true)}
        onShowAbout={() => setShowAbout(true)}
        onCleanupTempFiles={handleCleanupTempFiles}
        onToggleAlwaysOnTop={handleToggleAlwaysOnTop}
        onCheckForUpdates={handleCheckForUpdates}
        isAlwaysOnTop={isAlwaysOnTop}
      />

      <MainContent>
        <TopSection>
          <ImageDisplay 
            imageUrl={appState.currentImage}
            isDragActive={isDragActive}
            onUpload={handleUpload}
          />
        </TopSection>

        <BottomSection>
          <PreviewAndEditorContainer>
            <EditorWrapper>
              <LatexEditor
                value={appState.latexCode}
                onChange={(value) => setAppState(prev => ({ ...prev, latexCode: value }))}
                readOnly={appState.isRecognizing}
              />
            </EditorWrapper>
            
            <PreviewWrapper>
              <FormulaPreview 
                latex={appState.latexCode}
                isLoading={appState.isRecognizing}
              />
            </PreviewWrapper>
          </PreviewAndEditorContainer>
          
          <StatusBarWrapper>
            <StatusBar message={appState.statusMessage} />
          </StatusBarWrapper>
          
          <ButtonContainer>
            <CopyButton 
              onCopy={handleCopy}
              disabled={!appState.latexCode.trim() || appState.isRecognizing}
            />
            <ExportButton 
              onExport={handleExportFormula}
              disabled={!appState.latexCode.trim() || appState.isRecognizing}
            />
          </ButtonContainer>
        </BottomSection>
      </MainContent>

      {/* 对话框 */}
      {showApiSettings && (
        <ApiSettingsDialog
          apiConfig={settings.apiConfig}
          onSave={handleSaveApiSettings}
          onClose={() => setShowApiSettings(false)}
        />
      )}

      {showShortcutSettings && (
        <ShortcutSettingsDialog
          shortcuts={settings.shortcuts}
          onSave={handleSaveShortcutSettings}
          onClose={() => setShowShortcutSettings(false)}
        />
      )}

      {showHistory && (
        <HistoryDialog
          history={appState.history}
          onUse={handleUseHistory}
          onDelete={handleDeleteHistoryItem}
          onClear={handleClearHistory}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showAbout && (
        <AboutDialog onClose={() => setShowAbout(false)} />
      )}
    </AppContainer>
  );
}

export default App;