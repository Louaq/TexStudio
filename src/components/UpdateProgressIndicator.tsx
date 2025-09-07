import React from 'react';
import styled, { keyframes } from 'styled-components';

const slideIn = keyframes`
  from {
    transform: translateY(-100%);
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
    transform: translateY(-100%);
    opacity: 0;
  }
`;

const ProgressContainer = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: #e1e8ed;
  z-index: 2000;
  animation: ${props => (props.isVisible ? slideIn : slideOut)} 0.3s forwards ease-in-out;
  pointer-events: none;
`;
const ProgressBarContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: ${props => props.progress}%;
  height: 100%;
  background: linear-gradient(90deg, #4a90e2 0%, #357bd8 100%);
  transition: width 0.3s ease;
  border-radius: 4px;
`;

// 不显示具体百分比文本

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
      <ProgressBarContainer>
        <ProgressBar progress={progress} />
      </ProgressBarContainer>
    </ProgressContainer>
  );
};

export default UpdateProgressIndicator; 