import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Label = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 15px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ImageContainer = styled.div<{ isDragActive: boolean }>`
  flex: 1;
  border: 3px dashed ${props => props.isDragActive ? '#4a90e2' : '#cbd5e0'};
  border-radius: 12px;
  background: ${props => props.isDragActive 
    ? 'linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(74, 144, 226, 0.05) 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  /* 确保虚线边框完全可见 */
  box-sizing: border-box;

  &:hover {
    border-color: #4a90e2;
    background: linear-gradient(135deg, rgba(74, 144, 226, 0.05) 0%, rgba(74, 144, 226, 0.02) 100%);
  }
`;

const PlaceholderText = styled.div`
  text-align: center;
  color: #7f8c8d;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
`;

const Image = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const DragOverlay = styled.div<{ show: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(74, 144, 226, 0.2);
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  backdrop-filter: blur(2px);
`;

const DragText = styled.div`
  color: #4a90e2;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  padding: 20px;
  border: 2px solid #4a90e2;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
`;

interface ImageDisplayProps {
  imageUrl: string | null;
  isDragActive: boolean;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl, isDragActive }) => {
  return (
    <Container>
      <Label>
        🖼️ 识别图片
      </Label>
      <ImageContainer isDragActive={isDragActive}>
        {imageUrl ? (
          <Image src={imageUrl} alt="待识别的图片" />
        ) : (
          <PlaceholderText>
            📷 将在此处显示识别的图片
            <br />
            <small style={{ color: '#95a5a6', fontSize: '14px', marginTop: '8px', display: 'block' }}>
              支持拖拽图片文件到此处
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