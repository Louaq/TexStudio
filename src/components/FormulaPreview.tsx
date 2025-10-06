import React from 'react';
import styled from 'styled-components';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import MaterialIcon from './MaterialIcon';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  border-radius: 6px;
  padding: 5px 5px 7px 5px; /* 增加底部内边距 */
  overflow: visible; /* 确保内容不被裁剪 */
`;

const Label = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 3px;
`;

const PreviewArea = styled.div`
  padding: 12px;
  min-height: 226px; /* 与LatexEditor保持一致 */
  height: 226px; /* 与LatexEditor保持一致 */
  border: 2px solid var(--color-border); /* 增加边框宽度使其更明显 */
  border-radius: 8px;
  background: var(--color-surface);
  display: flex;
  overflow: auto;
  box-sizing: border-box;
  position: relative;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 2px; /* 添加底部边距 */
  
  /* 在不同大小的屏幕上调整高度 */
  @media (min-height: 900px) {
    height: 226px;
    min-height: 226px;
  }
  
  @media (min-height: 1080px) {
    height: 226px;
    min-height: 226px;
  }

  .katex-display {
    margin: 0;
  }

  .katex {
    font-size: 1.15em;
  }
`;

const ErrorMessage = styled.div`
  color: var(--color-error);
  font-size: 13px;
  padding: 8px;
  font-style: italic;
`;

const PlaceholderText = styled.div`
  color: var(--color-textSecondary);
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
        <MaterialIcon name="search" /> 公式预览
      </Label>
      <PreviewArea>
        {renderPreviewContent()}
      </PreviewArea>
    </Container>
  );
};

export default FormulaPreview; 