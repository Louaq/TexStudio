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
    name: '默认蓝色',
    colors: {
      primary: '#4a90e2',
      primaryLight: '#5ba0f2',
      primaryDark: '#357abd',
      
      background: '#f8f9fa',
      backgroundPattern: 'rgba(240, 240, 245, 0.3)',
      
      surface: '#ffffff',
      surfaceLight: 'rgba(255, 255, 255, 0.7)',
      
      text: '#2c3e50',
      textSecondary: '#7f8c8d',
      
      border: '#dce1e8',
      borderLight: '#e1e8ed',
      
      buttonGradientStart: '#4a90e2',
      buttonGradientEnd: '#357abd',
      buttonHoverStart: '#5ba0f2',
      buttonHoverEnd: '#458bcd',
      
      inputBackground: 'white',
      inputBorder: '#e1e8ed',
      inputFocus: '#4a90e2',
      
      success: '#27ae60',
      error: '#e74c3c',
      warning: '#f39c12',
      info: '#3498db',
      
      menuBackground: 'linear-gradient(180deg, #fafbfd 0%, #f2f5f9 100%)',
      menuBorder: '#dce1e8',
      menuHover: '#4375b9',
      
      dialogBackground: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      dialogOverlay: 'rgba(0, 0, 0, 0.5)',
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
      
      menuBackground: 'linear-gradient(180deg, #fbfafc 0%, #f3f1f5 100%)',
      menuBorder: '#d5c9e0',
      menuHover: '#8e44ad',
      
      dialogBackground: 'linear-gradient(135deg, #f5f3f7 0%, #ebe6f0 100%)',
      dialogOverlay: 'rgba(0, 0, 0, 0.5)',
    }
  },
  {
    id: 'green',
    name: '清新绿色',
    colors: {
      primary: '#27ae60',
      primaryLight: '#37be70',
      primaryDark: '#229954',
      
      background: '#f3f8f5',
      backgroundPattern: 'rgba(230, 245, 235, 0.3)',
      
      surface: '#ffffff',
      surfaceLight: 'rgba(255, 255, 255, 0.7)',
      
      text: '#2c3e50',
      textSecondary: '#7f8c8d',
      
      border: '#c9e0d3',
      borderLight: '#d6ebd9',
      
      buttonGradientStart: '#27ae60',
      buttonGradientEnd: '#229954',
      buttonHoverStart: '#37be70',
      buttonHoverEnd: '#32b964',
      
      inputBackground: 'white',
      inputBorder: '#d6ebd9',
      inputFocus: '#27ae60',
      
      success: '#27ae60',
      error: '#e74c3c',
      warning: '#f39c12',
      info: '#3498db',
      
      menuBackground: 'linear-gradient(180deg, #fafcfb 0%, #f1f5f3 100%)',
      menuBorder: '#c9e0d3',
      menuHover: '#229954',
      
      dialogBackground: 'linear-gradient(135deg, #f3f8f5 0%, #e6f0e9 100%)',
      dialogOverlay: 'rgba(0, 0, 0, 0.5)',
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
      
      menuBackground: 'linear-gradient(180deg, #fcfaf8 0%, #f5f1ed 100%)',
      menuBorder: '#e6d4c0',
      menuHover: '#d35400',
      
      dialogBackground: 'linear-gradient(135deg, #faf7f3 0%, #f0e8de 100%)',
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
      
      menuBackground: 'linear-gradient(180deg, #fcfafa 0%, #f5f1f1 100%)',
      menuBorder: '#e6c9c9',
      menuHover: '#c0392b',
      
      dialogBackground: 'linear-gradient(135deg, #faf3f3 0%, #f0e6e6 100%)',
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
      
      menuBackground: 'linear-gradient(180deg, #fafcfc 0%, #f1f5f4 100%)',
      menuBorder: '#c9e0dc',
      menuHover: '#138d75',
      
      dialogBackground: 'linear-gradient(135deg, #f3f8f7 0%, #e6f0ed 100%)',
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
      
      menuBackground: 'linear-gradient(180deg, #fafbfc 0%, #f1f4f7 100%)',
      menuBorder: '#c9d9e6',
      menuHover: '#2980b9',
      
      dialogBackground: 'linear-gradient(135deg, #f3f6f9 0%, #e6ecf0 100%)',
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
      
      menuBackground: 'linear-gradient(180deg, #fcfafb 0%, #f5f1f4 100%)',
      menuBorder: '#e6c9d9',
      menuHover: '#c2185b',
      
      dialogBackground: 'linear-gradient(135deg, #faf3f6 0%, #f0e6ec 100%)',
      dialogOverlay: 'rgba(0, 0, 0, 0.5)',
    }
  },
  {
    id: 'dark',
    name: '暗黑模式',
    colors: {
      primary: '#64b5f6',
      primaryLight: '#74c5ff',
      primaryDark: '#54a5e6',
      
      background: '#1e1e1e',
      backgroundPattern: 'rgba(40, 40, 40, 0.3)',
      
      surface: '#2d2d2d',
      surfaceLight: 'rgba(45, 45, 45, 0.7)',
      
      text: '#e0e0e0',
      textSecondary: '#b0b0b0',
      
      border: '#404040',
      borderLight: '#4a4a4a',
      
      buttonGradientStart: '#64b5f6',
      buttonGradientEnd: '#54a5e6',
      buttonHoverStart: '#74c5ff',
      buttonHoverEnd: '#64b5f6',
      
      inputBackground: '#2d2d2d',
      inputBorder: '#4a4a4a',
      inputFocus: '#64b5f6',
      
      success: '#4caf50',
      error: '#f44336',
      warning: '#ff9800',
      info: '#2196f3',
      
      menuBackground: 'linear-gradient(180deg, #2d2d2d 0%, #252525 100%)',
      menuBorder: '#404040',
      menuHover: '#74c5ff',
      
      dialogBackground: 'linear-gradient(135deg, #2d2d2d 0%, #252525 100%)',
      dialogOverlay: 'rgba(0, 0, 0, 0.7)',
    }
  }
];

// 获取主题
export const getTheme = (themeId: string): Theme => {
  return themes.find(t => t.id === themeId) || themes[0];
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
  
  // 触发重绘，确保所有元素立即更新
  root.style.display = 'none';
  void root.offsetHeight; // 强制重排
  root.style.display = '';
  
  console.log(`✅ 主题 "${theme.name}" 已立即应用`);
};
