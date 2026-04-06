import React, { useState } from 'react';
import styled from 'styled-components';
import MaterialIcon from './MaterialIcon';

const ExportContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const ExportButton = styled.button<{ disabled: boolean }>`
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primaryDark) 100%);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 120px;
  justify-content: center;

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-1px)'};
  }

  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(0)'};
  }

  ${props => props.disabled && `
    background: linear-gradient(135deg, #6c757d 0%, #868e96 100%);
  `}
`;

const DropdownMenu = styled.div<{ show: boolean }>`
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  z-index: 1000;
  margin-bottom: 5px;
  overflow: hidden;
  opacity: ${props => props.show ? 1 : 0};
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  transform: ${props => props.show ? 'translateY(0)' : 'translateY(10px)'};
  transition: all 0.2s ease;
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;

  &:hover {
    background: var(--color-surfaceLight);
    color: var(--color-primary);
  }

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-borderLight);
  }
`;

interface ExportButtonProps {
  onExport: (format: 'svg' | 'png' | 'jpg') => void;
  disabled?: boolean;
}

const ExportButtonComponent: React.FC<ExportButtonProps> = ({
  onExport,
  disabled = false
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleExport = (format: 'svg' | 'png' | 'jpg') => {
    onExport(format);
    setShowDropdown(false);
  };

  const handleButtonClick = () => {
    if (disabled) return;
    setShowDropdown(!showDropdown);
  };

  // 点击外部关闭下拉菜单
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.export-container')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <ExportContainer className="export-container">
      <ExportButton 
        disabled={disabled} 
        onClick={handleButtonClick}
        title={disabled ? "请先识别或输入数学公式" : "导出数学公式为图片"}
      >
        <MaterialIcon name="folder" /> 导出图片
        <MaterialIcon name={showDropdown ? 'expand_less' : 'expand_more'} style={{ transition: 'transform 0.2s ease' }} />
      </ExportButton>
      
      <DropdownMenu show={showDropdown && !disabled}>
        <DropdownItem onClick={() => handleExport('svg')}>
          <MaterialIcon name="palette" /> SVG格式
          <span style={{ fontSize: '13px', color: 'var(--color-textSecondary)', marginLeft: 'auto' }}>矢量图</span>
        </DropdownItem>
        <DropdownItem onClick={() => handleExport('png')}>
          <MaterialIcon name="image" /> PNG格式
          <span style={{ fontSize: '13px', color: 'var(--color-textSecondary)', marginLeft: 'auto' }}>透明背景</span>
        </DropdownItem>
        <DropdownItem onClick={() => handleExport('jpg')}>
          <MaterialIcon name="photo_camera" /> JPG格式
          <span style={{ fontSize: '13px', color: 'var(--color-textSecondary)', marginLeft: 'auto' }}>白色背景</span>
        </DropdownItem>
      </DropdownMenu>
    </ExportContainer>
  );
};

export default ExportButtonComponent; 