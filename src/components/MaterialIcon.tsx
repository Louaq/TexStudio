import React from 'react';

interface MaterialIconProps {
  name: string;
  size?: number;
  title?: string;
  style?: React.CSSProperties;
  className?: string;
  color?: string;
}

// 本地后备 SVG 图标集合
const LocalIcons: Record<string, React.ReactNode> = {
  eraser: (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
      <path fill="currentColor" d="M16.24 3.56c-.78-.78-2.05-.78-2.83 0L3.81 13.16c-.78.78-.78 2.05 0 2.83l3.54 3.54c.39.39.9.59 1.41.59H20c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1h-7.59l6.83-6.83c.78-.78.78-2.05 0-2.83l-2-2zM5.22 15.58l8.49-8.49 2 2-8.49 8.49-2-2zM9.17 19H8.17l-2-2h1l1.5 1.5L9.17 19z"/>
    </svg>
  ),
};

const MaterialIcon: React.FC<MaterialIconProps> = ({ name, size = 18, title, style, className, color }) => {
  const normalized = name.toLowerCase();
  const useFallback = normalized === 'ink_eraser' || normalized === 'ink-eraser' || normalized === 'eraser';

  if (useFallback) {
    return (
      <span
        style={{ fontSize: size, lineHeight: 1, verticalAlign: 'middle', display: 'inline-flex', color: color || 'inherit', ...style }}
        aria-hidden="true"
        title={title}
        className={className}
      >
        {LocalIcons.eraser}
      </span>
    );
  }

  return (
    <span
      className={`material-symbols-outlined${className ? ` ${className}` : ''}`}
      style={{ fontSize: size, lineHeight: 1, verticalAlign: 'middle', color: color || 'inherit', ...style }}
      aria-hidden="true"
      title={title}
    >
      {name}
    </span>
  );
};

export default MaterialIcon;


