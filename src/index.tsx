import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "@fontsource/material-symbols-outlined";
import { createGlobalStyle } from 'styled-components';
import { applyTheme, getTheme } from './theme/themes';

/* 首屏即写入变量，避免 useEffect 晚于渲染导致 backdrop-filter 无 blur、看起来像普通白底 */
applyTheme(getTheme());

// 全局样式
const GlobalStyle = createGlobalStyle`
  :root {
    --color-background: #f0f4f8;
    --color-menuBackground: #eef4ff;
    --color-text: #1e293b;
    --app-bg-gradient: radial-gradient(ellipse 95% 75% at 0% -8%, rgba(59, 130, 246, 0.16), transparent 52%),
      radial-gradient(ellipse 80% 60% at 100% 108%, rgba(168, 85, 124, 0.1), transparent 48%),
      linear-gradient(168deg, #e2e8f0 0%, #f0f4f8 45%, #e8edf4 100%);
    --glass-blur: 26px;
    --glass-saturate: 1.3;
    --glass-bg: rgba(255, 255, 255, 0.28);
    --glass-bg-strong: rgba(255, 255, 255, 0.45);
    --glass-bg-elevated: rgba(255, 255, 255, 0.38);
    --glass-bg-card: rgba(255, 255, 255, 0.32);
    --glass-edge: rgba(226, 232, 240, 0.85);
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    /* 添加全局禁止文本选择 */
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  body {
    font-family: "Segoe UI", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: var(--app-bg-gradient, var(--color-background, #f0f4f8));
    color: var(--color-text, #1e293b);
    overflow: hidden;
  }

  #root {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* 滚动条样式 */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,0.15);
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(0,0,0,0.25);
  }

  /* 选择文本样式 */
  ::selection {
    background: rgba(0, 0, 0, 0.1);
    color: var(--color-text);
  }

  /* 输入框焦点样式 */
  input:focus,
  textarea:focus,
  select:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.22);
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

  /* 动画 */
  .fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
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
    transition: all 0.3s ease;
    z-index: 1000;
  }

  .tooltip:hover::after {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(-4px);
  }

  /* Material Symbols Outlined 字体类，匹配 Google 样式用法 */
  .material-symbols-outlined {
    font-family: 'Material Symbols Outlined';
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