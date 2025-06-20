import React, { useState } from 'react';
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

const Input = styled.input`
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  color: #2c3e50;
  transition: all 0.3s ease;
  font-family: "Cascadia Code", "Consolas", monospace;

  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  }

  &::placeholder {
    color: #95a5a6;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
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
  ` : `
    background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
    color: white;

    &:hover {
      background: linear-gradient(135deg, #a4b3b6 0%, #8e9b9d 100%);
      transform: translateY(-1px);
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
  border-left: 4px solid #4a90e2;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: 'capture' | 'upload', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Dialog>
        <Title>
          ⌨️ 快捷键设置
        </Title>
        
        <Description>
          设置全局快捷键。格式示例：Alt+C、Ctrl+Shift+S、F2 等。
        </Description>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>截图快捷键</Label>
            <Input
              type="text"
              value={formData.capture}
              onChange={(e) => handleChange('capture', e.target.value)}
              placeholder="例如：Alt+C"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>上传图片快捷键</Label>
            <Input
              type="text"
              value={formData.upload}
              onChange={(e) => handleChange('upload', e.target.value)}
              placeholder="例如：Alt+U"
              required
            />
          </FormGroup>

          <ButtonGroup>
            <Button type="button" variant="secondary" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" variant="primary">
              保存
            </Button>
          </ButtonGroup>
        </Form>
      </Dialog>
    </Overlay>
  );
};

export default ShortcutSettingsDialog; 