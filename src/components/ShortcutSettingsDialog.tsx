import React, { useState, useEffect, useRef } from 'react';
import { electronShortcutFromKeydown } from '../utils/keyboardShortcut';
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
  z-index: 20000;
`;

const Dialog = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  padding: 32px;
  width: 90%;
  max-width: 500px;
  border: 1px solid #e1e8ed;
  animation: dialogFade 0.1s ease;

  @keyframes dialogFade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Title = styled.h2`
  margin: 0 0 24px 0;
  color: #2c3e50;
  font-size: 21px;
  font-weight: 600;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: #34495e;
  font-weight: 600;
  font-size: 15px;
`;

const ShortcutButton = styled.button<{ 
  $isListening?: boolean; 
  $isSet?: boolean;
}>`
  padding: 16px 20px;
  border: 2px solid ${props => 
    props.$isListening ? '#e74c3c' : 
    props.$isSet ? '#27ae60' : '#e1e8ed'
  };
  border-radius: 8px;
  background: ${props => 
    props.$isListening ? 'rgba(231, 76, 60, 0.1)' : 
    props.$isSet ? 'rgba(39, 174, 96, 0.1)' : 'white'
  };
  font-size: 15px;
  color: ${props => 
    props.$isListening ? '#e74c3c' : 
    props.$isSet ? '#27ae60' : '#2c3e50'
  };
  transition: border-color 0.12s ease, background 0.12s ease, color 0.12s ease;
  font-family: "Cascadia Code", "Consolas", monospace;
  cursor: pointer;
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;

  &:hover {
    background: ${props => 
      props.$isListening ? 'rgba(231, 76, 60, 0.15)' : 
      props.$isSet ? 'rgba(39, 174, 96, 0.15)' : 'rgba(74, 144, 226, 0.05)'
    };
    border-color: ${props => 
      props.$isListening ? '#e74c3c' : 
      props.$isSet ? '#27ae60' : '#4a90e2'
    };
  }

  &:focus {
    outline: 2px solid ${props => 
      props.$isListening ? 'rgba(231, 76, 60, 0.45)' : 
      props.$isSet ? 'rgba(39, 174, 96, 0.45)' : 'rgba(74, 144, 226, 0.45)'
    };
    outline-offset: 0;
  }

  ${props => props.$isListening && `
    outline: 2px solid rgba(231, 76, 60, 0.45);
    outline-offset: 0;
  `}
`;

const ShortcutDisplay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const ShortcutText = styled.span<{ $isListening?: boolean }>`
  font-weight: 600;
  font-size: ${props => props.$isListening ? '13px' : '17px'};
