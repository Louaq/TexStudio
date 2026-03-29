import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import MaterialIcon from './MaterialIcon';

const TitleBarContainer = styled.div`
  display: flex;
  align-items: center;
  height: 38px;
  background: var(--color-surface);
  user-select: none;
  -webkit-app-region: drag;
  position: relative;
  z-index: 10000;
  border-bottom: 1px solid var(--color-borderLight);
  flex-shrink: 0;
`;

const DragRegion = styled.div`
  flex: 1;
  height: 100%;
  -webkit-app-region: drag;
`;

const WindowControls = styled.div`
  display: flex;
  height: 100%;
  -webkit-app-region: no-drag;
  flex-shrink: 0;
`;

const ControlButton = styled.button<{ $isClose?: boolean }>`
  width: 42px;
  height: 38px;
  border: none;
  background: transparent;
  color: var(--color-textSecondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.12s ease, color 0.12s ease;
  padding: 0;

  &:hover {
    background: ${props => props.$isClose
      ? '#e81123'
      : 'color-mix(in srgb, var(--color-text) 8%, transparent)'};
    color: ${props => props.$isClose ? 'white' : 'var(--color-text)'};
  }

  &:active {
    background: ${props => props.$isClose
      ? '#c90012'
      : 'color-mix(in srgb, var(--color-text) 14%, transparent)'};
  }
`;

const TitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const checkMaximized = async () => {
      if (window.electronAPI && window.electronAPI.isWindowMaximized) {
        const maximized = await window.electronAPI.isWindowMaximized();
        setIsMaximized(maximized);
      }
    };

    checkMaximized();

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
      <DragRegion />

      <WindowControls>
        <ControlButton onClick={handleMinimize} title="最小化">
          <MaterialIcon name="minimize" size={11} />
        </ControlButton>

        <ControlButton onClick={handleMaximize} title={isMaximized ? '还原' : '最大化'}>
          {isMaximized ? (
            <MaterialIcon name="filter_none" size={11} />
          ) : (
            <MaterialIcon name="crop_square" size={11} />
          )}
        </ControlButton>

        <ControlButton $isClose onClick={handleClose} title="关闭">
          <MaterialIcon name="close" size={13} />
        </ControlButton>
      </WindowControls>
    </TitleBarContainer>
  );
};

export default TitleBar;
