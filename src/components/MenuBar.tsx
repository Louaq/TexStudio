import React from 'react';
import styled from 'styled-components';

const MenuContainer = styled.div`
  display: flex;
  background: white;
  border-bottom: 1px solid #e1e8ed;
  padding: 8px 16px;
  gap: 10px;
  font-size: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
  white-space: nowrap;
`;

const MenuItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  color: #2c3e50;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: #f1f3f4;
    color: #4a90e2;
  }
`;

const Divider = styled.div`
  width: 1px;
  background: #e1e8ed;
  margin: 0 4px;
`;

interface MenuBarProps {
  onCapture: () => void;
  onUpload: () => void;
  onShowApiSettings: () => void;
  onShowShortcutSettings: () => void;
  onShowHistory: () => void;
  onShowAbout: () => void;
  onCleanupTempFiles: () => void;
}

const MenuBar: React.FC<MenuBarProps> = ({
  onCapture,
  onUpload,
  onShowApiSettings,
  onShowShortcutSettings,
  onShowHistory,
  onShowAbout,
  onCleanupTempFiles
}) => {
  const handleScreenshot = () => {
    console.log('统一截图功能启动');
    window.electronAPI.showScreenshotOverlay();
  };

  return (
    <MenuContainer onClick={(e) => e.stopPropagation()}>
      {/* 截图 */}
      <MenuItem onClick={onCapture}>
        📸 截图
      </MenuItem>
      
      {/* 上传图片 */}
      <MenuItem onClick={onUpload}>
        📁 上传
      </MenuItem>
      
      <Divider />
      
      {/* 历史记录 */}
      <MenuItem onClick={onShowHistory}>
        📚 历史记录
      </MenuItem>
      
      <Divider />
      
      {/* API设置 */}
      <MenuItem onClick={onShowApiSettings}>
        🔑 API设置
      </MenuItem>
      
      {/* 快捷键设置 */}
      <MenuItem onClick={onShowShortcutSettings}>
        ⌨️ 快捷键
      </MenuItem>
      
      {/* 清理临时文件 */}
      <MenuItem onClick={onCleanupTempFiles}>
        🗑️ 清理临时文件
      </MenuItem>
      
      <Divider />
      
      {/* 关于 */}
      <MenuItem onClick={onShowAbout}>
        ℹ️ 关于
      </MenuItem>
    </MenuContainer>
  );
};

export default MenuBar; 