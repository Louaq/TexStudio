import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';
import { AppState, HistoryItem, ApiConfig, CopyMode } from './types';
import { formatLatex, getCurrentTimestamp, validateApiConfig } from './utils/api';
import MenuBar from './components/MenuBar';
import ImageDisplay from './components/ImageDisplay';
import LatexEditor from './components/LatexEditor';
import FormulaPreview from './components/FormulaPreview';
import FormulaExplanation from './components/FormulaExplanation';
import ApiSettingsDialog from './components/ApiSettingsDialog';
import ShortcutSettingsDialog from './components/ShortcutSettingsDialog';
import HistoryDialog from './components/HistoryDialog';
import AboutDialog from './components/AboutDialog';
import UpdateDialog from './components/UpdateDialog';
import UpdateProgressIndicator from './components/UpdateProgressIndicator';
import CopyOptionsDialog from './components/CopyOptionsDialog';
import ExportOptionsDialog from './components/ExportOptionsDialog';
import HandwritingDialog from './components/HandwritingDialog'; // 导入手写公式组件
import NotificationBar from './components/NotificationBar'; // 导入通知栏组件
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
  gap: 20px; /* 进一步增加组件之间的间距 */
  /* 调整高度以容纳所有组件 */
  min-height: 540px;
  max-height: 600px;
  height: auto;
  /* 确保不会覆盖图片区域的虚线 */
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  padding: 15px 15px 15px 15px; /* 增加内边距 */
`;

const PreviewAndEditorContainer = styled.div`
  display: flex;
  gap: 12px;
  height: 245px; /* 进一步增加高度以确保边框完全可见 */
  margin-bottom: 22px; /* 增加底部间距，确保边框完全可见 */

  @media (max-width: 1024px) {
    flex-direction: column;
    height: auto;
    gap: 8px;
  }
  
  @media (max-width: 768px) {
    gap: 6px;
  }
  
  /* 在大屏幕上自适应调整高度 */
  @media (min-height: 900px) {
    height: 245px;
  }
  
  /* 在更大屏幕上进一步调整高度 */
  @media (min-height: 1080px) {
    height: 245px;
  }
`;

const EditorWrapper = styled.div`
  flex: 1;
  min-width: 0;
  height: 240px;
  overflow: visible; /* 修改为visible，确保边框可见 */
  position: relative;
  padding-bottom: 2px; /* 添加底部内边距 */
  
  @media (min-height: 900px) {
    height: 240px;
  }
  
  @media (min-height: 1080px) {
    height: 240px;
  }
`;

const PreviewWrapper = styled.div`
  flex: 1;
  min-width: 0;
  height: 240px;
  overflow: visible; /* 修改为visible，确保边框可见 */
  position: relative;
  padding-bottom: 2px; /* 添加底部内边距 */
  
  @media (min-height: 900px) {
    height: 240px;
  }
  
  @media (min-height: 1080px) {
    height: 240px;
  }
`;

// 新增：AI解释区域独立容器
const ExplanationSection = styled.div`
  display: flex;
  flex-direction: column;
  height: 180px; /* 保持适中的高度 */
  background-color: rgba(248, 250, 252, 0.8);
  border-radius: 8px;
  padding: 8px;
  border: 2px solid rgba(203, 213, 225, 0.7); /* 增加边框宽度和对比度 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-top: 5px; /* 减少顶部间距，因为我们已经增加了PreviewAndEditorContainer的底部间距 */
  
  @media (min-height: 900px) {
    height: 190px;
  }
  
  @media (min-height: 1080px) {
    height: 200px;
  }
