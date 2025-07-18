import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface NotificationBarProps {
  message: string | null;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number; // Duration in milliseconds before auto-hiding
  onClose?: () => void;
}

// Styled components for the notification bar
const NotificationContainer = styled.div<{ type: string; visible: boolean }>`
  position: fixed;
  top: 50px; // Position below the menu bar
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  min-width: 300px;
  max-width: 80%;
  padding: 10px 16px;
  border-radius: 8px;
  display: ${props => (props.visible ? 'flex' : 'none')};
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  transition: opacity 0.3s, transform 0.3s;
  opacity: ${props => (props.visible ? 1 : 0)};
  
  ${props => {
    switch (props.type) {
      case 'success':
        return `
          background-color: #f0fdf4;
          color: #166534;
        `;
      case 'error':
        return `
          background-color: #fef2f2;
          color: #991b1b;
        `;
      case 'warning':
        return `
          background-color: #fffbeb;
          color: #92400e;
        `;
      case 'info':
      default:
        return `
          background-color: #f0f9ff;
          color: #1e40af;
        `;
    }
  }}
`;

const MessageContent = styled.div`
  flex: 1;
  padding-right: 16px;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.2s;
  padding: 0;
  margin: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    opacity: 1;
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
      
      // Auto-hide notification after duration if duration > 0
      if (duration > 0) {
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
    if (msg.includes('ℹ️')) return 'info';
    return type;
  };
  
  // Remove emoji indicators for cleaner display
  const cleanMessage = (msg: string): string => {
    return msg
      .replace(/✅/g, '')
      .replace(/❌/g, '')
      .replace(/⚠️/g, '')
      .replace(/ℹ️/g, '')
      .trim();
  };
  
  if (!message) return null;
  
  const notificationType = getTypeFromMessage(message);
  const displayMessage = cleanMessage(message);
  
  return (
    <NotificationContainer type={notificationType} visible={visible}>
      <MessageContent>{displayMessage}</MessageContent>
      <CloseButton onClick={handleClose}>×</CloseButton>
    </NotificationContainer>
  );
};

export default NotificationBar; 