// 主题接口定义
export interface Theme {
  id: string;
  name: string;
  colors: {
    // 主要颜色
    primary: string;
    primaryLight: string;
    primaryDark: string;
    
    // 背景颜色
    background: string;
    backgroundPattern: string;
    
    // 表面颜色
    surface: string;
    surfaceLight: string;
    
    // 文本颜色
    text: string;
    textSecondary: string;
    textMuted: string;
    /** 次要强调色（如品牌第二段、版本号点缀，图1 珊瑚粉） */
    accentSecondary: string;
    
    // 边框颜色
    border: string;
    borderLight: string;
    
    // 按钮渐变
    buttonGradientStart: string;
    buttonGradientEnd: string;
    buttonHoverStart: string;
    buttonHoverEnd: string;
    
    // 输入框
    inputBackground: string;
    inputBorder: string;
    inputFocus: string;
    
    // 状态颜色
    success: string;
    error: string;
    warning: string;
    info: string;
    
    // 菜单栏
    menuBackground: string;
    menuBorder: string;
    menuHover: string;
    
    // 对话框
    dialogBackground: string;
    dialogOverlay: string;
  };
}

// 预定义主题
export const themes: Theme[] = [
  {
    id: 'default',
    name: 'Fluent 浅色',
    colors: {
      primary: '#4a90e2',
      primaryLight: '#5ba0f2',
      primaryDark: '#357abd',

      background: '#f3f6f9',
      backgroundPattern: 'rgba(232, 238, 245, 0.5)',

      surface: '#ffffff',
      surfaceLight: 'rgba(255, 255, 255, 0.92)',

      text: '#323130',
      textSecondary: '#605e5c',
      textMuted: '#a19f9d',
      accentSecondary: '#e76d8d',

      border: '#edebe9',
      borderLight: '#edebe9',

      buttonGradientStart: '#4a90e2',
      buttonGradientEnd: '#357abd',
      buttonHoverStart: '#5ba0f2',
      buttonHoverEnd: '#458bcd',

      inputBackground: '#fafafa',
      inputBorder: '#edebe9',
      inputFocus: '#4a90e2',

      success: '#107c10',
      error: '#d13438',
      warning: '#ca5010',
      info: '#4a90e2',

      menuBackground: '#e8eef5',
      menuBorder: '#dce3ed',
      menuHover: '#4a90e2',

      dialogBackground: '#f3f6f9',
      dialogOverlay: 'rgba(0, 0, 0, 0.45)',
    }
  },
  {
    id: 'purple',
    name: '优雅紫色',
    colors: {
      primary: '#9b59b6',
      primaryLight: '#ab69c6',
      primaryDark: '#8e44ad',
      
      background: '#f5f3f7',
      backgroundPattern: 'rgba(235, 230, 240, 0.3)',
      
      surface: '#ffffff',
      surfaceLight: 'rgba(255, 255, 255, 0.7)',
      
      text: '#2c3e50',
      textSecondary: '#7f8c8d',
      textMuted: '#a19f9d',
      accentSecondary: '#ce7eb8',

      border: '#d5c9e0',
      borderLight: '#e0d6eb',

      buttonGradientStart: '#9b59b6',
      buttonGradientEnd: '#8e44ad',
      buttonHoverStart: '#ab69c6',
      buttonHoverEnd: '#9e54bd',
      
      inputBackground: 'white',
      inputBorder: '#e0d6eb',
      inputFocus: '#9b59b6',
      
      success: '#27ae60',
      error: '#e74c3c',
      warning: '#f39c12',
      info: '#9b59b6',
      
      menuBackground: '#f3f1f6',
      menuBorder: '#d5c9e0',
      menuHover: '#8e44ad',
      
      dialogBackground: '#f5f3f7',
      dialogOverlay: 'rgba(0, 0, 0, 0.5)',
    }
  },
  {
    id: 'green',
    name: '清新绿色',
    colors: {
      primary: '#22c55e',
      primaryLight: '#34d474',
      primaryDark: '#16a34a',
      
      background: '#f5f7f5',
      backgroundPattern: 'rgba(220, 240, 228, 0.3)',
      
      surface: '#ffffff',
      surfaceLight: 'rgba(255, 255, 255, 0.8)',
      
      text: '#1a2e1e',
      textSecondary: '#6b7c72',
      textMuted: '#9ca3af',
      accentSecondary: '#15803d',

      border: '#d1e7d9',
      borderLight: '#e4f0e8',

      buttonGradientStart: '#22c55e',
      buttonGradientEnd: '#16a34a',
      buttonHoverStart: '#34d474',
      buttonHoverEnd: '#22c55e',
      
      inputBackground: '#ffffff',
      inputBorder: '#d1e7d9',
      inputFocus: '#22c55e',
      
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      
      menuBackground: '#f2f6f3',
      menuBorder: '#d1e7d9',
      menuHover: '#16a34a',
      
      dialogBackground: '#f5f7f5',
      dialogOverlay: 'rgba(0, 0, 0, 0.45)',
    }
  },
  {
    id: 'orange',
    name: '活力橙色',
    colors: {
      primary: '#e67e22',
      primaryLight: '#f68e32',
      primaryDark: '#d35400',
      
      background: '#faf7f3',
      backgroundPattern: 'rgba(250, 240, 230, 0.3)',
      
      surface: '#ffffff',
      surfaceLight: 'rgba(255, 255, 255, 0.7)',
      
      text: '#2c3e50',
      textSecondary: '#7f8c8d',
      textMuted: '#a19f9d',
      accentSecondary: '#d35400',

      border: '#e6d4c0',
      borderLight: '#ebe0d1',

      buttonGradientStart: '#e67e22',
      buttonGradientEnd: '#d35400',
      buttonHoverStart: '#f68e32',
      buttonHoverEnd: '#e36e12',
      
      inputBackground: 'white',
      inputBorder: '#ebe0d1',
      inputFocus: '#e67e22',
      
      success: '#27ae60',
      error: '#e74c3c',
      warning: '#f39c12',
      info: '#3498db',
      
      menuBackground: '#f5f1ec',
      menuBorder: '#e6d4c0',
      menuHover: '#d35400',
      
      dialogBackground: '#faf7f3',
      dialogOverlay: 'rgba(0, 0, 0, 0.5)',
    }
  },
  {
    id: 'red',
    name: '热情红色',
    colors: {
      primary: '#e74c3c',
      primaryLight: '#f75c4c',
      primaryDark: '#c0392b',
      
      background: '#faf3f3',
      backgroundPattern: 'rgba(250, 230, 230, 0.3)',
      
      surface: '#ffffff',
      surfaceLight: 'rgba(255, 255, 255, 0.7)',
      
      text: '#2c3e50',
      textSecondary: '#7f8c8d',
      textMuted: '#a19f9d',
      accentSecondary: '#c0392b',

      border: '#e6c9c9',
      borderLight: '#ebd6d6',

      buttonGradientStart: '#e74c3c',
      buttonGradientEnd: '#c0392b',
      buttonHoverStart: '#f75c4c',
      buttonHoverEnd: '#d04a3b',
      
      inputBackground: 'white',
      inputBorder: '#ebd6d6',
      inputFocus: '#e74c3c',
      
      success: '#27ae60',
      error: '#e74c3c',
      warning: '#f39c12',
      info: '#3498db',
      
      menuBackground: '#f5f1f1',
      menuBorder: '#e6c9c9',
      menuHover: '#c0392b',
      
      dialogBackground: '#faf3f3',
      dialogOverlay: 'rgba(0, 0, 0, 0.5)',
    }
  },
  {
    id: 'teal',
    name: '清爽青色',
    colors: {
      primary: '#16a085',
      primaryLight: '#26b095',
      primaryDark: '#138d75',
      
      background: '#f3f8f7',
      backgroundPattern: 'rgba(230, 245, 242, 0.3)',
      
      surface: '#ffffff',
      surfaceLight: 'rgba(255, 255, 255, 0.7)',
      
      text: '#2c3e50',
      textSecondary: '#7f8c8d',
      textMuted: '#a19f9d',
      accentSecondary: '#0d9488',

      border: '#c9e0dc',
      borderLight: '#d6ebd8',

      buttonGradientStart: '#16a085',
      buttonGradientEnd: '#138d75',
      buttonHoverStart: '#26b095',
      buttonHoverEnd: '#1ea085',
      
      inputBackground: 'white',
      inputBorder: '#d6ebd8',
      inputFocus: '#16a085',
      
      success: '#27ae60',
      error: '#e74c3c',
      warning: '#f39c12',
      info: '#3498db',
      
      menuBackground: '#f1f6f5',
      menuBorder: '#c9e0dc',
      menuHover: '#138d75',
      
      dialogBackground: '#f3f8f7',
      dialogOverlay: 'rgba(0, 0, 0, 0.5)',
    }
  },
  {
    id: 'indigo',
    name: '深邃靛蓝',
    colors: {
      primary: '#3498db',
      primaryLight: '#44a8eb',
      primaryDark: '#2980b9',
      
      background: '#f3f6f9',
      backgroundPattern: 'rgba(230, 238, 245, 0.3)',
      
      surface: '#ffffff',
      surfaceLight: 'rgba(255, 255, 255, 0.7)',
      
      text: '#2c3e50',
      textSecondary: '#7f8c8d',
      textMuted: '#a19f9d',
      accentSecondary: '#2980b9',

      border: '#c9d9e6',
      borderLight: '#d6e3ed',

      buttonGradientStart: '#3498db',
      buttonGradientEnd: '#2980b9',
      buttonHoverStart: '#44a8eb',
      buttonHoverEnd: '#3988c9',
      
      inputBackground: 'white',
      inputBorder: '#d6e3ed',
      inputFocus: '#3498db',
      
      success: '#27ae60',
      error: '#e74c3c',
      warning: '#f39c12',
      info: '#3498db',
      
      menuBackground: '#f1f4f8',
      menuBorder: '#c9d9e6',
      menuHover: '#2980b9',
      
      dialogBackground: '#f3f6f9',
      dialogOverlay: 'rgba(0, 0, 0, 0.5)',
    }
  },
  {
    id: 'pink',
    name: '浪漫粉色',
    colors: {
      primary: '#e91e63',
      primaryLight: '#f92e73',
      primaryDark: '#c2185b',
      
      background: '#faf3f6',
      backgroundPattern: 'rgba(250, 230, 240, 0.3)',
      
      surface: '#ffffff',
      surfaceLight: 'rgba(255, 255, 255, 0.7)',
      
      text: '#2c3e50',
      textSecondary: '#7f8c8d',
      textMuted: '#a19f9d',
      accentSecondary: '#c2185b',

      border: '#e6c9d9',
      borderLight: '#ebd6e3',

      buttonGradientStart: '#e91e63',
      buttonGradientEnd: '#c2185b',
      buttonHoverStart: '#f92e73',
      buttonHoverEnd: '#d22e6b',
      
      inputBackground: 'white',
      inputBorder: '#ebd6e3',
      inputFocus: '#e91e63',
      
      success: '#27ae60',
      error: '#e74c3c',
      warning: '#f39c12',
      info: '#3498db',
      
      menuBackground: '#f5f1f4',
      menuBorder: '#e6c9d9',
      menuHover: '#c2185b',
      
      dialogBackground: '#faf3f6',
      dialogOverlay: 'rgba(0, 0, 0, 0.5)',
    }
  }
];

