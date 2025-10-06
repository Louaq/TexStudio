import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ApiConfig, SidebarConfig, SidebarItem } from '../types';
import MaterialIcon from '../components/MaterialIcon';
import { themes, getTheme, saveCustomTheme, Theme } from '../theme/themes';
import { DataConfirmDialog, DataAlertDialog } from '../components/DataDialog';
import { getDefaultSidebarConfig } from '../components/Sidebar';

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
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
      `;
    } else {
      return `
        background: var(--color-border);
        color: var(--color-text);

        &:hover {
          background: var(--color-borderLight);
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
    box-shadow: 0 3px 10px rgba(74, 144, 226, 0.25);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CustomThemeEditor = styled.div`
  margin-top: 24px;
  padding: 24px;
  border: 2px solid var(--color-primary);
  border-radius: 12px;
  background: color-mix(in srgb, var(--color-primary) 3%, var(--color-surface));
`;

const CustomThemeTitle = styled.h3`
  margin: 0 0 20px 0;
  color: var(--color-text);
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const ColorItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ColorLabel = styled.label`
  display: block;
  color: var(--color-text);
  font-weight: 600;
  font-size: 12px;
`;

const ColorInputWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ColorInput = styled.input`
  width: 50px;
  height: 36px;
  border: 2px solid var(--color-border);
  border-radius: 6px;
  cursor: pointer;
  padding: 2px;
  
  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  
  &::-webkit-color-swatch {
    border: none;
    border-radius: 4px;
  }
`;

const ColorTextInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 2px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  font-size: 12px;
  color: var(--color-text);
  font-family: "Cascadia Code", "Consolas", monospace;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 10%, transparent);
  }
`;

const DataRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }
`;

const DataLabel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DataTitle = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
`;

const DataDescription = styled.span`
  font-size: 12px;
  color: var(--color-textSecondary);
  max-width: 500px;
`;

const DataPath = styled.span`
  font-size: 12px;
  color: var(--color-textSecondary);
  font-family: "Cascadia Code", "Consolas", monospace;
  word-break: break-all;
`;

const DataActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const SmallButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  border: 1px solid;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
          &:hover {
            opacity: 0.9;
          }
        `;
      case 'danger':
        return `
          background: var(--color-error);
          color: white;
          border-color: var(--color-error);
          &:hover {
            opacity: 0.9;
          }
        `;
      default:
        return `
          background: var(--color-surface);
          color: var(--color-text);
          border-color: var(--color-border);
          &:hover {
            background: color-mix(in srgb, var(--color-text) 5%, var(--color-surface));
          }
        `;
    }
  }}

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
  cursor: pointer;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--color-border);
    border-radius: 26px;
    transition: all 0.3s ease;

    &:before {
      content: '';
      position: absolute;
      height: 20px;
      width: 20px;
      left: 3px;
      bottom: 3px;
      background: white;
      border-radius: 50%;
      transition: all 0.3s ease;
    }
  }

  input:checked + span {
    background: var(--color-primary);
  }

  input:checked + span:before {
    transform: translateX(22px);
  }
`;

const SidebarItemCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #fafbfc;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f3f5;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

const SidebarItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
`;

const SidebarItemIcon = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: white;
  border-radius: 8px;
`;

const SidebarItemText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SidebarItemName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
`;

const SidebarItemId = styled.span`
  font-size: 12px;
  color: var(--color-textSecondary);
  font-family: "Cascadia Code", "Consolas", monospace;
`;

const SidebarItemControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const OrderButton = styled.button`
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: white;
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const SidebarList = styled.div`
  display: flex;
  flex-direction: column;
`;

