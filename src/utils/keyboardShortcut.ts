/** 与浏览器 keydown 事件兼容（electron tsconfig 不含 dom lib） */
export interface ModifierKeyEvent {
  repeat: boolean;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
  key: string;
}

/**
 * 从 keydown 事件生成 Electron globalShortcut 风格字符串（如 Alt+A、Ctrl+Shift+K）。
 * 使用事件上的修饰键布尔值，避免仅用 e.key 累积导致的 Alt/Ctrl 混淆（Windows 上常见问题）。
 */
export function electronShortcutFromKeydown(e: ModifierKeyEvent): string | null {
  if (e.repeat) return null;
  if (!e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey) return null;

  const modOnlyKeys = ['Alt', 'Control', 'Shift', 'Meta'];
  if (modOnlyKeys.includes(e.key)) return null;

  const modifiers: string[] = [];
  if (e.ctrlKey) modifiers.push('Ctrl');
  if (e.altKey) modifiers.push('Alt');
  if (e.shiftKey) modifiers.push('Shift');
  if (e.metaKey) modifiers.push('Cmd');

  let k = e.key;
  if (k === ' ') k = 'Space';
  else if (k.length === 1) k = k.toUpperCase();

  return [...modifiers, k].join('+');
}
