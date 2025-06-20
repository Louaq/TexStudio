import React from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const Dialog = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  padding: 40px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid #e1e8ed;
  animation: slideIn 0.3s ease;
  text-align: center;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const AppIcon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
`;

const AppTitle = styled.h1`
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #4a90e2 0%, #7b68ee 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Version = styled.div`
  color: #7f8c8d;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 24px;
`;

const Description = styled.div`
  color: #2c3e50;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 24px;
  text-align: left;
  background: rgba(255, 255, 255, 0.6);
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid #4a90e2;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
`;

const FeatureItem = styled.li`
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #2c3e50;
  font-size: 14px;
`;

const FeatureIcon = styled.span`
  font-size: 16px;
  width: 20px;
  text-align: center;
`;

const TechInfo = styled.div`
  background: rgba(255, 255, 255, 0.8);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-size: 13px;
  color: #666;
  border: 1px solid #e1e8ed;
`;

const Copyright = styled.div`
  color: #95a5a6;
  font-size: 12px;
  margin-bottom: 24px;
`;

const CloseButton = styled.button`
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #5ba0f2 0%, #458bcd 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

interface AboutDialogProps {
  onClose: () => void;
}

const AboutDialog: React.FC<AboutDialogProps> = ({ onClose }) => {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Dialog>
        <AppIcon>∑</AppIcon>
        
        <AppTitle>LaTeX公式识别工具</AppTitle>
        
        <Version>✨ 版本 1.0.3 - TypeScript版</Version>
        
        <Description>
          <p style={{ margin: '0 0 16px 0', fontWeight: '600' }}>
            这是一个现代化的LaTeX公式识别工具，支持以下功能：
          </p>
          
          <FeatureList>
            <FeatureItem>
              <FeatureIcon>📸</FeatureIcon>
              截图识别公式
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>📁</FeatureIcon>
              上传图片识别
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>📋</FeatureIcon>
              复制为多种格式
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>📚</FeatureIcon>
              历史记录保存
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>⌨️</FeatureIcon>
              全局快捷键支持
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>🎨</FeatureIcon>
              现代化界面设计
            </FeatureItem>
          </FeatureList>
        </Description>

        <TechInfo>
          <strong>技术栈：</strong> Electron + React + TypeScript + Styled Components
          <br />
          <strong>API服务：</strong> SimpleTex API
        </TechInfo>

        <Copyright>
          © 2025 All Rights Reserved
        </Copyright>

        <CloseButton onClick={onClose}>
          确定
        </CloseButton>
      </Dialog>
    </Overlay>
  );
};

export default AboutDialog; 