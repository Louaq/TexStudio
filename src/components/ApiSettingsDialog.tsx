import React, { useState } from 'react';
import styled from 'styled-components';
import { ApiConfig } from '../types';
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
  background: var(--color-surface);
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--color-border);
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

const Title = styled.h2`
  margin: 0 0 18px 0;
  color: var(--color-text);
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
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: var(--color-text);
  font-weight: 600;
  font-size: 15px;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-inputBackground);
  font-size: 15px;
  color: var(--color-text);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--color-inputFocus);
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  }

  &::placeholder {
    color: var(--color-textSecondary);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;

  ${props => {
    if (props.variant === 'primary') {
      return `
        background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
        color: white;

        &:hover {
          background: linear-gradient(135deg, #5ba0f2 0%, #458bcd 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
        }
      `;
    } else if (props.variant === 'danger') {
      return `
        background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
        color: white;

        &:hover {
          background: linear-gradient(135deg, #f75c4c 0%, #d04a3b 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
        }
      `;
    } else {
      return `
        background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
        color: white;

        &:hover {
          background: linear-gradient(135deg, #a4b3b6 0%, #8e9b9d 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(127, 140, 141, 0.2);
        }
      `;
    }
  }}

  &:active {
    transform: translateY(0);
  }
`;

interface ApiSettingsDialogProps {
  apiConfig: ApiConfig;
  onSave: (config: ApiConfig) => void;
  onClose: () => void;
}

const ApiSettingsDialog: React.FC<ApiSettingsDialogProps> = ({
  apiConfig,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<ApiConfig>({
    appId: apiConfig?.appId || '',
    appSecret: apiConfig?.appSecret || '',
  });
  
  const [isDragging, setIsDragging] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validFormData = {
      appId: formData.appId || '',
      appSecret: formData.appSecret || '',
    };
    onSave(validFormData);
  };

  const handleChange = (field: keyof ApiConfig, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDragging) {
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

  const handleClearConfig = async () => {
    if (window.confirm('确定要清除所有API配置吗？清除后需要重新设置才能使用相关功能。')) {
      try {
        setFormData({ appId: '', appSecret: '' });
        onSave({ appId: '', appSecret: '' });
      } catch (error) {
        console.error('清除API配置失败:', error);
        alert('清除API配置失败');
      }
    }
  };

  return (
    <Overlay 
      onClick={handleOverlayClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Dialog onClick={handleDialogClick}>
        <Title>
          <MaterialIcon name="vpn_key" size={20} /> API设置
        </Title>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>APP ID</Label>
            <Input
              type="text"
              value={formData.appId || ''}
              onChange={(e) => handleChange('appId', e.target.value)}
              placeholder="请输入APP ID"
              autoComplete="off"
            />
          </FormGroup>

          <FormGroup>
            <Label>APP Secret</Label>
            <Input
              type="password"
              value={formData.appSecret || ''}
              onChange={(e) => handleChange('appSecret', e.target.value)}
              placeholder="请输入APP Secret"
              autoComplete="off"
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

export default ApiSettingsDialog;
