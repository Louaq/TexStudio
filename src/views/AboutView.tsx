import React, { useState } from 'react';
import styled from 'styled-components';
import MaterialIcon from '../components/MaterialIcon';
import packageJson from '../../package.json';
import { glassCard, glassViewRoot } from '../theme/themes';

const AboutContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  ${glassViewRoot}
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
`;

const AboutPanel = styled.div`
  border-radius: 10px;
  overflow: hidden;
  ${glassCard}
`;

const HeroSection = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 22px 22px 20px;
  border-bottom: 1px solid var(--color-borderLight);
`;

const AppLogo = styled.div`
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  border-radius: 12px;
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

const AppInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const AppName = styled.h1`
  margin: 0 0 6px 0;
  color: var(--color-text);
  font-size: 21px;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

const AppDescription = styled.p`
  margin: 0 0 14px 0;
  color: var(--color-textSecondary);
  font-size: 14px;
  line-height: 1.5;
`;

const VersionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
`;

const VersionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  background: color-mix(in srgb, var(--color-primary) 10%, var(--color-surface));
  color: var(--color-primary);
  border: 1px solid color-mix(in srgb, var(--color-primary) 28%, transparent);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
`;

const UpdateButton = styled.button`
  padding: 6px 14px;
  border: 1px solid var(--color-primary);
  border-radius: 6px;
  background: var(--color-surface);
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: color-mix(in srgb, var(--color-primary) 8%, var(--color-surface));
  }
`;

const UpdateHint = styled.div`
  width: 100%;
  margin-top: 2px;
  font-size: 13px;
  color: var(--color-textSecondary);
  line-height: 1.45;
`;

const LinkRow = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 14px 22px;
  border: none;
  border-bottom: 1px solid var(--color-borderLight);
  background: transparent;
  cursor: pointer;
  text-align: left;
  box-sizing: border-box;
  transition: background 0.15s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: color-mix(in srgb, var(--color-text) 3%, var(--color-surface));
  }
`;

const LinkLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const LinkIcon = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  flex-shrink: 0;
`;

const LinkText = styled.span`
  color: var(--color-text);
  font-size: 15px;
  font-weight: 500;
`;

const LinkAction = styled.span`
  flex-shrink: 0;
  padding: 5px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  color: var(--color-textSecondary);
  font-size: 13px;
  font-weight: 500;
  transition: border-color 0.15s ease, color 0.15s ease;
`;

const LinkRowStyled = styled(LinkRow)`
  &:hover ${LinkAction} {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
`;

interface AboutViewProps {
  onCheckForUpdates?: () => void;
}

const AboutView: React.FC<AboutViewProps> = ({ onCheckForUpdates }) => {
  const [envHint, setEnvHint] = useState<string | null>(null);
  const logoSrc = `${process.env.PUBLIC_URL}/logo512.png`;

  const handleLink = (url: string) => {
    if (window.electronAPI) {
      window.electronAPI.openExternal(url).catch(error => {
        console.error('打开链接失败:', error);
      });
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <AboutContainer>
      <Content>
        <AboutPanel>
          <HeroSection>
            <AppLogo>
              <img src={logoSrc} alt="TexStudio Logo" />
            </AppLogo>
            <AppInfo>
              <AppName>TexStudio OCR</AppName>
              <AppDescription>一款优雅的数学公式识别与编辑工具</AppDescription>
              <VersionRow>
                <VersionBadge>v{packageJson.version}</VersionBadge>
                <UpdateButton
                  type="button"
                  onClick={() => {
                    if (!window.electronAPI) {
                      setEnvHint(
                        `当前版本 v${packageJson.version}。自动更新仅在桌面应用中可用。`
                      );
                      return;
                    }
                    setEnvHint(null);
                    onCheckForUpdates?.();
                  }}
                >
                  检查更新
                </UpdateButton>
                {envHint ? <UpdateHint>{envHint}</UpdateHint> : null}
              </VersionRow>
            </AppInfo>
          </HeroSection>

          <LinkRowStyled
            type="button"
            onClick={() => handleLink('https://github.com/Louaq/TexStudio')}
          >
            <LinkLeft>
              <LinkIcon>
                <MaterialIcon name="language" size={22} />
              </LinkIcon>
              <LinkText>官方网站</LinkText>
            </LinkLeft>
            <LinkAction>查看</LinkAction>
          </LinkRowStyled>

          <LinkRowStyled
            type="button"
            onClick={() => handleLink('https://github.com/Louaq/TexStudio/issues')}
          >
            <LinkLeft>
              <LinkIcon>
                <MaterialIcon name="chat" size={22} />
              </LinkIcon>
              <LinkText>意见反馈</LinkText>
            </LinkLeft>
            <LinkAction>反馈</LinkAction>
          </LinkRowStyled>

          <LinkRowStyled
            type="button"
            onClick={() => handleLink('mailto:yang_syy@qq.com')}
          >
            <LinkLeft>
              <LinkIcon>
                <MaterialIcon name="mail" size={22} />
              </LinkIcon>
              <LinkText>邮件联系</LinkText>
            </LinkLeft>
            <LinkAction>邮件</LinkAction>
          </LinkRowStyled>

          <LinkRowStyled
            type="button"
            onClick={() => {
              if (window.electronAPI) {
                window.electronAPI.openDevTools().catch(error => {
                  console.error('打开开发者工具失败:', error);
                });
              }
            }}
          >
            <LinkLeft>
              <LinkIcon>
                <MaterialIcon name="bug_report" size={22} />
              </LinkIcon>
              <LinkText>调试面板</LinkText>
            </LinkLeft>
            <LinkAction>打开</LinkAction>
          </LinkRowStyled>
        </AboutPanel>
      </Content>
    </AboutContainer>
  );
};

export default AboutView;
