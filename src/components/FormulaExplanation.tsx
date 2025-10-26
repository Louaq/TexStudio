import React, { useState } from 'react';
import styled from 'styled-components';
import MaterialIcon from './MaterialIcon';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { FormulaExplanation as ExplanationType, ModelScopeConfig } from '../types';
import { explainFormulaWithModelScope } from '../utils/api';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  border-radius: 6px;
  padding: 5px;
  box-sizing: border-box;
  overflow: hidden; /* 防止内容溢出 */
  max-width: 100%; /* 确保容器不超出父元素宽度 */
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  padding: 0 3px 0 0;
  height: 24px;
  min-height: 24px;
  width: 100%; /* 确保头部宽度与容器一致 */
  box-sizing: border-box;
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0; /* 防止按钮组被压缩 */
`;

const Label = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
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
  color: white;
  opacity: ${props => props.disabled ? 0.6 : 1};
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; /* 防止按钮被压缩 */
  background: ${props => props.disabled 
    ? 'linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%)'
    : 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
  };

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--color-buttonHoverStart) 0%, var(--color-buttonHoverEnd) 100%);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const ClearButton = styled.button<{ disabled: boolean }>`
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
    : 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
  };
  color: white;
  opacity: ${props => props.disabled ? 0.6 : 1};
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; /* 防止按钮被压缩 */

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #ec7063 0%, var(--color-error) 100%);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const ContentArea = styled.div`
  flex: 1;
  min-height: 150px;
  max-height: calc(100% - 30px); /* 确保不超出父容器高度，减去头部高度 */
  height: auto; /* 自动高度，让它充分利用父容器的空间 */
  border-radius: 8px;
  overflow-y: auto;
  box-sizing: border-box;
  position: relative;
  
  /* 修改滚动条样式，确保滚动条在容器内部 */
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px; /* 添加水平滚动条高度 */
  }

  &::-webkit-scrollbar-track {
    background: var(--color-borderLight);
    border-radius: 3px;
    margin: 2px; /* 给滚动条轨道添加边距 */
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--color-textSecondary);
  }
  
  /* 确保KaTeX公式正确显示 */
  .katex-display {
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 5px;
  }
`;

const PlaceholderText = styled.div`
  color: #95a5a6;
  font-style: italic;
  font-size: 13px;
  text-align: center;
  display: flex;
  height: 100%;
  line-height: 1.5;
  width: 100%; /* 确保宽度不超过父容器 */
  box-sizing: border-box;
  padding: 0 10px; /* 添加水平内边距 */
