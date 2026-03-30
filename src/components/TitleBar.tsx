import React from 'react';
import styled from 'styled-components';
import MaterialIcon from './MaterialIcon';
import { glassTitleBar } from '../theme/themes';

const TitleBarContainer = styled.div`
  display: flex;
  align-items: center;
  height: 38px;
  ${glassTitleBar}
  user-select: none;
  -webkit-app-region: drag;
  position: relative;
  z-index: 10000;
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
  const handleMinimize = () => {
    if (window.electronAPI && window.electronAPI.minimizeWindow) {
      window.electronAPI.minimizeWindow();
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
          <MaterialIcon name="minimize" size={12} />
        </ControlButton>

        <ControlButton $isClose onClick={handleClose} title="关闭">
          <MaterialIcon name="close" size={14} />
        </ControlButton>
      </WindowControls>
    </TitleBarContainer>
  );
};

export default TitleBar;
