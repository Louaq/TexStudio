import React from 'react';
import styled, { keyframes } from 'styled-components';

const slideIn = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
`;

const ProgressContainer = styled.div<{ isVisible: boolean }>`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  z-index: 2000;
  display: flex;
  align-items: center;
  width: 280px;
  animation: ${props => (props.isVisible ? slideIn : slideOut)} 0.5s forwards ease-in-out;
  border: 1px solid #e1e8ed;
`;

const IconWrapper = styled.div`
  font-size: 24px;
  margin-right: 16px;
`;

const ProgressDetails = styled.div`
  flex-grow: 1;
`;

const Title = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background-color: #e1e8ed;
  border-radius: 4px;
  margin-top: 8px;
  overflow: hidden;
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: ${props => props.progress}%;
  height: 100%;
  background: linear-gradient(90deg, #4a90e2 0%, #357bd8 100%);
  transition: width 0.3s ease;
  border-radius: 4px;
`;

const ProgressText = styled.div`
  font-size: 12px;
  color: #34495e;
  margin-top: 4px;
  text-align: right;
`;

interface UpdateProgressIndicatorProps {
  progress: number;
  isVisible: boolean;
}

const UpdateProgressIndicator: React.FC<UpdateProgressIndicatorProps> = ({ progress, isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <ProgressContainer isVisible={isVisible}>
      <IconWrapper>🚀</IconWrapper>
      <ProgressDetails>
        <Title>正在后台下载更新...</Title>
        <ProgressBarContainer>
          <ProgressBar progress={progress} />
        </ProgressBarContainer>
        <ProgressText>{progress.toFixed(0)}%</ProgressText>
      </ProgressDetails>
    </ProgressContainer>
  );
};

export default UpdateProgressIndicator; 