import React from 'react';
import styled from 'styled-components';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  background-color: rgba(250, 250, 252, 0.7);
  border-radius: 6px;
  padding: 5px;
`;

const Label = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 3px;
`;

const PreviewArea = styled.div`
  padding: 12px;
  min-height: 180px;
  height: 180px; /* 固定高度 */
  border: 1px solid #dce1e8;
  border-radius: 8px;
  background: linear-gradient(135deg, #fefefe 0%, #f9fafb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  box-sizing: border-box;
  position: relative;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
  
  /* 在不同大小的屏幕上调整高度 */
  @media (min-height: 900px) {
    height: 200px;
    min-height: 200px;
  }
  
  @media (min-height: 1080px) {
    height: 220px;
    min-height: 220px;
  }

  /* 添加淡色数学元素背景 */
  background-image: 
    repeating-linear-gradient(
      -45deg,
      rgba(245, 247, 250, 0.5) 0px,
      rgba(245, 247, 250, 0.5) 1px,
      transparent 1px,
      transparent 20px
    );

  .katex-display {
    margin: 0;
  }

  .katex {
    font-size: 1.15em;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 13px;
  padding: 8px;
  font-style: italic;
`;

const PlaceholderText = styled.div`
  color: #95a5a6;
  font-style: italic;
  font-size: 13px;
  text-align: center;
`;

interface FormulaPreviewProps {
  latex: string;
  isLoading?: boolean;
}

const FormulaPreview: React.FC<FormulaPreviewProps> = ({ 
  latex, 
  isLoading = false 
}) => {
  // 渲染预览区域内容
  const renderPreviewContent = () => {
    if (!latex.trim()) {
      return (
        <PlaceholderText>
          {isLoading ? "正在加载..." : "输入LaTeX代码后显示公式渲染效果"}
        </PlaceholderText>
      );
    }

    // 尝试渲染公式
    try {
      return <BlockMath math={latex} errorColor={'#e74c3c'} />;
    } catch (error) {
      return (
        <ErrorMessage>
          无法渲染公式，请检查LaTeX代码是否正确
        </ErrorMessage>
      );
    }
  };

  return (
    <Container>
      <Label>
        🔍 公式预览
      </Label>
      <PreviewArea>
        {renderPreviewContent()}
      </PreviewArea>
    </Container>
  );
};

export default FormulaPreview; 