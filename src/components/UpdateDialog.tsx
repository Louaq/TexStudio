import React from 'react';
import styled, { keyframes } from 'styled-components';
import MaterialIcon from './MaterialIcon';

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
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
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 12px 40px rgba(0, 0, 0, 0.12);
  padding: 24px 22px 20px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  animation: ${fadeUp} 0.22s ease-out;
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

const SpinnerRing = styled.div`
  width: 22px;
  height: 22px;
  border: 2px solid color-mix(in srgb, var(--color-primary) 22%, transparent);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 16px;
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
  font-size: 12px;
  font-weight: 500;
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  padding: 4px 10px;
  border-radius: 6px;
  margin-bottom: 10px;
  letter-spacing: 0.02em;
`;

const Message = styled.p`
  margin: 0;
  font-size: 13px;
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
  font-size: 13px;
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

const CircleProgressContainer = styled.div`
  width: 100px;
  height: 100px;
  position: relative;
  margin: 8px auto 14px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CircleProgressSVG = styled.svg`
  width: 100px;
  height: 100px;
  transform: rotate(-90deg);
  position: absolute;
`;

const CircleProgressBg = styled.circle`
  fill: none;
  stroke: var(--color-borderLight);
  stroke-width: 5;
`;

const CircleProgressBar = styled.circle<{ progress: number; circumference: number }>`
  fill: none;
  stroke: var(--color-primary);
  stroke-width: 5;
  stroke-linecap: round;
  stroke-dasharray: ${props => props.circumference};
  stroke-dashoffset: ${props =>
    props.circumference - (props.progress / 100) * props.circumference};
  transition: stroke-dashoffset 0.25s ease;
`;

const ProgressText = styled.div`
  position: relative;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  z-index: 1;
  letter-spacing: -0.02em;
`;

const CircleProgress: React.FC<{ progress: number }> = ({ progress }) => {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, progress));

  return (
    <CircleProgressContainer>
      <CircleProgressSVG viewBox="0 0 100 100">
        <CircleProgressBg cx="50" cy="50" r={radius} />
        <CircleProgressBar
          cx="50"
          cy="50"
          r={radius}
          progress={clamped}
          circumference={circumference}
        />
      </CircleProgressSVG>
      <ProgressText>{clamped.toFixed(0)}%</ProgressText>
    </CircleProgressContainer>
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
                <SpinnerRing />
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
            <CircleProgress progress={progress} />
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
