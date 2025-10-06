import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import MaterialIcon from './MaterialIcon';

interface NotificationBarProps {
  message: string | null;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number; // Duration in milliseconds before auto-hiding
  onClose?: () => void;
}

// 图标容器
const IconWrapper = styled.div<{ type: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  ${props => {
    switch (props.type) {
      case 'success':
        return `
          background: var(--color-success);
          color: white;
        `;
      case 'error':
        return `
          background: var(--color-error);
          color: white;
        `;
      case 'warning':
        return `
          background: var(--color-warning);
          color: white;
        `;
      case 'info':
      default:
        return `
          background: var(--color-info);
          color: white;
        `;
    }
  }}
`;

// Styled components for the notification bar
const NotificationContainer = styled.div<{ type: string; visible: boolean }>`
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  min-width: 320px;
  max-width: 500px;
  padding: 12px 16px;
  border-radius: 8px;
  display: ${props => (props.visible ? 'flex' : 'none')};
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04);
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${props => (props.visible ? 1 : 0)};
  transform: translateX(-50%) translateY(${props => (props.visible ? '0' : '-20px')});
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
`;

const MessageContent = styled.div`
  flex: 1;
  line-height: 1.5;
  font-weight: 500;
  color: var(--color-text);
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-textSecondary);
  opacity: 0.7;
  transition: all 0.2s ease;
  padding: 4px;
  margin: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  flex-shrink: 0;
  
  &:hover {
    opacity: 1;
    color: var(--color-text);
    background: rgba(0, 0, 0, 0.05);
  }

  &:active {
    transform: scale(0.9);
  }
`;

const NotificationBar: React.FC<NotificationBarProps> = ({
  message,
  type = 'info',
  duration = 5000, // Default 5 seconds
  onClose
}) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (message) {
      setVisible(true);
      
      // 对于下载进度消息（包含 📥 或 🔄），不自动隐藏
      const isProgressMessage = message.includes('📥') || message.includes('🔄');
      
      // Auto-hide notification after duration if duration > 0 and not a progress message
      if (duration > 0 && !isProgressMessage) {
        const timer = setTimeout(() => {
          setVisible(false);
          if (onClose) onClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    } else {
      setVisible(false);
    }
  }, [message, duration, onClose]);
  
  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };
  
  // Extract notification type from message if it contains emoji indicators
  const getTypeFromMessage = (msg: string): 'success' | 'error' | 'info' | 'warning' => {
    if (msg.includes('✅')) return 'success';
    if (msg.includes('❌')) return 'error';
    if (msg.includes('⚠️')) return 'warning';
    if (msg.includes('ℹ️') || msg.includes('🔄') || msg.includes('✨') || msg.includes('📥')) return 'info';
    return type;
  };
  
  // Remove emoji indicators for cleaner display
  const cleanMessage = (msg: string): string => {
    return msg
      .replace(/✅/g, '')
      .replace(/❌/g, '')
      .replace(/⚠️/g, '')
      .replace(/ℹ️/g, '')
      .replace(/🔄/g, '')
      .replace(/✨/g, '')
      .replace(/📥/g, '')
      .trim();
  };
  
  // 仅在重要事件时显示通知：包含成功/错误/警告/信息的表情标识
  if (!message || (!message.includes('✅') && !message.includes('❌') && !message.includes('⚠️') && !message.includes('🔄') && !message.includes('✨') && !message.includes('📥'))) {
    return null;
  }
  
  const notificationType = getTypeFromMessage(message);
  const displayMessage = cleanMessage(message);
  
  // 根据类型选择图标
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  };
  
  return (
    <NotificationContainer type={notificationType} visible={visible}>
      <IconWrapper type={notificationType}>
        <MaterialIcon name={getIcon(notificationType)} size={16} />
      </IconWrapper>
      <MessageContent>{displayMessage}</MessageContent>
      <CloseButton onClick={handleClose} aria-label="关闭">
        <MaterialIcon name="close" size={16} />
      </CloseButton>
    </NotificationContainer>
  );
};

export default NotificationBar; 