import React from 'react';
import styled from 'styled-components';
import MaterialIcon from './MaterialIcon';
import { CopyMode } from '../types';

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-dialogOverlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const DialogContainer = styled.div`
  background: var(--color-surface);
  border-radius: 12px;
  padding: 24px;
  min-width: 320px;
  max-width: 400px;
  box-shadow: 0 8px 32px color-mix(in srgb, var(--color-text) 12%, transparent);
  border: 1px solid var(--color-border);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const DialogTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
`;

const OptionItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  
  &:hover {
    border-color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary) 5%, var(--color-surface));
  }

  &:active {
    transform: translateY(0);
  }
`;

const OptionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 4px;
`;

const OptionDescription = styled.div`
  font-size: 12px;
  color: var(--color-textSecondary);
  line-height: 1.4;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const CancelButton = styled.button`
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  color: var(--color-textSecondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: color-mix(in srgb, var(--color-text) 3%, var(--color-surface));
    border-color: var(--color-primary);
    color: var(--color-text);
  }
`;

interface CopyOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCopy: (mode: CopyMode) => void;
}

const CopyOptionsDialog: React.FC<CopyOptionsDialogProps> = ({
  isOpen,
  onClose,
  onCopy
}) => {
  if (!isOpen) return null;

  const handleOptionSelect = (mode: CopyMode) => {
    onCopy(mode);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ESC键关闭对话框
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const copyOptions = [
    {
      mode: 'normal' as CopyMode,
      title: '复制原始代码',
      description: '不添加任何符号，直接复制LaTeX代码'
    },
    {
      mode: 'inline' as CopyMode,
      title: '复制为 $...$',
      description: '行内公式格式，适用于文档中的单行公式'
    },
    {
      mode: 'display' as CopyMode,
      title: '复制为 $$...$$',
      description: '显示公式格式，独立成行居中显示'
    },
    {
      mode: 'equation' as CopyMode,
      title: '复制为 \\begin{equation}...\\end{equation}',
      description: '编号公式环境格式，自动添加公式编号'
    },
    {
      mode: 'mathml' as CopyMode,
      title: '复制为 MathML',
      description: 'Word等软件兼容的格式，可直接粘贴到Word'
    }
  ];

  return (
    <DialogOverlay onClick={handleOverlayClick}>
      <DialogContainer>
        <DialogTitle>
          <MaterialIcon name="content_copy" /> 选择复制格式
        </DialogTitle>
        
        <OptionsList>
          {copyOptions.map((option) => (
            <OptionItem
              key={option.mode}
              onClick={() => handleOptionSelect(option.mode)}
            >
              <OptionTitle>{option.title}</OptionTitle>
              <OptionDescription>{option.description}</OptionDescription>
            </OptionItem>
          ))}
        </OptionsList>

        <ButtonGroup>
          <CancelButton onClick={onClose}>
            取消
          </CancelButton>
        </ButtonGroup>
      </DialogContainer>
    </DialogOverlay>
  );
};

export default CopyOptionsDialog; 