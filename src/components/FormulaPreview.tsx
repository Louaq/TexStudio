import React from 'react';
import styled from 'styled-components';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Label = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PreviewArea = styled.div`
  padding: 12px;
  min-height: 80px;
  height: 100%;
  border: 2px solid #e1e8ed;
  border-radius: 10px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-x: auto;

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
  // 如果没有LaTeX代码，显示占位符
  if (!latex.trim()) {
    return (
      <Container>
        <Label>
          🔍 公式预览
        </Label>
        <PreviewArea>
          <PlaceholderText>
            {isLoading ? "正在加载..." : "输入LaTeX代码后显示公式渲染效果"}
          </PlaceholderText>
        </PreviewArea>
      </Container>
    );
  }

  // 尝试渲染公式，如果出错显示错误信息
  try {
    return (
      <Container>
        <Label>
          🔍 公式预览
        </Label>
        <PreviewArea>
          <BlockMath math={latex} errorColor={'#e74c3c'} />
        </PreviewArea>
      </Container>
    );
  } catch (error) {
    return (
      <Container>
        <Label>
          🔍 公式预览
        </Label>
        <PreviewArea>
          <ErrorMessage>
            无法渲染公式，请检查LaTeX代码是否正确
          </ErrorMessage>
        </PreviewArea>
      </Container>
    );
  }
};

export default FormulaPreview; 