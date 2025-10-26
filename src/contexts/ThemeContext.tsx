import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, themes, getTheme, applyTheme } from '../theme/themes';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
  initialThemeId?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  initialThemeId = 'green' 
}) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => getTheme(initialThemeId));

  const setTheme = (themeId: string) => {
    const theme = getTheme(themeId);
    setCurrentTheme(theme);
    applyTheme(theme);
    
    // 保存主题选择到localStorage
    localStorage.setItem('selectedTheme', themeId);
    
    // 如果在Electron环境中，也保存到设置
    if (window.electronAPI) {
      window.electronAPI.saveSettings({ theme: themeId }).catch(console.error);
    }
  };

  useEffect(() => {
    // 应用初始主题
    applyTheme(currentTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, availableThemes: themes }}>
      {children}
    </ThemeContext.Provider>
  );
};
