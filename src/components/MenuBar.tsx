import React from 'react';
import styled from 'styled-components';

const MenuContainer = styled.div`
  display: flex;
  background: linear-gradient(180deg, #fafbfd 0%, #f2f5f9 100%);
  border-bottom: 1px solid #dce1e8;
  padding: 2px 12px;
  gap: 2px;
  font-size: 14px;
  overflow-x: auto;
  white-space: nowrap;
  justify-content: flex-start;
  align-items: center;
`;

const MenuItem = styled.div<{ disabled?: boolean; $highlighted?: boolean }>`
  padding: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  border-radius: 6px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  width: 34px;
  height: 34px;
  position: relative;
  opacity: ${props => props.disabled ? 0.5 : 1};
  color: ${props => props.$highlighted ? 'var(--color-primary)' : 'inherit'};

  &:hover {
    ${props => !props.disabled && `
      color: var(--color-primary);
    `}
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 18px;
  background: #dce1e8;
  margin: 0 2px;
  opacity: 0.5;
`;

// 使用 Material Symbols Outlined 字体图标
const Icon = (name: string) => (
  <span className="material-symbols-outlined" style={{ fontSize: 20, lineHeight: 1 }} aria-hidden="true">{name}</span>
);

const MenuIcon = {
  capture: Icon("photo_camera"),
  upload: Icon("file_upload"),
  handwriting: Icon("edit"),
  copy: Icon("content_copy"),
  export: Icon("download"),
  autoMode: Icon("smart_toy"),
  manualMode: Icon("back_hand"),
  history: Icon("history"),
  settings: Icon("settings"),
  cleanup: Icon("cleaning_services"),
  pin: Icon("push_pin"),
  about: Icon("info")
};

interface MenuBarProps {
  onCapture: () => void;
  onUpload: () => void;
  onCopy: () => void;
  onExport: () => void;
  onToggleRecognitionMode: () => void;
  onShowSettings: () => void;
  onShowHistory: () => void;
  onShowAbout: () => void;
  isAutoRecognition: boolean;
  copyDisabled?: boolean;
  exportDisabled?: boolean;
}

const MenuBar: React.FC<MenuBarProps> = ({
  onCapture,
  onUpload,
  onCopy,
  onExport,
  onToggleRecognitionMode,
  onShowSettings,
  onShowHistory,
  onShowAbout,
  isAutoRecognition,
  copyDisabled = false,
  exportDisabled = false
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
      
      {/* 复制LaTeX */}
      <MenuItem 
        onClick={copyDisabled ? undefined : onCopy} 
        title={copyDisabled ? "请先识别或输入数学公式" : "复制LaTeX代码"}
        disabled={copyDisabled}
      >
        {MenuIcon.copy}
      </MenuItem>
      
      {/* 导出图片 */}
      <MenuItem 
        onClick={exportDisabled ? undefined : onExport} 
        title={exportDisabled ? "请先识别或输入数学公式" : "导出为图片"}
        disabled={exportDisabled}
      >
        {MenuIcon.export}
      </MenuItem>
      
      <Divider />
      
      {/* 识别模式切换 */}
      <MenuItem 
        $highlighted={isAutoRecognition}
        onClick={onToggleRecognitionMode} 
        title={isAutoRecognition ? "当前：自动识别模式，点击切换到手动识别" : "当前：手动识别模式，点击切换到自动识别"}
      >
        {isAutoRecognition ? MenuIcon.autoMode : MenuIcon.manualMode}
      </MenuItem>
      
      <Divider />
      
      {/* 历史记录 */}
      <MenuItem onClick={onShowHistory} title="历史记录">
        {MenuIcon.history}
      </MenuItem>
      
      <Divider />
      
      {/* 设置 */}
      <MenuItem onClick={onShowSettings} title="设置">
        {MenuIcon.settings}
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