import React, { useMemo } from 'react';
import styled from 'styled-components';
import MaterialIcon from './MaterialIcon';
import { SidebarConfig } from '../types';
import { glassSidebar } from '../theme/themes';

const SidebarContainer = styled.div`
  width: 180px;
  ${glassSidebar}
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
  min-height: 0;
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
  font-size: 15px;
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
  min-height: 0;
  padding: 4px 8px;
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow-y: auto;
  overflow-x: hidden;

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

const Divider = styled.div`
  height: 1px;
  background: var(--color-borderLight);
  margin: 6px 14px;
  flex-shrink: 0;
`;

/** 每个菜单项的分区色；自定义或未知项回退主色 */
const ITEM_COLORS: Record<string, string> = {
  home: 'var(--color-accentBlue)',
  capture: 'var(--color-accentOrange)',
  copy: 'var(--color-accentViolet)',
  export: 'var(--color-accentTeal)',
  history: 'var(--color-accentAmber)',
  settings: 'var(--color-accentGreen)',
  about: 'var(--color-accentPink)',
};

const NavItem = styled.div<{ $active?: boolean; disabled?: boolean; $color: string }>`
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: color 0.1s ease, background 0.1s ease;
  opacity: ${props => props.disabled ? 0.38 : 1};
  color: ${props => props.$active ? props.$color : 'var(--color-textSecondary)'};
  background: ${props => props.$active
    ? `color-mix(in srgb, ${props.$color} 14%, transparent)`
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
    background: ${props => props.$color};
    border-radius: 0 2px 2px 0;
    transition: height 0.1s ease;
  }

`;

const NavIcon = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: ${props => props.$color};
`;

const NavLabel = styled.span`
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.1px;
`;

const REPO_URL = 'https://github.com/Louaq/TexStudio';

const SidebarFooter = styled.div`
  flex-shrink: 0;
  padding: 8px 10px 12px;
  display: flex;
  justify-content: center;
`;

const RepoLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--color-textSecondary);
  cursor: pointer;

  svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }
`;

/** 用系统浏览器打开，避免在应用窗口内跳转 */
const openRepo = (e: React.MouseEvent) => {
  e.preventDefault();
  if (window.electronAPI?.openExternal) {
    window.electronAPI.openExternal(REPO_URL);
  } else {
    window.open(REPO_URL, '_blank', 'noopener');
  }
};

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
    const color = ITEM_COLORS[item.id] ?? 'var(--color-primary)';
    switch (item.id) {
      case 'home':
        return (
          <NavItem key={item.id} $color={color} $active={currentView === 'home'} onClick={() => onViewChange('home')}>
            <NavIcon $color={color}><MaterialIcon name={item.icon} size={20} /></NavIcon>
            <NavLabel>{item.label}</NavLabel>
          </NavItem>
        );

      case 'capture':
        return (
          <NavItem key={item.id} $color={color} onClick={onCapture}>
            <NavIcon $color={color}><MaterialIcon name={item.icon} size={20} /></NavIcon>
            <NavLabel>{item.label}</NavLabel>
          </NavItem>
        );

      case 'copy':
        return (
          <NavItem
            key={item.id}
            $color={color}
            onClick={copyDisabled ? undefined : onCopy}
            disabled={copyDisabled}
          >
            <NavIcon $color={color}><MaterialIcon name={item.icon} size={20} /></NavIcon>
            <NavLabel>{copyDisabled ? '复制 LaTeX' : item.label}</NavLabel>
          </NavItem>
        );

      case 'export':
        return (
          <NavItem
            key={item.id}
            $color={color}
            onClick={exportDisabled ? undefined : onExport}
            disabled={exportDisabled}
          >
            <NavIcon $color={color}><MaterialIcon name={item.icon} size={20} /></NavIcon>
            <NavLabel>{exportDisabled ? '导出图片' : item.label}</NavLabel>
          </NavItem>
        );

      case 'history':
        return (
          <NavItem key={item.id} $color={color} $active={currentView === 'history'} onClick={() => onViewChange('history')}>
            <NavIcon $color={color}><MaterialIcon name={item.icon} size={20} /></NavIcon>
            <NavLabel>{item.label}</NavLabel>
          </NavItem>
        );

      case 'settings':
        return (
          <NavItem key={item.id} $color={color} $active={currentView === 'settings'} onClick={() => onViewChange('settings')}>
            <NavIcon $color={color}><MaterialIcon name={item.icon} size={20} /></NavIcon>
            <NavLabel>{item.label}</NavLabel>
          </NavItem>
        );

      case 'about':
        return (
          <NavItem key={item.id} $color={color} $active={currentView === 'about'} onClick={() => onViewChange('about')}>
            <NavIcon $color={color}><MaterialIcon name={item.icon} size={20} /></NavIcon>
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
      <NavSection>
        {topItems.map(item => renderNavItem(item))}
        {topItems.length > 0 && bottomItems.length > 0 && (
          <Divider style={{ margin: '6px 0' }} />
        )}
        {bottomItems.map(item => renderNavItem(item))}
      </NavSection>
      <SidebarFooter>
        <RepoLink href={REPO_URL} onClick={openRepo} title="GitHub 地址" aria-label="GitHub 地址">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </RepoLink>
      </SidebarFooter>
    </SidebarContainer>
  );
};

export default Sidebar;
