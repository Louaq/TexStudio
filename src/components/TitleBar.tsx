import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import MaterialIcon from './MaterialIcon';

const TitleBarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  background: var(--color-background);
  user-select: none;
  -webkit-app-region: drag;
  padding: 0 0 0 16px;
  position: relative;
  z-index: 10000;
  
  /* 底部边框从侧边栏右侧开始 */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 48px;
    right: 0;
    height: 1px;
    background: var(--color-border);
  }
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  overflow: hidden;
`;

const AppIcon = styled.div`
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
`;

const AppTitle = styled.div`
  font-size: 13px;
  color: var(--color-text);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const WindowControls = styled.div`
  display: flex;
  height: 100%;
  -webkit-app-region: no-drag;
`;

const ControlButton = styled.button<{ $isClose?: boolean; $isMinimize?: boolean }>`
  width: 48px;
  height: 48px;
  border: none;
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease;
  padding: 0;

  &:hover {
    background: ${props => props.$isClose 
      ? '#e81123' 
      : 'color-mix(in srgb, var(--color-text) 10%, transparent)'};
    color: ${props => props.$isClose ? 'white' : 'var(--color-text)'};
  }

  &:active {
    background: ${props => props.$isClose 
      ? '#c90012' 
      : 'color-mix(in srgb, var(--color-text) 15%, transparent)'};
  }
`;

interface TitleBarProps {
  title?: string;
}

const TitleBar: React.FC<TitleBarProps> = ({ title = 'TexStudio OCR' }) => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // 检查窗口是否最大化
    const checkMaximized = async () => {
      if (window.electronAPI && window.electronAPI.isWindowMaximized) {
        const maximized = await window.electronAPI.isWindowMaximized();
        setIsMaximized(maximized);
      }
    };

    checkMaximized();

    // 监听窗口最大化/还原事件
    if (window.electronAPI && window.electronAPI.onWindowStateChange) {
      const removeListener = window.electronAPI.onWindowStateChange((maximized: boolean) => {
        setIsMaximized(maximized);
      });

      return () => {
        if (removeListener) removeListener();
      };
    }
  }, []);

  const handleMinimize = () => {
    if (window.electronAPI && window.electronAPI.minimizeWindow) {
      window.electronAPI.minimizeWindow();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI && window.electronAPI.maximizeWindow) {
      window.electronAPI.maximizeWindow();
    }
  };

  const handleClose = () => {
    if (window.electronAPI && window.electronAPI.closeWindow) {
      window.electronAPI.closeWindow();
    }
  };

  return (
    <TitleBarContainer>
      <TitleSection>
        <AppIcon>
          <img src="icons/icon-32.png" alt="TexStudio" />
        </AppIcon>
        <AppTitle>{title}</AppTitle>
      </TitleSection>
      
      <WindowControls>
        <ControlButton $isMinimize onClick={handleMinimize} title="最小化">
          <MaterialIcon name="minimize" size={12} />
        </ControlButton>
        
        <ControlButton onClick={handleMaximize} title={isMaximized ? "还原" : "最大化"}>
          {isMaximized ? (
            <MaterialIcon name="filter_none" size={12} />
          ) : (
            <MaterialIcon name="crop_square" size={12} />
          )}
        </ControlButton>
        
        <ControlButton $isClose onClick={handleClose} title="关闭">
          <MaterialIcon name="close" size={14} />
        </ControlButton>
      </WindowControls>
    </TitleBarContainer>
  );
};

export default TitleBar;

