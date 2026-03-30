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

/** 唯一主题 ID（典雅轻蓝） */
export const THEME_ID = 'formal' as const;

const formalTheme: Theme = {
  id: THEME_ID,
  name: '典雅轻蓝',
  colors: {
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    primaryDark: '#1d4ed8',

    background: '#f0f4f8',
    backgroundPattern: 'rgba(37, 99, 235, 0.035)',

    surface: '#ffffff',
    surfaceLight: '#f8fafc',

    text: '#1e293b',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    accentSecondary: '#a8557c',

    border: '#e2e8f0',
    borderLight: '#eef2f7',

    buttonGradientStart: '#2563eb',
    buttonGradientEnd: '#1d4ed8',
    buttonHoverStart: '#3b82f6',
    buttonHoverEnd: '#2563eb',

    inputBackground: '#ffffff',
    inputBorder: '#e2e8f0',
    inputFocus: '#2563eb',

    success: '#0d9488',
    error: '#be123c',
    warning: '#c2410c',
    info: '#2563eb',

    menuBackground: '#eef4ff',
    menuBorder: '#dbeafe',
    menuHover: '#2563eb',

    dialogBackground: '#f0f4f8',
    dialogOverlay: 'rgba(15, 23, 42, 0.42)',
  },
};

/** 仅含「典雅轻蓝」 */
export const themes: Theme[] = [formalTheme];

/** 任意历史 theme 字段均归一为唯一主题 */
export function normalizeThemeId(themeId: string | undefined | null): string {
  return THEME_ID;
}

// 获取主题（仅典雅轻蓝）
export const getTheme = (_themeId?: string): Theme => formalTheme;

/** 磨砂玻璃：背景层（径向 + 线性渐变，供 backdrop-filter 透出层次） */
export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;

  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });

  const appBg = `radial-gradient(ellipse 95% 75% at 0% -8%, rgba(59, 130, 246, 0.14), transparent 52%),
    radial-gradient(ellipse 80% 60% at 100% 108%, rgba(168, 85, 124, 0.09), transparent 48%),
    linear-gradient(168deg, #e2e8f0 0%, ${theme.colors.background} 45%, #e8edf4 100%)`;
  root.style.setProperty('--app-bg-gradient', appBg);

  /* 透明度略低，磨砂才看得出模糊；blur 略大 */
  root.style.setProperty('--glass-blur', '28px');
  root.style.setProperty('--glass-saturate', '1.35');
  root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.28)');
  root.style.setProperty('--glass-bg-strong', 'rgba(255, 255, 255, 0.45)');
  root.style.setProperty('--glass-bg-elevated', 'rgba(255, 255, 255, 0.38)');
  root.style.setProperty('--glass-bg-card', 'rgba(255, 255, 255, 0.32)');
  root.style.setProperty('--glass-border-soft', 'rgba(255, 255, 255, 0.55)');
  root.style.setProperty('--glass-edge', 'rgba(226, 232, 240, 0.85)');

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

/* var 带 px 回退：首帧未跑 applyTheme 时仍能模糊 */
const backdrop = css`
  -webkit-backdrop-filter: blur(var(--glass-blur, 26px)) saturate(var(--glass-saturate, 1.3));
  backdrop-filter: blur(var(--glass-blur, 26px)) saturate(var(--glass-saturate, 1.3));
`;

/** 仅毛玻璃模糊（用于上传区等局部） */
export const glassBackdrop = backdrop;

/** 顶栏磨砂（与侧栏同系浅蓝，避免大块死白） */
export const glassTitleBar = css`
  ${backdrop}
  background: rgba(238, 244, 255, 0.78);
  border-bottom: 1px solid rgba(191, 219, 254, 0.65);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.42);
  transform: translateZ(0);
`;

/** 侧栏磨砂（不用 color-mix，兼容旧内核） */
export const glassSidebar = css`
  ${backdrop}
  background: rgba(238, 244, 255, 0.42);
  border-right: 1px solid var(--glass-edge);
  box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.35);
  transform: translateZ(0);
`;

/** 主内容区磨砂（translateZ 促建立体合成层，部分环境下 backdrop 才生效） */
export const glassMain = css`
  ${backdrop}
  background: var(--glass-bg, rgba(255, 255, 255, 0.28));
  border-left: 1px solid transparent;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
  transform: translateZ(0);
`;

/** 卡片 / 面板磨砂 */
export const glassCard = css`
  ${backdrop}
  background: var(--glass-bg-card, rgba(255, 255, 255, 0.32));
  border: 1px solid var(--glass-edge);
  box-shadow:
    0 4px 24px rgba(15, 23, 42, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  transform: translateZ(0);
`;

/** 各页顶栏磨砂（与主题浅蓝一致） */
export const glassPageHeader = css`
  ${backdrop}
  background: rgba(238, 244, 255, 0.55);
  border-bottom: 1px solid rgba(191, 219, 254, 0.55);
  box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.22);
  transform: translateZ(0);
`;

/** 底栏 / 分页条磨砂 */
export const glassFooterBar = css`
  ${backdrop}
  background: rgba(255, 255, 255, 0.4);
  border-top: 1px solid var(--glass-edge);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28);
  transform: translateZ(0);
`;

/** 视图根区域透明，透出主内容磨砂层 */
export const glassViewRoot = css`
  background: transparent;
`;
