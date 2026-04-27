import { css } from 'styled-components';

// 主题接口定义
export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    background: string;
    backgroundPattern: string;
    surface: string;
    surfaceLight: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    accentSecondary: string;
    border: string;
    borderLight: string;
    buttonGradientStart: string;
    buttonGradientEnd: string;
    buttonHoverStart: string;
    buttonHoverEnd: string;
    inputBackground: string;
    inputBorder: string;
    inputFocus: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    menuBackground: string;
    menuBorder: string;
    menuHover: string;
    dialogBackground: string;
    dialogOverlay: string;
  };
}

/** 主题模式 */
export type ThemeMode = 'light' | 'dark';

/** 唯一主题 ID（青花 Qing-hua：钴蓝 + 瓷白） */
export const THEME_ID = 'formal' as const;

const lightTheme: Theme = {
  id: THEME_ID,
  name: '青花',
  colors: {
    primary: '#5E81F4',
    primaryLight: '#4C6FED',
    primaryDark: '#3B5DE6',

    background: '#F5F7FA',
    backgroundPattern: 'rgba(94, 129, 244, 0.05)',

    surface: '#FFFFFF',
    surfaceLight: '#EEF2F7',

    text: '#000000',
    textSecondary: '#000000',
    textMuted: '#000000',
    accentSecondary: '#000000',

    border: '#D8E0EB',
    borderLight: 'rgba(216, 224, 235, 0.55)',

    buttonGradientStart: '#5E81F4',
    buttonGradientEnd: '#3B5DE6',
    buttonHoverStart: '#4C6FED',
    buttonHoverEnd: '#5E81F4',

    inputBackground: 'rgba(255, 255, 255, 0.96)',
    inputBorder: '#D8E0EB',
    inputFocus: '#5E81F4',

    success: '#0d9488',
    error: '#be123c',
    warning: '#c2410c',
    info: '#5E81F4',

    menuBackground: '#FFFFFF',
    menuBorder: 'rgba(216, 224, 235, 0.85)',
    menuHover: '#5E81F4',

    dialogBackground: '#FFFFFF',
    dialogOverlay: 'rgba(26, 28, 35, 0.45)',
  },
};

const darkTheme: Theme = {
  id: THEME_ID,
  name: '青花·夜',
  colors: {
    primary: '#7B91FF',
    primaryLight: '#8C9EFF',
    primaryDark: '#6A81FF',

    background: '#121218',
    backgroundPattern: 'rgba(123, 145, 255, 0.06)',

    surface: '#1E1E28',
    surfaceLight: '#2A2A38',

    text: '#F0F4FF',
    textSecondary: '#F0F4FF',
    textMuted: '#F0F4FF',
    accentSecondary: '#F0F4FF',

    border: '#3A3A4D',
    borderLight: 'rgba(58, 58, 77, 0.55)',

    buttonGradientStart: '#7B91FF',
    buttonGradientEnd: '#6A81FF',
    buttonHoverStart: '#8C9EFF',
    buttonHoverEnd: '#7B91FF',

    inputBackground: 'rgba(35, 35, 48, 0.96)',
    inputBorder: '#3A3A4D',
    inputFocus: '#7B91FF',

    success: '#10b981',
    error: '#f43f5e',
    warning: '#f59e0b',
    info: '#7B91FF',

    menuBackground: '#1E1E28',
    menuBorder: 'rgba(58, 58, 77, 0.85)',
    menuHover: '#7B91FF',

    dialogBackground: '#1E1E28',
    dialogOverlay: 'rgba(0, 0, 0, 0.55)',
  },
};

export const themes: Theme[] = [lightTheme, darkTheme];

/** 任意历史 theme 字段均归一为唯一主题 */
export function normalizeThemeId(themeId: string | undefined | null): string {
  return THEME_ID;
}

/** 归一化主题模式（兼容历史值） */
export function normalizeThemeMode(mode: string | undefined | null): ThemeMode {
  return mode === 'dark' ? 'dark' : 'light';
}

/** 获取主题（按模式选择） */
export const getTheme = (mode: ThemeMode = 'light'): Theme =>
  mode === 'dark' ? darkTheme : lightTheme;

