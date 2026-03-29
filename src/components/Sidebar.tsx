import React, { useMemo } from 'react';
import styled from 'styled-components';
import MaterialIcon from './MaterialIcon';
import { SidebarConfig } from '../types';

const SidebarContainer = styled.div`
  width: 180px;
  background: var(--color-menuBackground);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--color-borderLight);
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 0;
  position: relative;

  &::-webkit-scrollbar {
    width: 2px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.08);
    border-radius: 2px;
  }
`;


const BrandSection = styled.div`
  padding: 0 14px;
  height: 38px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  -webkit-app-region: drag;
  cursor: default;
`;

const BrandIcon = styled.div`
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const BrandName = styled.div`
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  letter-spacing: -0.2px;
  line-height: 1;
`;

const BrandTex = styled.span`
  color: var(--color-primary);
`;

const BrandStudio = styled.span`
  color: var(--color-accentSecondary);
`;

const NavSection = styled.div`
  flex: 1;
  padding: 4px 8px;
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const Divider = styled.div`
  height: 1px;
  background: var(--color-borderLight);
  margin: 6px 14px;
  flex-shrink: 0;
`;

const NavItem = styled.div<{ $active?: boolean; disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${props => props.disabled ? 0.38 : 1};
  color: ${props => props.$active ? 'var(--color-primary)' : 'var(--color-textSecondary)'};
  background: ${props => props.$active
    ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)'
    : 'transparent'
  };
  font-weight: ${props => props.$active ? '600' : '400'};
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: -8px;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: ${props => props.$active ? '18px' : '0px'};
    background: var(--color-primary);
    border-radius: 0 2px 2px 0;
    transition: height 0.18s ease;
  }

  &:hover {
    ${props => !props.disabled && !props.$active && `
      color: var(--color-text);
      background: color-mix(in srgb, var(--color-text) 5%, transparent);
    `}
    ${props => !props.disabled && props.$active && `
      background: color-mix(in srgb, var(--color-primary) 15%, transparent);
    `}
  }

  &:active {
    ${props => !props.disabled && 'transform: scale(0.97);'}
  }
`;

const NavIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
`;

const NavLabel = styled.span`
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.1px;
`;

const BottomSection = styled.div`
  padding: 8px 14px 14px;
  flex-shrink: 0;
`;

const VersionText = styled.div`
  font-size: 11px;
  color: var(--color-textMuted);
  letter-spacing: 0.2px;
`;

type ViewType = 'home' | 'settings' | 'history' | 'about';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onCapture: () => void;
  onUpload: () => void;
  onCopy: () => void;
  onExport: () => void;
  copyDisabled?: boolean;
  exportDisabled?: boolean;
  sidebarConfig?: SidebarConfig;
}

export const getDefaultSidebarConfig = (): SidebarConfig => ({
  items: [
    { id: 'home', label: '主页', icon: 'home', visible: true, order: 0, type: 'view' },
    { id: 'capture', label: '截图识别', icon: 'photo_camera', visible: true, order: 1, type: 'action' },
    { id: 'copy', label: '复制 LaTeX', icon: 'content_copy', visible: true, order: 2, type: 'action' },
    { id: 'export', label: '导出图片', icon: 'download', visible: true, order: 3, type: 'action' },
    { id: 'history', label: '历史记录', icon: 'history', visible: true, order: 4, type: 'view' },
    { id: 'settings', label: '设置', icon: 'settings', visible: true, order: 5, type: 'view' },
    { id: 'about', label: '关于', icon: 'info', visible: true, order: 6, type: 'view' }
  ]
});

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  onCapture,
  onUpload,
  onCopy,
  onExport,
  copyDisabled = false,
  exportDisabled = false,
  sidebarConfig,
}) => {
  const config = useMemo(() =>
    sidebarConfig || getDefaultSidebarConfig(),
    [sidebarConfig]
  );

  const sortedItems = useMemo(() =>
    [...config.items]
      .filter(item => item.visible)
      .sort((a, b) => a.order - b.order),
    [config]
  );

  const renderNavItem = (item: typeof sortedItems[0]) => {
    switch (item.id) {
      case 'home':
        return (
          <NavItem key={item.id} $active={currentView === 'home'} onClick={() => onViewChange('home')}>
            <NavIcon><MaterialIcon name={item.icon} size={18} /></NavIcon>
            <NavLabel>{item.label}</NavLabel>
          </NavItem>
        );

      case 'capture':
        return (
          <NavItem key={item.id} onClick={onCapture}>
            <NavIcon><MaterialIcon name={item.icon} size={18} /></NavIcon>
            <NavLabel>{item.label}</NavLabel>
          </NavItem>
        );

      case 'copy':
        return (
          <NavItem
            key={item.id}
            onClick={copyDisabled ? undefined : onCopy}
            disabled={copyDisabled}
          >
            <NavIcon><MaterialIcon name={item.icon} size={18} /></NavIcon>
            <NavLabel>{copyDisabled ? '复制 LaTeX' : item.label}</NavLabel>
          </NavItem>
        );

      case 'export':
        return (
          <NavItem
            key={item.id}
            onClick={exportDisabled ? undefined : onExport}
            disabled={exportDisabled}
          >
            <NavIcon><MaterialIcon name={item.icon} size={18} /></NavIcon>
            <NavLabel>{exportDisabled ? '导出图片' : item.label}</NavLabel>
          </NavItem>
        );

      case 'history':
        return (
          <NavItem key={item.id} $active={currentView === 'history'} onClick={() => onViewChange('history')}>
            <NavIcon><MaterialIcon name={item.icon} size={18} /></NavIcon>
            <NavLabel>{item.label}</NavLabel>
          </NavItem>
        );

      case 'settings':
        return (
          <NavItem key={item.id} $active={currentView === 'settings'} onClick={() => onViewChange('settings')}>
            <NavIcon><MaterialIcon name={item.icon} size={18} /></NavIcon>
            <NavLabel>{item.label}</NavLabel>
          </NavItem>
        );

      case 'about':
        return (
          <NavItem key={item.id} $active={currentView === 'about'} onClick={() => onViewChange('about')}>
            <NavIcon><MaterialIcon name={item.icon} size={18} /></NavIcon>
            <NavLabel>{item.label}</NavLabel>
          </NavItem>
        );

      default:
        return null;
    }
  };

  const topItems = sortedItems.filter(i => ['home', 'capture', 'copy', 'export'].includes(i.id));
  const bottomItems = sortedItems.filter(i => ['history', 'settings', 'about'].includes(i.id));

  return (
    <SidebarContainer>
      <BrandSection>
        <BrandIcon>
          <img src="icons/icon-32.png" alt="TexStudio" />
        </BrandIcon>
        <BrandName>
          <BrandTex>Tex</BrandTex>
          <BrandStudio>Studio</BrandStudio>
        </BrandName>
      </BrandSection>

      <Divider />

      <NavSection>
        {topItems.map(item => renderNavItem(item))}
        {topItems.length > 0 && bottomItems.length > 0 && (
          <Divider style={{ margin: '6px 0' }} />
        )}
        {bottomItems.map(item => renderNavItem(item))}
      </NavSection>

      <BottomSection>
        <Divider style={{ margin: '0 0 8px 0' }} />
        <VersionText>v4.7.1</VersionText>
      </BottomSection>
    </SidebarContainer>
  );
};

export default Sidebar;