`;

const ListeningText = styled.span`
  font-size: 12px;
  opacity: 0.7;
  font-weight: normal;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'tertiary' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: opacity 0.12s ease;
  min-width: 100px;

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
          color: white;

          &:hover {
            background: linear-gradient(135deg, #5ba0f2 0%, #458bcd 100%);
          }

          &:disabled {
            background: linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%);
            cursor: not-allowed;
          }
        `;
      case 'tertiary':
        return `
          background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
          color: white;

          &:hover {
            background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
          }
        `;
      default: // secondary
        return `
          background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
          color: white;

          &:hover {
            background: linear-gradient(135deg, #a4b3b6 0%, #8e9b9d 100%);
          }
        `;
    }
  }}
`;

const Description = styled.p`
  color: var(--color-textSecondary);
  font-size: 14px;
  margin: 0 0 20px 0;
  line-height: 1.5;
  text-align: center;
  background: var(--color-surfaceLight);
  padding: 12px;
  border-radius: 8px;
`;

const SuccessMessage = styled.div`
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  color: #155724;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid #28a745;
  margin-bottom: 16px;
  text-align: center;
  font-weight: 600;
  animation: msgFade 0.1s ease;

  @keyframes msgFade {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

interface ShortcutSettingsDialogProps {
  shortcuts: { capture: string; upload: string };
  onSave: (shortcuts: { capture: string; upload: string }) => void;
  onClose: () => void;
}

const ShortcutSettingsDialog: React.FC<ShortcutSettingsDialogProps> = ({
  shortcuts,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState(shortcuts);
  const [isDragging, setIsDragging] = useState(false);
  const [listeningFor, setListeningFor] = useState<'capture' | 'upload' | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleReset = () => {
    const defaultShortcuts = { capture: 'Alt+A', upload: 'Alt+S' };
    setFormData(defaultShortcuts);
    onSave(defaultShortcuts);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  const handleShortcutKeyDown = (e: KeyboardEvent) => {
    if (!listeningFor) return;
    e.preventDefault();
    e.stopPropagation();

    const shortcut = electronShortcutFromKeydown(e);
    if (!shortcut) return;

    setFormData(prev => ({ ...prev, [listeningFor]: shortcut }));
    setListeningFor(null);
  };

  useEffect(() => {
    if (listeningFor) {
      document.addEventListener('keydown', handleShortcutKeyDown, true);
      return () => {
        document.removeEventListener('keydown', handleShortcutKeyDown, true);
      };
    }
  }, [listeningFor]);

  // 开始监听快捷键
  const startListening = (field: 'capture' | 'upload') => {
    setListeningFor(field);
    if (dialogRef.current) {
      dialogRef.current.focus();
    }
  };

  const stopListening = () => {
    setListeningFor(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 检查快捷键是否有效
    if (!formData.capture || !formData.upload) {
      return;
    }

    try {
      await onSave(formData);
      setShowSuccess(true);
      
      // 显示成功消息后自动关闭
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('保存快捷键失败:', error);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDragging && !listeningFor) {
      onClose();
    }
  };
  
  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  const handleMouseDown = () => {
    setIsDragging(false);
  };
  
  const handleMouseMove = () => {
    if (isDragging === false) {
      setIsDragging(true);
    }
  };
  
  const handleMouseUp = () => {
    setTimeout(() => {
      setIsDragging(false);
    }, 10);
  };

  // 按键显示文本
  const getShortcutDisplay = (field: 'capture' | 'upload') => {
    if (listeningFor === field) {
      return '按住快捷键...';
    }
    return formData[field] || '点击设置快捷键';
  };

  return (
    <Overlay 
      onClick={handleOverlayClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Dialog 
        ref={dialogRef}
        onClick={handleDialogClick}
        tabIndex={-1}
      >
        <Title>
          <MaterialIcon name="keyboard" size={20} /> 快捷键设置
        </Title>
        
        {showSuccess ? (
          <SuccessMessage>
            <MaterialIcon name="check_circle" size={16} /> 快捷键已保存成功！
          </SuccessMessage>
        ) : (
          <Description>
            点击下方按钮，再按下目标组合键（截图默认 Alt+A；请避免与系统或其它软件冲突）。
          </Description>
        )}

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>截图快捷键</Label>
            <ShortcutButton
              type="button"
              $isListening={listeningFor === 'capture'}
              $isSet={!!formData.capture}
              onClick={() => listeningFor === 'capture' ? stopListening() : startListening('capture')}
            >
              <ShortcutDisplay>
                <ShortcutText $isListening={listeningFor === 'capture'}>
                  {getShortcutDisplay('capture')}
                </ShortcutText>
                {listeningFor === 'capture' && (
                  <ListeningText>松开按键即可保存</ListeningText>
                )}
              </ShortcutDisplay>
            </ShortcutButton>
          </FormGroup>

          <FormGroup>
            <Label>上传图片快捷键</Label>
            <ShortcutButton
              type="button"
              $isListening={listeningFor === 'upload'}
              $isSet={!!formData.upload}
              onClick={() => listeningFor === 'upload' ? stopListening() : startListening('upload')}
            >
              <ShortcutDisplay>
                <ShortcutText $isListening={listeningFor === 'upload'}>
                  {getShortcutDisplay('upload')}
                </ShortcutText>
                {listeningFor === 'upload' && (
                  <ListeningText>松开按键即可保存</ListeningText>
                )}
              </ShortcutDisplay>
            </ShortcutButton>
          </FormGroup>

          <ButtonGroup>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose}
              disabled={!!listeningFor}
            >
              取消
            </Button>
            <Button 
              type="button" 
              variant="tertiary" 
              onClick={handleReset}
              disabled={!!listeningFor}
            >
              重置
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={!!listeningFor || !formData.capture || !formData.upload}
            >
              保存
            </Button>
          </ButtonGroup>
        </Form>
      </Dialog>
    </Overlay>
  );
};

export default ShortcutSettingsDialog; 