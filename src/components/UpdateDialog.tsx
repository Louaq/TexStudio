import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import MaterialIcon from './MaterialIcon';

const LOGO_SRC = `${process.env.PUBLIC_URL}/logo512.png`;

const dialogIn = keyframes`
  from { opacity: 0; transform: translateY(6px) scale(0.97); }
  to { opacity: 1; transform: none; }
`;

const contentIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: none; }
`;

const popIn = keyframes`
  0% { transform: scale(0.6); opacity: 0; }
  60% { transform: scale(1.06); opacity: 1; }
  100% { transform: scale(1); }
`;

/* 不定进度：整体旋转 + 弧长伸缩（Material 风格），弧长单位基于 pathLength=100 */
const ringRotate = keyframes`
  to { transform: rotate(360deg); }
`;

const ringDash = keyframes`
  0% { stroke-dasharray: 1 200; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 65 200; stroke-dashoffset: -20; }
  100% { stroke-dasharray: 65 200; stroke-dashoffset: -99; }
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
  position: relative;
  width: 100%;
  max-width: 360px;
  background: var(--color-surface);
  border-radius: 16px;
  border: 1px solid var(--color-borderLight);
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.18), 0 2px 8px rgba(15, 23, 42, 0.06);
  padding: 32px 24px 20px;
  box-sizing: border-box;
  animation: ${dialogIn} 0.18s ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: ${contentIn} 0.2s ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const CloseGhost = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  border: none;
  background: transparent;
  color: var(--color-textSecondary);
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: color-mix(in srgb, var(--color-text) 6%, transparent);
    color: var(--color-text);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 1px;
  }
`;

type Tone = 'primary' | 'success' | 'error';

const toneVar = (tone: Tone) => `var(--color-${tone})`;

/** 状态图标：与圆环同尺寸，状态切换时视觉位置不跳动 */
const StatusIcon = styled.div<{ $tone: Tone }>`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${p => toneVar(p.$tone)};
  background: color-mix(in srgb, ${p => toneVar(p.$tone)} 12%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, ${p => toneVar(p.$tone)} 18%, transparent);
  animation: ${popIn} 0.32s cubic-bezier(0.2, 0.8, 0.3, 1.2);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const RingWrap = styled.div<{ $size: number }>`
  position: relative;
  width: ${p => p.$size}px;
  height: ${p => p.$size}px;
  flex-shrink: 0;
`;

const RingSvg = styled.svg<{ $indeterminate: boolean }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  ${p =>
    p.$indeterminate &&
    css`
      animation: ${ringRotate} 1.6s linear infinite;
    `}

  @media (prefers-reduced-motion: reduce) {
    animation-duration: 4s;
  }
`;

const RingTrack = styled.circle`
  fill: none;
  stroke: color-mix(in srgb, var(--color-primary) 14%, transparent);
`;

const RingArc = styled.circle<{ $indeterminate: boolean; $progress: number }>`
  fill: none;
  stroke: var(--color-primary);
  stroke-linecap: round;
  ${p =>
    p.$indeterminate
      ? css`
          animation: ${ringDash} 1.4s ease-in-out infinite;
        `
      : css`
        stroke-dasharray: ${p.$progress} 200;
        opacity: ${p.$progress > 0 ? 1 : 0};
        transition: stroke-dasharray 0.3s ease, opacity 0.2s ease;
      `}
`;

const RingCenter = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  pointer-events: none;
`;

const RingLogo = styled.img<{ $size: number }>`
  width: ${p => p.$size}px;
  height: ${p => p.$size}px;
  border-radius: 50%;
  object-fit: contain;
`;

const RingPercent = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  line-height: 1;
`;

/** progress 为 undefined 时显示不定进度（旋转伸缩弧），否则显示 0-100 的确定进度 */
const ProgressRing: React.FC<{ size: number; progress?: number }> = ({ size, progress }) => {
  const indeterminate = progress === undefined;
  const clamped = Math.max(0, Math.min(100, progress ?? 0));
  const stroke = size >= 96 ? 6 : 4;
  const r = (size - stroke) / 2;

  return (
    <RingWrap
      $size={size}
      role="progressbar"
      aria-label={indeterminate ? '正在检查更新' : '下载进度'}
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-valuenow={indeterminate ? undefined : Math.round(clamped)}
    >
      <RingSvg $indeterminate={indeterminate} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <RingTrack cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
        <RingArc
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          pathLength={100}
          $indeterminate={indeterminate}
          $progress={clamped}
        />
      </RingSvg>
      <RingCenter>
        <RingLogo $size={Math.round(size * (indeterminate ? 0.5 : 0.38))} src={LOGO_SRC} alt="" />
        {!indeterminate && <RingPercent>{clamped.toFixed(0)}%</RingPercent>}
      </RingCenter>
    </RingWrap>
  );
};

const Title = styled.h2`
  margin: 16px 0 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: -0.01em;
  line-height: 1.35;
`;

const ChipRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
  color: var(--color-textSecondary);
`;

