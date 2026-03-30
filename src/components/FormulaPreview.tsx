import React from 'react';
import styled from 'styled-components';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import MaterialIcon from './MaterialIcon';

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

const PreviewArea = styled.div`
  flex: 1;
  padding: 16px;
  border: 1.5px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface);
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  overflow: auto;
  box-sizing: border-box;
  position: relative;
  transition: border-color 0.2s ease;

  .katex-display {
    margin: 0;
    width: 100%;
    text-align: left;
  }

  .katex {
    font-size: 1.2em;
  }

  &::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 3px;
  }
`;

const ErrorMessage = styled.div`
  color: var(--color-error);
  font-size: 14px;
  padding: 10px 14px;
  background: color-mix(in srgb, var(--color-error) 8%, transparent);
  border-radius: 7px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

interface FormulaPreviewProps {
  latex: string;
  isLoading?: boolean;
}

const FormulaPreview: React.FC<FormulaPreviewProps> = ({
  latex,
  isLoading = false
}) => {
  const renderContent = () => {
    if (!latex.trim()) {
      return null;
    }

    try {
      return <BlockMath math={latex} errorColor={'var(--color-error)'} />;
    } catch (error) {
      return (
        <ErrorMessage>
          <MaterialIcon name="error_outline" size={16} />
          无法渲染公式，请检查 LaTeX 代码
        </ErrorMessage>
      );
    }
  };

  return (
    <Container>
      <Label>
        <MaterialIcon name="functions" size={14} /> 公式预览
      </Label>
      <PreviewArea>
        {renderContent()}
      </PreviewArea>
    </Container>
  );
};

export default FormulaPreview;
