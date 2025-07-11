import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { UpdateInfo } from '../types';

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
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid #e1e8ed;
  animation: slideIn 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;

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

const IconContainer = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #4cd964;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: white;
  font-size: 40px;
`;

const Title = styled.h2`
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
`;

const Message = styled.p`
  color: #34495e;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 20px;
  text-align: center;
`;

const ButtonContainer = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 12px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.variant === 'primary' 
    ? 'linear-gradient(135deg, #4a90e2 0%, #357bd8 100%)' 
    : 'linear-gradient(135deg, #f1f3f4 0%, #e1e8ed 100%)'
  };
  color: ${props => props.variant === 'primary' ? 'white' : '#34495e'};
  border: none;
  box-shadow: ${props => props.variant === 'primary'
    ? '0 4px 8px rgba(74, 144, 226, 0.2)'
    : '0 2px 4px rgba(0, 0, 0, 0.08)'
  };

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.variant === 'primary'
      ? '0 6px 12px rgba(74, 144, 226, 0.3)'
      : '0 4px 8px rgba(0, 0, 0, 0.12)'
    };
  }

  &:active {
    transform: translateY(0);
  }
`;

// 圆环进度条组件 - 使用SVG实现
const CircleProgressContainer = styled.div`
  width: 120px;
  height: 120px;
  position: relative;
  margin: 10px 0 20px 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CircleProgressSVG = styled.svg`
  width: 120px;
  height: 120px;
  transform: rotate(-90deg);
  position: absolute;
`;

const CircleProgressBg = styled.circle`
  fill: none;
  stroke: #e1e8ed;
  stroke-width: 6;
`;

const CircleProgressBar = styled.circle<{ progress: number; circumference: number }>`
  fill: none;
  stroke: #4a90e2;
  stroke-width: 6;
  stroke-linecap: round;
  stroke-dasharray: ${props => props.circumference};
  stroke-dashoffset: ${props => props.circumference - (props.progress / 100) * props.circumference};
  transition: stroke-dashoffset 0.3s ease;
`;

const ProgressText = styled.div`
  position: relative;
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  z-index: 1;
`;

// 新的进度条组件
const CircleProgress: React.FC<{ progress: number }> = ({ progress }) => {
  const radius = 54; // SVG圆的半径 (120/2 - 6/2 = 54)
  const circumference = 2 * Math.PI * radius;
  
  // 确保进度值在0-100之间
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  return (
    <CircleProgressContainer>
      <CircleProgressSVG>
        <CircleProgressBg
          cx="60"
          cy="60"
          r={radius}
        />
        <CircleProgressBar
          cx="60"
          cy="60"
          r={radius}
          progress={clampedProgress}
          circumference={circumference}
        />
      </CircleProgressSVG>
      <ProgressText>{clampedProgress.toFixed(0)}%</ProgressText>
    </CircleProgressContainer>
  );
};

interface UpdateDialogProps {
  isOpen: boolean;
  status: 'checking' | 'no-update' | 'available' | 'downloading' | 'downloaded' | 'error';
  progress?: number;
  version?: string;
  onClose: () => void;
  onDownload?: () => void;
  onRestart?: () => void;
  onBackgroundDownload?: () => void;
}

const UpdateDialog: React.FC<UpdateDialogProps> = ({
  isOpen,
  status,
  progress = 0,
  version = '',
  onClose,
  onDownload,
  onRestart,
  onBackgroundDownload
}) => {
  // 如果不显示，直接返回null
  if (!isOpen) return null;
  
  // 渲染对话框内容
  const renderDialogContent = () => {
    switch (status) {
      case 'checking':
        return (
          <>
            <IconContainer style={{ backgroundColor: '#f0ad4e' }}>🔄</IconContainer>
            <Title>版本检查中</Title>
            <Message>正在检查更新，请稍候...</Message>
            <ButtonContainer>
              <Button onClick={onClose}>关闭</Button>
            </ButtonContainer>
          </>
        );
        
      case 'no-update':
        return (
          <>
            <IconContainer>✓</IconContainer>
            <Title>版本检测成功</Title>
            <Message>已是最新版本，无需更新！</Message>
            <ButtonContainer>
              <Button onClick={onClose}>关闭</Button>
            </ButtonContainer>
          </>
        );
        
      case 'available':
        return (
          <>
            <IconContainer style={{ backgroundColor: '#4a90e2' }}>🚀</IconContainer>
            <Title>发现新版本</Title>
            <Message>发现新版本 {version}，是否立即下载更新？</Message>
            <ButtonContainer>
              <Button onClick={onClose}>稍后再说</Button>
              <Button variant="primary" onClick={onDownload}>立即下载</Button>
            </ButtonContainer>
          </>
        );
        
      case 'downloading':
        return (
          <>
            <Title>下载更新中</Title>
            <CircleProgress progress={progress} />
            <Message>正在下载新版本，请稍候...</Message>
            <ButtonContainer>
              <Button onClick={onBackgroundDownload}>后台下载</Button>
            </ButtonContainer>
          </>
        );
        
      case 'downloaded':
        return (
          <>
            <IconContainer style={{ backgroundColor: '#4cd964' }}>🎉</IconContainer>
            <Title>下载完成</Title>
            <Message>新版本 {version} 已准备就绪，重启以完成安装。</Message>
            <ButtonContainer>
              <Button variant="primary" onClick={onRestart}>立即重启</Button>
            </ButtonContainer>
          </>
        );

      case 'error':
        return (
          <>
            <IconContainer style={{ backgroundColor: '#d9534f' }}>❌</IconContainer>
            <Title>更新失败</Title>
            <Message>检查更新时遇到错误，请检查网络连接或稍后再试。</Message>
            <ButtonContainer>
              <Button onClick={onClose}>关闭</Button>
            </ButtonContainer>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Overlay onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <Dialog onClick={(e) => e.stopPropagation()}>
        {renderDialogContent()}
      </Dialog>
    </Overlay>
  );
};

export default UpdateDialog; 