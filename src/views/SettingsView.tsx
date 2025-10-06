import React, { useState } from 'react';
import styled from 'styled-components';
import { ApiConfig } from '../types';
import MaterialIcon from '../components/MaterialIcon';
import { themes } from '../theme/themes';

const SettingsContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-dialogBackground);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 24px 32px;
  border-bottom: 2px solid var(--color-border);
  background: var(--color-surface);
`;

const Title = styled.h1`
  margin: 0;
  color: var(--color-text);
  font-size: 22px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 48px 32px 32px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
  }
`;

const Section = styled.div`
  background: var(--color-surface);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h2`
  margin: 0 0 16px 0;
  color: var(--color-text);
  font-size: 17px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  color: var(--color-text);
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 14px;
  border: 2px solid var(--color-inputBorder);
  border-radius: 8px;
  background: var(--color-inputBackground);
  font-size: 13px;
  color: var(--color-text);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--color-inputFocus);
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  }

  &::placeholder {
    color: var(--color-textSecondary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--color-surface);
  }
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  color: var(--color-text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
`;

const InfoNote = styled.div`
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 10px;
  margin-top: 10px;
  font-size: 12px;
  color: var(--color-text);
  line-height: 1.5;

  strong {
    color: var(--color-primary);
    display: block;
    margin-bottom: 8px;
  }

  a {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: flex-end;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'tertiary' }>`
  padding: 5px 0;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 70px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;

  ${props => {
    if (props.variant === 'primary') {
      return `
        background: var(--color-buttonGradientStart);
        color: white;

        &:hover {
          background: var(--color-buttonHoverStart);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
      `;
    } else if (props.variant === 'tertiary') {
      return `
        background: var(--color-warning);
        color: white;

        &:hover {
          background: var(--color-warning);
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
      `;
    } else {
      return `
        background: var(--color-border);
        color: var(--color-text);

        &:hover {
          background: var(--color-borderLight);
          transform: translateY(-1px);
        }
      `;
    }
  }}

  &:active {
    transform: translateY(0);
  }
`;

const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const ThemeCard = styled.button<{ $isActive: boolean }>`
  padding: 20px 16px;
  border: 3px solid ${props => props.$isActive ? 'var(--color-primary)' : 'var(--color-border)'};
  border-radius: 12px;
  background: var(--color-surface);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  position: relative;

  &:hover {
    border-color: ${props => props.$isActive ? 'var(--color-primary)' : 'var(--color-borderLight)'};
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }

  ${props => props.$isActive && `
    background: rgba(0, 0, 0, 0.03);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  `}
`;

const ThemeColorPreview = styled.div<{ $color: string }>`
  width: 80px;
  height: 50px;
  border-radius: 10px;
  background: ${props => props.$color};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, transparent 30%, rgba(255, 255, 255, 0.2) 100%);
  }
`;

const ThemeName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  text-align: center;
`;

const ActiveBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.4);
`;

const ShortcutGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const ShortcutCard = styled.div`
  background: #fafbfc;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ShortcutLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2c3e50;
  font-size: 13px;
  font-weight: 600;
`;

const ShortcutButton = styled.button<{ $isListening?: boolean; $isSet?: boolean }>`
  padding: 10px 16px;
  border: 1.5px solid ${props => 
    props.$isListening ? '#e74c3c' : 
    props.$isSet ? '#27ae60' : '#d1d5db'
  };
  border-radius: 6px;
  background: ${props => 
    props.$isListening ? 'rgba(231, 76, 60, 0.08)' : 
    props.$isSet ? 'rgba(39, 174, 96, 0.08)' : 'white'
  };
  font-size: 12px;
  color: ${props => 
    props.$isListening ? '#e74c3c' : 
    props.$isSet ? '#27ae60' : '#2c3e50'
  };
  transition: all 0.2s ease;
  font-family: "Cascadia Code", "Consolas", monospace;
  cursor: pointer;
  min-height: 40px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  &:hover {
    background: ${props => 
      props.$isListening ? 'rgba(231, 76, 60, 0.12)' : 
      props.$isSet ? 'rgba(39, 174, 96, 0.12)' : 'rgba(74, 144, 226, 0.05)'
    };
    border-color: ${props => 
      props.$isListening ? '#e74c3c' : 
      props.$isSet ? '#27ae60' : '#4a90e2'
    };
  }

  ${props => props.$isListening && `
    animation: pulse 1.5s infinite;
    
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.4); }
      70% { box-shadow: 0 0 0 8px rgba(231, 76, 60, 0); }
      100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); }
    }
  `}
`;

const UpdateContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
`;

const UpdateCard = styled.div`
  background: #fafbfc;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const UpdateCardTitle = styled.h3`
  margin: 0;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 600;
`;

const UpdateCardText = styled.p`
  margin: 0;
  color: #6c757d;
  font-size: 12px;
  line-height: 1.6;
