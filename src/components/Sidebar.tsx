import React from 'react';
import styled from 'styled-components';
import MaterialIcon from './MaterialIcon';

const SidebarContainer = styled.div`
  width: 48px;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  z-index: 100;
  transition: all 0.3s ease;
  overflow-y: auto;
  
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

const MenuItem = styled.div<{ $active?: boolean; disabled?: boolean }>`
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
  color: ${props => props.$active ? 'var(--color-primary)' : 'var(--color-textSecondary)'};
  background: transparent;
  opacity: ${props => props.disabled ? 0.4 : 1};

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
  onHandwriting: () => void;
  onCopy: () => void;
  onExport: () => void;
  onToggleRecognitionMode: () => void;
  onCleanupTempFiles: () => void;
  onToggleAlwaysOnTop: () => void;
  isAlwaysOnTop: boolean;
  isAutoRecognition: boolean;
  copyDisabled?: boolean;
  exportDisabled?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  onCapture,
  onUpload,
  onHandwriting,
  onCopy,
  onExport,
  onToggleRecognitionMode,
  onCleanupTempFiles,
  onToggleAlwaysOnTop,
  isAlwaysOnTop,
  isAutoRecognition,
  copyDisabled = false,
  exportDisabled = false
}) => {
  return (
    <SidebarContainer>
      {/* 主页 */}
      <MenuItem 
        $active={currentView === 'home'} 
        onClick={() => onViewChange('home')}
        title="主页"
      >
        <MaterialIcon name="home" size={20} />
      </MenuItem>

      {/* 识别模式切换 */}
      <MenuItem 
        onClick={onToggleRecognitionMode} 
        title={isAutoRecognition ? "当前：自动识别模式，点击切换到手动识别" : "当前：手动识别模式，点击切换到自动识别"}
        style={{ color: isAutoRecognition ? 'var(--color-primary)' : 'var(--color-textSecondary)' }}
      >
        <MaterialIcon name={isAutoRecognition ? "smart_toy" : "back_hand"} size={20} />
      </MenuItem>

      <Divider />

      {/* 截图 */}
      <MenuItem onClick={onCapture} title="截图">
        <MaterialIcon name="photo_camera" size={20} />
      </MenuItem>

      {/* 手写公式 */}
      <MenuItem onClick={onHandwriting} title="手写公式">
        <MaterialIcon name="edit" size={20} />
      </MenuItem>

      {/* 复制LaTeX */}
      <MenuItem 
        onClick={copyDisabled ? undefined : onCopy} 
        title={copyDisabled ? "请先识别或输入数学公式" : "复制LaTeX代码"}
        disabled={copyDisabled}
      >
        <MaterialIcon name="content_copy" size={20} />
      </MenuItem>

      {/* 导出图片 */}
      <MenuItem 
        onClick={exportDisabled ? undefined : onExport} 
        title={exportDisabled ? "请先识别或输入数学公式" : "导出为图片"}
        disabled={exportDisabled}
      >
        <MaterialIcon name="download" size={20} />
      </MenuItem>

      <Divider />

      {/* 窗口置顶 */}
      <MenuItem 
        onClick={onToggleAlwaysOnTop} 
        title={isAlwaysOnTop ? "取消置顶" : "窗口置顶"}
        style={{ color: isAlwaysOnTop ? 'var(--color-primary)' : 'var(--color-textSecondary)' }}
      >
        <MaterialIcon name="push_pin" size={20} />
      </MenuItem>

      {/* 清理临时文件 */}
      <MenuItem onClick={onCleanupTempFiles} title="清理临时文件">
        <MaterialIcon name="cleaning_services" size={20} />
      </MenuItem>

      <Divider />

      {/* 历史记录 */}
      <MenuItem 
        $active={currentView === 'history'} 
        onClick={() => onViewChange('history')}
        title="历史记录"
      >
        <MaterialIcon name="history" size={20} />
      </MenuItem>

      {/* 设置 */}
      <MenuItem 
        $active={currentView === 'settings'} 
        onClick={() => onViewChange('settings')}
        title="设置"
      >
        <MaterialIcon name="settings" size={20} />
      </MenuItem>

      {/* 关于 */}
      <MenuItem 
        $active={currentView === 'about'} 
        onClick={() => onViewChange('about')}
        title="关于"
      >
        <MaterialIcon name="info" size={18} />
      </MenuItem>
    </SidebarContainer>
  );
};

export default Sidebar;
