import React from 'react';
import styled, { keyframes } from 'styled-components';
import MaterialIcon from './MaterialIcon';

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const dialogFade = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: var(--color-dialogOverlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20000;
  padding: 20px;
  box-sizing: border-box;
`;

const Dialog = styled.div`
  width: 100%;
  max-width: 380px;
  background: var(--color-surface);
  border-radius: 14px;
  border: 1px solid var(--color-borderLight);
  padding: 24px 22px 20px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  animation: ${dialogFade} 0.1s ease-out;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
`;

const IconBadge = styled.div<{ $variant: 'checking' | 'success' | 'info' | 'error' | 'download' }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-primary);

  ${props => {
    switch (props.$variant) {
      case 'checking':
        return `
          background: color-mix(in srgb, var(--color-primary) 12%, transparent);
        `;
      case 'success':
        return `
          background: color-mix(in srgb, var(--color-success) 14%, transparent);
          color: var(--color-success);
        `;
      case 'info':
        return `
          background: color-mix(in srgb, var(--color-primary) 12%, transparent);
        `;
      case 'error':
        return `
          background: color-mix(in srgb, var(--color-error) 12%, transparent);
          color: var(--color-error);
        `;
      case 'download':
        return `
          background: color-mix(in srgb, var(--color-primary) 12%, transparent);
        `;
      default:
        return '';
    }
  }}
`;

const Title = styled.h2`
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: -0.02em;
  line-height: 1.35;
  flex: 1;
  min-width: 0;
  padding-top: 2px;
`;

const CloseGhost = styled.button`
  border: none;
  background: transparent;
  color: var(--color-textSecondary);
  cursor: pointer;
  padding: 4px;
  margin: -4px -4px 0 0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: color-mix(in srgb, var(--color-text) 6%, transparent);
    color: var(--color-text);
  }
`;

const Body = styled.div`
  padding-left: 0;
`;

const VersionChip = styled.span`
  display: inline-block;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  padding: 4px 10px;
  border-radius: 6px;
  margin-bottom: 10px;
  letter-spacing: 0.02em;
`;

const VersionChipMuted = styled(VersionChip)`
  color: var(--color-textSecondary);
  background: color-mix(in srgb, var(--color-text) 6%, transparent);
`;

const Message = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: var(--color-textSecondary);
  letter-spacing: 0.01em;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
  padding-top: 4px;
`;

const Btn = styled.button<{ $primary?: boolean }>`
  padding: 8px 16px;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.1s ease;
  border: 1px solid ${props => props.$primary ? 'transparent' : 'var(--color-border)'};
  background: ${props =>
    props.$primary
      ? 'var(--color-primary)'
      : 'transparent'};
  color: ${props => (props.$primary ? '#fff' : 'var(--color-text)')};

  &:hover {
    background: ${props =>
      props.$primary
        ? 'color-mix(in srgb, var(--color-primary) 88%, #000)'
        : 'color-mix(in srgb, var(--color-text) 5%, transparent)'};
    border-color: ${props => (props.$primary ? 'transparent' : 'var(--color-border)')};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const LOGO_SRC = `${process.env.PUBLIC_URL}/logo512.png`;

/** 检查中：Logo 居中，外圈旋转弧 */
const CheckingLogoWrap = styled.div`
  position: relative;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
`;

const CheckingLogoSvg = styled.svg`
  position: absolute;
  inset: 0;
  width: 44px;
  height: 44px;
`;

const CheckingTrackCircle = styled.circle`
  fill: none;
  stroke: color-mix(in srgb, var(--color-primary) 22%, transparent);
  stroke-width: 2.5;
`;

const CheckingSpinGroup = styled.g`
  animation: ${spin} 0.9s linear infinite;
  transform-origin: 0px 0px;
`;

const CheckingArcCircle = styled.circle`
  fill: none;
  stroke: var(--color-primary);
  stroke-width: 2.75;
  stroke-linecap: round;
  stroke-dasharray: 30 92;
`;

const CheckingLogoImg = styled.img`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 22px;
  height: 22px;
  border-radius: 5px;
  object-fit: contain;
  z-index: 1;
  pointer-events: none;
`;

const CheckingLogoRing: React.FC = () => (
  <CheckingLogoWrap>
    <CheckingLogoSvg viewBox="0 0 44 44" aria-hidden>
      <CheckingTrackCircle cx="22" cy="22" r="19" />
      <g transform="translate(22 22)">
        <CheckingSpinGroup>
          <CheckingArcCircle cx="0" cy="0" r="19" transform="rotate(-90)" />
        </CheckingSpinGroup>
      </g>
    </CheckingLogoSvg>
    <CheckingLogoImg src={LOGO_SRC} alt="" />
  </CheckingLogoWrap>
);

const LogoProgressOuter = styled.div`
  width: 112px;
  height: 112px;
  position: relative;
  margin: 8px auto 14px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LogoProgressSvg = styled.svg`
  position: absolute;
  inset: 0;
  width: 112px;
  height: 112px;
  transform: rotate(-90deg);
`;

const LogoProgressBg = styled.circle`
  fill: none;
  stroke: var(--color-borderLight);
  stroke-width: 5;
`;

const LogoProgressBar = styled.circle<{ $dashoffset: number; $circumference: number }>`
  fill: none;
  stroke: var(--color-primary);
  stroke-width: 5;
  stroke-linecap: round;
  stroke-dasharray: ${props => props.$circumference};
  stroke-dashoffset: ${props => props.$dashoffset};
  transition: stroke-dashoffset 0.25s ease;
`;

const LogoProgressCenter = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  pointer-events: none;
`;

const LogoProgressImg = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  object-fit: contain;
`;

const LogoProgressPercent = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: -0.02em;
  line-height: 1;
`;

const LogoCircularProgress: React.FC<{ progress: number }> = ({ progress }) => {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, progress));
  const dashOffset = circumference - (clamped / 100) * circumference;

  return (
    <LogoProgressOuter>
      <LogoProgressSvg viewBox="0 0 112 112" aria-hidden>
        <LogoProgressBg cx="56" cy="56" r={radius} />
        <LogoProgressBar
          cx="56"
          cy="56"
          r={radius}
          $circumference={circumference}
          $dashoffset={dashOffset}
        />
      </LogoProgressSvg>
      <LogoProgressCenter>
        <LogoProgressImg src={LOGO_SRC} alt="" />
        <LogoProgressPercent>{clamped.toFixed(0)}%</LogoProgressPercent>
      </LogoProgressCenter>
    </LogoProgressOuter>
  );
};

