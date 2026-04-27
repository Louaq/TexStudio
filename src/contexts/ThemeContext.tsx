import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, themes, getTheme, applyTheme, THEME_ID } from '../theme/themes';

interface ThemeContextType {
  currentTheme: Theme;
  /** 仅保留单一主题，参数可忽略 */
  setTheme: (themeId?: string) => void;
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
  initialThemeId = THEME_ID
}) => {
  void initialThemeId;
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => getTheme('light'));

  const setTheme = (_themeId?: string) => {
    const theme = getTheme('light');
    setCurrentTheme(theme);
    applyTheme(theme, 'light');
    localStorage.setItem('selectedTheme', THEME_ID);
    if (window.electronAPI) {
      window.electronAPI.saveSettings({ theme: THEME_ID }).catch(console.error);
    }
  };

  useEffect(() => {
    applyTheme(currentTheme, 'light');
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, availableThemes: themes }}>
      {children}
    </ThemeContext.Provider>
  );
};
