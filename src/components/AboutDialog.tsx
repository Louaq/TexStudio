import React, { useState } from 'react';
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

const Description = styled.div`
  color: #475569;
  font-size: 14px;
  line-height: 1.5;
  background: rgba(248, 250, 252, 0.8);
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  text-align: center;
`;

const FeatureList = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 8px;
`;

const FeatureItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #475569;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  min-width: 60px;
`;

const FeatureIcon = styled.div`
  font-size: 18px;
  margin-bottom: 4px;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 8px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
`;

const Footer = styled.div`
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
`;

const Copyright = styled.div`
  color: #64748b;
  font-size: 12px;
  margin-bottom: 16px;
  font-style: italic;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

  &:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
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
          <Version>v3.10.5</Version>
        </Header>

        <Description>
          专为学术研究设计的数学公式识别工具<br/>
          支持截图和文件识别，快速转换为 LaTeX 代码
        </Description>

        <FeatureList>
          <FeatureItem>
            <FeatureIcon>📸</FeatureIcon>
            截图识别
          </FeatureItem>
          <FeatureItem>
            <FeatureIcon>📁</FeatureIcon>
            文件上传
          </FeatureItem>
          <FeatureItem>
            <FeatureIcon>📋</FeatureIcon>
            多格式导出
          </FeatureItem>
          <FeatureItem>
            <FeatureIcon>📚</FeatureIcon>
            历史记录
          </FeatureItem>
        </FeatureList>

        <Footer>
          <Copyright>
                            © 2025 TexStudio Team. All Rights Reserved.<br/>
            本软件受知识产权法保护，未经授权不得复制或分发
          </Copyright>
          
          <CloseButton onClick={onClose}>
            关闭
          </CloseButton>
        </Footer>
      </Dialog>
    </Overlay>
  );
};

export default AboutDialog; 