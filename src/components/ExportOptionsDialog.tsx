import React from 'react';
import styled from 'styled-components';
import MaterialIcon from './MaterialIcon';

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
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
  background: white;
  border-radius: 12px;
  padding: 24px;
  min-width: 320px;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
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
  color: #2c3e50;
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
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  
  &:hover {
    border-color: #28a745;
    background: #f8fff8;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const OptionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const OptionIcon = styled.span`
  font-size: 16px;
  display: inline-flex;
  align-items: center;
`;

const OptionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
`;

const OptionDescription = styled.div`
  font-size: 12px;
  color: #7f8c8d;
  line-height: 1.4;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const CancelButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #dce1e8;
  border-radius: 6px;
  background: white;
  color: #6c757d;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
    border-color: #adb5bd;
  }
`;

interface ExportOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'svg' | 'png' | 'jpg') => void;
}

const ExportOptionsDialog: React.FC<ExportOptionsDialogProps> = ({
  isOpen,
  onClose,
  onExport
}) => {
  if (!isOpen) return null;

  const handleOptionSelect = (format: 'svg' | 'png' | 'jpg') => {
    onExport(format);
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

  const exportOptions = [
    {
      format: 'svg' as const,
      icon: <MaterialIcon name="palette" size={18} />,
      title: 'SVG格式',
      description: '矢量图形，无损缩放，适合印刷和网页使用'
    },
    {
      format: 'png' as const,
      icon: <MaterialIcon name="image" size={18} />,
      title: 'PNG格式',
      description: '透明背景位图，适合网页和演示文稿使用'
    },
    {
      format: 'jpg' as const,
      icon: <MaterialIcon name="photo_camera" size={18} />,
      title: 'JPG格式',
      description: '白色背景位图，文件较小，适合文档插入'
    }
  ];

  return (
    <DialogOverlay onClick={handleOverlayClick}>
      <DialogContainer>
        <DialogTitle>
          <MaterialIcon name="save" /> 选择导出格式
        </DialogTitle>
        
        <OptionsList>
          {exportOptions.map((option) => (
            <OptionItem
              key={option.format}
              onClick={() => handleOptionSelect(option.format)}
            >
              <OptionHeader>
                <OptionIcon>{option.icon}</OptionIcon>
                <OptionTitle>{option.title}</OptionTitle>
              </OptionHeader>
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

export default ExportOptionsDialog; 