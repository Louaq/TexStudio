import React from 'react';
import styled from 'styled-components';
import MaterialIcon from './MaterialIcon';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-dialogOverlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(2px);
`;

const Dialog = styled.div`
  background: var(--color-surface);
  border-radius: 12px;
  box-shadow: 0 20px 60px color-mix(in srgb, var(--color-text) 30%, transparent);
  width: 90%;
  max-width: 420px;
  overflow: hidden;
  animation: slideIn 0.2s ease-out;
  border: 1px solid var(--color-border);

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`;

const DialogHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-borderLight);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DialogTitle = styled.h3`
  margin: 0;
  color: var(--color-text);
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--color-textSecondary);
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: color-mix(in srgb, var(--color-text) 5%, transparent);
    color: var(--color-text);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const DialogBody = styled.div`
  padding: 24px;
`;

const DialogMessage = styled.p`
  margin: 0;
  color: var(--color-text);
  font-size: 14px;
  line-height: 1.6;
`;

const DialogFooter = styled.div`
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid var(--color-borderLight);
  background: color-mix(in srgb, var(--color-text) 2%, transparent);
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;

  ${props => props.$variant === 'primary' ? `
    background: var(--color-error);
    color: white;
    
    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px color-mix(in srgb, var(--color-error) 30%, transparent);
    }
  ` : `
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    
    &:hover {
      background: color-mix(in srgb, var(--color-text) 3%, transparent);
      border-color: var(--color-primary);
    }
  `}

  &:active {
    transform: translateY(0);
  }
`;

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = '确认操作',
  message,
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  onCancel
}) => {
  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Dialog>
        <DialogHeader>
          <DialogTitle>
            <MaterialIcon name="warning" size={22} style={{ color: 'var(--color-error)' }} />
            {title}
          </DialogTitle>
          <CloseButton onClick={handleCancel}>
            <MaterialIcon name="close" size={20} />
          </CloseButton>
        </DialogHeader>
        <DialogBody>
          <DialogMessage>{message}</DialogMessage>
        </DialogBody>
        <DialogFooter>
          <Button $variant="secondary" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button $variant="primary" onClick={handleConfirm}>
            {confirmText}
          </Button>
        </DialogFooter>
      </Dialog>
    </Overlay>
  );
};

export default ConfirmDialog;

