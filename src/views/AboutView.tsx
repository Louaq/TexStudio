import React from 'react';
import styled from 'styled-components';
import packageJson from '../../package.json';
import { glassViewRoot } from '../theme/themes';

const AboutContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  ${glassViewRoot}
`;

const Content = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px 24px 28px;
  box-sizing: border-box;
  ${glassViewRoot}
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

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
  width: 100%;
  max-width: 480px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: visible;
  background: transparent;
  border: none;
  box-shadow: none;
`;

const HeroSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  padding: 36px 28px 40px;
`;

const AppLogo = styled.div`
  width: 88px;
  height: 88px;
  flex-shrink: 0;
  border-radius: 14px;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  max-width: 360px;
`;

const AppName = styled.h1`
  margin: 0 0 8px 0;
  color: var(--color-text);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

const AppDescription = styled.p`
  margin: 0 0 18px 0;
  color: var(--color-textSecondary);
  font-size: 14px;
  line-height: 1.55;
`;

const VersionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  background: color-mix(in srgb, var(--color-primary) 10%, var(--color-surface));
  color: var(--color-primary);
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
`;

const VersionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const AboutView: React.FC = () => {
  const logoSrc = `${process.env.PUBLIC_URL}/logo512.png`;

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
              </VersionRow>
            </AppInfo>
          </HeroSection>
        </AboutPanel>
      </Content>
    </AboutContainer>
  );
};

export default AboutView;
