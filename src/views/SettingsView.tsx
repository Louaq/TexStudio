import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ApiConfig, SidebarConfig, SidebarItem } from '../types';
import MaterialIcon from '../components/MaterialIcon';
import { DataConfirmDialog, DataAlertDialog } from '../components/DataDialog';
import { getDefaultSidebarConfig } from '../components/Sidebar';
import { glassCard, glassViewRoot } from '../theme/themes';

const SettingsContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  ${glassViewRoot}
  overflow: hidden;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px 28px;
  box-sizing: border-box;
  ${glassViewRoot}

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--color-text) 16%, transparent);
    border-radius: 6px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: color-mix(in srgb, var(--color-text) 26%, transparent);
  }
`;

const SettingsPanel = styled.div`
  border-radius: 10px;
  overflow: hidden;
  ${glassCard}
`;

const SettingsRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-borderLight);

  &:last-of-type {
    border-bottom: none;
  }
`;

const RowLabelCol = styled.div`
  flex: 0 0 34%;
  max-width: 240px;
  min-width: 112px;
  padding-top: 9px;
`;

const RowControlCol = styled.div`
  flex: 1;
  min-width: 0;
`;

const RowLabelText = styled.span`
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text);
  line-height: 1.4;
`;

const RowLabelWithIcon = styled(RowLabelText)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RowControlShortcut = styled(RowControlCol)`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 2px;
`;

const ShortcutsBlock = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;
  width: 100%;
`;

const ShortcutLine = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: nowrap;
  justify-content: flex-end;
  flex: 0 1 auto;
`;

const ShortcutLineLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
`;

const UnifiedSettingsFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  padding: 16px 18px;
  border-top: 1px solid var(--color-borderLight);
  background: color-mix(in srgb, var(--color-text) 1.5%, var(--color-surface));
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-inputBackground);
  font-size: 14px;
  color: var(--color-text);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--color-primary) 35%, transparent);
  }

  &::placeholder {
    color: var(--color-textSecondary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: color-mix(in srgb, var(--color-text) 4%, var(--color-surface));
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
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-inputBorder);
  border-radius: 8px;
  background: var(--color-inputBackground);
  font-size: 16px;
  color: var(--color-text);
  transition: all 0.3s ease;
  cursor: pointer;
  font-weight: 500;
  height: 44px;
  line-height: 20px;
  -webkit-appearance: menulist;
  appearance: menulist;

  &:focus {
    outline: none;
    border-color: var(--color-inputFocus);
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  option {
    font-size: 16px;
    padding: 8px;
    line-height: 1.5;
  }
`;

const LoadButton = styled.button`
  border: none;
  border-radius: 4px;
  background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
  font-size: 13px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #a4b3b6 0%, #8e9b9d 100%);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:active {
    transform: translateY(0);
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'tertiary' }>`
  padding: 6px 16px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  ${props => {
    if (props.variant === 'primary') {
      return `
        border: 1px solid color-mix(in srgb, var(--color-primary) 85%, black);
        background: var(--color-primary);
        color: var(--color-surface);

        &:hover {
          background: color-mix(in srgb, var(--color-primary) 88%, black);
        }
      `;
    } else if (props.variant === 'tertiary') {
      return `
        border: 1px solid color-mix(in srgb, var(--color-warning) 70%, var(--color-text));
        background: var(--color-warning);
        color: var(--color-surface);

        &:hover {
          filter: brightness(0.95);
        }
      `;
    } else {
      return `
        border: 1px solid var(--color-border);
        background: var(--color-surface);
        color: var(--color-text);

        &:hover {
          background: color-mix(in srgb, var(--color-text) 4%, var(--color-surface));
          border-color: var(--color-borderLight);
        }
      `;
    }
  }}

  &:active {
    transform: translateY(0);
  }