/** 应用主题色与页面背景渐变（不使用背景模糊） */
export const applyTheme = (theme: Theme, mode: ThemeMode = 'light') => {
  const root = document.documentElement;

  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });

  const isDark = mode === 'dark';

  const appBg = isDark
    ? `radial-gradient(ellipse 95% 75% at 0% -8%, rgba(123, 145, 255, 0.10), transparent 52%),
    radial-gradient(ellipse 80% 60% at 100% 108%, rgba(123, 145, 255, 0.06), transparent 48%),
    linear-gradient(168deg, #16161E 0%, ${theme.colors.background} 50%, #14141A 100%)`
    : `radial-gradient(ellipse 95% 75% at 0% -8%, rgba(94, 129, 244, 0.08), transparent 52%),
    radial-gradient(ellipse 80% 60% at 100% 108%, rgba(94, 129, 244, 0.05), transparent 48%),
    linear-gradient(168deg, #EEF2FA 0%, ${theme.colors.background} 50%, #F2F5F9 100%)`;
  root.style.setProperty('--app-bg-gradient', appBg);

  if (isDark) {
    root.style.setProperty('--glass-bg', 'rgba(30, 30, 40, 0.45)');
    root.style.setProperty('--glass-bg-strong', 'rgba(30, 30, 40, 0.94)');
    root.style.setProperty('--glass-bg-elevated', 'rgba(30, 30, 40, 0.88)');
    root.style.setProperty('--glass-bg-card', 'rgba(30, 30, 40, 0.96)');
    root.style.setProperty('--glass-border-soft', 'rgba(255, 255, 255, 0.06)');
    root.style.setProperty('--glass-edge', 'rgba(58, 58, 77, 0.95)');

    root.style.setProperty('--ui-titlebar-bg', 'rgba(30, 30, 40, 0.96)');
    root.style.setProperty('--ui-titlebar-border', 'rgba(58, 58, 77, 0.9)');
    root.style.setProperty('--ui-pageheader-bg', 'rgba(30, 30, 40, 0.92)');
    root.style.setProperty('--ui-pageheader-border', 'rgba(58, 58, 77, 0.8)');
    root.style.setProperty('--ui-footerbar-bg', 'rgba(30, 30, 40, 0.72)');
    root.style.setProperty('--ui-sidebar-bg', '#1E1E28');
    root.style.setProperty('--ui-placeholder', 'rgba(240, 244, 255, 0.5)');
  } else {
    root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.45)');
    root.style.setProperty('--glass-bg-strong', 'rgba(255, 255, 255, 0.94)');
    root.style.setProperty('--glass-bg-elevated', 'rgba(255, 255, 255, 0.88)');
    root.style.setProperty('--glass-bg-card', 'rgba(255, 255, 255, 0.96)');
    root.style.setProperty('--glass-border-soft', 'rgba(26, 28, 35, 0.06)');
    root.style.setProperty('--glass-edge', 'rgba(216, 224, 235, 0.95)');

    root.style.setProperty('--ui-titlebar-bg', 'rgba(255, 255, 255, 0.96)');
    root.style.setProperty('--ui-titlebar-border', 'rgba(216, 224, 235, 0.9)');
    root.style.setProperty('--ui-pageheader-bg', 'rgba(255, 255, 255, 0.92)');
    root.style.setProperty('--ui-pageheader-border', 'rgba(216, 224, 235, 0.8)');
    root.style.setProperty('--ui-footerbar-bg', 'rgba(255, 255, 255, 0.72)');
    root.style.setProperty('--ui-sidebar-bg', '#ffffff');
    root.style.setProperty('--ui-placeholder', 'rgba(0, 0, 0, 0.5)');
  }

  document.body.style.background = appBg;
  document.body.setAttribute('theme-mode', isDark ? 'dark' : 'light');

  if (window.electronAPI && window.electronAPI.updateWindowTheme) {
    const backgroundColor = theme.colors.background;
    const textColor = theme.colors.text;

    window.electronAPI
      .updateWindowTheme(backgroundColor, textColor)
      .then(() => {
        console.log(`✅ Electron 窗口颜色已更新: ${backgroundColor}`);
      })
      .catch((error: Error) => {
        console.error('更新 Electron 窗口颜色失败:', error);
      });
  }

  console.log(`✅ 主题 "${theme.name}" 已立即应用 (mode=${mode})`);
};

/** 上传区等局部：纯色底，无 backdrop-filter */
export const glassBackdrop = css`
  background: var(--glass-bg-card, rgba(255, 255, 255, 0.96));
`;

/** 顶栏（与图1 白底侧栏一致） */
export const glassTitleBar = css`
  background: var(--ui-titlebar-bg, rgba(255, 255, 255, 0.96));
  border-bottom: 1px solid var(--ui-titlebar-border, rgba(216, 224, 235, 0.9));
  transform: translateZ(0);
`;

/** 侧栏：纯色 + 细线分割（随主题切换） */
export const glassSidebar = css`
  background: var(--ui-sidebar-bg, #ffffff);
  border-right: 1px solid var(--glass-edge);
  transform: translateZ(0);
`;

/** 主内容区 */
export const glassMain = css`
  background: var(--glass-bg, rgba(245, 247, 250, 0.35));
  border-left: 1px solid transparent;
  transform: translateZ(0);
`;

/** 卡片 / 面板 */
export const glassCard = css`
  background: var(--glass-bg-card, rgba(255, 255, 255, 0.96));
  border: 1px solid var(--glass-edge);
  transform: translateZ(0);
`;

/** 各页顶栏 */
export const glassPageHeader = css`
  background: var(--ui-pageheader-bg, rgba(255, 255, 255, 0.92));
  border-bottom: 1px solid var(--ui-pageheader-border, rgba(216, 224, 235, 0.8));
  transform: translateZ(0);
`;

/** 底栏 / 分页条 */
export const glassFooterBar = css`
  background: var(--ui-footerbar-bg, rgba(255, 255, 255, 0.72));
  border-top: 1px solid var(--glass-edge);
  transform: translateZ(0);
`;

/** 视图根区域透明，透出主内容磨砂层 */
export const glassViewRoot = css`
  background: transparent;
`;
