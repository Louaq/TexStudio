import React from 'react';
import styled from 'styled-components';

const StatusContainer = styled.div`
  padding: 10px 14px;
  background: linear-gradient(135deg, #ecf0f1 0%, #d5dbdb 100%);
  border: 1px solid #bdc3c7;
  border-radius: 8px;
  /* 作为内嵌状态显示 */
  flex-shrink: 0;
  min-height: 38px;
  display: flex;
  align-items: center;
`;

const StatusContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const StatusText = styled.div`
  color: #2c3e50;
  font-size: 13px;
  font-weight: 500;
`;

const StatusIcon = styled.span`
  font-size: 16px;
  flex-shrink: 0;
`;

interface StatusBarProps {
  message: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ message }) => {
  // 根据消息内容提取图标
  const getStatusIcon = (message: string) => {
    if (message.includes('准备就绪')) return '⚡';
    if (message.includes('识别')) return '🤖';
    if (message.includes('完成')) return '✅';
    if (message.includes('失败') || message.includes('错误')) return '❌';
    if (message.includes('复制')) return '📋';
    if (message.includes('准备')) return '🔄';
    return '📊';
  };

  const icon = getStatusIcon(message);

  // 清理消息中可能包含的表情符号
  const cleanMessage = (msg: string): string => {
    // 移除常见的表情符号
    return msg.replace(/[⚡🤖✅❌📋🔄📊]/g, '').trim();
  };

  return (
    <StatusContainer>
      <StatusContent>
        <StatusIcon>{icon}</StatusIcon>
        <StatusText>{cleanMessage(message)}</StatusText>
      </StatusContent>
    </StatusContainer>
  );
};

export default StatusBar; 