// 获取自定义主题
export const getCustomTheme = (): Theme | null => {
  try {
    const saved = localStorage.getItem('customTheme');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('读取自定义主题失败:', error);
  }
  return null;
};

// 保存自定义主题
export const saveCustomTheme = (theme: Theme): void => {
  try {
    localStorage.setItem('customTheme', JSON.stringify(theme));
  } catch (error) {
    console.error('保存自定义主题失败:', error);
  }
};

// 获取主题（包括自定义主题）
export const getTheme = (themeId: string): Theme => {
  const fallback = themes.find(t => t.id === 'green') || themes[0];
  if (themeId === 'custom') {
    const customTheme = getCustomTheme();
    if (customTheme) {
      return {
        ...customTheme,
        colors: { ...fallback.colors, ...customTheme.colors }
      };
    }
    return {
      id: 'custom',
      name: '自定义主题',
      colors: { ...fallback.colors }
    };
  }
  return themes.find(t => t.id === themeId) || fallback;
};

// 应用主题到CSS变量 - 立即生效
export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  
  // 立即设置CSS变量到文档根元素
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  
  // 同时更新body的背景色，确保立即生效
  document.body.style.background = theme.colors.background;
  
  // 更新 Electron 窗口标题栏颜色（如果在 Electron 环境中）
  if (window.electronAPI && window.electronAPI.updateWindowTheme) {
    // 从背景色和文字色计算标题栏颜色
    const backgroundColor = theme.colors.background;
    const textColor = theme.colors.text;
    
    window.electronAPI.updateWindowTheme(backgroundColor, textColor)
      .then(() => {
        console.log(`✅ Electron 窗口颜色已更新: ${backgroundColor}`);
      })
      .catch((error: Error) => {
        console.error('更新 Electron 窗口颜色失败:', error);
      });
  }
  
  // 触发重绘，确保所有元素立即更新
  root.style.display = 'none';
  void root.offsetHeight; // 强制重排
  root.style.display = '';
  
  console.log(`✅ 主题 "${theme.name}" 已立即应用`);
};
