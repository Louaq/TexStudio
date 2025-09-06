import React, { useState } from 'react';
import packageInfo from '../../package.json';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
`;

const Dialog = styled.div`
  background: linear-gradient(145deg, #fefefe 0%, #f8fafc 100%);
  border-radius: 20px;
  padding: 32px 28px;
  width: 90%;
  max-width: 420px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  font-family: "Georgia", "Times New Roman", serif;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-40px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const AppIcon = styled.div`
  font-size: 56px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 2px 4px rgba(59, 130, 246, 0.2));
`;

const AppTitle = styled.h1`
  margin: 0 0 6px 0;
  color: #1e293b;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.5px;
  line-height: 1.2;
`;

const Subtitle = styled.div`
  color: #64748b;
  font-size: 14px;
  font-style: italic;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
`;

const Version = styled.div`
  color: #3b82f6;
  font-size: 13px;
  font-weight: 500;
  padding: 3px 10px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 16px;
  display: inline-block;
  border: 1px solid rgba(59, 130, 246, 0.2);
`;
const Copyright = styled.div`
  color: #64748b;
  font-size: 12px;
  margin-bottom: 16px;
  font-style: italic;
  line-height: 1.4;
  text-align: center;
`;

interface AboutDialogProps {
  onClose: () => void;
}

const AboutDialog: React.FC<AboutDialogProps> = ({ onClose }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDragging) {
      onClose();
    }
  };

  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  const handleMouseDown = () => {
    setIsDragging(false);
  };
  
  const handleMouseMove = () => {
    if (isDragging === false) {
      setIsDragging(true);
    }
  };
  
  const handleMouseUp = () => {
    setTimeout(() => {
      setIsDragging(false);
    }, 10);
  };

  return (
    <Overlay 
      onClick={handleOverlayClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Dialog onClick={handleDialogClick}>
        <Header>
          <AppIcon>∑</AppIcon>
                          <AppTitle>TexStudio</AppTitle>
          <Subtitle>数学公式识别工具</Subtitle>
          <Version>v{packageInfo.version}</Version>
        </Header>
        <Copyright>
          © 2025 TexStudio Team. All Rights Reserved.<br/>
          本软件受知识产权法保护，未经授权不得复制或分发
        </Copyright>
      </Dialog>
    </Overlay>
  );
};

export default AboutDialog; 