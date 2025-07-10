import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

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
  padding: 32px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid #e1e8ed;
  animation: slideIn 0.3s ease;

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

const Title = styled.h2`
  margin: 0 0 24px 0;
  color: #2c3e50;
  font-size: 20px;
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
  font-size: 14px;
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
  font-size: 14px;
  color: ${props => 
    props.$isListening ? '#e74c3c' : 
    props.$isSet ? '#27ae60' : '#2c3e50'
  };
  transition: all 0.3s ease;
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
    outline: none;
    box-shadow: 0 0 0 3px ${props => 
      props.$isListening ? 'rgba(231, 76, 60, 0.2)' : 
      props.$isSet ? 'rgba(39, 174, 96, 0.2)' : 'rgba(74, 144, 226, 0.2)'
    };
  }

  ${props => props.$isListening && `
    animation: pulse 1.5s infinite;
    
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(231, 76, 60, 0); }
      100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); }
    }
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
  font-size: ${props => props.$isListening ? '12px' : '16px'};
`;

const ListeningText = styled.span`
  font-size: 10px;
  opacity: 0.7;
  font-weight: normal;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;

  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
    color: white;

    &:hover {
      background: linear-gradient(135deg, #5ba0f2 0%, #458bcd 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
    }

    &:disabled {
      background: linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%);
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  ` : `
    background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
    color: white;

    &:hover {
      background: linear-gradient(135deg, #a4b3b6 0%, #8e9b9d 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(127, 140, 141, 0.2);
    }
  `}

  &:active {
    transform: translateY(0);
  }
`;

const Description = styled.p`
  color: #7f8c8d;
  font-size: 13px;
  margin: 0 0 20px 0;
  line-height: 1.5;
  text-align: center;
  background: rgba(255, 255, 255, 0.6);
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
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
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
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // 将按键转换为Electron格式
  const formatShortcut = (keys: Set<string>): string => {
    const modifiers: string[] = [];
    const regularKeys: string[] = [];

    Array.from(keys).forEach(key => {
      switch (key.toLowerCase()) {
        case 'control':
        case 'ctrl':
          modifiers.push('Ctrl');
          break;
        case 'alt':
          modifiers.push('Alt');
          break;
        case 'shift':
          modifiers.push('Shift');
          break;
        case 'meta':
        case 'cmd':
          modifiers.push('Cmd');
          break;
        default:
          if (key.length === 1) {
            regularKeys.push(key.toUpperCase());
          } else {
            // 处理功能键
            regularKeys.push(key);
          }
          break;
      }
    });

    // 按照 Electron 的格式组合快捷键
    return [...modifiers, ...regularKeys].join('+');
  };

  // 处理按键按下
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!listeningFor) return;

    e.preventDefault();
    e.stopPropagation();

    const key = e.key;
    setPressedKeys(prev => new Set([...Array.from(prev), key]));
  };

  // 处理按键释放
  const handleKeyUp = (e: KeyboardEvent) => {
    if (!listeningFor) return;

    e.preventDefault();
    e.stopPropagation();

    // 如果所有修饰键都释放了，并且有实际的按键被按下，就保存快捷键
    if (!e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey && pressedKeys.size > 0) {
      const shortcut = formatShortcut(pressedKeys);
      
      if (shortcut && shortcut !== '' && pressedKeys.size > 1) { // 至少需要一个修饰键 + 一个普通键
        setFormData(prev => ({ ...prev, [listeningFor]: shortcut }));
        setListeningFor(null);
        setPressedKeys(new Set());
      }
    }
  };

  // 监听键盘事件
  useEffect(() => {
    if (listeningFor) {
      document.addEventListener('keydown', handleKeyDown, true);
      document.addEventListener('keyup', handleKeyUp, true);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown, true);
        document.removeEventListener('keyup', handleKeyUp, true);
      };
    }
  }, [listeningFor, pressedKeys]);

  // 开始监听快捷键
  const startListening = (field: 'capture' | 'upload') => {
    setListeningFor(field);
    setPressedKeys(new Set());
    
    // 聚焦到对话框以确保能接收键盘事件
    if (dialogRef.current) {
      dialogRef.current.focus();
    }
  };

  // 停止监听
  const stopListening = () => {
    setListeningFor(null);
    setPressedKeys(new Set());
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
      if (pressedKeys.size > 0) {
        return formatShortcut(pressedKeys);
      }
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
          ⌨️ 快捷键设置
        </Title>
        
        {showSuccess ? (
          <SuccessMessage>
            ✅ 快捷键已保存成功！
          </SuccessMessage>
        ) : (
          <Description>
            点击下方按钮，然后按住您想要设置的快捷键组合（不要设置为Alt+其他键）。
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