`;



// 删除StatusBarWrapper样式定义

type UpdateStatus = 'idle' | 'checking' | 'available' | 'no-update' | 'downloading' | 'downloaded' | 'error';

interface UpdateInfoState {
  showDialog: boolean;
  showIndicator: boolean;
  status: UpdateStatus;
  version: string;
}

function App() {
  const [appState, setAppState] = useState<AppState>({
    currentImage: null,
    latexCode: '',
    isRecognizing: false,
    history: [],
    statusMessage: '欢迎使用 SimpleTex-OCR'
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
  } | null>(null);

  const [showApiSettings, setShowApiSettings] = useState(false);
  const [showShortcutSettings, setShowShortcutSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showHelp, setShowHelp] = useState(false); // 新增
  const [showCopyOptions, setShowCopyOptions] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showHandwriting, setShowHandwriting] = useState(false); // 添加手写公式对话框状态
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);
  const [isAutoRecognition, setIsAutoRecognition] = useState(true);
  
  // 添加AI解释重置控制
  const [explanationResetKey, setExplanationResetKey] = useState(0);
  
  // 重置AI解释的函数
  const resetAIExplanation = () => {
    setExplanationResetKey(prev => prev + 1);
  };

  // 切换识别模式的函数
  const handleToggleRecognitionMode = () => {
    const newMode = !isAutoRecognition;
    setIsAutoRecognition(newMode);
    setAppState(prev => ({ 
      ...prev, 
      statusMessage: newMode ? 'ℹ️ 已开启自动识别模式' : 'ℹ️ 已切换为手动识别模式' 
    }));
  };

  // 手动识别函数
  const handleManualRecognize = async () => {
    if (!appState.currentImage) {
      setAppState(prev => ({ ...prev, statusMessage: '⚠️ 请先上传或截取图片' }));
      return;
    }

    let imagePath = appState.currentImage;
    
    // 如果是 data URL（拖拽上传的情况），需要重新保存为临时文件
    if (imagePath.startsWith('data:')) {
      if (!window.electronAPI) {
        setAppState(prev => ({ ...prev, statusMessage: '❌ 浏览器模式不支持此操作' }));
        return;
      }

      try {
        // 将 data URL 转换为 Blob
        const response = await fetch(imagePath);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // 保存为临时文件
        const tempFileName = `manual-recognize-${Date.now()}.png`;
        imagePath = await window.electronAPI.saveTempFile(uint8Array, tempFileName);
        console.log('手动识别：将 data URL 保存为临时文件:', imagePath);
      } catch (error) {
        console.error('转换 data URL 为临时文件失败:', error);
        // 移除状态消息的设置
        return;
      }
    } else if (imagePath.startsWith('file://')) {
      // 从文件URL中提取文件路径
      imagePath = imagePath.substring(7); // 移除 'file://' 前缀
    }

    await recognizeFormula(imagePath);
  };

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
              endpoint: 'https://server.simpletex.cn/api/latex_ocr',
              deepSeek: {
                apiKey: '',
                enabled: false
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
              
              // 加载DeepSeek配置
              if (settings.deepseek_api_key !== undefined || settings.deepseek_enabled !== undefined) {
                defaultSettings.apiConfig.deepSeek = {
                  apiKey: settings.deepseek_api_key || '',
                  enabled: settings.deepseek_enabled || false
                };
                console.log('从settings.json加载DeepSeek配置成功');
              } else {
                console.log('settings.json中使用默认DeepSeek配置');
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
      setUpdateInfo({ showDialog: true, showIndicator: false, status: 'checking', version: '' });
      setDownloadProgress(0);
    };

    const handleUpdateAvailable = (info: any) => {
      console.log('发现新版本:', info);
      setUpdateInfo(prev => ({ ...prev, showDialog: true, showIndicator: false, status: 'available', version: info.version }));
    };

    const handleUpdateNotAvailable = (info: any) => {
      console.log('已是最新版本:', info);
      setUpdateInfo(prev => ({ ...prev, status: 'no-update' }));
    };

    const handleUpdateError = (error: string) => {
      console.error('更新错误:', error);
      setUpdateInfo({
        showDialog: true,
        showIndicator: false,
        status: 'error',
        version: ''
      });
      setDownloadProgress(0);
    };

    const handleDownloadProgress = (progressObj: any) => {
      console.log(`下载进度: ${progressObj.percent}%`);
      setDownloadProgress(progressObj.percent);
    };

    const handleUpdateDownloaded = (info: any) => {
      setDownloadProgress(100);
      setUpdateInfo({
        showDialog: true,
        showIndicator: false,
        status: 'downloaded',
        version: info.version,
      });
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
        
        // 清空AI解释区域
        resetAIExplanation();
        
        setAppState(prev => ({ 
          ...prev, 
          latexCode: '',
          statusMessage: isAutoRecognition ? '🔄 准备自动识别...' : '截图完成，点击识别按钮开始识别'
        }));
        
        // 根据识别模式决定是否自动开始识别
        if (isAutoRecognition) {
          await recognizeFormula(imagePath);
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
  }, [settings, isAutoRecognition]); // 依赖于settings和isAutoRecognition

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
              statusMessage: isAutoRecognition ? '🔄 准备自动识别...' : '图片已拖拽上传，点击识别按钮开始识别'
            }));
            
            // 根据识别模式决定是否自动开始识别
            if (isAutoRecognition) {
              await recognizeFormula(tempPath);
            }
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
  }, [settings, resetAIExplanation, isAutoRecognition]);

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
        // 清空AI解释区域
        resetAIExplanation();
        
        setAppState(prev => ({ 
          ...prev, 
          currentImage: `file://${filePath}`,
          latexCode: '',
          statusMessage: isAutoRecognition ? '🔄 准备自动识别...' : '图片已上传，点击识别按钮开始识别'
        }));
        
        // 根据识别模式决定是否自动开始识别
        if (isAutoRecognition) {
          await recognizeFormula(filePath);
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
              // 添加到历史记录的开头，并保留最多5条记录
              newHistory = [newItem, ...prev.history.slice(0, 4)];
              
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
          
        // 2秒后清除状态消息
        setTimeout(() => {
          setAppState(prev => ({ 
            ...prev, 
            statusMessage: null
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
            statusMessage: null
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
        statusMessage: '❌ 临时文件清理功能仅在桌面应用中可用'
      }));
      return;
    }
    
    try {
      const result = await window.electronAPI.cleanupTempFiles();
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: `✅ 已清理 ${result.count} 个临时文件`
      }));
      setTimeout(() => {
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: null
        }));
      }, 3000);
    } catch (error) {
      console.error('清理临时文件失败:', error);
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: '❌ 清理临时文件失败'
      }));
      setTimeout(() => {
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: null
        }));
      }, 3000);
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
      setUpdateInfo({ showDialog: true, showIndicator: false, status: 'checking', version: '' });
      setDownloadProgress(0);
      await window.electronAPI.checkForUpdates();
    } catch (error) {
      console.error('检查更新失败:', error);
      setAppState(prev => ({
        ...prev,
        statusMessage: '❌ 检查更新失败'
      }));
      setUpdateInfo(prev => ({ ...prev, status: 'error' }));
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

  const handleBackgroundDownload = () => {
    setUpdateInfo(prev => ({
      ...prev,
      showDialog: false,
      showIndicator: true,
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

  // 处理手写公式识别
  const handleHandwriting = () => {
    setShowHandwriting(true);
    setAppState(prev => ({ 
      ...prev, 
      statusMessage: 'ℹ️ 请在手写板上绘制数学公式'
    }));
  };

  // 处理手写公式识别提交
  const handleHandwritingRecognize = async (imageData: string) => {
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

    // 清空AI解释区域
    resetAIExplanation();

    // 立即关闭手写对话框
    setShowHandwriting(false);

    setAppState(prev => ({ 
      ...prev, 
      isRecognizing: true, 
      latexCode: '',
      statusMessage: '🤖 正在识别手写公式...'
    }));

    try {
      // 先保存手写图像为临时文件，以便显示
      const tempFilePath = await window.electronAPI.saveHandwritingImage(imageData);
      
      // 设置当前图像
      setAppState(prev => ({ 
        ...prev, 
        currentImage: `file://${tempFilePath}`
      }));
      
      // 调用手写公式识别API
      const apiConfig = currentSettings.apiConfig;
      if (!validateApiConfig(apiConfig)) {
        console.log('API配置无效，无法识别');
        setAppState(prev => ({ 
          ...prev, 
          latexCode: '',
          isRecognizing: false,
          statusMessage: '❌ 请先在设置中配置API密钥'
        }));
        return;
      }
      
      console.log('调用手写公式识别API，配置:', currentSettings.apiConfig);
      const result = await window.electronAPI.recognizeHandwriting(imageData, currentSettings.apiConfig);
      console.log('手写公式识别结果:', result);
      
      if (result.status && result.res?.latex) {
        const latex = result.res.latex;
        console.log('识别成功，LaTeX:', latex);
        
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
            statusMessage: '✅ 手写公式识别完成！',
            history: newHistory
          };
        });
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
            statusMessage: `❌ 手写公式识别失败: ${result.message || '未知错误'}`
          }));
        }
      }
    } catch (error) {
      console.error('手写公式识别失败:', error);
      setAppState(prev => ({ 
        ...prev, 
        latexCode: '',
        isRecognizing: false,
        statusMessage: '❌ 手写公式识别出错'
      }));
    }
  };

  return (
    <AppContainer>
      <MenuBar
        onCapture={handleCapture}
        onUpload={handleUpload}
        onHandwriting={handleHandwriting} // 添加手写公式处理函数
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
        onToggleRecognitionMode={handleToggleRecognitionMode}
        onShowApiSettings={() => setShowApiSettings(true)}
        onShowShortcutSettings={() => setShowShortcutSettings(true)}
        onShowHistory={() => setShowHistory(true)}
        onShowAbout={() => setShowAbout(true)}
        onCleanupTempFiles={handleCleanupTempFiles}
        onToggleAlwaysOnTop={handleToggleAlwaysOnTop}
        onCheckForUpdates={handleCheckForUpdates}
        isAlwaysOnTop={isAlwaysOnTop}
        isAutoRecognition={isAutoRecognition}
        copyDisabled={!appState.latexCode.trim() || appState.isRecognizing}
        exportDisabled={!appState.latexCode.trim() || appState.isRecognizing}
      />
      
      {/* 添加通知栏 */}
      <NotificationBar 
        message={appState.statusMessage}
        onClose={() => setAppState(prev => ({ ...prev, statusMessage: null }))}
      />
      <MainContent {...getRootProps()}>
        <TopSection>
          <ImageDisplay
            imageUrl={appState.currentImage}
            isDragActive={isDragActive}
            isAutoRecognition={isAutoRecognition}
            isRecognizing={appState.isRecognizing}
            onUpload={handleUpload}
            onManualRecognize={handleManualRecognize}
          />
        </TopSection>
        <BottomSection>
          <PreviewAndEditorContainer>
            <EditorWrapper>
              <LatexEditor
                value={appState.latexCode}
                onChange={(code: string) => {
                  setAppState(prev => ({ 
                    ...prev, 
                    latexCode: code,
                    // 仅当从无内容变为有内容时显示通知
                    statusMessage: (!prev.latexCode && code) ? 'ℹ️ 正在手动编辑LaTeX代码' : prev.statusMessage
                  }));
                  // 重置AI解释区域
                  if (code !== appState.latexCode) {
                    resetAIExplanation();
                  }
                }}
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
          
          <ExplanationSection>
            <FormulaExplanation
              latex={appState.latexCode}
              deepSeekConfig={settings?.apiConfig?.deepSeek}
              resetKey={explanationResetKey}
            />
          </ExplanationSection>
        </BottomSection>
      </MainContent>

      {/* 对话框 */}
      {showApiSettings && (
        <ApiSettingsDialog
          apiConfig={settings?.apiConfig || { appId: '', appSecret: '', endpoint: '' }}
          onSave={handleSaveApiSettings}
          onClose={() => setShowApiSettings(false)}
        />
      )}

      {showShortcutSettings && (
        <ShortcutSettingsDialog
          shortcuts={settings?.shortcuts || { capture: '', upload: '' }}
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

      {/* 手写公式对话框 */}
      {showHandwriting && (
        <HandwritingDialog
          onClose={() => setShowHandwriting(false)}
          onRecognize={handleHandwritingRecognize}
          isRecognizing={appState.isRecognizing}
        />
      )}

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

      <UpdateDialog
        isOpen={updateInfo.showDialog}
        onClose={handleCloseUpdateDialog}
        status={updateInfo.status as Exclude<UpdateStatus, 'idle'>}
        progress={downloadProgress}
        version={updateInfo.version}
        onDownload={handleDownloadUpdate}
        onRestart={handleRestartAndInstall}
        onBackgroundDownload={handleBackgroundDownload}
      />

      <UpdateProgressIndicator
        isVisible={updateInfo.showIndicator}
        progress={downloadProgress}
      />
    </AppContainer>
  );
}

export default App;