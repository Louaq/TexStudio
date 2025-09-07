import React, { useState } from 'react';
import styled from 'styled-components';
import MaterialIcon from './MaterialIcon';
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
  padding: 10px 18px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  min-width: 130px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    ${props => !props.disabled && `
      background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
      transform: translateY(-1px);
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
    `}
  }

  &:active {
    transform: translateY(0);
  }

  &::after {
    content: '';
  }
`;

const DropdownMenu = styled.div<{ show: boolean }>`
  position: absolute;
  bottom: 100%;
  right: 0;
  min-width: 190px;
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
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
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.2s ease;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
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
  font-size: 11px;
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
        <MaterialIcon name="content_copy" /> 复制LaTeX
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
        
        <DropdownItem onClick={() => handleModeSelect('equation')}>
          <div>
            <div>复制为 {'\\begin{equation}...\\end{equation}'}</div>
            <ModeDescription>编号公式环境格式</ModeDescription>
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