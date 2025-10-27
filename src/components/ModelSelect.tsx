import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { getModelDisplayName } from '../utils/modelIcons';
import MaterialIcon from './MaterialIcon';
import ModelIcon from './ModelIcon';

const SelectContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SelectButton = styled.button<{ disabled: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-inputBorder);
  border-radius: 8px;
  background: var(--color-inputBackground);
  font-size: 15px;
  color: var(--color-text);
  transition: all 0.3s ease;
  cursor: pointer;
  font-weight: 500;
  height: 44px;
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;

  &:focus {
    outline: none;
    border-color: var(--color-inputFocus);
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SelectButtonContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconWrapper = styled.div<{ size: number }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const Dropdown = styled.div<{ open: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  display: ${props => props.open ? 'block' : 'none'};
  
  /* 滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--color-borderLight);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--color-textSecondary);
  }
`;

const Option = styled.div<{ selected: boolean }>`
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
  background: ${props => props.selected ? 'color-mix(in srgb, var(--color-primary) 8%, var(--color-surface))' : 'var(--color-surface)'};
  border-left: ${props => props.selected ? '3px solid var(--color-primary)' : '3px solid transparent'};

  &:hover {
    background: ${props => props.selected ? 'color-mix(in srgb, var(--color-primary) 12%, var(--color-surface))' : 'color-mix(in srgb, var(--color-text) 5%, var(--color-surface))'};
  }

  &:first-child {
    border-radius: 8px 8px 0 0;
  }

  &:last-child {
    border-radius: 0 0 8px 8px;
  }
`;

const OptionText = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const OptionName = styled.span`
  font-size: 14px;
  color: var(--color-text);
`;

const OptionId = styled.span`
  font-size: 11px;
  color: var(--color-textSecondary);
  font-family: "Cascadia Code", "Consolas", monospace;
`;

const PlaceholderText = styled.span`
  color: var(--color-textSecondary);
`;

const CheckIcon = styled.div`
  color: var(--color-primary);
  display: flex;
  align-items: center;
`;

interface Model {
  id: string;
  name: string;
}

interface ModelSelectProps {
  value: string;
  options: Model[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}


const ModelSelect: React.FC<ModelSelectProps> = ({
  value,
  options,
  onChange,
  disabled = false,
  placeholder = '请选择模型'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.id === value);

  return (
    <SelectContainer ref={selectRef}>
      <SelectButton
        type="button"
        onClick={handleToggle}
        disabled={disabled}
      >
        <SelectButtonContent>
          {selectedOption && (
            <IconWrapper size={20}>
              <ModelIcon modelId={selectedOption.id} size={20} />
            </IconWrapper>
          )}
          <span>{selectedOption ? getModelDisplayName(selectedOption.name) : <PlaceholderText>{placeholder}</PlaceholderText>}</span>
        </SelectButtonContent>
        <IconWrapper size={20}>
          <MaterialIcon name={isOpen ? "expand_less" : "expand_more"} size={20} />
        </IconWrapper>
      </SelectButton>
      
      <Dropdown open={isOpen}>
        {options.length === 0 ? (
          <Option selected={false}>
            <PlaceholderText style={{ padding: '12px' }}>暂无可用模型，请先加载模型列表</PlaceholderText>
          </Option>
        ) : (
          options.map(option => {
            const isSelected = option.id === value;
            
            return (
              <Option
                key={option.id}
                selected={isSelected}
                onClick={() => handleSelect(option.id)}
              >
                <IconWrapper size={18}>
                  <ModelIcon modelId={option.id} size={18} />
                </IconWrapper>
                <OptionText>
                  <OptionName>{getModelDisplayName(option.name)}</OptionName>
                  <OptionId>{option.id}</OptionId>
                </OptionText>
                {isSelected && (
                  <CheckIcon>
                    <MaterialIcon name="check" size={18} />
                  </CheckIcon>
                )}
              </Option>
            );
          })
        )}
      </Dropdown>
    </SelectContainer>
  );
};

export default ModelSelect;