import React from 'react';

interface MaterialIconProps {
  name: string;
  size?: number;
  title?: string;
  style?: React.CSSProperties;
  className?: string;
}

const MaterialIcon: React.FC<MaterialIconProps> = ({ name, size = 18, title, style, className }) => {
  return (
    <span
      className={`material-symbols-outlined${className ? ` ${className}` : ''}`}
      style={{ fontSize: size, lineHeight: 1, verticalAlign: 'middle', ...style }}
      aria-hidden="true"
      title={title}
    >
      {name}
    </span>
  );
};

export default MaterialIcon;


