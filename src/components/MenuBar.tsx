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

const MenuItem = styled.div<{ disabled?: boolean }>`
  padding: 8px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  border-radius: 6px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  color: ${props => props.disabled ? '#95a5a6' : '#3a4a5b'};
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  width: 34px;
  height: 34px;
  position: relative;
  opacity: ${props => props.disabled ? 0.5 : 1};

  &:hover {
    ${props => !props.disabled && `
      background: #edf2f7;
      color: #4375b9;
      transform: translateY(-1px);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    `}
  }
  
  &:active {
    ${props => !props.disabled && `
      transform: translateY(0);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
    `}
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 22px;
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
  api: Icon("vpn_key"),
  shortcut: Icon("keyboard"),
  cleanup: Icon("cleaning_services"),
  update: Icon("new_releases"),
  pin: Icon("push_pin"),
  about: Icon("info"),
  help: Icon("lightbulb")
};

interface MenuBarProps {
  onCapture: () => void;
  onUpload: () => void;
  onHandwriting: () => void; // 新增
  onCopy: () => void;
  onExport: () => void;
  onToggleRecognitionMode: () => void;
  onShowApiSettings: () => void;
  onShowShortcutSettings: () => void;
  onShowHistory: () => void;
  onShowAbout: () => void;
  onShowHelp: () => void;
  onCleanupTempFiles: () => void;
  onToggleAlwaysOnTop: () => void;
  onCheckForUpdates?: () => void;
  isAlwaysOnTop: boolean;
  isAutoRecognition: boolean;
  copyDisabled?: boolean;
  exportDisabled?: boolean;
}

const MenuBar: React.FC<MenuBarProps> = ({
  onCapture,
  onUpload,
  onHandwriting, // 新增
  onCopy,
  onExport,
  onToggleRecognitionMode,
  onShowApiSettings,
  onShowShortcutSettings,
  onShowHistory,
  onShowAbout,
  onShowHelp,
  onCleanupTempFiles,
  onToggleAlwaysOnTop,
  onCheckForUpdates,
  isAlwaysOnTop,
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
      
      {/* 手写公式 */}
      <MenuItem onClick={onHandwriting} title="手写公式">
        {MenuIcon.handwriting}
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
        onClick={onToggleRecognitionMode} 
        title={isAutoRecognition ? "当前：自动识别模式，点击切换到手动识别" : "当前：手动识别模式，点击切换到自动识别"}
        style={isAutoRecognition ? { color: '#4a90e2', background: '#edf2f7' } : {}}
      >
        {isAutoRecognition ? MenuIcon.autoMode : MenuIcon.manualMode}
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
      
      {/* 帮助 */}
      <MenuItem onClick={onShowHelp} title="使用帮助">
        {MenuIcon.help}
      </MenuItem>

      {/* 关于 */}
      <MenuItem onClick={onShowAbout} title="关于">
        {MenuIcon.about}
      </MenuItem>
    </MenuContainer>
  );
};

export default MenuBar; 