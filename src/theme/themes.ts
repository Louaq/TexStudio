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
    primary: '#5E81F4',
    primaryLight: '#4C6FED',
    primaryDark: '#3B5DE6',

    background: '#F5F7FA',
    backgroundPattern: 'rgba(94, 129, 244, 0.05)',

    surface: '#FFFFFF',
    surfaceLight: '#EEF2F7',

    text: '#000000',
    textSecondary: '#5F6C84',
    textMuted: '#8A94A6',
    accentSecondary: '#7C8594',

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

  const appBg = `radial-gradient(ellipse 95% 75% at 0% -8%, rgba(94, 129, 244, 0.08), transparent 52%),
    radial-gradient(ellipse 80% 60% at 100% 108%, rgba(94, 129, 244, 0.05), transparent 48%),
    linear-gradient(168deg, #EEF2FA 0%, ${theme.colors.background} 50%, #F2F5F9 100%)`;
  root.style.setProperty('--app-bg-gradient', appBg);

  root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.45)');
  root.style.setProperty('--glass-bg-strong', 'rgba(255, 255, 255, 0.94)');
  root.style.setProperty('--glass-bg-elevated', 'rgba(255, 255, 255, 0.88)');
  root.style.setProperty('--glass-bg-card', 'rgba(255, 255, 255, 0.96)');
  root.style.setProperty('--glass-border-soft', 'rgba(26, 28, 35, 0.06)');
  root.style.setProperty('--glass-edge', 'rgba(216, 224, 235, 0.95)');

  document.body.style.background = appBg;
  document.body.setAttribute('theme-mode', 'light');

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
  background: var(--glass-bg-card, rgba(255, 255, 255, 0.96));
`;

/** 顶栏（与图1 白底侧栏一致） */
export const glassTitleBar = css`
  background: rgba(255, 255, 255, 0.96);
  border-bottom: 1px solid rgba(216, 224, 235, 0.9);
  transform: translateZ(0);
`;

/** 侧栏：纯白 + 细线分割 */
export const glassSidebar = css`
  background: #ffffff;
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
  background: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid rgba(216, 224, 235, 0.8);
  transform: translateZ(0);
`;

/** 底栏 / 分页条 */
export const glassFooterBar = css`
  background: rgba(255, 255, 255, 0.72);
  border-top: 1px solid var(--glass-edge);
  transform: translateZ(0);
`;

/** 视图根区域透明，透出主内容磨砂层 */
export const glassViewRoot = css`
  background: transparent;
`;