const Chip = styled.span<{ $muted?: boolean }>`
  font-size: 12.5px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  padding: 3px 10px;
  border-radius: 999px;
  color: ${p => (p.$muted ? 'var(--color-textSecondary)' : 'var(--color-primary)')};
  background: ${p =>
    p.$muted
      ? 'color-mix(in srgb, var(--color-text) 6%, transparent)'
      : 'color-mix(in srgb, var(--color-primary) 11%, transparent)'};
`;

const Message = styled.p`
  margin: 12px 0 0;
  max-width: 280px;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--color-textSecondary);
  text-wrap: balance;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
  margin-top: 22px;

  & > button {
    flex: 1;
  }
`;

const Btn = styled.button<{ $primary?: boolean }>`
  height: 38px;
  padding: 0 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;
  border: 1px solid ${p => (p.$primary ? 'transparent' : 'var(--color-border)')};
  background: ${p => (p.$primary ? 'var(--color-primary)' : 'transparent')};
  color: ${p => (p.$primary ? '#fff' : 'var(--color-text)')};

  &:hover {
    background: ${p =>
      p.$primary
        ? 'color-mix(in srgb, var(--color-primary) 88%, #000)'
        : 'color-mix(in srgb, var(--color-text) 5%, transparent)'};
  }

  &:active {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
`;

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

  const currentChip = currentVersion ? <Chip>当前版本 v{currentVersion}</Chip> : null;

  const renderContent = () => {
    switch (status) {
      case 'checking':
        return (
          <>
            <ProgressRing size={64} />
            <Title id="update-dialog-title">正在检查更新</Title>
            {currentChip && <ChipRow>{currentChip}</ChipRow>}
            <Message>正在连接更新服务器，查询是否有新版本…</Message>
          </>
        );

      case 'no-update':
        return (
          <>
            <StatusIcon $tone="success">
              <MaterialIcon name="check" size={34} />
            </StatusIcon>
            <Title id="update-dialog-title">已是最新版本</Title>
            {currentChip && <ChipRow>{currentChip}</ChipRow>}
            <Message>当前安装的版本已是最新，无需更新。</Message>
            <ButtonRow>
              <Btn $primary type="button" onClick={onClose} autoFocus>
                好的
              </Btn>
            </ButtonRow>
          </>
        );

      case 'available':
        return (
          <>
            <StatusIcon $tone="primary">
              <MaterialIcon name="upgrade" size={34} />
            </StatusIcon>
            <Title id="update-dialog-title">发现新版本</Title>
            <ChipRow>
              {currentVersion && <Chip $muted>v{currentVersion}</Chip>}
              {currentVersion && version && <MaterialIcon name="arrow_forward" size={16} />}
              {version && <Chip>v{version}</Chip>}
            </ChipRow>
            <Message>检测到可用更新。是否立即下载？下载完成后可随时重启完成安装。</Message>
            <ButtonRow>
              <Btn type="button" onClick={onClose}>
                稍后
              </Btn>
              <Btn $primary type="button" onClick={onDownload} autoFocus>
                立即下载
              </Btn>
            </ButtonRow>
          </>
        );

      case 'downloading':
        return (
          <>
            <ProgressRing size={104} progress={progress} />
            <Title id="update-dialog-title">正在下载更新</Title>
            {version && (
              <ChipRow>
                <Chip>v{version}</Chip>
              </ChipRow>
            )}
            <Message>请保持网络畅通，也可以转到后台下载并关闭此窗口。</Message>
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
            <StatusIcon $tone="success">
              <MaterialIcon name="download_done" size={34} />
            </StatusIcon>
            <Title id="update-dialog-title">下载完成</Title>
            {version && (
              <ChipRow>
                <Chip>v{version}</Chip>
              </ChipRow>
            )}
            <Message>新版本已就绪，重启应用即可完成安装。</Message>
            <ButtonRow>
              <Btn type="button" onClick={onClose}>
                稍后重启
              </Btn>
              <Btn $primary type="button" onClick={onRestart} autoFocus>
                立即重启
              </Btn>
            </ButtonRow>
          </>
        );

      case 'error':
        return (
          <>
            <StatusIcon $tone="error">
              <MaterialIcon name="priority_high" size={34} />
            </StatusIcon>
            <Title id="update-dialog-title">检查失败</Title>
            {currentChip && <ChipRow>{currentChip}</ChipRow>}
            <Message>无法完成更新检查，请检查网络后重试，或稍后再试。</Message>
            <ButtonRow>
              <Btn $primary type="button" onClick={onClose} autoFocus>
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
      <Dialog
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="update-dialog-title"
      >
        <CloseGhost type="button" onClick={onClose} title="关闭" aria-label="关闭">
          <MaterialIcon name="close" size={20} />
        </CloseGhost>
        {/* key 使状态切换时内容淡入 */}
        <Content key={status}>{renderContent()}</Content>
      </Dialog>
    </Overlay>
  );
};

export default UpdateDialog;
