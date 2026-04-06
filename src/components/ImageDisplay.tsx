import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import MaterialIcon from './MaterialIcon';
import { glassBackdrop } from '../theme/themes';

const pulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.04); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 8px;
`;

const Label = styled.h3`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-textSecondary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

const ImageContainer = styled.div<{ $isDragActive: boolean; $hasImage: boolean }>`
  flex: 1;
  ${glassBackdrop}
  border: 1.5px dashed ${props => props.$isDragActive ? 'var(--color-primary)' : 'var(--color-border)'};
  border-radius: 12px;
  background: ${props => props.$isDragActive
    ? 'color-mix(in srgb, var(--color-primary) 8%, var(--glass-bg-card))'
    : props.$hasImage
      ? 'color-mix(in srgb, var(--glass-bg-card) 92%, transparent)'
      : 'color-mix(in srgb, var(--color-primary) 3%, var(--glass-bg-card))'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 150px;
  transition: border-color 0.12s ease, background 0.12s ease;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  cursor: pointer;

  &:hover {
    border-color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary) 6%, var(--glass-bg-card));
  }
`;

const PlaceholderContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px;
  text-align: center;
`;

const IconWrapper = styled.div<{ $isDragActive: boolean }>`
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  animation: ${props =>
    props.$isDragActive ? css`${pulse} 0.8s ease-in-out infinite` : 'none'};
  transition: background 0.12s ease, color 0.12s ease;
`;

const PlaceholderTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.3;
`;

const PlaceholderSubtitle = styled.div`
  font-size: 13px;
  color: var(--color-textSecondary);
  line-height: 1.5;
`;

const Image = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
`;

const DragOverlay = styled.div<{ $show: boolean }>`
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--color-primary) 8%, transparent);
  display: ${props => props.$show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  border-radius: 11px;
`;

const DragLabel = styled.div`
  background: color-mix(in srgb, var(--glass-bg-strong) 90%, transparent);
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 8px;
  border: 1.5px solid var(--color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
`;

interface ImageDisplayProps {
  imageUrl: string | null;
  isDragActive: boolean;
  isRecognizing: boolean;
  onUpload?: () => void;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({
  imageUrl,
  isDragActive,
  isRecognizing,
  onUpload
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpload) {
      onUpload();
    }
  };

  return (
    <Container>
      <Label>
        <MaterialIcon name="image" size={14} /> 识别图片
      </Label>
      <ImageContainer
        $isDragActive={isDragActive}
        $hasImage={!!imageUrl}
        onClick={handleClick}
      >
        {imageUrl ? (
          <Image src={imageUrl} alt="待识别的图片" />
        ) : (
          <PlaceholderContent>
            <IconWrapper $isDragActive={isDragActive}>
              <MaterialIcon name={isDragActive ? 'drive_folder_upload' : 'photo_camera'} size={26} />
            </IconWrapper>
            <PlaceholderTitle>
              {isDragActive ? '释放以开始识别' : '拖拽图片或点击上传'}
            </PlaceholderTitle>
            <PlaceholderSubtitle>
              支持 PNG · JPG · BMP · GIF，最大 10 MB
            </PlaceholderSubtitle>
          </PlaceholderContent>
        )}

        <DragOverlay $show={isDragActive}>
          <DragLabel>
            <MaterialIcon name="drive_folder_upload" size={18} />
            释放文件开始识别
          </DragLabel>
        </DragOverlay>
      </ImageContainer>
    </Container>
  );
};

export default ImageDisplay;
