import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { ApiConfig, ModelScopeConfig } from '../types';
import MaterialIcon from './MaterialIcon';
import { getModelScopeModels } from '../utils/api';

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

const Title = styled.h2`
  margin: 0 0 18px 0;
  color: var(--color-text);
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
  font-size: 14px;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-inputBackground);
  font-size: 14px;
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
  font-size: 14px;
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

const Description = styled.p`
  color: var(--color-textSecondary);
  font-size: 13px;
  margin: 0 0 16px 0;
  line-height: 1.5;
  text-align: center;
  background: var(--color-surfaceLight);
  padding: 10px;
  border-radius: 8px;
  border-left: 4px solid var(--color-primary);
`;

const SectionDivider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-border), transparent);
  margin: 16px 0 14px 0;
  position: relative;

  &::after {
    content: '魔搭 AI 配置';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-surface);
    padding: 0 16px;
    font-size: 12px;
    color: var(--color-textSecondary);
    font-weight: 600;
  }
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  color: var(--color-text);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-inputBackground);
  font-size: 14px;
  color: var(--color-text);
  transition: all 0.3s ease;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--color-inputFocus);
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ModelScopeNote = styled.div`
  background: rgba(52, 152, 219, 0.1);
  border: 1px solid var(--color-info);
  border-radius: 8px;
  padding: 8px;
  margin-top: 8px;
  font-size: 11px;
  color: var(--color-text);
  line-height: 1.3;

  strong {
    color: var(--color-info);
  }

  a {
    color: var(--color-info);
    text-decoration: none;
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const LoadModelsButton = styled.button`
  padding: 8px 16px;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  font-size: 13px;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingIndicator = styled.span`
  color: var(--color-textSecondary);
  font-size: 12px;
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
  // 确保初始表单数据有效，处理apiConfig可能为undefined或null的情况
  const [formData, setFormData] = useState<ApiConfig>({
    appId: apiConfig?.appId || '',
    appSecret: apiConfig?.appSecret || '',
    modelScope: {
      apiKey: apiConfig?.modelScope?.apiKey || '',
      enabled: apiConfig?.modelScope?.enabled || false,
      model: apiConfig?.modelScope?.model || 'Qwen/Qwen2.5-7B-Instruct'
    }
  });
  
  console.log('初始化ApiSettingsDialog，apiConfig:', apiConfig);
  console.log('初始化的formData:', formData);
  
  const [isDragging, setIsDragging] = useState(false);
  const [availableModels, setAvailableModels] = useState<Array<{id: string, name: string}>>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelLoadError, setModelLoadError] = useState<string | null>(null);
  
  // 加载可用模型列表
  const handleLoadModels = async () => {
    const apiKey = formData.modelScope?.apiKey;
    if (!apiKey) {
      alert('请先输入API Key');
      return;
    }

    setIsLoadingModels(true);
    setModelLoadError(null);
    
    try {
      const models = await getModelScopeModels(apiKey);
      setAvailableModels(models);
      console.log('加载的模型列表:', models);
    } catch (error) {
      console.error('加载模型列表失败:', error);
      setModelLoadError(error instanceof Error ? error.message : '加载模型列表失败');
      alert(`加载模型列表失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoadingModels(false);
    }
  };
  
  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('提交表单数据:', formData);
    
    // 确保表单数据有效
    const validFormData = {
      appId: formData.appId || '',
      appSecret: formData.appSecret || '',
      modelScope: {
        apiKey: formData.modelScope?.apiKey || '',
        enabled: formData.modelScope?.enabled || false,
        model: formData.modelScope?.model || 'Qwen/Qwen2.5-7B-Instruct'
      }
    };
    
    console.log('处理后的表单数据:', validFormData);
    onSave(validFormData);
  };

  // 处理输入框变化
  const handleChange = (field: keyof ApiConfig, value: string) => {
    console.log(`输入框变化: ${field} = ${value}`);
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      console.log('新的表单数据:', newData);
      return newData;
    });
  };

  // 处理魔搭配置变化
  const handleModelScopeChange = (field: keyof ModelScopeConfig, value: string | boolean) => {
    console.log(`魔搭配置变化: ${field} = ${value}`);
    setFormData(prev => {
      const currentModelScope = prev.modelScope || { apiKey: '', enabled: false, model: 'Qwen/Qwen2.5-7B-Instruct' };
      const newData = {
        ...prev,
        modelScope: {
          ...currentModelScope,
          [field]: value
        }
      };
      console.log('新的表单数据:', newData);
      return newData;
    });
  };

  // 处理遮罩层点击
  const handleOverlayClick = (e: React.MouseEvent) => {
    // 只有当不在拖动状态下，且点击的是遮罩层本身时才关闭
    if (e.target === e.currentTarget && !isDragging) {
      onClose();
    }
  };

  // 阻止对话框上的点击事件冒泡
  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  // 监听全局鼠标按下事件
  const handleMouseDown = () => {
    setIsDragging(false);
  };
  
  // 监听全局鼠标移动事件
  const handleMouseMove = () => {
    // 如果鼠标按下并移动，标记为拖动状态
    if (isDragging === false) {
      setIsDragging(true);
    }
  };
  
  // 监听全局鼠标释放事件
  const handleMouseUp = () => {
    // 延迟重置拖动状态，确保点击事件处理完成
    setTimeout(() => {
      setIsDragging(false);
    }, 10);
  };

  // 清除API配置
  const handleClearConfig = async () => {
    if (window.confirm('确定要清除所有API配置吗？清除后需要重新设置才能使用相关功能。')) {
      try {
        // 清空表单数据
        setFormData({
          appId: '',
          appSecret: '',
          modelScope: {
            apiKey: '',
            enabled: false,
            model: 'Qwen/Qwen2.5-7B-Instruct'
          }
        });
        
        // 保存空的API配置，这会触发父组件的handleSaveApiSettings函数
        // 该函数会自动检测到是清空操作并调用clearApiConfig
        onSave({
          appId: '',
          appSecret: '',
          modelScope: {
            apiKey: '',
            enabled: false,
            model: 'Qwen/Qwen2.5-7B-Instruct'
          }
        });
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
              onChange={(e) => {
                console.log('APP ID 输入事件:', e.target.value);
                handleChange('appId', e.target.value);
              }}
              placeholder="请输入APP ID"
              autoComplete="off"
            />
          </FormGroup>

          <FormGroup>
            <Label>APP Secret</Label>
            <Input
              type="password"
              value={formData.appSecret || ''}
              onChange={(e) => {
                console.log('APP Secret 输入事件:', e.target.value);
                handleChange('appSecret', e.target.value);
              }}
              placeholder="请输入APP Secret"
              autoComplete="off"
            />
          </FormGroup>

          <SectionDivider />

          <FormGroup>
            <CheckboxWrapper>
              <Checkbox
                id="modelscope-enabled"
                type="checkbox"
                checked={formData.modelScope?.enabled || false}
                onChange={(e) => {
                  handleModelScopeChange('enabled', e.target.checked);
                }}
              />
              <CheckboxLabel htmlFor="modelscope-enabled">
                启用魔搭 AI 公式解释功能
              </CheckboxLabel>
            </CheckboxWrapper>
          </FormGroup>

          <FormGroup>
            <Label>魔搭 API Key</Label>
            <Input
              type="password"
              value={formData.modelScope?.apiKey || ''}
              onChange={(e) => {
                handleModelScopeChange('apiKey', e.target.value);
              }}
              placeholder="请输入魔搭 API Key"
              autoComplete="off"
              disabled={!formData.modelScope?.enabled}
              style={{ 
                opacity: formData.modelScope?.enabled ? 1 : 0.5,
                cursor: formData.modelScope?.enabled ? 'text' : 'not-allowed'
              }}
            />
          </FormGroup>

          <FormGroup>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <Label style={{ marginBottom: 0 }}>选择模型</Label>
              <LoadModelsButton
                type="button"
                onClick={handleLoadModels}
                disabled={!formData.modelScope?.enabled || !formData.modelScope?.apiKey || isLoadingModels}
              >
                <MaterialIcon name={isLoadingModels ? "hourglass_empty" : "refresh"} size={16} />
                {isLoadingModels ? '加载中...' : '从API加载'}
              </LoadModelsButton>
            </div>
            <Select
              value={formData.modelScope?.model || ''}
              onChange={(e) => {
                handleModelScopeChange('model', e.target.value);
              }}
              disabled={!formData.modelScope?.enabled}
              style={{ 
                opacity: formData.modelScope?.enabled ? 1 : 0.5,
                cursor: formData.modelScope?.enabled ? 'pointer' : 'not-allowed'
              }}
            >
              <option value="">请先加载模型列表</option>
              {availableModels.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </Select>
            {isLoadingModels && (
              <LoadingIndicator>
                <MaterialIcon name="hourglass_empty" size={14} /> 正在从魔搭API加载模型列表...
              </LoadingIndicator>
            )}
            {modelLoadError && (
              <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '8px' }}>
                错误: {modelLoadError}
              </div>
            )}
          </FormGroup>

          <FormGroup>
            <ModelScopeNote>
              <strong>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <MaterialIcon name="edit_note" size={14} /> 获取 API Key 说明：
                </span>
              </strong><br/>
              1. 访问 <a href="https://dashscope.console.aliyun.com" target="_blank" rel="noopener noreferrer">阿里云百炼控制台</a> 注册账号<br/>
              2. 创建 API Key<br/>
              3. 将 API Key 填入上方输入框<br/>
              4. 选择合适的模型并启用功能即可使用 AI 解释数学公式<br/>
              <strong>提示：</strong>推荐使用 Qwen2-7B-Instruct 或更高版本以获得更好的效果
            </ModelScopeNote>
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