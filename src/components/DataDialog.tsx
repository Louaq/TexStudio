import React from 'react';
import styled from 'styled-components';
import MaterialIcon from './MaterialIcon';

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-dialogOverlay);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Dialog = styled.div`
  background: var(--color-surface);
  border-radius: 16px;
  padding: 0;
  min-width: 420px;
  max-width: 520px;
  box-shadow: 0 20px 60px color-mix(in srgb, var(--color-text) 30%, transparent);
  border: 1px solid var(--color-border);
  animation: slideUp 0.25s ease;
  overflow: hidden;

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

const DialogHeader = styled.div<{ $type?: 'info' | 'warning' | 'error' | 'success' }>`
  padding: 24px 24px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 2px solid var(--color-border);
  background: ${props => {
    switch (props.$type) {
      case 'warning':
        return 'color-mix(in srgb, var(--color-warning) 8%, var(--color-surface))';
      case 'error':
        return 'color-mix(in srgb, var(--color-error) 8%, var(--color-surface))';
      case 'success':
        return 'color-mix(in srgb, var(--color-success) 8%, var(--color-surface))';
      default:
        return 'color-mix(in srgb, var(--color-primary) 8%, var(--color-surface))';
    }
  }};
`;

const IconWrapper = styled.div<{ $type?: 'info' | 'warning' | 'error' | 'success' }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${props => {
    switch (props.$type) {
      case 'warning':
        return 'var(--color-warning)';
      case 'error':
        return 'var(--color-error)';
      case 'success':
        return 'var(--color-success)';
      default:
        return 'var(--color-primary)';
    }
  }};
  color: white;
`;

const DialogTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  flex: 1;
`;

const DialogContent = styled.div`
  padding: 24px;
  color: var(--color-text);
  font-size: 14px;
  line-height: 1.6;
  
  strong {
    color: var(--color-text);
    font-weight: 600;
  }
`;

const DialogFooter = styled.div`
  padding: 16px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-top: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-text) 2%, var(--color-surface));
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 90px;
  justify-content: center;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: var(--color-primary);
          color: white;
          &:hover {
            opacity: 0.9;
            box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 30%, transparent);
          }
        `;
      case 'danger':
        return `
          background: var(--color-error);
          color: white;
          &:hover {
            opacity: 0.9;
            box-shadow: 0 4px 12px color-mix(in srgb, var(--color-error) 30%, transparent);
          }
        `;
      default:
        return `
          background: var(--color-surface);
          color: var(--color-text);
          border: 2px solid var(--color-border);
          &:hover {
            background: color-mix(in srgb, var(--color-text) 5%, var(--color-surface));
            border-color: var(--color-primary);
          }
        `;
    }
  }}

  &:active {
    transform: translateY(1px);
  }
`;

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  type?: 'info' | 'warning' | 'error' | 'success';
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DataConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  type = 'info',
  confirmText = '确定',
  cancelText = '取消',
  isDanger = false,
  onConfirm,
  onCancel
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'success':
        return 'check_circle';
      default:
        return 'info';
    }
  };

  return (
    <Overlay $isOpen={isOpen} onClick={onCancel}>
      <Dialog onClick={(e) => e.stopPropagation()}>
        <DialogHeader $type={type}>
          <IconWrapper $type={type}>
            <MaterialIcon name={getIcon()} size={24} />
          </IconWrapper>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogContent>
          {typeof message === 'string' ? <p style={{ margin: 0 }}>{message}</p> : message}
        </DialogContent>
        <DialogFooter>
          <Button $variant="secondary" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button $variant={isDanger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmText}
          </Button>
        </DialogFooter>
      </Dialog>
    </Overlay>
  );
};

interface AlertDialogProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  type?: 'info' | 'warning' | 'error' | 'success';
  confirmText?: string;
  onConfirm: () => void;
}

export const DataAlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  title,
  message,
  type = 'info',
  confirmText = '确定',
  onConfirm
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'success':
        return 'check_circle';
      default:
        return 'info';
    }
  };

  return (
    <Overlay $isOpen={isOpen} onClick={onConfirm}>
      <Dialog onClick={(e) => e.stopPropagation()}>
        <DialogHeader $type={type}>
          <IconWrapper $type={type}>
            <MaterialIcon name={getIcon()} size={24} />
          </IconWrapper>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogContent>
          {typeof message === 'string' ? <p style={{ margin: 0 }}>{message}</p> : message}
        </DialogContent>
        <DialogFooter>
          <Button $variant="primary" onClick={onConfirm}>
            {confirmText}
          </Button>
        </DialogFooter>
      </Dialog>
    </Overlay>
  );
};