interface UpdateDialogProps {
  isOpen: boolean;
  status: 'checking' | 'no-update' | 'available' | 'downloading' | 'downloaded' | 'error';
  progress?: number;
  version?: string;
  currentVersion?: string;
  onClose: () => void;
  onDownload?: () => void;
  onRestart?: () => void;
  onBackgroundDownload?: () => void;
}

const UpdateDialog: React.FC<UpdateDialogProps> = ({
  isOpen,
  status,
  progress = 0,
  version = '',
  currentVersion = '',
  onClose,
  onDownload,
  onRestart,
  onBackgroundDownload,
}) => {
  if (!isOpen) return null;

  const renderContent = () => {
    switch (status) {
      case 'checking':
        return (
          <>
            <HeaderRow>
              <IconBadge $variant="checking">
                <CheckingLogoRing />
              </IconBadge>
              <Title>检查更新</Title>
              <CloseGhost type="button" onClick={onClose} title="关闭" aria-label="关闭">
                <MaterialIcon name="close" size={20} />
              </CloseGhost>
            </HeaderRow>
            <Body>
              {currentVersion ? (
                <VersionChip>当前版本 v{currentVersion}</VersionChip>
              ) : null}
              <Message>正在连接更新服务器，查询是否有新版本…</Message>
            </Body>
          </>
        );

      case 'no-update':
        return (
          <>
            <HeaderRow>
              <IconBadge $variant="success">
                <MaterialIcon name="check_circle" size={24} />
              </IconBadge>
              <Title>已是最新版本</Title>
              <CloseGhost type="button" onClick={onClose} title="关闭" aria-label="关闭">
                <MaterialIcon name="close" size={20} />
              </CloseGhost>
            </HeaderRow>
            <Body>
              {currentVersion ? (
                <VersionChip>当前版本 v{currentVersion}</VersionChip>
              ) : null}
              <Message>当前安装版本已是最新，无需更新。</Message>
            </Body>
            <ButtonRow>
              <Btn $primary type="button" onClick={onClose}>
                好的
              </Btn>
            </ButtonRow>
          </>
        );

      case 'available':
        return (
          <>
            <HeaderRow>
              <IconBadge $variant="info">
                <MaterialIcon name="update" size={24} />
              </IconBadge>
              <Title>发现新版本</Title>
              <CloseGhost type="button" onClick={onClose} title="关闭" aria-label="关闭">
                <MaterialIcon name="close" size={20} />
              </CloseGhost>
            </HeaderRow>
            <Body>
              {currentVersion ? (
                <VersionChipMuted>当前版本 v{currentVersion}</VersionChipMuted>
              ) : null}
              {version ? <VersionChip>新版本 v{version}</VersionChip> : null}
              <Message>
                检测到可用更新。是否立即下载？下载完成后可随时重启完成安装。
              </Message>
            </Body>
            <ButtonRow>
              <Btn type="button" onClick={onClose}>
                稍后
              </Btn>
              <Btn $primary type="button" onClick={onDownload}>
                立即下载
              </Btn>
            </ButtonRow>
          </>
        );

      case 'downloading':
        return (
          <>
            <HeaderRow>
              <IconBadge $variant="download">
                <MaterialIcon name="download" size={22} />
              </IconBadge>
              <Title>正在下载</Title>
              <CloseGhost type="button" onClick={onClose} title="关闭" aria-label="关闭">
                <MaterialIcon name="close" size={20} />
              </CloseGhost>
            </HeaderRow>
            <LogoCircularProgress progress={progress} />
            <Body>
              <Message>更新包下载中，请保持网络畅通。也可选择后台下载并关闭此窗口。</Message>
            </Body>
            <ButtonRow>
              <Btn type="button" onClick={onBackgroundDownload}>
                后台下载
              </Btn>
            </ButtonRow>
          </>
        );

      case 'downloaded':
        return (
          <>
            <HeaderRow>
              <IconBadge $variant="success">
                <MaterialIcon name="check_circle" size={24} />
              </IconBadge>
              <Title>下载完成</Title>
              <CloseGhost type="button" onClick={onClose} title="关闭" aria-label="关闭">
                <MaterialIcon name="close" size={20} />
              </CloseGhost>
            </HeaderRow>
            <Body>
              {version ? <VersionChip>v{version}</VersionChip> : null}
              <Message>新版本已就绪。重启应用后即可完成安装。</Message>
            </Body>
            <ButtonRow>
              <Btn type="button" onClick={onClose}>
                稍后重启
              </Btn>
              <Btn $primary type="button" onClick={onRestart}>
                立即重启
              </Btn>
            </ButtonRow>
          </>
        );

      case 'error':
        return (
          <>
            <HeaderRow>
              <IconBadge $variant="error">
                <MaterialIcon name="error_outline" size={24} />
              </IconBadge>
              <Title>检查失败</Title>
              <CloseGhost type="button" onClick={onClose} title="关闭" aria-label="关闭">
                <MaterialIcon name="close" size={20} />
              </CloseGhost>
            </HeaderRow>
            <Body>
              {currentVersion ? (
                <VersionChip>当前版本 v{currentVersion}</VersionChip>
              ) : null}
              <Message>无法完成更新检查。请检查网络后重试，或稍后再试。</Message>
            </Body>
            <ButtonRow>
              <Btn $primary type="button" onClick={onClose}>
                关闭
              </Btn>
            </ButtonRow>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Overlay
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Dialog onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        {renderContent()}
      </Dialog>
    </Overlay>
  );
};

export default UpdateDialog;
