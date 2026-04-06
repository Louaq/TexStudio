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

/** 唯一主题 ID（青花 Qing-hua：钴蓝 + 瓷白） */
export const THEME_ID = 'formal' as const;

const formalTheme: Theme = {
  id: THEME_ID,
  name: '青花',
  colors: {
    /** 经典钴蓝 */
    primary: '#1E3F66',
    primaryLight: '#275983',
    primaryDark: '#152d4a',

    /** 瓷白底 F2F7FF / F7FBFF */
    background: '#F2F7FF',
    backgroundPattern: 'rgba(30, 63, 102, 0.045)',

    surface: '#F7FBFF',
    surfaceLight: '#E6F0FF',

    /** 深钴蓝文字 #102349 */
    text: '#102349',
    textSecondary: 'rgba(16, 35, 73, 0.62)',
    textMuted: 'rgba(16, 35, 73, 0.42)',
    /** 次要点缀：略偏灰蓝，与钴蓝协调 */
    accentSecondary: '#5c7a9e',

    border: 'rgba(16, 35, 73, 0.12)',
    borderLight: 'rgba(16, 35, 73, 0.06)',

    buttonGradientStart: '#1E3F66',
    buttonGradientEnd: '#152d4a',
    buttonHoverStart: '#275983',
    buttonHoverEnd: '#1E3F66',

    inputBackground: '#F7FBFF',
    inputBorder: 'rgba(16, 35, 73, 0.14)',
    inputFocus: '#1E3F66',

    success: '#0d9488',
    error: '#be123c',
    warning: '#c2410c',
    info: '#1E3F66',

    menuBackground: '#E6F0FF',
    menuBorder: 'rgba(16, 35, 73, 0.10)',
    menuHover: '#1E3F66',

    dialogBackground: '#F2F7FF',
    dialogOverlay: 'rgba(16, 35, 73, 0.45)',
  },
};

/** 仅含「青花」 */
export const themes: Theme[] = [formalTheme];

/** 任意历史 theme 字段均归一为唯一主题 */
export function normalizeThemeId(themeId: string | undefined | null): string {
  return THEME_ID;
}

// 获取主题（仅青花）
export const getTheme = (_themeId?: string): Theme => formalTheme;

/** 应用主题色与页面背景渐变（不使用背景模糊） */
export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;

  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });

  const appBg = `radial-gradient(ellipse 95% 75% at 0% -8%, rgba(30, 63, 102, 0.14), transparent 52%),
    radial-gradient(ellipse 80% 60% at 100% 108%, rgba(185, 215, 255, 0.35), transparent 48%),
    linear-gradient(168deg, #D4E5FF 0%, ${theme.colors.background} 45%, #E6F0FF 100%)`;
  root.style.setProperty('--app-bg-gradient', appBg);

  root.style.setProperty('--glass-bg', 'rgba(247, 251, 255, 0.52)');
  root.style.setProperty('--glass-bg-strong', 'rgba(255, 255, 255, 0.78)');
  root.style.setProperty('--glass-bg-elevated', 'rgba(230, 240, 255, 0.68)');
  root.style.setProperty('--glass-bg-card', 'rgba(247, 251, 255, 0.78)');
  root.style.setProperty('--glass-border-soft', 'rgba(16, 35, 73, 0.08)');
  root.style.setProperty('--glass-edge', 'rgba(16, 35, 73, 0.10)');

  document.body.style.background = appBg;

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

  console.log(`✅ 主题 "${theme.name}" 已立即应用`);
};

/** 上传区等局部：纯色底，无 backdrop-filter */
export const glassBackdrop = css`
  background: var(--glass-bg-card, rgba(247, 251, 255, 0.96));
`;

/** 顶栏（青花：E6F0FF 系） */
export const glassTitleBar = css`
  background: rgba(230, 240, 255, 0.88);
  border-bottom: 1px solid rgba(16, 35, 73, 0.08);
  transform: translateZ(0);
`;

/** 侧栏 */
export const glassSidebar = css`
  background: rgba(230, 240, 255, 0.48);
  border-right: 1px solid var(--glass-edge);
  transform: translateZ(0);
`;

/** 主内容区 */
export const glassMain = css`
  background: var(--glass-bg, rgba(247, 251, 255, 0.4));
  border-left: 1px solid transparent;
  transform: translateZ(0);
`;

/** 卡片 / 面板 */
export const glassCard = css`
  background: var(--glass-bg-card, rgba(247, 251, 255, 0.78));
  border: 1px solid var(--glass-edge);
  transform: translateZ(0);
`;

/** 各页顶栏 */
export const glassPageHeader = css`
  background: rgba(230, 240, 255, 0.68);
  border-bottom: 1px solid rgba(16, 35, 73, 0.08);
  transform: translateZ(0);
`;

/** 底栏 / 分页条 */
export const glassFooterBar = css`
  background: rgba(247, 251, 255, 0.55);
  border-top: 1px solid var(--glass-edge);
  transform: translateZ(0);
`;

/** 视图根区域透明，透出主内容磨砂层 */
export const glassViewRoot = css`
  background: transparent;
`;
