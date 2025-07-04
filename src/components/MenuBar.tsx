import React from 'react';
import styled from 'styled-components';

const MenuContainer = styled.div`
  display: flex;
  background: linear-gradient(180deg, #fafbfd 0%, #f2f5f9 100%);
  border-bottom: 1px solid #dce1e8;
  padding: 6px 12px;
  gap: 2px;
  font-size: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  overflow-x: auto;
  white-space: nowrap;
  justify-content: flex-start;
  align-items: center;
`;

const MenuItem = styled.div`
  padding: 8px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  color: #3a4a5b;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  width: 34px;
  height: 34px;
  position: relative;

  &:hover {
    background: #edf2f7;
    color: #4375b9;
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 22px;
  background: #dce1e8;
  margin: 0 2px;
  opacity: 0.5;
`;

// 替换emoji图标为更现代的表示方式
const MenuIcon = {
  capture: "📷",   // 截图
  upload: "📤",    // 上传图片
  history: "🕒",   // 历史记录
  api: "🔐",       // API设置
  shortcut: "⌨️",  // 快捷键
  cleanup: "🧹",   // 清理临时文件
  update: "🔄",    // 检查更新
  pin: "📌",       // 窗口置顶
  about: "ℹ️"      // 关于
};

interface MenuBarProps {
  onCapture: () => void;
  onUpload: () => void;
  onShowApiSettings: () => void;
  onShowShortcutSettings: () => void;
  onShowHistory: () => void;
  onShowAbout: () => void;
  onCleanupTempFiles: () => void;
  onToggleAlwaysOnTop: () => void;
  onCheckForUpdates?: () => void;
  isAlwaysOnTop: boolean;
}

const MenuBar: React.FC<MenuBarProps> = ({
  onCapture,
  onUpload,
  onShowApiSettings,
  onShowShortcutSettings,
  onShowHistory,
  onShowAbout,
  onCleanupTempFiles,
  onToggleAlwaysOnTop,
  onCheckForUpdates,
  isAlwaysOnTop
}) => {
  return (
    <MenuContainer onClick={(e) => e.stopPropagation()}>
      {/* 截图 */}
      <MenuItem onClick={onCapture} title="截图">
        {MenuIcon.capture}
      </MenuItem>
      
      {/* 上传图片 */}
      <MenuItem onClick={onUpload} title="上传图片">
        {MenuIcon.upload}
      </MenuItem>
      
      <Divider />
      
      {/* 历史记录 */}
      <MenuItem onClick={onShowHistory} title="历史记录">
        {MenuIcon.history}
      </MenuItem>
      
      <Divider />
      
      {/* API设置 */}
      <MenuItem onClick={onShowApiSettings} title="API设置">
        {MenuIcon.api}
      </MenuItem>
      
      {/* 快捷键设置 */}
      <MenuItem onClick={onShowShortcutSettings} title="快捷键设置">
        {MenuIcon.shortcut}
      </MenuItem>
      
      {/* 清理临时文件 */}
      <MenuItem onClick={onCleanupTempFiles} title="清理临时文件">
        {MenuIcon.cleanup}
      </MenuItem>
      
      {/* 检查更新 */}
      {onCheckForUpdates && (
        <MenuItem onClick={onCheckForUpdates} title="检查更新">
          {MenuIcon.update}
        </MenuItem>
      )}
      
      <Divider />
      
      {/* 窗口置顶 */}
      <MenuItem 
        onClick={onToggleAlwaysOnTop} 
        title={isAlwaysOnTop ? "取消置顶" : "窗口置顶"}
        style={isAlwaysOnTop ? { color: '#4a90e2', background: '#edf2f7' } : {}}
      >
        {MenuIcon.pin}
      </MenuItem>
      
      <Divider />
      
      {/* 关于 */}
      <MenuItem onClick={onShowAbout} title="关于">
        {MenuIcon.about}
      </MenuItem>
    </MenuContainer>
  );
};

export default MenuBar; 