`;

const UpdateButton = styled.button`
  padding: 0;
  border: none;
  border-radius: 6px;
  background: #4a90e2;
  color: white;
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 40px;
  margin-top: 8px;

  &:hover {
    background: #5ba0f2;
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(74, 144, 226, 0.25);
  }

  &:active {
    transform: translateY(0);
  }
`;

interface SettingsViewProps {
  apiConfig: ApiConfig;
  shortcuts: { capture: string; upload: string };
  currentTheme?: string;
  onSaveApi: (config: ApiConfig) => void;
  onSaveShortcuts: (shortcuts: { capture: string; upload: string }) => void;
  onThemeChange?: (themeId: string) => void;
  onCheckForUpdates?: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  apiConfig,
  shortcuts,
  currentTheme = 'default',
  onSaveApi,
  onSaveShortcuts,
  onThemeChange,
  onCheckForUpdates
}) => {
  const [apiFormData, setApiFormData] = useState<ApiConfig>(apiConfig);
  const [shortcutFormData, setShortcutFormData] = useState(shortcuts);
  const [listeningFor, setListeningFor] = useState<'capture' | 'upload' | null>(null);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  // API设置相关函数
  const handleApiChange = (field: keyof ApiConfig, value: string) => {
    setApiFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDeepSeekChange = (field: string, value: string | boolean) => {
    setApiFormData(prev => ({
      ...prev,
      deepSeek: {
        apiKey: prev.deepSeek?.apiKey || '',
        enabled: prev.deepSeek?.enabled || false,
        [field]: value
      }
    }));
  };

  const handleSaveApi = () => {
    onSaveApi(apiFormData);
  };

  // 快捷键设置相关函数
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
            regularKeys.push(key);
          }
          break;
      }
    });

    return [...modifiers, ...regularKeys].join('+');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!listeningFor) return;
    e.preventDefault();
    e.stopPropagation();
    const key = e.key;
    setPressedKeys(prev => new Set([...Array.from(prev), key]));
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (!listeningFor) return;
    e.preventDefault();
    e.stopPropagation();

    if (!e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey && pressedKeys.size > 0) {
      const shortcut = formatShortcut(pressedKeys);
      
      if (shortcut && shortcut !== '' && pressedKeys.size > 1) {
        setShortcutFormData(prev => ({ ...prev, [listeningFor]: shortcut }));
        setListeningFor(null);
        setPressedKeys(new Set());
      }
    }
  };

  React.useEffect(() => {
    if (listeningFor) {
      document.addEventListener('keydown', handleKeyDown, true);
      document.addEventListener('keyup', handleKeyUp, true);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown, true);
        document.removeEventListener('keyup', handleKeyUp, true);
      };
    }
  }, [listeningFor, pressedKeys]);

  const startListening = (field: 'capture' | 'upload') => {
    setListeningFor(field);
    setPressedKeys(new Set());
  };

  const stopListening = () => {
    setListeningFor(null);
    setPressedKeys(new Set());
  };

  const handleResetShortcuts = () => {
    const defaultShortcuts = { capture: 'Alt+A', upload: 'Alt+S' };
    setShortcutFormData(defaultShortcuts);
    onSaveShortcuts(defaultShortcuts);
  };

  const handleSaveShortcuts = () => {
    if (shortcutFormData.capture && shortcutFormData.upload) {
      onSaveShortcuts(shortcutFormData);
    }
  };

  const getShortcutDisplay = (field: 'capture' | 'upload') => {
    if (listeningFor === field) {
      if (pressedKeys.size > 0) {
        return formatShortcut(pressedKeys);
      }
      return '按住快捷键...';
    }
    return shortcutFormData[field] || '点击设置快捷键';
  };

  return (
    <SettingsContainer>


      <Content>
        {/* API 设置 */}
        <Section>
            <SectionTitle>
              <MaterialIcon name="vpn_key" size={22} />
              API配置
            </SectionTitle>
            
            <FormGroup>
              <Label>APP ID</Label>
              <Input
                type="text"
                value={apiFormData.appId || ''}
                onChange={(e) => handleApiChange('appId', e.target.value)}
                placeholder="请输入APP ID"
                autoComplete="off"
              />
            </FormGroup>

            <FormGroup>
              <Label>APP Secret</Label>
              <Input
                type="password"
                value={apiFormData.appSecret || ''}
                onChange={(e) => handleApiChange('appSecret', e.target.value)}
                placeholder="请输入APP Secret"
                autoComplete="off"
              />
            </FormGroup>

            <hr style={{ border: 'none', borderTop: '1px solid #e1e8ed', margin: '24px 0' }} />

            <SectionTitle style={{ fontSize: '18px' }}>
              <MaterialIcon name="psychology" size={20} />
              DeepSeek AI 配置
            </SectionTitle>

            <FormGroup>
              <CheckboxWrapper>
                <Checkbox
                  id="deepseek-enabled"
                  type="checkbox"
                  checked={apiFormData.deepSeek?.enabled || false}
                  onChange={(e) => handleDeepSeekChange('enabled', e.target.checked)}
                />
                <CheckboxLabel htmlFor="deepseek-enabled">
                  启用 DeepSeek AI 公式解释功能
                </CheckboxLabel>
              </CheckboxWrapper>
            </FormGroup>

            <FormGroup>
              <Label>DeepSeek API Key</Label>
              <Input
                type="password"
                value={apiFormData.deepSeek?.apiKey || ''}
                onChange={(e) => handleDeepSeekChange('apiKey', e.target.value)}
                placeholder="请输入 DeepSeek API Key"
                autoComplete="off"
                disabled={!apiFormData.deepSeek?.enabled}
              />
              <InfoNote>
                <strong>
                  <MaterialIcon name="edit_note" size={16} /> 获取 API Key 说明：
                </strong>
                1. 访问 <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer">DeepSeek 官网</a> 注册账号<br/>
                2. 在控制台创建 API Key<br/>
                3. 将 API Key 填入上方输入框<br/>
                4. 启用功能后即可使用 AI 解释数学公式
              </InfoNote>
            </FormGroup>

            <ButtonGroup>
              <Button variant="primary" onClick={handleSaveApi}>
                保存
              </Button>
            </ButtonGroup>
        </Section>

        {/* 快捷键设置 */}
        <Section>
            <SectionTitle>
              <MaterialIcon name="keyboard" size={22} />
              快捷键设置
            </SectionTitle>
            
            <InfoNote style={{ marginBottom: '24px' }}>
              点击下方按钮，然后按住您想要设置的快捷键组合（不要设置为Alt+其他键）。
            </InfoNote>

            <ShortcutGrid>
              <ShortcutCard>
                <ShortcutLabel>
                  <MaterialIcon name="screenshot" size={20} />
                  <span>截图快捷键</span>
                </ShortcutLabel>
                <ShortcutButton
                  $isListening={listeningFor === 'capture'}
                  $isSet={!!shortcutFormData.capture}
                  onClick={() => listeningFor === 'capture' ? stopListening() : startListening('capture')}
                >
                  <div>
                    <div style={{ fontWeight: 500, fontSize: listeningFor === 'capture' ? '11px' : '13px' }}>
                      {getShortcutDisplay('capture')}
                    </div>
                    {listeningFor === 'capture' && (
                      <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px' }}>
                        松开按键即可保存
                      </div>
                    )}
                  </div>
                </ShortcutButton>
              </ShortcutCard>

              <ShortcutCard>
                <ShortcutLabel>
                  <MaterialIcon name="upload_file" size={20} />
                  <span>上传图片快捷键</span>
                </ShortcutLabel>
                <ShortcutButton
                  $isListening={listeningFor === 'upload'}
                  $isSet={!!shortcutFormData.upload}
                  onClick={() => listeningFor === 'upload' ? stopListening() : startListening('upload')}
                >
                  <div>
                    <div style={{ fontWeight: 500, fontSize: listeningFor === 'upload' ? '11px' : '13px' }}>
                      {getShortcutDisplay('upload')}
                    </div>
                    {listeningFor === 'upload' && (
                      <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px' }}>
                        松开按键即可保存
                      </div>
                    )}
                  </div>
                </ShortcutButton>
              </ShortcutCard>
            </ShortcutGrid>

            <ButtonGroup>
              <Button variant="secondary" onClick={handleResetShortcuts}>
                重置
              </Button>
              <Button variant="primary" onClick={handleSaveShortcuts}>
                保存
              </Button>
            </ButtonGroup>
        </Section>

        {/* 主题设置 */}
        <Section>
            <SectionTitle>
              <MaterialIcon name="palette" size={22} />
              主题颜色
            </SectionTitle>
            
            <InfoNote style={{ marginBottom: '24px' }}>
              选择您喜欢的主题颜色，应用会立即切换到新主题。
            </InfoNote>

            <ThemeGrid>
              {themes.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  $isActive={currentTheme === theme.id}
                  onClick={() => onThemeChange && onThemeChange(theme.id)}
                >
                  {currentTheme === theme.id && (
                    <ActiveBadge>
                      <MaterialIcon name="check" size={16} style={{ color: 'white' }} />
                    </ActiveBadge>
                  )}
                  <ThemeColorPreview $color={theme.colors.primary} />
                  <ThemeName>{theme.name}</ThemeName>
                </ThemeCard>
              ))}
            </ThemeGrid>

            <InfoNote style={{ marginTop: '24px' }}>
              <strong>提示</strong><br/>
              主题设置会自动保存，下次启动应用时会应用您选择的主题。
            </InfoNote>
        </Section>
      </Content>
    </SettingsContainer>
  );
};

export default SettingsView;
