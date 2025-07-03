import React, { useState } from 'react';
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
  padding: 28px;
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
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
  font-size: 42px;
  margin-bottom: 16px;
`;

const AppTitle = styled.h1`
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #4a90e2 0%, #7b68ee 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Version = styled.div`
  color: #7f8c8d;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
`;

const Description = styled.div`
  color: #2c3e50;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 16px;
  text-align: left;
  background: rgba(255, 255, 255, 0.6);
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid #4a90e2;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2c3e50;
  font-size: 13px;
  padding: 4px 0;
`;

const FeatureIcon = styled.span`
  font-size: 14px;
  width: 18px;
  text-align: center;
`;

const TechInfo = styled.div`
  background: rgba(255, 255, 255, 0.8);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 12px;
  color: #666;
  border: 1px solid #e1e8ed;
`;

const Copyright = styled.div`
  color: #95a5a6;
  font-size: 11px;
  margin-bottom: 16px;
`;

const CloseButton = styled.button`
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  color: white;
  border: none;
  padding: 10px 28px;
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
  const [isDragging, setIsDragging] = useState(false);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDragging) {
      onClose();
    }
  };

  // 阻止对话框上的点击事件冒泡
  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  // 监听全局鼠标按下事件
  const handleMouseDown = () => {
    setIsDragging(false);
  };
  
  // 监听全局鼠标移动事件
  const handleMouseMove = () => {
    // 如果鼠标按下并移动，标记为拖动状态
    if (isDragging === false) {
      setIsDragging(true);
    }
  };
  
  // 监听全局鼠标释放事件
  const handleMouseUp = () => {
    // 延迟重置拖动状态，确保点击事件处理完成
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
        <AppIcon>∑</AppIcon>
        
        <AppTitle>LaTeX公式识别工具</AppTitle>
        
        <Version>✨ 版本 3.9.3</Version>
        
        <Description>
          <p style={{ margin: '0 0 10px 0', fontWeight: '600' }}>
            现代化的LaTeX公式识别工具
          </p>
          
          <FeatureGrid>
            <FeatureItem>
              <FeatureIcon>📸</FeatureIcon>
              截图识别
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>📁</FeatureIcon>
              上传识别
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>📋</FeatureIcon>
              多格式复制
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>📚</FeatureIcon>
              历史记录
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>⌨️</FeatureIcon>
              全局快捷键
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>🎨</FeatureIcon>
              现代界面
            </FeatureItem>
          </FeatureGrid>
        </Description>

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