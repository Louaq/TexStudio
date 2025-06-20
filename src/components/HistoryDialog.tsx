import React, { useState } from 'react';
import styled from 'styled-components';
import { HistoryItem } from '../types';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const Dialog = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid #e1e8ed;
  animation: slideIn 0.3s ease;
  display: flex;
  flex-direction: column;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

// 自定义确认对话框样式
const ConfirmDialog = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid #e1e8ed;
  animation: slideIn 0.3s ease;
  display: flex;
  flex-direction: column;
  z-index: 1100;
`;

const ConfirmTitle = styled.h3`
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ConfirmMessage = styled.p`
  color: #34495e;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 24px;
`;

const ConfirmButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const ConfirmButton = styled.button<{ variant?: 'primary' | 'danger' | 'cancel' }>`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  ${props => {
    if (props.variant === 'danger') {
      return `
        background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
        color: white;
        &:hover {
          background: linear-gradient(135deg, #e55347 0%, #d2433a 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(231, 76, 60, 0.3);
        }
      `;
    } else if (props.variant === 'cancel') {
      return `
        background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
        color: white;
        &:hover {
          background: linear-gradient(135deg, #a4b3b6 0%, #8e9b9d 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(127, 140, 141, 0.3);
        }
      `;
    } else {
      return `
        background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
        color: white;
        &:hover {
          background: linear-gradient(135deg, #5ba0f2 0%, #458bcd 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(74, 144, 226, 0.3);
        }
      `;
    }
  }}
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ClearButton = styled.button`
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;

  &:hover {
    background: linear-gradient(135deg, #e55347 0%, #d2433a 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(231, 76, 60, 0.2);
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
  }
`;

const HistoryItemContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
`;

const DateLabel = styled.div`
  color: #7f8c8d;
  font-size: 12px;
  margin-bottom: 8px;
  font-weight: 500;
`;

const LatexCode = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 12px;
  font-family: "Cascadia Code", "Consolas", monospace;
  font-size: 13px;
  color: #2c3e50;
  max-height: 80px;
  overflow-y: auto;
  margin-bottom: 12px;
  word-break: break-all;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'danger' }>`
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  ${props => props.variant === 'danger' ? `
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    color: white;

    &:hover {
      background: linear-gradient(135deg, #e55347 0%, #d2433a 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(231, 76, 60, 0.2);
    }
  ` : `
    background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
    color: white;

    &:hover {
      background: linear-gradient(135deg, #5ba0f2 0%, #458bcd 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(74, 144, 226, 0.2);
    }
  `}
`;

const EmptyState = styled.div`
  text-align: center;
  color: #7f8c8d;
  padding: 40px 20px;
  font-size: 16px;
`;

const CloseButton = styled.button`
  background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: flex-end;

  &:hover {
    background: linear-gradient(135deg, #a4b3b6 0%, #8e9b9d 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(127, 140, 141, 0.2);
  }
`;

// 自定义确认对话框组件
interface ConfirmationProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDelete?: boolean;
}

const Confirmation: React.FC<ConfirmationProps> = ({
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  onCancel,
  isDelete = false
}) => {
  return (
    <Overlay onClick={(e) => {
      if (e.target === e.currentTarget) onCancel();
    }}>
      <ConfirmDialog>
        <ConfirmTitle>
          {isDelete ? '🗑️ ' : '⚠️ '}{title}
        </ConfirmTitle>
        <ConfirmMessage>{message}</ConfirmMessage>
        <ConfirmButtons>
          <ConfirmButton variant="cancel" onClick={onCancel}>
            {cancelText}
          </ConfirmButton>
          <ConfirmButton variant={isDelete ? "danger" : "primary"} onClick={onConfirm}>
            {confirmText}
          </ConfirmButton>
        </ConfirmButtons>
      </ConfirmDialog>
    </Overlay>
  );
};

interface HistoryDialogProps {
  history: HistoryItem[];
  onUse: (latex: string) => void;
  onDelete: (latex: string) => void;
  onClear: () => void;
  onClose: () => void;
}

const HistoryDialog: React.FC<HistoryDialogProps> = ({
  history,
  onUse,
  onDelete,
  onClear,
  onClose
}) => {
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [latexToDelete, setLatexToDelete] = useState<string | null>(null);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleClear = () => {
    setShowConfirmClear(true);
  };

  const handleDelete = (latex: string) => {
    setLatexToDelete(latex);
    setShowConfirmDelete(true);
  };

  const confirmClear = () => {
    onClear();
    setShowConfirmClear(false);
  };

  const confirmDelete = () => {
    if (latexToDelete) {
      onDelete(latexToDelete);
      setLatexToDelete(null);
    }
    setShowConfirmDelete(false);
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Dialog>
        <Header>
          <Title>
            📚 历史记录
          </Title>
          {history.length > 0 && (
            <ClearButton onClick={handleClear}>
              🗑️ 清空历史记录
            </ClearButton>
          )}
        </Header>

        <Content>
          {history.length === 0 ? (
            <EmptyState>
              📝 暂无历史记录
            </EmptyState>
          ) : (
            history.map((item, index) => (
              <HistoryItemContainer key={index}>
                <DateLabel>{item.date}</DateLabel>
                <LatexCode>{item.latex}</LatexCode>
                <ButtonGroup>
                  <ActionButton 
                    variant="danger" 
                    onClick={() => handleDelete(item.latex)}
                  >
                    🗑️ 删除
                  </ActionButton>
                  <ActionButton onClick={() => onUse(item.latex)}>
                    ✨ 使用此公式
                  </ActionButton>
                </ButtonGroup>
              </HistoryItemContainer>
            ))
          )}
        </Content>

        <CloseButton onClick={onClose}>
          关闭
        </CloseButton>
      </Dialog>

      {/* 清空历史记录确认对话框 */}
      {showConfirmClear && (
        <Confirmation
          title="确定要清空所有历史记录吗？"
          message="此操作将删除所有历史记录，且不可恢复。"
          confirmText="确定清空"
          onConfirm={confirmClear}
          onCancel={() => setShowConfirmClear(false)}
          isDelete={true}
        />
      )}

      {/* 删除单条记录确认对话框 */}
      {showConfirmDelete && (
        <Confirmation
          title="确定要删除这条记录吗？"
          message="此操作不可恢复。"
          confirmText="确定删除"
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirmDelete(false)}
          isDelete={true}
        />
      )}
    </Overlay>
  );
};

export default HistoryDialog; 