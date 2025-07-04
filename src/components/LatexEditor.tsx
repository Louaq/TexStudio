import React from 'react';
import styled from 'styled-components';

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

const TextArea = styled.textarea<{ readOnly: boolean }>`
  height: 180px; /* 固定高度 */
  min-height: 180px;
  max-height: 180px;
  padding: 12px;
  border: 1px solid #dce1e8;
  border-radius: 8px;
  background: ${props => props.readOnly 
    ? 'linear-gradient(135deg, #f8f9fa 0%, #f5f7fa 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)'
  };
  color: #2c3e50;
  font-family: "Cascadia Code", "Consolas", "Monaco", monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: none; /* 禁用调整大小 */
  transition: all 0.2s ease;
  opacity: ${props => props.readOnly ? 0.7 : 1};
  cursor: ${props => props.readOnly ? 'not-allowed' : 'text'};
  overflow-y: auto;
  box-sizing: border-box;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
  
  /* 在不同大小的屏幕上调整高度 */
  @media (min-height: 900px) {
    height: 200px;
    min-height: 200px;
    max-height: 200px;
  }
  
  @media (min-height: 1080px) {
    height: 220px;
    min-height: 220px;
    max-height: 220px;
  }

  &:focus {
    outline: none;
    border-color: #4a90e2;
    background: white;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05), 0 0 0 2px rgba(74, 144, 226, 0.1);
  }

  &::placeholder {
    color: #95a5a6;
    font-style: italic;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
  }
`;

const LoadingOverlay = styled.div<{ show: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(248, 249, 250, 0.8);
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  backdrop-filter: blur(2px);
`;

const LoadingText = styled.div`
  color: #4a90e2;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
`;

const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #e1e8ed;
  border-top: 2px solid #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EditorContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden; /* 防止超出容器 */
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
  placeholder = "LaTeX代码将在此处显示..."
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!readOnly) {
      onChange(e.target.value);
    }
  };

  return (
    <Container>
      <Label>
        📝 LaTeX代码
      </Label>
      <EditorContainer>
        <TextArea
          value={value}
          onChange={handleChange}
          readOnly={readOnly}
          placeholder={placeholder}
          spellCheck={false}
        />
        <LoadingOverlay show={readOnly && !value}>
          <LoadingText>
            <Spinner />
            正在识别中...
          </LoadingText>
        </LoadingOverlay>
      </EditorContainer>
    </Container>
  );
};

export default LatexEditor; 