interface SettingsViewProps {
  apiConfig: ApiConfig;
  shortcuts: { capture: string; upload: string };
  currentTheme?: string;
  sidebarConfig?: SidebarConfig;
  onSaveApi: (config: ApiConfig) => void;
  onSaveShortcuts: (shortcuts: { capture: string; upload: string }) => void;
  onThemeChange?: (themeId: string) => void;
  onCheckForUpdates?: () => void;
  onSaveSidebarConfig?: (config: SidebarConfig) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  apiConfig,
  shortcuts,
  currentTheme = 'green',
  sidebarConfig,
  onSaveApi,
  onSaveShortcuts,
  onThemeChange,
  onCheckForUpdates,
  onSaveSidebarConfig
}) => {
  const [apiFormData, setApiFormData] = useState<ApiConfig>(apiConfig);
  const [shortcutFormData, setShortcutFormData] = useState(shortcuts);
  const [listeningFor, setListeningFor] = useState<'capture' | 'upload' | null>(null);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [customTheme, setCustomTheme] = useState<Theme>(getTheme('custom'));
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>(
    sidebarConfig?.items || getDefaultSidebarConfig().items
  );
  
  // 数据设置相关状态
  const [simpleBackup, setSimpleBackup] = useState(false);
  const [dataPath, setDataPath] = useState('');
  const [logPath, setLogPath] = useState('');
  const [cacheSize, setCacheSize] = useState('0MB');
  
  // 对话框状态
  const [dialogState, setDialogState] = useState<{
    type: 'alert' | 'confirm' | null;
    title: string;
    message: string | React.ReactNode;
    dialogType?: 'info' | 'warning' | 'error' | 'success';
    isDanger?: boolean;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({
    type: null,
    title: '',
    message: ''
  });

  // 当切换到自定义主题时加载
  useEffect(() => {
    if (currentTheme === 'custom') {
      setCustomTheme(getTheme('custom'));
    }
  }, [currentTheme]);

  // 当外部配置变化时更新内部状态
  useEffect(() => {
    if (sidebarConfig?.items) {
      setSidebarItems(sidebarConfig.items);
    }
  }, [sidebarConfig]);

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

  // 自定义主题相关函数
  const handleCustomColorChange = (colorKey: string, value: string) => {
    setCustomTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value
      }
    }));
  };

  const handleSaveCustomTheme = () => {
    saveCustomTheme(customTheme);
    if (onThemeChange) {
      onThemeChange('custom');
    }
  };

  const handleResetCustomTheme = () => {
    const greenTheme = themes.find(t => t.id === 'green') || themes[0];
    const defaultTheme = {
      id: 'custom',
      name: '自定义主题',
      colors: { ...greenTheme.colors }
    };
    setCustomTheme(defaultTheme);
    saveCustomTheme(defaultTheme);
    if (onThemeChange) {
      onThemeChange('custom');
    }
  };

  // 对话框辅助函数
  const showAlert = (
    title: string,
    message: string | React.ReactNode,
    type: 'info' | 'warning' | 'error' | 'success' = 'info'
  ) => {
    return new Promise<void>((resolve) => {
      setDialogState({
        type: 'alert',
        title,
        message,
        dialogType: type,
        onConfirm: () => {
          setDialogState({ type: null, title: '', message: '' });
          resolve();
        }
      });
    });
  };

  const showConfirm = (
    title: string,
    message: string | React.ReactNode,
    type: 'info' | 'warning' | 'error' = 'info',
    isDanger: boolean = false
  ) => {
    return new Promise<boolean>((resolve) => {
      const handleConfirm = () => {
        setDialogState({ type: null, title: '', message: '' });
        resolve(true);
      };
      
      const handleCancel = () => {
        setDialogState({ type: null, title: '', message: '' });
        resolve(false);
      };
      
      setDialogState({
        type: 'confirm',
        title,
        message,
        dialogType: type,
        isDanger,
        onConfirm: handleConfirm,
        onCancel: handleCancel
      });
    });
  };

  const closeDialog = () => {
    setDialogState({ type: null, title: '', message: '' });
  };

  // 数据设置相关函数
  useEffect(() => {
    // 加载数据路径和缓存大小
    const loadDataInfo = async () => {
      if (window.electronAPI) {
        try {
          const paths = await window.electronAPI.getDataPaths();
          setDataPath(paths.dataPath);
          setLogPath(paths.logPath);
          
          const cache = await window.electronAPI.getCacheSize();
          setCacheSize(cache.size);
        } catch (error) {
          console.error('加载数据信息失败:', error);
        }
      }
    };
    loadDataInfo();
  }, []);

  const handleBackupData = async () => {
    if (!window.electronAPI) return;
    try {
      const result = await window.electronAPI.backupData(simpleBackup);
      if (result.success) {
        await showAlert(
          '备份成功',
          <>
            数据备份成功！<br />
            <strong>保存位置：</strong><br />
            {result.filePath}
          </>,
          'success'
        );
      } else {
        await showAlert('备份失败', `数据备份失败：${result.message}`, 'error');
      }
    } catch (error) {
      console.error('备份数据失败:', error);
      await showAlert('备份失败', '备份数据时发生错误', 'error');
    }
  };

  const handleRestoreData = async () => {
    if (!window.electronAPI) return;
    
    const confirmed = await showConfirm(
      '恢复数据',
      '恢复数据将覆盖当前所有设置和历史记录，是否继续？',
      'warning',
      false
    );
    if (!confirmed) return;
    
    try {
      const result = await window.electronAPI.restoreData();
      if (result.success) {
        await showAlert(
          '恢复成功',
          '数据恢复成功！应用将重启以加载新数据。',
          'success'
        );
        window.electronAPI.restartApp();
      } else {
        await showAlert('恢复失败', `数据恢复失败：${result.message}`, 'error');
      }
    } catch (error) {
      console.error('恢复数据失败:', error);
      await showAlert('恢复失败', '恢复数据时发生错误', 'error');
    }
  };

  const handleOpenDataFolder = async () => {
    if (!window.electronAPI) return;
    try {
      await window.electronAPI.openDataFolder();
    } catch (error) {
      console.error('打开数据文件夹失败:', error);
    }
  };

  const handleOpenLogFolder = async () => {
    if (!window.electronAPI) return;
    try {
      await window.electronAPI.openLogFolder();
    } catch (error) {
      console.error('打开日志文件夹失败:', error);
    }
  };

  const handleClearKnowledge = async () => {
    if (!window.electronAPI) return;
    
    const confirmed = await showConfirm(
      '删除知识库文件',
      '确定要删除所有知识库文件吗？此操作不可恢复。',
      'warning',
      true
    );
    if (!confirmed) return;
    
    try {
      const result = await window.electronAPI.clearKnowledge();
      if (result.success) {
        await showAlert(
          '删除成功',
          `已删除 ${result.count} 个知识库文件`,
          'success'
        );
      } else {
        await showAlert('删除失败', `删除失败：${result.message}`, 'error');
      }
    } catch (error) {
      console.error('删除知识库文件失败:', error);
      await showAlert('删除失败', '删除知识库文件时发生错误', 'error');
    }
  };

  const handleClearCache = async () => {
    if (!window.electronAPI) return;
    
    const confirmed = await showConfirm(
      '清除缓存',
      '确定要清除所有缓存吗？',
      'info',
      false
    );
    if (!confirmed) return;
    
    try {
      const result = await window.electronAPI.clearCache();
      if (result.success) {
        setCacheSize('0MB');
        await showAlert(
          '清除成功',
          `已清除 ${result.size} 的缓存`,
          'success'
        );
      } else {
        await showAlert('清除失败', `清除缓存失败：${result.message}`, 'error');
      }
    } catch (error) {
      console.error('清除缓存失败:', error);
      await showAlert('清除失败', '清除缓存时发生错误', 'error');
    }
  };

  const handleResetData = async () => {
    if (!window.electronAPI) return;
    
    const confirmed = await showConfirm(
      '⚠️ 重置数据警告',
      <>
        <strong>警告：</strong>重置数据将删除所有设置、历史记录和缓存文件，恢复到初始状态。<br /><br />
        <strong style={{ color: 'var(--color-error)' }}>此操作不可恢复！</strong><br /><br />
        确定要继续吗？
      </>,
      'error',
      true
    );
    if (!confirmed) return;
    
    const doubleCheck = await showConfirm(
      '⚠️ 再次确认',
      '您真的要重置所有数据吗？这是最后一次确认机会。',
      'error',
      true
    );
    if (!doubleCheck) return;
    
    try {
      const result = await window.electronAPI.resetAllData();
      if (result.success) {
        await showAlert(
          '重置成功',
          '数据已重置，应用将重启。',
          'success'
        );
        window.electronAPI.restartApp();
      } else {
        await showAlert('重置失败', `重置数据失败：${result.message}`, 'error');
      }
    } catch (error) {
      console.error('重置数据失败:', error);
      await showAlert('重置失败', '重置数据时发生错误', 'error');
    }
  };

  // 侧边栏配置相关函数
  const handleToggleVisibility = (id: string) => {
    setSidebarItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, visible: !item.visible } : item
      )
    );
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setSidebarItems(prev => {
      const newItems = [...prev];
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      // 重新计算 order
      return newItems.map((item, idx) => ({ ...item, order: idx }));
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === sidebarItems.length - 1) return;
    setSidebarItems(prev => {
      const newItems = [...prev];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      // 重新计算 order
      return newItems.map((item, idx) => ({ ...item, order: idx }));
    });
  };

  const handleSaveSidebar = () => {
    if (onSaveSidebarConfig) {
      onSaveSidebarConfig({ items: sidebarItems });
      showAlert('保存成功', '侧边栏配置已保存', 'success');
    }
  };

  const handleResetSidebar = () => {
    const defaultConfig = getDefaultSidebarConfig();
    setSidebarItems(defaultConfig.items);
    if (onSaveSidebarConfig) {
      onSaveSidebarConfig(defaultConfig);
    }
    showAlert('重置成功', '侧边栏配置已恢复默认', 'success');
  };

  // 颜色标签的中文名称
  const colorLabels: Record<string, string> = {
    primary: '主色调',
    primaryLight: '主色调（亮）',
    primaryDark: '主色调（暗）',
    background: '背景色',
    backgroundPattern: '背景图案',
    surface: '表面颜色',
    surfaceLight: '表面颜色（亮）',
    text: '文字颜色',
    textSecondary: '次要文字',
    border: '边框颜色',
    borderLight: '边框颜色（亮）',
    buttonGradientStart: '按钮渐变（起）',
    buttonGradientEnd: '按钮渐变（终）',
    buttonHoverStart: '按钮悬停（起）',
    buttonHoverEnd: '按钮悬停（终）',
    inputBackground: '输入框背景',
    inputBorder: '输入框边框',
    inputFocus: '输入框焦点',
    success: '成功色',
    error: '错误色',
    warning: '警告色',
    info: '信息色',
    menuBackground: '菜单背景',
    menuBorder: '菜单边框',
    menuHover: '菜单悬停',
    dialogBackground: '对话框背景',
    dialogOverlay: '对话框遮罩'
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
              选择您喜欢的主题颜色，应用会立即切换到新主题。您也可以选择"自定义主题"来创建专属配色。
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
              
              {/* 自定义主题卡片 */}
              <ThemeCard
                $isActive={currentTheme === 'custom'}
                onClick={() => onThemeChange && onThemeChange('custom')}
              >
                {currentTheme === 'custom' && (
                  <ActiveBadge>
                    <MaterialIcon name="check" size={16} style={{ color: 'white' }} />
                  </ActiveBadge>
                )}
                <ThemeColorPreview $color={customTheme.colors.primary} />
                <ThemeName>
                  <MaterialIcon name="tune" size={16} /> 自定义主题
                </ThemeName>
              </ThemeCard>
            </ThemeGrid>

            {/* 自定义主题编辑器 */}
            {currentTheme === 'custom' && (
              <CustomThemeEditor>
                <CustomThemeTitle>
                  <MaterialIcon name="color_lens" size={20} />
                  自定义主题编辑器
                </CustomThemeTitle>
                
                <InfoNote style={{ marginBottom: '20px' }}>
                  💡 提示：修改颜色后点击"应用"按钮即可实时预览效果。支持 HEX 颜色代码和渐变。
                </InfoNote>

                <ColorGrid>
                  {Object.entries(customTheme.colors).map(([key, value]) => {
                    // 检查是否是渐变或其他复杂值
                    const isSimpleColor = /^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$|^rgba?\(/.test(value);
                    const displayValue = isSimpleColor ? value : value.split(',')[0].split('(')[1] || '#4a90e2';
                    
                    return (
                      <ColorItem key={key}>
                        <ColorLabel>{colorLabels[key] || key}</ColorLabel>
                        <ColorInputWrapper>
                          {isSimpleColor && (
                            <ColorInput
                              type="color"
                              value={value.startsWith('#') ? value : '#4a90e2'}
                              onChange={(e) => handleCustomColorChange(key, e.target.value)}
                            />
                          )}
                          <ColorTextInput
                            type="text"
                            value={value}
                            onChange={(e) => handleCustomColorChange(key, e.target.value)}
                            placeholder="#000000"
                          />
                        </ColorInputWrapper>
                      </ColorItem>
                    );
                  })}
                </ColorGrid>

                <ButtonGroup>
                  <Button variant="tertiary" onClick={handleResetCustomTheme}>
                    重置
                  </Button>
                  <Button variant="primary" onClick={handleSaveCustomTheme}>
                    应用
                  </Button>
                </ButtonGroup>
              </CustomThemeEditor>
            )}

            <InfoNote style={{ marginTop: '24px' }}>
              <strong>提示</strong><br/>
              主题设置会自动保存，下次启动应用时会应用您选择的主题。自定义主题的配色也会被保存。
            </InfoNote>
        </Section>

        {/* 侧边栏配置 */}
        <Section>
          <SectionTitle>
            <MaterialIcon name="view_sidebar" size={22} />
            侧边栏配置
          </SectionTitle>

          <InfoNote style={{ marginBottom: '24px' }}>
            可以调整侧边栏选项的显示顺序和可见性。使用上下箭头调整顺序，使用开关控制显示/隐藏。
          </InfoNote>

          <SidebarList>
            {sidebarItems.map((item, index) => (
              <SidebarItemCard key={item.id}>
                <SidebarItemInfo>
                  <SidebarItemIcon>
                    <MaterialIcon name={item.icon} size={20} />
                  </SidebarItemIcon>
                  <SidebarItemText>
                    <SidebarItemName>{item.label}</SidebarItemName>
                    <SidebarItemId>{item.id}</SidebarItemId>
                  </SidebarItemText>
                </SidebarItemInfo>
                
                <SidebarItemControls>
                  <OrderButton
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    title="上移"
                  >
                    <MaterialIcon name="arrow_upward" size={18} />
                  </OrderButton>
                  <OrderButton
                    onClick={() => handleMoveDown(index)}
                    disabled={index === sidebarItems.length - 1}
                    title="下移"
                  >
                    <MaterialIcon name="arrow_downward" size={18} />
                  </OrderButton>
                  <Toggle>
                    <input
                      type="checkbox"
                      checked={item.visible}
                      onChange={() => handleToggleVisibility(item.id)}
                    />
                    <span></span>
                  </Toggle>
                </SidebarItemControls>
              </SidebarItemCard>
            ))}
          </SidebarList>

          <ButtonGroup>
            <Button variant="tertiary" onClick={handleResetSidebar}>
              重置
            </Button>
            <Button variant="primary" onClick={handleSaveSidebar}>
              保存
            </Button>
          </ButtonGroup>

          <InfoNote style={{ marginTop: '16px' }}>
            <strong>注意</strong><br/>
            隐藏的选项将不会在侧边栏中显示。至少保留一个可见的选项以便访问应用功能。
          </InfoNote>
        </Section>

        {/* 数据设置 */}
        <Section>
          <SectionTitle>
            <MaterialIcon name="storage" size={22} />
            数据设置
          </SectionTitle>

          <DataRow>
            <DataLabel>
              <DataTitle>数据备份与恢复</DataTitle>
            </DataLabel>
            <DataActions>
              <SmallButton onClick={handleBackupData}>
                <MaterialIcon name="save" size={16} />
                备份
              </SmallButton>
              <SmallButton onClick={handleRestoreData}>
                <MaterialIcon name="restore" size={16} />
                恢复
              </SmallButton>
            </DataActions>
          </DataRow>

          <DataRow>
            <DataLabel>
              <DataTitle>精简备份</DataTitle>
              <DataDescription>
                备份时跳过备份图片等数据文件，减少空间占用，加快备份速度
              </DataDescription>
            </DataLabel>
            <DataActions>
              <Toggle>
                <input
                  type="checkbox"
                  checked={simpleBackup}
                  onChange={(e) => setSimpleBackup(e.target.checked)}
                />
                <span></span>
              </Toggle>
            </DataActions>
          </DataRow>
        </Section>

        {/* 数据目录 */}
        <Section>
          <SectionTitle>
            <MaterialIcon name="folder" size={22} />
            数据目录
          </SectionTitle>

          <DataRow>
            <DataLabel>
              <DataTitle>应用数据</DataTitle>
              <DataPath>{dataPath || '加载中...'}</DataPath>
            </DataLabel>
            <DataActions>
              <SmallButton onClick={handleOpenDataFolder}>
                <MaterialIcon name="folder_open" size={16} />
                打开目录
              </SmallButton>
            </DataActions>
          </DataRow>

          <DataRow>
            <DataLabel>
              <DataTitle>应用日志</DataTitle>
              <DataPath>{logPath || '加载中...'}</DataPath>
            </DataLabel>
            <DataActions>
              <SmallButton onClick={handleOpenLogFolder}>
                <MaterialIcon name="description" size={16} />
                打开日志
              </SmallButton>
            </DataActions>
          </DataRow>

          <DataRow>
            <DataLabel>
              <DataTitle>清除缓存</DataTitle>
              <DataDescription>{cacheSize}</DataDescription>
            </DataLabel>
            <DataActions>
              <SmallButton onClick={handleClearCache}>
                <MaterialIcon name="cleaning_services" size={16} />
                清除缓存
              </SmallButton>
            </DataActions>
          </DataRow>

          <DataRow>
            <DataLabel>
              <DataTitle>重置数据</DataTitle>
            </DataLabel>
            <DataActions>
              <SmallButton $variant="danger" onClick={handleResetData}>
                <MaterialIcon name="restore_page" size={16} />
                重置数据
              </SmallButton>
            </DataActions>
          </DataRow>

          <InfoNote style={{ marginTop: '16px' }}>
            <strong>注意</strong><br/>
            重置数据将删除所有应用数据，包括设置、历史记录和缓存文件。此操作不可恢复，请谨慎使用。
          </InfoNote>
        </Section>
      </Content>

      {/* 对话框 */}
      {dialogState.type === 'confirm' && (
        <DataConfirmDialog
          isOpen={true}
          title={dialogState.title}
          message={dialogState.message}
          type={dialogState.dialogType}
          isDanger={dialogState.isDanger}
          confirmText={dialogState.confirmText}
          cancelText={dialogState.cancelText}
          onConfirm={() => dialogState.onConfirm?.()}
          onCancel={() => dialogState.onCancel?.()}
        />
      )}

      {dialogState.type === 'alert' && (
        <DataAlertDialog
          isOpen={true}
          title={dialogState.title}
          message={dialogState.message}
          type={dialogState.dialogType}
          confirmText={dialogState.confirmText}
          onConfirm={() => dialogState.onConfirm?.()}
        />
      )}
    </SettingsContainer>
  );
};

export default SettingsView;
