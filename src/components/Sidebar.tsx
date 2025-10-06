import React, { useMemo } from 'react';
import styled from 'styled-components';
import MaterialIcon from './MaterialIcon';
import { SidebarConfig } from '../types';

const SidebarContainer = styled.div`
  width: 48px;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 0 12px 0;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  z-index: 100;
  transition: all 0.3s ease;
  overflow-y: auto;
  position: relative;
  
  /* 滚动条样式 */
  &::-webkit-scrollbar {
    width: 3px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.02);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.2);
  }
`;

const MenuItem = styled.div<{ $active?: boolean; $highlighted?: boolean; disabled?: boolean }>`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  border-radius: 8px;
  margin: 4px 0;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  color: ${props => {
    if (props.$active || props.$highlighted) return 'var(--color-primary)';
    return 'var(--color-textSecondary)';
  }};
  background: transparent;
  opacity: ${props => props.disabled ? 0.4 : 1};

  /* 第一个图标移除顶部margin，使其对齐标题栏底部 */
  &:first-child {
    margin-top: 0;
  }

  &:hover {
    ${props => !props.disabled && !props.$active && `
      color: var(--color-primary);
    `}
  }

  ${props => props.$active && `
    color: var(--color-primary);
    
    &::before {
      content: '';
      position: absolute;
      left: -12px;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 20px;
      background: var(--color-primary);
      border-radius: 0 2px 2px 0;
    }
  `}
`;

const Divider = styled.div`
  width: 24px;
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
  margin: 8px 0;
`;

type ViewType = 'home' | 'settings' | 'history' | 'about';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onCapture: () => void;
  onUpload: () => void;
  onCopy: () => void;
  onExport: () => void;
  copyDisabled?: boolean;
  exportDisabled?: boolean;
  sidebarConfig?: SidebarConfig;
}

// 默认侧边栏配置
export const getDefaultSidebarConfig = (): SidebarConfig => ({
  items: [
    { id: 'home', label: '主页', icon: 'home', visible: true, order: 0, type: 'view' },
    { id: 'capture', label: '截图', icon: 'photo_camera', visible: true, order: 1, type: 'action' },
    { id: 'copy', label: '复制LaTeX', icon: 'content_copy', visible: true, order: 2, type: 'action' },
    { id: 'export', label: '导出图片', icon: 'download', visible: true, order: 3, type: 'action' },
    { id: 'history', label: '历史记录', icon: 'history', visible: true, order: 4, type: 'view' },
    { id: 'settings', label: '设置', icon: 'settings', visible: true, order: 5, type: 'view' },
    { id: 'about', label: '关于', icon: 'info', visible: true, order: 6, type: 'view' }
  ]
});

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  onCapture,
  onUpload,
  onCopy,
  onExport,
  copyDisabled = false,
  exportDisabled = false,
  sidebarConfig
}) => {
  // 使用配置或默认配置
  const config = useMemo(() => 
    sidebarConfig || getDefaultSidebarConfig(), 
    [sidebarConfig]
  );

  // 按顺序排序并过滤可见项
  const sortedItems = useMemo(() => 
    [...config.items]
      .filter(item => item.visible)
      .sort((a, b) => a.order - b.order),
    [config]
  );

  // 渲染单个菜单项
  const renderMenuItem = (item: typeof sortedItems[0]) => {
    const commonProps = {
      key: item.id,
      title: item.label
    };

    switch (item.id) {
      case 'home':
        return (
          <MenuItem 
            {...commonProps}
            $active={currentView === 'home'} 
            onClick={() => onViewChange('home')}
          >
            <MaterialIcon name={item.icon} size={20} />
          </MenuItem>
        );
      
      case 'capture':
        return (
          <MenuItem {...commonProps} onClick={onCapture}>
            <MaterialIcon name={item.icon} size={20} />
          </MenuItem>
        );
      
      case 'copy':
        return (
          <MenuItem 
            {...commonProps}
            onClick={copyDisabled ? undefined : onCopy} 
            title={copyDisabled ? "请先识别或输入数学公式" : item.label}
            disabled={copyDisabled}
          >
            <MaterialIcon name={item.icon} size={20} />
          </MenuItem>
        );
      
      case 'export':
        return (
          <MenuItem 
            {...commonProps}
            onClick={exportDisabled ? undefined : onExport} 
            title={exportDisabled ? "请先识别或输入数学公式" : item.label}
            disabled={exportDisabled}
          >
            <MaterialIcon name={item.icon} size={20} />
          </MenuItem>
        );
      
      case 'history':
        return (
          <MenuItem 
            {...commonProps}
            $active={currentView === 'history'} 
            onClick={() => onViewChange('history')}
          >
            <MaterialIcon name={item.icon} size={20} />
          </MenuItem>
        );
      
      case 'settings':
        return (
          <MenuItem 
            {...commonProps}
            $active={currentView === 'settings'} 
            onClick={() => onViewChange('settings')}
          >
            <MaterialIcon name={item.icon} size={20} />
          </MenuItem>
        );
      
      case 'about':
        return (
          <MenuItem 
            {...commonProps}
            $active={currentView === 'about'} 
            onClick={() => onViewChange('about')}
          >
            <MaterialIcon name={item.icon} size={item.id === 'about' ? 18 : 20} />
          </MenuItem>
        );
      
      default:
        return null;
    }
  };

  return (
    <SidebarContainer>
      {sortedItems.map(item => renderMenuItem(item))}
    </SidebarContainer>
  );
};

export default Sidebar;