`;

const ShortcutButton = styled.button<{ $isListening?: boolean; $isSet?: boolean }>`
  padding: 8px 14px;
  border: 1px solid ${props =>
    props.$isListening || props.$isSet
      ? 'var(--color-primary)'
      : 'var(--color-borderLight)'};
  border-radius: 6px;
  background: ${props =>
    props.$isListening || props.$isSet
      ? 'color-mix(in srgb, var(--color-primary) 6%, var(--color-surface))'
      : 'var(--color-inputBackground)'};
  font-size: 13px;
  color: ${props =>
    props.$isListening || props.$isSet
      ? 'var(--color-primary)'
      : 'var(--color-text)'};
  transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
  font-family: "Cascadia Code", "Consolas", monospace;
  cursor: pointer;
  min-height: 36px;
  min-width: 168px;
  max-width: 100%;
  width: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  &:hover {
    background: ${props => 
      props.$isListening 
        ? 'color-mix(in srgb, var(--color-primary) 12%, var(--color-surface))' 
        : props.$isSet 
          ? 'color-mix(in srgb, var(--color-primary) 12%, var(--color-surface))' 
          : 'color-mix(in srgb, var(--color-primary) 6%, var(--color-surface))'
    };
    border-color: ${props => 
      props.$isListening ? 'var(--color-primary)' : 
      props.$isSet ? 'var(--color-primary)' : 'var(--color-primary)'
    };
  }

  ${props => props.$isListening && `
    animation: pulse 1.5s infinite;
    
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-primary) 40%, transparent); }
      70% { box-shadow: 0 0 0 8px color-mix(in srgb, var(--color-primary) 0%, transparent); }
      100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-primary) 0%, transparent); }
    }
  `}
`;

const UpdateContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  font-size: 15px;
  font-weight: 600;
`;

const UpdateCardText = styled.p`
  margin: 0;
  color: #6c757d;
  font-size: 13px;
  line-height: 1.6;
`;

const UpdateButton = styled.button`
  padding: 0;
  border: none;
  border-radius: 6px;
  background: #4a90e2;
  color: white;
  font-weight: 500;
  font-size: 14px;
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

const DataRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-borderLight);

  &:last-child {
    border-bottom: none;
  }
`;

const DataLabel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DataTitle = styled.span`
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text);
`;

const DataDescription = styled.span`
  font-size: 13px;
  color: var(--color-textSecondary);
  max-width: 500px;
`;

const DataPath = styled.span`
  font-size: 13px;
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
  font-size: 14px;
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
  width: 44px;
  height: 24px;
  flex-shrink: 0;
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
    background: color-mix(in srgb, var(--color-text) 14%, var(--color-surface));
    border-radius: 24px;
    transition: background 0.2s ease;

    &:before {
      content: '';
      position: absolute;
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background: var(--color-surface);
      border-radius: 50%;
      transition: transform 0.2s ease;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
    }
  }

  input:checked + span {
    background: var(--color-primary);
  }

  input:checked + span:before {
    transform: translateX(20px);
  }
`;

const SidebarSettingsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-borderLight);

  &:last-child {
    border-bottom: none;
  }
`;

const SidebarItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
`;

const SidebarItemIcon = styled.div`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--color-primary) 12%, var(--color-surface));
  color: var(--color-primary);
  border-radius: 6px;
  border: 1px solid var(--color-borderLight);
`;

