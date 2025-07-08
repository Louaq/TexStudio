import React, { useState } from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { FormulaExplanation as ExplanationType, DeepSeekConfig } from '../types';
import { explainFormulaWithDeepSeek } from '../utils/api';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  background-color: rgba(250, 250, 252, 0.7);
  border-radius: 6px;
  padding: 5px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 0 3px 0 0;
  height: 20px;
  min-height: 20px;
`;

const Label = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 3px;
`;

const ExplainButton = styled.button<{ disabled: boolean }>`
  padding: 2px 8px;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  height: 20px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  background: ${props => props.disabled 
    ? 'linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%)'
    : 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
  };
  color: white;
  opacity: ${props => props.disabled ? 0.6 : 1};
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #5dade2 0%, #3498db 100%);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 12px;
  min-height: 180px;
  height: 180px;
  border: 1px solid #dce1e8;
  border-radius: 8px;
  background: linear-gradient(135deg, #fefefe 0%, #f9fafb 100%);
  overflow-y: auto;
  box-sizing: border-box;
  position: relative;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
  
  @media (min-height: 900px) {
    height: 200px;
    min-height: 200px;
  }
  
  @media (min-height: 1080px) {
    height: 220px;
    min-height: 220px;
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

const PlaceholderText = styled.div`
  color: #95a5a6;
  font-style: italic;
  font-size: 13px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  line-height: 1.5;
