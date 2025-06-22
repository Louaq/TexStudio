import React, { useState } from 'react';
import styled from 'styled-components';
import { CopyMode } from '../types';

const ButtonContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const MainButton = styled.button<{ disabled: boolean }>`
  background: ${props => props.disabled 
    ? 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)'
    : 'linear-gradient(135deg, #27ae60 0%, #229954 100%)'
  };
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  min-width: 140px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    ${props => !props.disabled && `
      background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    `}
  }

  &:active {
    transform: translateY(0);
  }

  &::after {
    content: '▼';
    font-size: 10px;
    margin-left: 8px;
    opacity: 0.8;
  }
`;

const DropdownMenu = styled.div<{ show: boolean }>`
  position: absolute;
  bottom: 100%;
  right: 0;
  min-width: 200px;
  background: white;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  display: ${props => props.show ? 'block' : 'none'};
  margin-bottom: 8px;
  animation: slideUp 0.2s ease;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: #27ae60;
    color: white;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f1f3f4;
  }
`;

const ModeDescription = styled.div`
  font-size: 12px;
  color: #7f8c8d;
  font-weight: normal;
`;

interface CopyButtonProps {
  onCopy: (mode: CopyMode) => void;
  disabled?: boolean;
}

const CopyButton: React.FC<CopyButtonProps> = ({ onCopy, disabled = false }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleMainClick = () => {
    if (!disabled) {
      onCopy('normal');
    }
  };

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      setShowDropdown(!showDropdown);
    }
  };

  const handleModeSelect = (mode: CopyMode) => {
    onCopy(mode);
    setShowDropdown(false);
  };

  // 点击外部关闭下拉菜单
  React.useEffect(() => {
    const handleClickOutside = () => setShowDropdown(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <ButtonContainer onClick={(e) => e.stopPropagation()}>
      <MainButton 
        disabled={disabled}
        onClick={handleDropdownToggle}
      >
        📋 复制LaTeX
      </MainButton>
      
      <DropdownMenu show={showDropdown && !disabled}>
        <DropdownItem onClick={() => handleModeSelect('normal')}>
          <div>
            <div>复制原始代码</div>
            <ModeDescription>不添加任何符号</ModeDescription>
          </div>
        </DropdownItem>
        
        <DropdownItem onClick={() => handleModeSelect('inline')}>
          <div>
            <div>复制为 $...$</div>
            <ModeDescription>行内公式格式</ModeDescription>
          </div>
        </DropdownItem>
        
        <DropdownItem onClick={() => handleModeSelect('display')}>
          <div>
            <div>复制为 $$...$$</div>
            <ModeDescription>显示公式格式</ModeDescription>
          </div>
        </DropdownItem>
        
        <DropdownItem onClick={() => handleModeSelect('mathml')}>
          <div>
            <div>复制为 MathML</div>
            <ModeDescription>Word公式兼容格式</ModeDescription>
          </div>
        </DropdownItem>
      </DropdownMenu>
    </ButtonContainer>
  );
};

export default CopyButton; 