import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import MaterialIcon from './MaterialIcon';

const pulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.04); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 8px;
`;

const Label = styled.h3`
  font-size: 12px;
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
  border: 1.5px dashed ${props => props.$isDragActive ? 'var(--color-primary)' : 'var(--color-border)'};
  border-radius: 12px;
  background: ${props => props.$isDragActive
    ? 'color-mix(in srgb, var(--color-primary) 5%, var(--color-surface))'
    : props.$hasImage ? 'var(--color-surface)' : 'color-mix(in srgb, var(--color-primary) 2%, var(--color-surface))'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 150px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  cursor: pointer;

  &:hover {
    border-color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary) 4%, var(--color-surface));
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
  animation: ${props => props.$isDragActive
    ? css`${pulse} 0.8s ease-in-out infinite`
    : css`${float} 3s ease-in-out infinite`
  };
  transition: all 0.25s ease;
`;

const PlaceholderTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.3;
`;

const PlaceholderSubtitle = styled.div`
  font-size: 12px;
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
  background: var(--color-surface);
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 8px;
  border: 1.5px solid var(--color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
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
