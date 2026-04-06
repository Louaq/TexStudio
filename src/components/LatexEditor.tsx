import React from 'react';
import styled, { keyframes } from 'styled-components';
import MaterialIcon from './MaterialIcon';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 8px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
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

const EditorWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  overflow: hidden;
  border: 1.5px solid var(--color-border);
  transition: border-color 0.2s ease;
`;

const TextArea = styled.textarea<{ $readOnly: boolean }>`
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 12px 14px;
  border: none;
  outline: none;
  color: var(--color-text);
  background: var(--color-inputBackground);
  font-family: "Cascadia Code", "Fira Code", "Consolas", "Monaco", "Courier New", monospace;
  font-size: 14px;
  line-height: 1.7;
  resize: none;
  opacity: ${props => props.$readOnly ? 0.6 : 1};
  cursor: ${props => props.$readOnly ? 'not-allowed' : 'text'};
  overflow-y: auto;
  box-sizing: border-box;

  &::placeholder {
    color: var(--color-textSecondary);
    font-style: italic;
    font-family: "Segoe UI", "Microsoft YaHei", sans-serif;
  }

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--color-textSecondary);
  }
`;

const LoadingOverlay = styled.div<{ $show: boolean }>`
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--color-surface) 85%, transparent);
  display: ${props => props.$show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  border-radius: 8px;
`;

const LoadingContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 500;
`;

const Spinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid color-mix(in srgb, var(--color-primary) 25%, transparent);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  flex-shrink: 0;
`;

interface LatexEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

const LatexEditor: React.FC<LatexEditorProps> = ({
  value,
  onChange,
  readOnly = false,
  placeholder = ''
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!readOnly) {
      onChange(e.target.value);
    }
  };

  return (
    <Container>
      <Header>
        <Label>
          <MaterialIcon name="code" size={14} /> LaTeX 代码
        </Label>
      </Header>
      <EditorWrapper>
        <TextArea
          value={value}
          onChange={handleChange}
          $readOnly={readOnly}
          placeholder={placeholder}
          spellCheck={false}
          readOnly={readOnly}
        />
        <LoadingOverlay $show={readOnly && !value}>
          <LoadingContent>
            <Spinner />
            正在识别中...
          </LoadingContent>
        </LoadingOverlay>
      </EditorWrapper>
    </Container>
  );
};

export default LatexEditor;
