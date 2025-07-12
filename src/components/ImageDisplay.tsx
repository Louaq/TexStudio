import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: rgba(250, 250, 252, 0.7);
  border-radius: 6px;
  padding: 5px;
`;

const Label = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #3a4a5b;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 3px;
`;

const ImageContainer = styled.div<{ isDragActive: boolean }>`
  flex: 1;
  border: 1px dashed ${props => props.isDragActive ? '#4375b9' : '#dce1e8'};
  border-radius: 8px;
  background: ${props => props.isDragActive 
    ? 'linear-gradient(135deg, rgba(67, 117, 185, 0.08) 0%, rgba(67, 117, 185, 0.04) 100%)'
    : 'linear-gradient(135deg, #fefefe 0%, #f7f9fc 100%)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 150px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  /* 确保虚线边框完全可见 */
  box-sizing: border-box;
  cursor: pointer;

  /* 添加淡色网格背景，类似于科学论文中的图表网格 */
  background-image: 
    linear-gradient(rgba(220, 225, 232, 0.3) 1px, transparent 1px),
    linear-gradient(90deg, rgba(220, 225, 232, 0.3) 1px, transparent 1px);
  background-size: 20px 20px;

  &:hover {
    border-color: #4375b9;
    background: linear-gradient(135deg, rgba(67, 117, 185, 0.05) 0%, rgba(67, 117, 185, 0.02) 100%);
  }
`;

const PlaceholderText = styled.div`
  text-align: center;
  color: #4a6583;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.4;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 15px;
  border-radius: 8px;
`;

const Image = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
`;

const DragOverlay = styled.div<{ show: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(67, 117, 185, 0.1);
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  backdrop-filter: blur(1px);
`;

const DragText = styled.div`
  color: #4375b9;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  padding: 16px;
  border: 1px solid #4375b9;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
`;

const ManualRecognizeButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(46, 204, 113, 0.25);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(8px);
  z-index: 10;
  min-width: 120px;
  justify-content: center;
  letter-spacing: 0.5px;

  &:active {
    transform: translateY(-1px) scale(1.01);
    box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
  }

  &:disabled {
    background: linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%);
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 8px rgba(149, 165, 166, 0.15);
    
    &:hover {
      transform: none;
      box-shadow: 0 2px 8px rgba(149, 165, 166, 0.15);
    }
  }
`;

interface ImageDisplayProps {
  imageUrl: string | null;
  isDragActive: boolean;
  isAutoRecognition: boolean;
  isRecognizing: boolean;
  onUpload?: () => void;
  onManualRecognize?: () => void;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ 
  imageUrl, 
  isDragActive, 
  isAutoRecognition, 
  isRecognizing,
  onUpload,
  onManualRecognize 
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpload) {
      onUpload();
    }
  };

  const handleManualRecognize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onManualRecognize) {
      onManualRecognize();
    }
  };

  return (
    <Container>
      <Label>
        🖼️ 识别图片
      </Label>
      <ImageContainer isDragActive={isDragActive} onClick={handleClick}>
        {imageUrl ? (
          <>
            <Image src={imageUrl} alt="待识别的图片" />
            {/* 只在手动模式且有图片时显示识别按钮 */}
            {!isAutoRecognition && imageUrl && (
              <ManualRecognizeButton 
                onClick={handleManualRecognize}
                disabled={isRecognizing}
              >
                {isRecognizing ? (
                  <>🔄 识别中...</>
                ) : (
                  <>🤖 开始识别</>
                )}
              </ManualRecognizeButton>
            )}
          </>
        ) : (
          <PlaceholderText>
            📷 将在此处显示识别的图片
            <br />
            <small style={{ color: '#95a5a6', fontSize: '14px', marginTop: '8px', display: 'block' }}>
              点击此区域选择图片或拖拽图片文件到此处
            </small>
          </PlaceholderText>
        )}
        
        <DragOverlay show={isDragActive}>
          <DragText>
            📁 释放文件开始识别
          </DragText>
        </DragOverlay>
      </ImageContainer>
    </Container>
  );
};

export default ImageDisplay; 