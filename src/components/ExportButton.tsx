import React, { useState } from 'react';
import styled from 'styled-components';

const ExportContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const ExportButton = styled.button<{ disabled: boolean }>`
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
  min-width: 120px;
  justify-content: center;

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled ? 
      '0 4px 12px rgba(40, 167, 69, 0.3)' : 
      '0 6px 20px rgba(40, 167, 69, 0.4)'
    };
  }

  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(0)'};
  }

  ${props => props.disabled && `
    background: linear-gradient(135deg, #6c757d 0%, #868e96 100%);
    box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
  `}
`;

const DropdownMenu = styled.div<{ show: boolean }>`
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
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
  padding: 12px 16px;
  border: none;
  background: white;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;

  &:hover {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    color: #28a745;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f1f3f4;
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
        📁 导出图片
        <span style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
          ▼
        </span>
      </ExportButton>
      
      <DropdownMenu show={showDropdown && !disabled}>
        <DropdownItem onClick={() => handleExport('svg')}>
          🎨 SVG格式
          <span style={{ fontSize: '12px', color: '#6c757d', marginLeft: 'auto' }}>矢量图</span>
        </DropdownItem>
        <DropdownItem onClick={() => handleExport('png')}>
          🖼️ PNG格式
          <span style={{ fontSize: '12px', color: '#6c757d', marginLeft: 'auto' }}>透明背景</span>
        </DropdownItem>
        <DropdownItem onClick={() => handleExport('jpg')}>
          📷 JPG格式
          <span style={{ fontSize: '12px', color: '#6c757d', marginLeft: 'auto' }}>白色背景</span>
        </DropdownItem>
      </DropdownMenu>
    </ExportContainer>
  );
};

export default ExportButtonComponent; 