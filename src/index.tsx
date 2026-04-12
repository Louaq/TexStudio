import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "@fontsource/material-symbols-outlined";
import { createGlobalStyle } from 'styled-components';
import { applyTheme, getTheme } from './theme/themes';

/* 首屏即写入主题变量 */
applyTheme(getTheme());

// 全局样式
const GlobalStyle = createGlobalStyle`
  :root {
    --base-radius: 12px;
    --base-spacing: 16px;
    --font-sans: 'MISAN VF', 'MiSans VF', 'Segoe UI', 'Microsoft YaHei', sans-serif;
    --font-mono: 'Maple Mono NF CN', 'Consolas', 'Courier New', monospace;

    --bounce-in: cubic-bezier(0.5, 1.8, 0.5, 1);
    --smooth-out: cubic-bezier(0.2, 0.8, 0.4, 1);
    --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

    /* 图1 极简星阶：主底冷灰白，卡片/侧栏纯白，次级浅蓝灰 */
    --bg-primary: #F5F7FA;
    --bg-secondary: #FFFFFF;
    --bg-tertiary: #EEF2F7;
    --text-primary: #000000;
    --text-secondary: #5F6C84;
    --text-muted: #8A94A6;
    --accent-primary: #5E81F4;
    --accent-hover: #4C6FED;
    --accent-active: #3B5DE6;
    --border-primary: #D8E0EB;
    --border-hover: #C2CBD6;

    --dark-bg-primary: #121218;
    --dark-bg-secondary: #1E1E28;
    --dark-bg-tertiary: #2A2A38;
    --dark-text-primary: #F0F4FF;
    --dark-text-secondary: #A6B0C3;
    --dark-text-muted: #7C8594;
    --dark-accent-primary: #7B91FF;
    --dark-accent-hover: #8C9EFF;
    --dark-accent-active: #6A81FF;
    --dark-border-primary: #3A3A4D;
    --dark-border-hover: #4A4A61;
    --dark-code-bg: #232330;
    --dark-card-shadow: 0 4px 20px rgba(0,0,0,0.15);

    --current-bg: var(--bg-primary);
    --current-card: var(--bg-secondary);
    --current-bubble: var(--bg-tertiary);
    --current-text: var(--text-primary);
    --current-subtext: var(--text-secondary);
    --current-muted: var(--text-muted);
    --current-accent: var(--accent-primary);
    --current-accent-hover: var(--accent-hover);
    --current-accent-active: var(--accent-active);
    --current-border: var(--border-primary);
    --current-border-hover: var(--border-hover);
    --current-input-shade: rgba(255, 255, 255, 0.92);
  }

  html {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    transition:
      background-color 0.25s var(--smooth-out),
      border-color 0.25s var(--smooth-out),
      color 0.25s var(--smooth-out),
      box-shadow 0.25s var(--smooth-out);
  }

  body {
    font-family: var(--font-sans);
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: var(--app-bg-gradient, var(--color-background, var(--bg-primary)));
    color: var(--color-text, var(--text-primary));
    overflow: hidden;
    overflow-x: hidden;
    height: 100%;
    width: 100%;
    min-height: 100%;
  }

  body[theme-mode='light'] {
    --current-bg: var(--bg-primary);
    --current-card: var(--bg-secondary);
    --current-bubble: var(--bg-tertiary);
    --current-text: var(--text-primary);
    --current-subtext: var(--text-secondary);
    --current-muted: var(--text-muted);
    --current-accent: var(--accent-primary);
    --current-accent-hover: var(--accent-hover);
    --current-accent-active: var(--accent-active);
    --current-border: var(--border-primary);
    --current-border-hover: var(--border-hover);
    --current-input-shade: rgba(255, 255, 255, 0.92);
  }

  body[theme-mode='dark'] {
    --current-bg: var(--dark-bg-primary);
    --current-card: var(--dark-bg-secondary);
    --current-bubble: var(--dark-bg-tertiary);
    --current-text: var(--dark-text-primary);
    --current-subtext: var(--dark-text-secondary);
    --current-muted: var(--dark-text-muted);
    --current-accent: var(--dark-accent-primary);
    --current-accent-hover: var(--dark-accent-hover);
    --current-accent-active: var(--dark-accent-active);
    --current-border: var(--dark-border-primary);
    --current-border-hover: var(--dark-border-hover);
    --current-input-shade: rgba(25, 25, 40, 0.7);

    color-scheme: dark;
    -webkit-font-smoothing: antialiased;
    text-shadow: 0 0 1px rgba(0,0,0,0.3);
  }

  #root {
    height: 100%;
    width: 100%;
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }

  @keyframes messagePop {
    0% { opacity: 0; transform: translateY(12px) scale(0.96); }
    60% { transform: translateY(-6px) scale(1.03); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes inputBreath {
    0% { box-shadow: 0 0 0 0 rgba(94, 129, 244, 0.3); }
    70% { box-shadow: 0 0 0 10px rgba(94, 129, 244, 0); }
  }

  .message-content-container {
    background: var(--current-bubble) !important;
    border: 1px solid var(--current-border) !important;
    margin: 8px 4px !important;
    padding: 14px 18px !important;
    animation: messagePop 0.6s var(--bounce-in) forwards !important;
    border-radius: var(--base-radius) !important;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    line-height: 1.6 !important;
    transition: transform 0.25s var(--smooth-out);
  }

  body[theme-mode='dark'] .message-content-container {
    box-shadow: 0 1px 4px rgba(0,0,0,0.12);
  }

  .message-content-container:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0,0,0,0.08);
  }

  body[theme-mode='dark'] .message-content-container:hover {
    box-shadow: 0 3px 10px rgba(0,0,0,0.15);
  }

  .message-user.message-content-container {
    background-color: color-mix(in srgb, var(--current-accent) 8%, var(--current-bubble)) !important;
    border-color: color-mix(in srgb, var(--current-accent) 20%, var(--current-border)) !important;
  }

  .message-user.message-content-container:hover {
    background-color: color-mix(in srgb, var(--current-accent) 12%, var(--current-bubble)) !important;
    border-color: color-mix(in srgb, var(--current-accent) 30%, var(--current-border)) !important;
  }

  #inputbar-container {
    margin: 0 !important;
    padding: 8px !important;
    background: linear-gradient(
      to top,
      var(--current-bg) 70%,
      transparent 100%
    ) !important;
  }

  #inputbar {
    border: 1px solid var(--current-border) !important;
    backdrop-filter: blur(12px);
    animation: inputBreath 3s ease-in-out infinite !important;
    border-radius: var(--base-radius) !important;
    padding: 8px 8px !important;
    background: var(--current-input-shade) !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }

  #inputbar:focus-within {
    animation: none !important;
    box-shadow: 0 0 0 2px var(--current-accent) !important;
    border-color: var(--current-accent) !important;
  }

  pre, code {
    font-family: var(--font-mono) !important;
    background: var(--current-card) !important;
    border-radius: 8px !important;
    padding: 1px 4px !important;
    font-size: 0.95em !important;
  }

  pre {
    padding: 12px 16px !important;
    border: 1px solid var(--current-border) !important;
    overflow-x: auto !important;
  }

  pre code {
    padding: 0 !important;
    background: transparent !important;
  }

  body[theme-mode='dark'] pre,
  body[theme-mode='dark'] code {
    background: var(--dark-code-bg) !important;
  }

  body[theme-mode='dark'] pre code {
    background: transparent !important;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: var(--current-border);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--current-border-hover);
  }

  ::selection {
    background: color-mix(in srgb, var(--current-accent) 30%, transparent);
    color: var(--color-text, var(--current-text));
  }

  a {
    color: var(--current-accent);
    text-decoration: none;
    transition: all 0.2s var(--ease-in-out);
  }

  a:hover {
    color: var(--current-accent-hover);
  }

  /* 输入框焦点样式 */
  input:focus,
  textarea:focus,
  select:focus {
    outline: 2px solid color-mix(in srgb, var(--color-primary, var(--current-accent)) 55%, transparent);
    outline-offset: 0;
  }

  /* 禁用拖拽选择 */
  .no-drag {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  /* 对于需要可选择文本的元素（如输入框、文本区域）重新启用文本选择 */
  input, 
  textarea, 
  [contenteditable="true"] {
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    user-select: text;
  }

  /* 首屏淡入：仅透明度，避免位移触发布局 */
  .fade-in {
    animation: fadeIn 0.1s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* 工具提示样式 */
  .tooltip {
    position: relative;
  }

  .tooltip::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 13px;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.12s ease, visibility 0.12s ease;
    z-index: 1000;
  }

  .tooltip:hover::after {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(-4px);
  }

  /* Material Symbols Outlined 字体类，匹配 Google 样式用法 */
  .material-symbols-outlined {
    font-family: 'Material Symbols Outlined' !important;
    font-weight: normal;
    font-style: normal;
    font-size: 26px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-feature-settings: 'liga';
    font-feature-settings: 'liga';
    -webkit-font-smoothing: antialiased;
    /* 指定可变字体轴，确保某些符号（如 ink_eraser）正确渲染 */
    font-variation-settings:
      'FILL' 0,
      'wght' 400,
      'GRAD' 0,
      'opsz' 26;
  }
`;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// 移除StrictMode以防止重复渲染
root.render(
  <>
    <GlobalStyle />
    <App />
  </>
); 