`;

const ExplanationContent = styled.div`
  color: #2c3e50;
  font-size: 13px;
  line-height: 1.6;
  word-wrap: break-word;
  overflow-x: hidden; /* 防止水平溢出 */
  width: 100%; /* 确保内容宽度不超过父容器 */

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
    max-width: 100%; /* 确保不超出父容器宽度 */
  }

  blockquote {
    padding-left: 12px;
    margin: 8px 0;
    color: #34495e;
    font-style: italic;
  }

  /* KaTeX 数学公式样式 */
  .katex {
    font-size: 1em;
    max-width: 100%;
  }

  .katex-display {
    margin: 12px 0;
    text-align: center;
    overflow-x: auto; /* 允许数学公式水平滚动 */
    max-width: 100%; /* 限制最大宽度 */
    padding: 0 2px; /* 添加一点内边距，防止贴边 */
    display: block; /* 确保公式独占一行 */
  }

  /* 确保数学公式在容器内正确显示 */
  .katex-html {
    overflow-x: auto;
    overflow-y: visible;
    max-width: 100%; /* 限制最大宽度 */
    padding-bottom: 5px; /* 添加底部内边距，防止滚动条遮挡 */
  }
  
  /* 包装长公式 */
  .math-display {
    max-width: 100%;
    overflow-x: auto;
    margin: 10px 0;
    padding-bottom: 5px;
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
  width: 100%; /* 确保宽度不超过父容器 */
  box-sizing: border-box;
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid #e1e8ed;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  flex-shrink: 0; /* 防止spinner被压缩 */

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
  margin: 8px 0;
  width: calc(100% - 24px); /* 计算实际宽度，考虑内边距 */
  box-sizing: border-box;
  word-wrap: break-word; /* 确保长文本可以换行 */
`;

const Timestamp = styled.div`
  color: #7f8c8d;
  font-size: 11px;
  text-align: right;
  margin-top: 8px;
  font-style: italic;
  padding-right: 2px; /* 添加右侧内边距，防止贴边 */
  box-sizing: border-box;
  width: 100%; /* 确保宽度不超过父容器 */
`;

const ConfigMissingText = styled.div`
  font-size: 13px;
  text-align: left;
  display: flex;
  height: 100%;
  line-height: 1.5;
  border-radius: 6px;
  width: calc(100% - 24px); /* 计算实际宽度，考虑内边距 */
  box-sizing: border-box;
  color: #7f8c8d;
  align-items: flex-start; /* 顶部对齐 */
  justify-content: flex-start; /* 左侧对齐 */
`;









interface FormulaExplanationProps {
  latex: string;
  modelScopeConfig?: ModelScopeConfig;
  resetKey?: number;
}

const FormulaExplanationComponent: React.FC<FormulaExplanationProps> = ({
  latex,
  modelScopeConfig,
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

    if (!modelScopeConfig?.apiKey || !modelScopeConfig.enabled) {
      setExplanation(prev => ({
        ...prev,
        error: '请先在设置中配置魔搭 API 密钥并启用功能'
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
      const result = await explainFormulaWithModelScope(
        latex, 
        modelScopeConfig.apiKey,
        modelScopeConfig.model
      );
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

  const handleClear = () => {
    setExplanation({
      content: '',
      timestamp: '',
      isLoading: false,
      error: undefined
    });
  };

  const renderContent = () => {
    if (!latex.trim()) {
      return (
        <PlaceholderText>
          输入 LaTeX 公式后，点击"解释公式"按钮获取 AI 解释
        </PlaceholderText>
      );
    }

    if (!modelScopeConfig?.apiKey || !modelScopeConfig.enabled) {
      return (
        <ConfigMissingText>
          <span style={{display:'inline-flex',alignItems:'center',gap:4, fontStyle:'italic', color:'#95a5a6', padding: '0 10px'}}>
            请先在设置中配置魔搭 API 密钥并启用此功能
          </span>
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
          <span style={{display:'inline-flex',alignItems:'center',gap:4}}>
            <MaterialIcon name="error" /> {explanation.error}
          </span>
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
                pre: ({ children }) => <pre style={{ maxWidth: '100%', overflowX: 'auto' }}>{children}</pre>,
                blockquote: ({ children }) => <blockquote>{children}</blockquote>,
                // 移除不支持的math和inlineMath组件
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

  const isExplainDisabled = !latex.trim() || 
                           !modelScopeConfig?.apiKey || 
                           !modelScopeConfig.enabled || 
                           explanation.isLoading;

  const isClearDisabled = !explanation.content && 
                         !explanation.error && 
                         !explanation.isLoading;

  return (
    <Container>
      <Header>
        <Label>
          <MaterialIcon name="smart_toy" /> AI 公式解释
        </Label>
        <ButtonGroup>
          <ExplainButton 
            onClick={handleExplain}
            disabled={isExplainDisabled}
          >
            {explanation.isLoading ? '解释中...' : '解释公式'}
          </ExplainButton>
          <ClearButton 
            onClick={handleClear}
            disabled={isClearDisabled}
            title="清除解释内容"
          >
            清除
          </ClearButton>
        </ButtonGroup>
      </Header>
      <ContentArea>
        {renderContent()}
      </ContentArea>
    </Container>
  );
};

export default FormulaExplanationComponent; 