`;

const ExplanationContent = styled.div`
  color: #2c3e50;
  font-size: 13px;
  line-height: 1.6;
  word-wrap: break-word;

  /* Markdown 样式 */
  h1, h2, h3, h4, h5, h6 {
    color: #2c3e50;
    margin: 12px 0 8px 0;
    font-weight: 600;
  }

  h1 { font-size: 16px; }
  h2 { font-size: 15px; }
  h3 { font-size: 14px; }
  h4 { font-size: 13px; }
  h5 { font-size: 12px; }
  h6 { font-size: 12px; }

  p {
    margin: 8px 0;
    line-height: 1.6;
  }

  strong {
    font-weight: 600;
    color: #2c3e50;
  }

  em {
    font-style: italic;
    color: #34495e;
  }

  ul, ol {
    margin: 8px 0;
    padding-left: 20px;
  }

  li {
    margin: 4px 0;
    line-height: 1.5;
  }

  code {
    background: rgba(52, 152, 219, 0.1);
    color: #2c3e50;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: "Cascadia Code", "Consolas", "Monaco", monospace;
    font-size: 12px;
  }

  pre {
    background: rgba(52, 152, 219, 0.05);
    padding: 8px;
    border-radius: 4px;
    overflow-x: auto;
    margin: 8px 0;
  }

  blockquote {
    border-left: 3px solid #3498db;
    padding-left: 12px;
    margin: 8px 0;
    color: #34495e;
    font-style: italic;
  }

  /* KaTeX 数学公式样式 */
  .katex {
    font-size: 1em;
  }

  .katex-display {
    margin: 12px 0;
    text-align: center;
  }

  /* 确保数学公式在容器内正确显示 */
  .katex-html {
    overflow-x: auto;
    overflow-y: visible;
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #3498db;
  font-size: 13px;
  gap: 10px;
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid #e1e8ed;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 13px;
  text-align: center;
  padding: 12px;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 6px;
  border-left: 4px solid #e74c3c;
  margin: 8px 0;
`;

const Timestamp = styled.div`
  color: #7f8c8d;
  font-size: 11px;
  text-align: right;
  margin-top: 8px;
  font-style: italic;
`;

const ConfigMissingText = styled.div`
  color: #f39c12;
  font-size: 13px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  line-height: 1.5;
  background: rgba(243, 156, 18, 0.1);
  border-radius: 6px;
  padding: 12px;
  border-left: 4px solid #f39c12;
`;

interface FormulaExplanationProps {
  latex: string;
  deepSeekConfig?: DeepSeekConfig;
  resetKey?: number;
}

const FormulaExplanationComponent: React.FC<FormulaExplanationProps> = ({
  latex,
  deepSeekConfig,
  resetKey
}) => {
  const [explanation, setExplanation] = useState<ExplanationType>({
    content: '',
    timestamp: '',
    isLoading: false
  });

  // 监听resetKey变化，重置解释内容
  React.useEffect(() => {
    if (resetKey !== undefined) {
      setExplanation({
        content: '',
        timestamp: '',
        isLoading: false
      });
    }
  }, [resetKey]);

  const handleExplain = async () => {
    if (!latex.trim()) {
      return;
    }

    if (!deepSeekConfig?.apiKey || !deepSeekConfig.enabled) {
      setExplanation(prev => ({
        ...prev,
        error: '请先在设置中配置 DeepSeek API 密钥并启用功能'
      }));
      return;
    }

    setExplanation({
      content: '',
      timestamp: '',
      isLoading: true,
      error: undefined
    });

    try {
      const result = await explainFormulaWithDeepSeek(latex, deepSeekConfig.apiKey);
      const timestamp = new Date().toLocaleString('zh-CN');
      
      setExplanation({
        content: result,
        timestamp,
        isLoading: false
      });
    } catch (error) {
      setExplanation({
        content: '',
        timestamp: '',
        isLoading: false,
        error: error instanceof Error ? error.message : '解释公式时发生未知错误'
      });
    }
  };

  const renderContent = () => {
    if (!latex.trim()) {
      return (
        <PlaceholderText>
          输入 LaTeX 公式后，点击"解释公式"按钮获取 AI 解释
        </PlaceholderText>
      );
    }

    if (!deepSeekConfig?.apiKey || !deepSeekConfig.enabled) {
      return (
        <ConfigMissingText>
          ⚙️ 请先在设置中配置 DeepSeek API 密钥并启用此功能
        </ConfigMissingText>
      );
    }

    if (explanation.isLoading) {
      return (
        <LoadingIndicator>
          <Spinner />
          正在分析公式，请稍候...
        </LoadingIndicator>
      );
    }

    if (explanation.error) {
      return (
        <ErrorMessage>
          ❌ {explanation.error}
        </ErrorMessage>
      );
    }

    if (explanation.content) {
      return (
        <>
          <ExplanationContent>
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                // 自定义组件以确保样式正确
                p: ({ children }) => <p>{children}</p>,
                h1: ({ children }) => <h1>{children}</h1>,
                h2: ({ children }) => <h2>{children}</h2>,
                h3: ({ children }) => <h3>{children}</h3>,
                h4: ({ children }) => <h4>{children}</h4>,
                h5: ({ children }) => <h5>{children}</h5>,
                h6: ({ children }) => <h6>{children}</h6>,
                strong: ({ children }) => <strong>{children}</strong>,
                em: ({ children }) => <em>{children}</em>,
                ul: ({ children }) => <ul>{children}</ul>,
                ol: ({ children }) => <ol>{children}</ol>,
                li: ({ children }) => <li>{children}</li>,
                code: ({ children }) => <code>{children}</code>,
                pre: ({ children }) => <pre>{children}</pre>,
                blockquote: ({ children }) => <blockquote>{children}</blockquote>,
              }}
            >
              {explanation.content}
            </ReactMarkdown>
          </ExplanationContent>
          <Timestamp>
            解释时间: {explanation.timestamp}
          </Timestamp>
        </>
      );
    }

    return (
      <PlaceholderText>
        点击"解释公式"按钮获取 AI 解释
      </PlaceholderText>
    );
  };

  const isButtonDisabled = !latex.trim() || 
                          !deepSeekConfig?.apiKey || 
                          !deepSeekConfig.enabled || 
                          explanation.isLoading;

  return (
    <Container>
      <Header>
        <Label>
          🤖 AI 公式解释
        </Label>
        <ExplainButton 
          onClick={handleExplain}
          disabled={isButtonDisabled}
        >
          {explanation.isLoading ? '解释中...' : '解释公式'}
        </ExplainButton>
      </Header>
      <ContentArea>
        {renderContent()}
      </ContentArea>
    </Container>
  );
};

export default FormulaExplanationComponent; 