import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import MaterialIcon from '../components/MaterialIcon';
import packageJson from '../../package.json';

const AboutContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-dialogBackground);
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 32px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 4px;
  }
`;

const Card = styled.div`
  background: var(--color-surface);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
`;

const TopSection = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 32px;
`;

const LogoWrapper = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
`;

const AppLogo = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const ProgressRing = styled.svg`
  position: absolute;
  top: -6px;
  left: -6px;
  width: 92px;
  height: 92px;
  transform: rotate(-90deg);
  pointer-events: none;
`;

const ProgressBackground = styled.circle`
  fill: none;
  stroke: rgba(0, 0, 0, 0.1);
  stroke-width: 3;
`;

const ProgressCircle = styled.circle<{ $progress: number }>`
  fill: none;
  stroke: var(--color-primary);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: ${2 * Math.PI * 43};
  stroke-dashoffset: ${props => 2 * Math.PI * 43 * (1 - props.$progress / 100)};
  transition: stroke-dashoffset 0.3s ease;
`;

const AppInfo = styled.div`
  flex: 1;
`;

const AppName = styled.h1`
  margin: 0 0 8px 0;
  color: var(--color-text);
  font-size: 24px;
  font-weight: 700;
`;

const AppDescription = styled.div`
  color: var(--color-textSecondary);
  font-size: 14px;
  margin-bottom: 16px;
`;

const VersionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const VersionBadge = styled.span`
  display: inline-block;
  padding: 6px 14px;
  background: rgba(0, 0, 0, 0.05);
  color: var(--color-primary);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
`;

const UpdateButton = styled.button`
  padding: 6px 16px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.03);
    border-color: var(--color-primary);
  }
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--color-borderLight);

  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.div`
  color: var(--color-text);
  font-size: 14px;
  font-weight: 500;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: var(--color-primary);
  }

  &:checked + span:before {
    transform: translateX(20px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 24px;

  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }
`;

const LinksSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const LinkItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--color-borderLight);
  cursor: pointer;
  transition: all 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.02);
    margin: 0 -16px;
    padding: 16px 16px;
  }
`;

const LinkLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LinkIcon = styled.div`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-textSecondary);
`;

const LinkText = styled.div`
  color: var(--color-text);
  font-size: 14px;
  font-weight: 500;
`;

const LinkButton = styled.button`
  padding: 6px 16px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.03);
    border-color: var(--color-primary);
  }
