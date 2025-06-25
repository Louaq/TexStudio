import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';
import { AppState, HistoryItem, ApiConfig, CopyMode } from './types';
import { formatLatex, getCurrentTimestamp, validateApiConfig } from './utils/api';
import MenuBar from './components/MenuBar';
import ImageDisplay from './components/ImageDisplay';
import LatexEditor from './components/LatexEditor';
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
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  font-family: "Segoe UI", "Microsoft YaHei", sans-serif;
  color: #2c3e50;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;
  overflow: hidden;
  /* 禁用滚动条，内容自适应窗口大小 */
  height: 100vh;
`;

const TopSection = styled.div`
  flex: 1;
  min-height: 220px;
  /* 确保图片区域有合理的最小高度，虚线完全可见 */
  overflow: visible;
  /* 确保虚线边框不被裁切 */
  padding: 2px;
`;

const BottomSection = styled.div`
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  /* 固定底部区域，不参与flex伸缩 */
  min-height: 160px;
  /* 确保不会覆盖图片区域的虚线 */
  z-index: 1;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
`;

function App() {
  const [appState, setAppState] = useState<AppState>({
    currentImage: null,
    latexCode: '',
    isRecognizing: false,
    statusMessage: '⚡ 准备就绪',
    history: []
  });

  const [settings, setSettings] = useState<{
    apiConfig: ApiConfig;
    shortcuts: { capture: string; upload: string };
  } | null>(null);

  // 对话框状态
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [showShortcutSettings, setShowShortcutSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // 加载设置
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
          // 浏览器模式下的默认设置
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
          
          // 尝试从settings.json加载配置
          try {
            // 使用相对路径加载settings.json
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
  }, []);

  // 监听快捷键触发
  useEffect(() => {
    if (!window.electronAPI) {
      console.log('electronAPI不可用，跳过事件监听器设置');
      return; // 只在 Electron 环境中注册
    }

    console.log('设置Electron事件监听器...');

    const handleShortcut = async (action: 'capture' | 'upload') => {
      console.log('收到快捷键事件:', action);
      if (action === 'capture') {
        // 截图处理
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
            statusMessage: '📸 请在屏幕上选择区域进行截图'
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
                         // 直接在这里实现识别逻辑，避免函数依赖
             if (settings) {
               // 开始识别
               setAppState(prev => ({ 
                 ...prev, 
                 isRecognizing: true, 
                 latexCode: '',
                 statusMessage: '🤖 正在识别公式...'
               }));

               try {
                 // 先验证API配置是否有效
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
                   
                   // 添加到历史记录
                   const newItem = {
                     date: getCurrentTimestamp(),
                     latex: latex.trim()
                   };
                   
                   setAppState(prev => {
                     const exists = prev.history.some(item => item.latex === newItem.latex);
                     if (!exists) {
                       const newHistory = [newItem, ...prev.history.slice(0, 4)];
                       // 保存到设置
                       if (window.electronAPI) {
                         window.electronAPI.saveSettings({ history: newHistory }).catch(console.error);
                       }
                       return { ...prev, history: newHistory };
                     }
                     return prev;
                   });
                   

                 } else {
                   console.log('识别失败，错误信息:', result.message);
                   
                   // 检查是否是API配置错误
                   if (result.error_code === 'NO_API_CONFIG') {
                     setAppState(prev => ({ 
                       ...prev, 
                       latexCode: '', // 确保清空公式区域
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

    console.log('注册快捷键监听器');
    window.electronAPI.onShortcutTriggered(handleShortcut);
    
    console.log('注册截图完成监听器');
    window.electronAPI.onScreenshotComplete(async (imagePath: string) => {
      console.log('=== React收到截图完成事件 ===');
      console.log('收到截图完成事件，图片路径:', imagePath);
      console.log('当前时间:', new Date().toISOString());
      
      // 检查文件是否存在
      if (window.electronAPI && imagePath) {
        // 创建一个任务ID来跟踪当前识别任务
        const taskId = Date.now();
        console.log(`开始识别任务 ID: ${taskId}`);
        
        // 先更新图片，但不更改状态消息
        setAppState(prev => ({ 
          ...prev, 
          currentImage: `file://${imagePath}`
        }));
        
        // 等待图片加载完成
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('开始识别截图...');
        // 获取最新的设置
        const currentSettings = settings;
        console.log('当前使用的设置:', currentSettings);
        
        // 直接在这里实现识别逻辑，避免函数依赖
        if (currentSettings) {
          // 开始识别，只设置一次状态
          setAppState(prev => ({ 
            ...prev, 
            isRecognizing: true, 
            latexCode: '',
            statusMessage: '🤖 正在识别公式...'
          }));

          try {
            // 先严格验证API配置是否有效
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
              
              // 合并状态更新，一次性更新所有状态
              setAppState(prev => {
                // 添加到历史记录
                const newItem = {
                  date: getCurrentTimestamp(),
                  latex: latex.trim()
                };
                
                let newHistory = prev.history;
                const exists = prev.history.some(item => item.latex === newItem.latex);
                if (!exists) {
                  newHistory = [newItem, ...prev.history.slice(0, 4)];
                  // 保存到设置
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
    });
    
    console.log('所有Electron事件监听器设置完成');
    
    // 添加清理函数
    return () => {
      console.log('清理事件监听器');
      // 注意：ipcRenderer.removeAllListeners 需要在preload中暴露
    };
  }, [settings]);

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
        // 处理拖拽的图片文件
        const reader = new FileReader();
        reader.onload = async () => {
          if (reader.result) {
            console.log('文件读取完成，设置图片显示');
            setAppState(prev => ({ ...prev, currentImage: reader.result as string }));
            
            // 直接在这里处理识别逻辑，避免函数引用问题
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
               // 将File对象保存为临时文件
               const arrayBuffer = await file.arrayBuffer();
               const uint8Array = new Uint8Array(arrayBuffer);
               const tempPath = await window.electronAPI.saveTempFile(uint8Array, file.name);
               console.log('临时文件保存到:', tempPath);
              
              // 直接内联识别逻辑
              if (settings) {
                // 获取最新的设置
                const currentSettings = settings;
                console.log('当前使用的设置:', currentSettings);
                
                // 创建一个任务ID来跟踪当前识别任务
                const taskId = Date.now();
                console.log(`开始拖拽识别任务 ID: ${taskId}`);
                
                setAppState(prev => ({ 
                  ...prev, 
                  isRecognizing: true, 
                  latexCode: '',
                  statusMessage: '🤖 正在识别公式...'
                }));

                try {
                  // 先严格验证API配置是否有效
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
                    
                    // 合并状态更新，一次性更新所有状态
                    setAppState(prev => {
                      // 添加到历史记录
                      const newItem = {
                        date: getCurrentTimestamp(),
                        latex: latex.trim()
                      };
                      
                      let newHistory = prev.history;
                      const exists = prev.history.some(item => item.latex === newItem.latex);
                      if (!exists) {
                        newHistory = [newItem, ...prev.history.slice(0, 4)];
                        // 保存到设置
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
                    
                    // 检查是否是API配置错误
                    if (result.error_code === 'NO_API_CONFIG') {
                      setAppState(prev => ({ 
                        ...prev, 
                        latexCode: '', // 确保清空公式区域
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

  // 处理截图 - 用于菜单栏直接调用
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
        statusMessage: '📸 请在屏幕上选择区域进行截图'
      }));
    } catch (error) {
      console.error('启动截图失败:', error);
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: '❌ 截图失败'
      }));
    }
  };

  // 处理文件上传 - 用于菜单栏直接调用
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
        // 创建一个任务ID来跟踪当前识别任务
        const taskId = Date.now();
        
        setAppState(prev => ({ 
          ...prev, 
          currentImage: `file://${filePath}`,
          statusMessage: '🔄 准备识别...'
        }));
        
        // 直接内联识别逻辑
        if (settings) {
          // 获取最新的设置
          const currentSettings = settings;
          console.log('当前使用的设置:', currentSettings);
          
          // 创建一个任务ID来跟踪当前识别任务
          const taskId = Date.now();
          console.log(`开始上传识别任务 ID: ${taskId}`);
          
          setAppState(prev => ({ 
            ...prev, 
            isRecognizing: true, 
            latexCode: '',
            statusMessage: '🤖 正在识别公式...'
          }));

          try {
            // 先严格验证API配置是否有效
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
              
              // 合并状态更新，一次性更新所有状态
              setAppState(prev => {
                // 添加到历史记录
                const newItem = {
                  date: getCurrentTimestamp(),
                  latex: latex.trim()
                };
                
                let newHistory = prev.history;
                const exists = prev.history.some(item => item.latex === newItem.latex);
                if (!exists) {
                  newHistory = [newItem, ...prev.history.slice(0, 4)];
                  // 保存到设置
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
              
              // 检查是否是API配置错误
              if (result.error_code === 'NO_API_CONFIG') {
                setAppState(prev => ({ 
                  ...prev, 
                  latexCode: '', // 确保清空公式区域
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

  // 添加到历史记录
  const addToHistory = useCallback(async (latex: string) => {
    if (!latex.trim()) return;

    const newItem: HistoryItem = {
      date: getCurrentTimestamp(),
      latex: latex.trim()
    };

    // 检查是否已存在
    const exists = appState.history.some(item => item.latex === newItem.latex);
    if (exists) return;

    const newHistory = [newItem, ...appState.history.slice(0, 4)]; // 保持最多5条
    setAppState(prev => ({ ...prev, history: newHistory }));

    // 保存到设置（仅在 Electron 环境中）
    if (window.electronAPI) {
      try {
        await window.electronAPI.saveSettings({ history: newHistory });
      } catch (error) {
        console.error('保存历史记录失败:', error);
      }
    }
  }, [appState.history]);

  // 识别公式
  const recognizeFormula = useCallback(async (imagePath: string) => {
    console.log('recognizeFormula被调用，图片路径:', imagePath);
    
    if (!settings) {
      console.log('settings未加载');
      return;
    }

    // 获取最新的设置
    const currentSettings = settings;
    console.log('当前使用的设置:', currentSettings);

    if (!window.electronAPI) {
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: '❌ 公式识别功能仅在 Electron 应用中可用'
      }));
      return;
    }

    // 创建一个任务ID来跟踪当前识别任务
    const taskId = Date.now();
    console.log(`开始通用识别任务 ID: ${taskId}`);

    setAppState(prev => ({ 
      ...prev, 
      isRecognizing: true, 
      latexCode: '',
      statusMessage: '🤖 正在识别公式...'
    }));

    try {
      // 先严格验证API配置是否有效
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
        
        // 合并状态更新，一次性更新所有状态
        setAppState(prev => {
          // 准备历史记录更新
          let newHistory = prev.history;
          
          // 只有当latex不为空时才添加到历史记录
          if (latex.trim()) {
            const newItem = {
              date: getCurrentTimestamp(),
              latex: latex.trim()
            };
            
            const exists = prev.history.some(item => item.latex === newItem.latex);
            if (!exists) {
              newHistory = [newItem, ...prev.history.slice(0, 4)];
              // 保存到设置
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
        
        // 检查是否是API配置错误
        if (result.error_code === 'NO_API_CONFIG') {
          setAppState(prev => ({ 
            ...prev, 
            latexCode: '', // 确保清空公式区域
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

  // 复制LaTeX代码
  const handleCopy = async (mode: CopyMode = 'normal') => {
    if (!appState.latexCode.trim()) return;

    if (mode === 'mathml') {
      // 使用MathML模式 - 直接转换为MathML并复制到剪贴板
      if (!window.electronAPI) {
        setAppState(prev => ({ 
          ...prev, 
          statusMessage: '❌ MathML转换功能仅在桌面应用中可用'
        }));
        return;
      }

      try {
        // 直接调用保存Word文档的方法中的MathML转换功能
        // 这会将LaTeX转换为MathML并复制到剪贴板，但不会显示保存对话框
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

      // 2秒后恢复状态
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
      // 浏览器环境下使用 Clipboard API
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

    // 2秒后恢复状态
    setTimeout(() => {
      setAppState(prev => ({ 
        ...prev, 
        statusMessage: '⚡ 准备就绪'
      }));
    }, 2000);
  };



  // 从历史记录中使用
  const handleUseHistory = (latex: string) => {
    setAppState(prev => ({ ...prev, latexCode: latex }));
    setShowHistory(false);
  };

  // 清空历史记录
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

  // 删除历史记录项
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

  // 保存API设置
  const handleSaveApiSettings = async (apiConfig: ApiConfig) => {
    if (window.electronAPI) {
      try {
        // 检查是否是清空API配置
        const isClearing = !apiConfig.appId || !apiConfig.appSecret || 
                          !apiConfig.appId.trim() || !apiConfig.appSecret.trim();
        
        if (isClearing) {
          console.log('检测到清除API配置操作');
          // 如果是清空配置，调用清除API配置方法
          const result = await window.electronAPI.clearApiConfig();
          console.log('清除API配置结果:', result);
          
          if (result) {
            // 立即更新前端设置状态为空配置
            setSettings(prev => prev ? { 
              ...prev, 
              apiConfig: { appId: '', appSecret: '' }
            } : null);
            
            // 显示清除成功提示
            setAppState(prev => ({ 
              ...prev, 
              statusMessage: '✅ API配置已清除' 
            }));
            
            // 清理当前图片和识别结果
            setAppState(prev => ({
              ...prev,
              currentImage: null,
              latexCode: ''
            }));
          } else {
            // 显示清除失败提示
            setAppState(prev => ({ 
              ...prev, 
              statusMessage: '❌ API配置清除失败' 
            }));
          }
        } else {
          // 保存到electron-store
          await window.electronAPI.saveSettings({ apiConfig });
          
          // 同时保存到settings.json文件
          await window.electronAPI.saveApiToSettingsFile(apiConfig);
          
          // 更新设置状态
          setSettings(prev => prev ? { ...prev, apiConfig } : null);
          
          // 显示保存成功提示
          setAppState(prev => ({ 
            ...prev, 
            statusMessage: '✅ API设置已保存' 
          }));
        }
        
        // 记录日志
        console.log('API设置已更新', apiConfig);
        
        // 清理当前图片和识别结果，避免自动触发识别
        // 这样用户需要重新截图或上传图片，确保新API设置生效
        setAppState(prev => ({
          ...prev,
          currentImage: null,
          latexCode: ''
        }));
        
        // 2秒后恢复状态
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
      // 浏览器环境下的处理
      const isClearing = !apiConfig.appId || !apiConfig.appSecret || 
                        !apiConfig.appId.trim() || !apiConfig.appSecret.trim();
      
      // 更新设置状态
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

  // 保存快捷键设置
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

  // 清理临时文件
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

      // 3秒后恢复状态
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

  // 导出数学公式为图片
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

      // 3秒后恢复状态
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
    <AppContainer {...getRootProps()}>
      <MenuBar
        onCapture={handleCapture}
        onUpload={handleUpload}
        onShowApiSettings={() => setShowApiSettings(true)}
        onShowShortcutSettings={() => setShowShortcutSettings(true)}
        onShowHistory={() => setShowHistory(true)}
        onShowAbout={() => setShowAbout(true)}
        onCleanupTempFiles={handleCleanupTempFiles}
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
          <LatexEditor
            value={appState.latexCode}
            onChange={(value) => setAppState(prev => ({ ...prev, latexCode: value }))}
            readOnly={appState.isRecognizing}
          />
          
          <StatusBar message={appState.statusMessage} />
          
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