const SidebarItemText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SidebarItemName = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
`;

const SidebarItemId = styled.span`
  font-size: 13px;
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
  border: 1px solid var(--color-borderLight);
  border-radius: 6px;
  background: var(--color-inputBackground);
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover:not(:disabled) {
    background: color-mix(in srgb, var(--color-text) 6%, var(--color-surface));
    border-color: var(--color-border);
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

interface SettingsViewProps {
  apiConfig: ApiConfig;
  shortcuts: { capture: string; upload: string };
  sidebarConfig?: SidebarConfig;
  minimizeToTray?: boolean;
  onSaveApi: (config: ApiConfig) => void;
  onSaveShortcuts: (shortcuts: { capture: string; upload: string }) => void;
  onCheckForUpdates?: () => void;
  onSaveSidebarConfig?: (config: SidebarConfig) => void;
  onSaveMinimizeToTray?: (minimizeToTray: boolean) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  apiConfig,
  shortcuts,
  sidebarConfig,
  minimizeToTray = true,
  onSaveApi,
  onSaveShortcuts,
  onCheckForUpdates,
  onSaveSidebarConfig,
  onSaveMinimizeToTray
}) => {
  const [apiFormData, setApiFormData] = useState<ApiConfig>(apiConfig);
  const [shortcutFormData, setShortcutFormData] = useState(shortcuts);
  const [listeningFor, setListeningFor] = useState<'capture' | 'upload' | null>(null);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>(
    sidebarConfig?.items || getDefaultSidebarConfig().items
  );
  const [minimizeToTrayState, setMinimizeToTrayState] = useState<boolean>(minimizeToTray);
  
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

  const handleSaveAll = () => {
    onSaveApi(apiFormData);

    const shortcutOk =
      !!shortcutFormData.capture?.trim() && !!shortcutFormData.upload?.trim();
    if (shortcutOk) {
      onSaveShortcuts(shortcutFormData);
    }

    if (onSaveSidebarConfig) {
      onSaveSidebarConfig({ items: sidebarItems });
    }

    if (onSaveMinimizeToTray) {
      onSaveMinimizeToTray(minimizeToTrayState);
    }

    void showAlert(
      shortcutOk ? '保存成功' : '已保存',
      shortcutOk
        ? '设置已保存'
        : '其余项已保存。请为截图与上传设置完整快捷键后再次点击保存。',
      shortcutOk ? 'success' : 'warning'
    );
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

  const getShortcutDisplay = (field: 'capture' | 'upload') => {
    if (listeningFor === field) {
      if (pressedKeys.size > 0) {
        return formatShortcut(pressedKeys);
      }
      return '按住快捷键...';
    }
    return shortcutFormData[field] || '点击设置快捷键';
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
          <>
            {result.message || '数据恢复成功！'}<br />
            应用将重启以加载新数据。
          </>,
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

  return (
    <SettingsContainer>
      <Content>
        <SettingsPanel>
            <SettingsRow>
              <RowLabelCol>
                <RowLabelText>APP ID</RowLabelText>
              </RowLabelCol>
              <RowControlCol>
                <Input
                  type="text"
                  value={apiFormData.appId || ''}
                  onChange={(e) => handleApiChange('appId', e.target.value)}
                  placeholder="请输入APP ID"
                  autoComplete="off"
                />
              </RowControlCol>
            </SettingsRow>

            <SettingsRow>
              <RowLabelCol>
                <RowLabelText>APP Secret</RowLabelText>
              </RowLabelCol>
              <RowControlCol>
                <Input
                  type="password"
                  value={apiFormData.appSecret || ''}
                  onChange={(e) => handleApiChange('appSecret', e.target.value)}
                  placeholder="请输入APP Secret"
                  autoComplete="off"
                />
              </RowControlCol>
            </SettingsRow>

            <SettingsRow>
              <RowLabelCol>
                <RowLabelWithIcon>
                  <MaterialIcon name="keyboard" size={18} />
                  快捷键
                </RowLabelWithIcon>
              </RowLabelCol>
              <RowControlShortcut>
                <ShortcutsBlock>
                  <ShortcutLine>
                    <ShortcutLineLabel>
                      <MaterialIcon name="screenshot" size={16} />
                      截图
                    </ShortcutLineLabel>
                    <ShortcutButton
                      $isListening={listeningFor === 'capture'}
                      $isSet={!!shortcutFormData.capture}
                      onClick={() => listeningFor === 'capture' ? stopListening() : startListening('capture')}
                    >
                      <div>
                        <div style={{ fontWeight: 500, fontSize: listeningFor === 'capture' ? '12px' : '14px' }}>
                          {getShortcutDisplay('capture')}
                        </div>
                      </div>
                    </ShortcutButton>
                  </ShortcutLine>
                  <ShortcutLine>
                    <ShortcutLineLabel>
                      <MaterialIcon name="upload_file" size={16} />
                      上传图片
                    </ShortcutLineLabel>
                    <ShortcutButton
                      $isListening={listeningFor === 'upload'}
                      $isSet={!!shortcutFormData.upload}
                      onClick={() => listeningFor === 'upload' ? stopListening() : startListening('upload')}
                    >
                      <div>
                        <div style={{ fontWeight: 500, fontSize: listeningFor === 'upload' ? '12px' : '14px' }}>
                          {getShortcutDisplay('upload')}
                        </div>
                      </div>
                    </ShortcutButton>
                  </ShortcutLine>
                </ShortcutsBlock>
              </RowControlShortcut>
            </SettingsRow>

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

          <DataRow>
            <DataLabel>
              <DataTitle>最小化到系统托盘</DataTitle>
            </DataLabel>
            <DataActions>
              <Toggle>
                <input
                  type="checkbox"
                  checked={minimizeToTrayState}
                  onChange={(e) => setMinimizeToTrayState(e.target.checked)}
                />
                <span></span>
              </Toggle>
            </DataActions>
          </DataRow>

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

          <UnifiedSettingsFooter>
            <Button variant="primary" onClick={() => handleSaveAll()}>
              保存
            </Button>
          </UnifiedSettingsFooter>
        </SettingsPanel>
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