`;

interface AboutViewProps {
  onCheckForUpdates?: () => void;
}

type UpdateStatus = 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'no-update';

const AboutView: React.FC<AboutViewProps> = ({ onCheckForUpdates }) => {
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [betaProgram, setBetaProgram] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const logoSrc = `${process.env.PUBLIC_URL}/logo512.png`;

  useEffect(() => {
    if (!window.electronAPI) return;

    // 监听更新事件
    const handleCheckingForUpdate = () => {
      setUpdateStatus('checking');
      setDownloadProgress(10);
    };

    const handleUpdateAvailable = () => {
      setUpdateStatus('available');
      setDownloadProgress(20);
    };

    const handleUpdateNotAvailable = () => {
      setUpdateStatus('no-update');
      setDownloadProgress(0);
      setTimeout(() => setUpdateStatus('idle'), 3000); // 3秒后重置状态
    };

    const handleDownloadProgress = (progressObj: any) => {
      setUpdateStatus('downloading');
      setDownloadProgress(Math.round(progressObj.percent || 0));
    };

    const handleUpdateDownloaded = () => {
      setUpdateStatus('downloaded');
      setDownloadProgress(100);
    };

    const handleUpdateError = () => {
      setUpdateStatus('idle');
      setDownloadProgress(0);
    };

    // 注册监听器
    window.electronAPI.onCheckingForUpdate(handleCheckingForUpdate);
    window.electronAPI.onUpdateAvailable(handleUpdateAvailable);
    window.electronAPI.onUpdateNotAvailable(handleUpdateNotAvailable);
    window.electronAPI.onDownloadProgress(handleDownloadProgress);
    window.electronAPI.onUpdateDownloaded(handleUpdateDownloaded);
    window.electronAPI.onUpdateError(handleUpdateError);

    // 清理监听器
    return () => {
      if (window.electronAPI?.removeUpdateListeners) {
        window.electronAPI.removeUpdateListeners();
      }
    };
  }, []);

  const handleLink = (url: string) => {
    if (window.electronAPI) {
      // Electron 环境：使用系统默认浏览器
      window.electronAPI.openExternal(url).catch(error => {
        console.error('打开链接失败:', error);
      });
    } else {
      // 浏览器环境：使用 window.open
      window.open(url, '_blank');
    }
  };

  // 显示进度的条件：正在检查、有更新、正在下载或已下载
  const showProgress = updateStatus !== 'idle' && updateStatus !== 'no-update';

  return (
    <AboutContainer>
      <Content>
        <Card>
          <TopSection>
            <LogoWrapper>
              <AppLogo>
                <img src={logoSrc} alt="TexStudio Logo" />
              </AppLogo>
              {showProgress && (
                <ProgressRing>
                  <ProgressBackground
                    cx="46"
                    cy="46"
                    r="43"
                  />
                  <ProgressCircle
                    cx="46"
                    cy="46"
                    r="43"
                    $progress={downloadProgress}
                  />
                </ProgressRing>
              )}
            </LogoWrapper>
            <AppInfo>
              <AppName>TexStudio OCR</AppName>
              <AppDescription>一款优雅的数学公式识别与编辑工具</AppDescription>
              <VersionRow>
                <VersionBadge>v{packageJson.version}</VersionBadge>
                <UpdateButton onClick={onCheckForUpdates}>检查更新</UpdateButton>
              </VersionRow>
            </AppInfo>
          </TopSection>
        </Card>

        <Card>
          <LinksSection>
            <LinkItem onClick={() => handleLink('https://github.com/Louaq/TexStudio/wiki')}>
              <LinkLeft>
                <LinkIcon>
                  <MaterialIcon name="help" size={24} />
                </LinkIcon>
                <LinkText>帮助文档</LinkText>
              </LinkLeft>
              <LinkButton>查看</LinkButton>
            </LinkItem>

            <LinkItem onClick={() => handleLink('https://github.com/Louaq/TexStudio/releases')}>
              <LinkLeft>
                <LinkIcon>
                  <MaterialIcon name="update" size={24} />
                </LinkIcon>
                <LinkText>更新日志</LinkText>
              </LinkLeft>
              <LinkButton>查看</LinkButton>
            </LinkItem>

            <LinkItem onClick={() => handleLink('https://github.com/Louaq/TexStudio')}>
              <LinkLeft>
                <LinkIcon>
                  <MaterialIcon name="language" size={24} />
                </LinkIcon>
                <LinkText>官方网站</LinkText>
              </LinkLeft>
              <LinkButton>查看</LinkButton>
            </LinkItem>

            <LinkItem onClick={() => handleLink('https://github.com/Louaq/TexStudio/issues')}>
              <LinkLeft>
                <LinkIcon>
                  <MaterialIcon name="chat" size={24} />
                </LinkIcon>
                <LinkText>意见反馈</LinkText>
              </LinkLeft>
              <LinkButton>反馈</LinkButton>
            </LinkItem>

            <LinkItem onClick={() => handleLink('https://github.com/Louaq/TexStudio/blob/main/LICENSE')}>
              <LinkLeft>
                <LinkIcon>
                  <MaterialIcon name="description" size={24} />
                </LinkIcon>
                <LinkText>许可证</LinkText>
              </LinkLeft>
              <LinkButton>查看</LinkButton>
            </LinkItem>

            <LinkItem onClick={() => handleLink('mailto:yang_syy@qq.com')}>
              <LinkLeft>
                <LinkIcon>
                  <MaterialIcon name="mail" size={24} />
                </LinkIcon>
                <LinkText>邮件联系</LinkText>
              </LinkLeft>
              <LinkButton>邮件</LinkButton>
            </LinkItem>

            <LinkItem onClick={() => {
              if (window.electronAPI) {
                window.electronAPI.openDevTools().catch(error => {
                  console.error('打开开发者工具失败:', error);
                });
              }
            }}>
              <LinkLeft>
                <LinkIcon>
                  <MaterialIcon name="bug_report" size={24} />
                </LinkIcon>
                <LinkText>调试面板</LinkText>
              </LinkLeft>
              <LinkButton>打开</LinkButton>
            </LinkItem>
          </LinksSection>
        </Card>
      </Content>
    </AboutContainer>
  );
};

export default AboutView;
