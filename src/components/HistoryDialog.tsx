import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { HistoryItem, CopyMode } from '../types';
import { formatLatex } from '../utils/api';
// 引入KaTeX相关库
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import MaterialIcon from './MaterialIcon';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const Dialog = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid #e1e8ed;
  animation: slideIn 0.3s ease;
  display: flex;
  flex-direction: column;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

// 自定义确认对话框样式
const ConfirmDialog = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid #e1e8ed;
  animation: slideIn 0.3s ease;
  display: flex;
  flex-direction: column;
  z-index: 1100;
`;

const ConfirmTitle = styled.h3`
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ConfirmMessage = styled.p`
  color: #34495e;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 24px;
`;

const ConfirmButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const ConfirmButton = styled.button<{ variant?: 'primary' | 'danger' | 'cancel' }>`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  ${props => {
    if (props.variant === 'danger') {
      return `
        background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
        color: white;
        &:hover {
          background: linear-gradient(135deg, #e55347 0%, #d2433a 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(231, 76, 60, 0.3);
        }
      `;
    } else if (props.variant === 'cancel') {
      return `
        background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
        color: white;
        &:hover {
          background: linear-gradient(135deg, #a4b3b6 0%, #8e9b9d 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(127, 140, 141, 0.3);
        }
      `;
    } else {
      return `
        background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
        color: white;
        &:hover {
          background: linear-gradient(135deg, #5ba0f2 0%, #458bcd 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(74, 144, 226, 0.3);
        }
      `;
    }
  }}
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ClearButton = styled.button`
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;

  &:hover {
    background: linear-gradient(135deg, #e55347 0%, #d2433a 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(231, 76, 60, 0.2);
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
  }
`;

const HistoryItemContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
  position: relative;
  min-width: 0;
`;

const DateLabel = styled.div`
  color: #7f8c8d;
  font-size: 12px;
  font-weight: 500;
`;

const ItemHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2c3e50;
  font-size: 13px;
`;

const Tag = styled.span`
  padding: 2px 6px;
  border-radius: 6px;
  background: #eef3fb;
  color: #3b6db2;
  font-size: 12px;
  border: 1px solid #d9e4f6;
`;

const DeleteIconButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: #7f8c8d;
  padding: 4px;
  border-radius: 6px;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    color: #c0392b;
  }
`;

// 显示模式类型
type DisplayMode = 'rendered' | 'source';

// 修改LatexCode样式组件，添加渲染模式样式
const LatexCode = styled.div<{ mode?: DisplayMode }>`
  background: ${props => props.mode === 'rendered' ? 'white' : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'};
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 12px;
  font-family: ${props => props.mode === 'rendered' ? 'inherit' : '"Cascadia Code", "Consolas", monospace'};
  font-size: ${props => props.mode === 'rendered' ? '16px' : '13px'};
  color: #2c3e50;
  max-height: 80px;
  overflow: hidden;
  margin-bottom: 12px;
  word-break: ${props => props.mode === 'rendered' ? 'normal' : 'break-all'};
  text-align: left;
  display: block;
  min-height: 60px;
  position: relative;
  
  ${props => props.mode === 'rendered' && `
    .katex-display {
      margin: 0;
    }
    .katex {
      font-size: 1.05em;
      display: inline-block; /* 保持整体作为一个内联块，让外层负责溢出处理 */
      max-width: 100%;
    }
    .katex .katex-html {
      display: block; /* 保持 KaTeX 内部正常排版，不再做省略 */
      max-width: 100%;
    }
  `}
`;

const Ellipsis = styled.div`
  width: 100%;
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis; /* 仅在实际溢出时显示结尾省略号 */
`;

// 添加模式切换按钮样式
const ModeToggleButton = styled.button<{ active: boolean }>`
  background: ${props => props.active ? 
    'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)' : 
    'linear-gradient(135deg, #ecf0f1 0%, #bdc3c7 100%)'};
  color: ${props => props.active ? 'white' : '#7f8c8d'};
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 50px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

// 添加模式切换容器
const ModeToggleContainer = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
  justify-content: flex-start;
`;

// 添加错误显示组件
const ErrorDisplay = styled.div`
  color: #e74c3c;
  font-size: 12px;
  font-style: italic;
  text-align: center;
  padding: 8px;
  background: #fdf2f2;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'danger' }>`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 80px;
  justify-content: center;

  ${props => props.variant === 'danger' ? `
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    color: white;

    &:hover {
      background: linear-gradient(135deg, #e55347 0%, #d2433a 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(231, 76, 60, 0.2);
    }
  ` : `
    background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
    color: white;

    &:hover {
      background: linear-gradient(135deg, #5ba0f2 0%, #458bcd 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(74, 144, 226, 0.2);
    }
  `}
`;

const EmptyState = styled.div`
  text-align: center;
  color: #7f8c8d;
  padding: 40px 20px;
  font-size: 16px;
`;

const CloseButton = styled.button`
  background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;

  &:hover {
    background: linear-gradient(135deg, #a4b3b6 0%, #8e9b9d 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(127, 140, 141, 0.2);
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const CopyButtonContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const CopyButtonMain = styled(ActionButton)`
  background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(39, 174, 96, 0.2);
  }

  &::after {
    content: '▼';
    font-size: 8px;
    margin-left: 4px;
    opacity: 0.8;
  }
`;

const CopyDropdownMenu = styled.div<{ show: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 180px;
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  display: ${props => props.show ? 'block' : 'none'};
  margin-top: 8px;
  animation: slideDown 0.2s ease;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const CopyDropdownItem = styled.div`
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.2s ease;
  color: #2c3e50;
  font-size: 12px;
  font-weight: 500;

  &:hover {
    background: #27ae60;
    color: white;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f1f3f4;
  }
`;

const CopyModeDescription = styled.div`
  font-size: 11px;
  color: #7f8c8d;
  font-weight: normal;
  margin-top: 2px;
`;

// 复制选项对话框样式
const CopyOptionsDialog = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  padding: 20px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid #e1e8ed;
  animation: slideIn 0.3s ease;
  display: flex;
  flex-direction: column;
  z-index: 1100;
`;

const CopyOptionsTitle = styled.h3`
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CopyOptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

const CopyOptionButton = styled.button`
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  background: white;
  color: #2c3e50;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: #27ae60;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(39, 174, 96, 0.2);
  }
  
  &:hover span {
    color: rgba(255, 255, 255, 0.8);
  }
`;

const CopyOptionDescription = styled.span`
  font-size: 12px;
  color: #7f8c8d;
  font-weight: normal;
  margin-top: 4px;
`;

// 自定义确认对话框组件
interface ConfirmationProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDelete?: boolean;
}

const Confirmation: React.FC<ConfirmationProps> = ({
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  onCancel,
  isDelete = false
}) => {
  return (
    <Overlay onClick={(e) => {
      if (e.target === e.currentTarget) onCancel();
    }}>
      <ConfirmDialog>
        <ConfirmTitle>
          {isDelete ? (<MaterialIcon name="delete" size={18} />) : (<MaterialIcon name="warning" size={18} />)} {title}
        </ConfirmTitle>
        <ConfirmMessage>{message}</ConfirmMessage>
        <ConfirmButtons>
          <ConfirmButton variant="cancel" onClick={onCancel}>
            {cancelText}
          </ConfirmButton>
          <ConfirmButton variant={isDelete ? "danger" : "primary"} onClick={onConfirm}>
            {confirmText}
          </ConfirmButton>
        </ConfirmButtons>
      </ConfirmDialog>
    </Overlay>
  );
};

// 复制按钮组件
interface CopyButtonProps {
  latex: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ latex }) => {
  const [showOptions, setShowOptions] = useState(false);

  const handleCopy = async (mode: CopyMode) => {
    if (mode === 'mathml') {
      // 使用MathML模式 - 直接转换为MathML并复制到剪贴板
      if (window.electronAPI) {
        try {
          // 直接调用保存Word文档的方法中的MathML转换功能
          const tempFilename = `temp-${Date.now()}`;
          await window.electronAPI.saveDocxFile(latex, tempFilename);
        } catch (error) {
          console.error('转换为MathML失败:', error);
        }
      } else {
        console.error('MathML转换仅在桌面应用中可用');
      }
    } else {
      const formattedLatex = formatLatex(latex, mode);
      
      if (window.electronAPI) {
        window.electronAPI.copyToClipboard(formattedLatex);
      } else {
        // 浏览器环境下使用 Clipboard API
        navigator.clipboard.writeText(formattedLatex);
      }
    }
    
    setShowOptions(false);
  };

  const toggleOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOptions(true);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowOptions(false);
    }
  };

  return (
    <>
      <ActionButton onClick={toggleOptions}>
        <MaterialIcon name="content_copy" size={14} /> 复制
      </ActionButton>
      
      {showOptions && (
        <Overlay onClick={handleOverlayClick}>
          <CopyOptionsDialog>
            <CopyOptionsTitle>
              <MaterialIcon name="content_copy" size={16} /> 选择复制格式
            </CopyOptionsTitle>
            
            <CopyOptionsList>
              <CopyOptionButton onClick={() => handleCopy('normal')}>
                复制原始代码
                <CopyOptionDescription>不添加任何符号</CopyOptionDescription>
              </CopyOptionButton>
              
              <CopyOptionButton onClick={() => handleCopy('inline')}>
                复制为 $...$
                <CopyOptionDescription>行内公式格式</CopyOptionDescription>
              </CopyOptionButton>
              
              <CopyOptionButton onClick={() => handleCopy('display')}>
                复制为 $$...$$
                <CopyOptionDescription>显示公式格式</CopyOptionDescription>
              </CopyOptionButton>

              <CopyOptionButton onClick={() => handleCopy('equation')}>
                复制为 {'\\begin{equation}...\\end{equation}'}
                <CopyOptionDescription>编号公式环境格式</CopyOptionDescription>
              </CopyOptionButton>

              <CopyOptionButton onClick={() => handleCopy('mathml')}>
                复制为 MathML
                <CopyOptionDescription>Word公式兼容格式</CopyOptionDescription>
              </CopyOptionButton>
            </CopyOptionsList>
            
            <ConfirmButton variant="cancel" onClick={() => setShowOptions(false)}>
              取消
            </ConfirmButton>
          </CopyOptionsDialog>
        </Overlay>
      )}
    </>
  );
};

// 数学公式渲染组件
interface MathRendererProps {
  latex: string;
  onUse?: () => void;
}

const MathRenderer: React.FC<MathRendererProps> = ({ latex, onUse }) => {
  const [renderError, setRenderError] = useState<string | null>(null);
  
  // 安全地调用onUse函数
  const handleUseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onUse) {
      try {
        onUse();
      } catch (error) {
        console.error('使用历史记录项时出错:', error);
        setRenderError('使用历史记录项时出错');
      }
    }
  };

  // 渲染数学公式
  const renderMath = () => {
    try {
      // 清理LaTeX代码，移除可能的包围符号
      let cleanLatex = latex.trim();
      
      // 移除常见的LaTeX包围符号
      if (cleanLatex.startsWith('$$') && cleanLatex.endsWith('$$')) {
        cleanLatex = cleanLatex.slice(2, -2);
      } else if (cleanLatex.startsWith('$') && cleanLatex.endsWith('$')) {
        cleanLatex = cleanLatex.slice(1, -1);
      } else if (cleanLatex.startsWith('\\[') && cleanLatex.endsWith('\\]')) {
        cleanLatex = cleanLatex.slice(2, -2);
      } else if (cleanLatex.startsWith('\\(') && cleanLatex.endsWith('\\)')) {
        cleanLatex = cleanLatex.slice(2, -2);
      }

      return (
        <div
          onClick={onUse ? handleUseClick : undefined}
          style={{ cursor: onUse ? 'pointer' : 'default' }}
          title={onUse ? "点击使用该公式" : undefined}
        >
          <Ellipsis>
            <ErrorBoundary fallback={<div style={{color: '#e74c3c'}}>无法渲染公式</div>}> 
              {/* 将公式整体包一层span，避免内部元素分段导致中间截断 */}
              <span style={{ display: 'inline-block', maxWidth: '100%' }}>
                <InlineMath math={cleanLatex} />
              </span>
            </ErrorBoundary>
          </Ellipsis>
        </div>
      );
    } catch (error) {
      console.error('渲染公式失败:', error);
      setRenderError('渲染公式失败');
      return (
        <div style={{ textAlign: 'center', padding: '8px', color: '#e74c3c' }}>
          无法渲染公式
        </div>
      );
    }
  };

  return (
    <LatexCode mode="rendered">
      {renderError ? (
        <ErrorDisplay>
          {renderError}
        </ErrorDisplay>
      ) : (
        renderMath()
      )}
    </LatexCode>
  );
};

// 错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('公式渲染错误:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

interface HistoryDialogProps {
  history: HistoryItem[];
  onUse: (latex: string) => void;
  onDelete: (latex: string) => void;
  onClear: () => void;
  onClose: () => void;
  onReorder?: (items: HistoryItem[]) => void; // 可选：将新顺序回传给父组件
}

const HistoryDialog: React.FC<HistoryDialogProps> = ({
  history,
  onUse,
  onDelete,
  onClear,
  onClose,
  onReorder
}) => {
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [latexToDelete, setLatexToDelete] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<HistoryItem[]>(history);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const dragImageRef = useRef<HTMLElement | null>(null);
  const ghostRef = useRef<HTMLElement | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    setItems(history);
  }, [history]);

  const persistHistoryOrder = (newItems: HistoryItem[]) => {
    if (window.electronAPI) {
      window.electronAPI.saveSettings({ history: newItems }).catch(console.error);
    }
    if (onReorder) onReorder(newItems);
  };

  const handleItemDragStart = (index: number) => (e: React.DragEvent) => {
    setDragIndex(index);
    setIsDragging(true);
    try { e.dataTransfer.effectAllowed = 'move'; } catch {}

    // 使用透明拖拽影像隐藏系统默认半透明预览
    const transparent = document.createElement('canvas');
    transparent.width = 1; transparent.height = 1;
    try { e.dataTransfer.setDragImage(transparent, 0, 0); } catch {}

    // 创建自定义“跟随鼠标”的幽灵元素，保持完全不透明
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const ghost = target.cloneNode(true) as HTMLElement;
    ghost.style.position = 'fixed';
    ghost.style.top = `${e.clientY - dragOffsetRef.current.y}px`;
    ghost.style.left = `${e.clientX - dragOffsetRef.current.x}px`;
    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    ghost.style.pointerEvents = 'none';
    ghost.style.zIndex = '9999';
    ghost.style.opacity = '1';
    ghost.style.transform = 'translateZ(0)';
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
  };

  const handleItemDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    try { e.dataTransfer.dropEffect = 'move'; } catch {}
    // 移动自定义幽灵元素以跟随鼠标
    if (ghostRef.current) {
      const x = e.clientX - dragOffsetRef.current.x;
      const y = e.clientY - dragOffsetRef.current.y;
      ghostRef.current.style.left = `${x}px`;
      ghostRef.current.style.top = `${y}px`;
    }
  };

  const handleItemDrop = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) {
      setIsDragging(false);
      setDragIndex(null);
      if (ghostRef.current && ghostRef.current.parentNode) {
        ghostRef.current.parentNode.removeChild(ghostRef.current);
      }
      ghostRef.current = null;
      return;
    }
    const newItems = [...items];
    const [moved] = newItems.splice(dragIndex, 1);
    newItems.splice(index, 0, moved);
    setItems(newItems);
    setIsDragging(false);
    setDragIndex(null);
    if (ghostRef.current && ghostRef.current.parentNode) {
      ghostRef.current.parentNode.removeChild(ghostRef.current);
    }
    ghostRef.current = null;
    persistHistoryOrder(newItems);
  };

  const handleItemDragEnd = () => {
    setIsDragging(false);
    setDragIndex(null);
    // 清理自定义拖拽预览
    if (dragImageRef.current && dragImageRef.current.parentNode) {
      dragImageRef.current.parentNode.removeChild(dragImageRef.current);
    }
    dragImageRef.current = null;
    if (ghostRef.current && ghostRef.current.parentNode) {
      ghostRef.current.parentNode.removeChild(ghostRef.current);
    }
    ghostRef.current = null;
  };
  
  // 已移除“使用”按钮，不再需要包装 onUse

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDragging) {
      onClose();
    }
  };

  // 阻止对话框上的点击事件冒泡
  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  // 监听全局鼠标按下事件
  const handleMouseDown = () => {
    setIsDragging(false);
  };
  
  // 监听全局鼠标移动事件
  const handleMouseMove = () => {
    // 如果鼠标按下并移动，标记为拖动状态
    if (isDragging === false) {
      setIsDragging(true);
    }
  };
  
  // 监听全局鼠标释放事件
  const handleMouseUp = () => {
    // 延迟重置拖动状态，确保点击事件处理完成
    setTimeout(() => {
      setIsDragging(false);
    }, 10);
  };

  const handleClear = () => {
    setShowConfirmClear(true);
  };

  const handleDelete = (latex: string) => {
    setLatexToDelete(latex);
    setShowConfirmDelete(true);
  };

  const confirmClear = () => {
    onClear();
    setShowConfirmClear(false);
  };

  const confirmDelete = () => {
    if (latexToDelete) {
      onDelete(latexToDelete);
      setLatexToDelete(null);
    }
    setShowConfirmDelete(false);
  };

  return (
    <Overlay 
      onClick={handleOverlayClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Dialog onClick={handleDialogClick}>
        <Header>
          <Title>
            <MaterialIcon name="history" size={20} /> 历史记录
          </Title>
        </Header>

        {error && (
          <ErrorDisplay style={{ margin: '10px 0' }}>
            {error}
            <div style={{ fontSize: '10px', marginTop: '5px' }}>
              <button 
                onClick={() => setError(null)} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#3498db', 
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0
                }}
              >
                清除错误
              </button>
            </div>
          </ErrorDisplay>
        )}

        <Content>
          {items.length === 0 ? (
            <EmptyState>
              <MaterialIcon name="note_alt" size={18} /> 暂无历史记录
            </EmptyState>
          ) : (
            items.map((item, index) => (
              <HistoryItemContainer
                key={index}
                draggable
                onDragStart={handleItemDragStart(index)}
                onDragOver={handleItemDragOver(index)}
                onDrop={handleItemDrop(index)}
                onDragEnd={handleItemDragEnd}
              >
                <ItemHeader>
                  <HeaderLeft>
                    <span>识别结果</span>
                    <DateLabel>{item.date}</DateLabel>
                    <Tag>公式</Tag>
                  </HeaderLeft>
                  <DeleteIconButton onClick={() => handleDelete(item.latex)} title="删除">
                    <MaterialIcon name="delete" size={18} />
                  </DeleteIconButton>
                </ItemHeader>
                <MathRenderer 
                  latex={item.latex}
                  onUse={() => onUse(item.latex)}
                />
              </HistoryItemContainer>
            ))
          )}
        </Content>

        <ButtonsContainer>
          {history.length > 0 && (
            <ClearButton onClick={handleClear}>
              <MaterialIcon name="delete" size={16} /> 清空历史记录
            </ClearButton>
          )}
          <CloseButton onClick={onClose}>
            关闭
          </CloseButton>
        </ButtonsContainer>
      </Dialog>

      {/* 清空历史记录确认对话框 */}
      {showConfirmClear && (
        <Confirmation
          title="确定要清空所有历史记录吗？"
          message="此操作将删除所有历史记录，且不可恢复。"
          confirmText="确定清空"
          onConfirm={confirmClear}
          onCancel={() => setShowConfirmClear(false)}
          isDelete={true}
        />
      )}

      {/* 删除单条记录确认对话框 */}
      {showConfirmDelete && (
        <Confirmation
          title="确定要删除这条记录吗？"
          message="此操作不可恢复。"
          confirmText="确定删除"
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirmDelete(false)}
          isDelete={true}
        />
      )}
    </Overlay>
  );
};

export default HistoryDialog; 