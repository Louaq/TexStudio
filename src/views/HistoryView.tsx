import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import MaterialIcon from '../components/MaterialIcon';
import { HistoryItem, CopyMode } from '../types';
import { formatLatex } from '../utils/api';
import CopyOptionsDialog from '../components/CopyOptionsDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { glassCard, glassFooterBar, glassPageHeader, glassViewRoot } from '../theme/themes';

const HistoryContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  ${glassViewRoot}
  overflow: hidden;
`;

const PageHeader = styled.div`
  padding: 0 24px;
  height: 48px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  ${glassPageHeader}
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: -0.1px;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
  }
`;

const FixedPagination = styled.div`
  flex-shrink: 0;
  padding: 20px 24px;
  ${glassFooterBar}
`;

const HintBar = styled.div`
  -webkit-backdrop-filter: blur(14px) saturate(1.12);
  backdrop-filter: blur(14px) saturate(1.12);
  background: color-mix(in srgb, var(--glass-bg-elevated) 75%, transparent);
  border: 1px solid var(--glass-edge);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--color-primary);
  font-size: 14px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
`;

const HintBarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
`;

const ClearAllButton = styled.button`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid color-mix(in srgb, var(--color-primary) 35%, var(--color-border));
  border-radius: 8px;
  background: transparent;
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease;

  &:hover {
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    border-color: color-mix(in srgb, var(--color-primary) 50%, var(--color-border));
  }

  &:active {
    transform: scale(0.98);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-textSecondary);
  gap: 16px;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  opacity: 0.3;
`;

const EmptyText = styled.p`
  font-size: 16px;
  font-weight: 500;
`;

const HistoryList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
`;

const HistoryCard = styled.div`
  border-radius: 8px;
  padding: 0;
  transition: all 0.2s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  ${glassCard}

  &:hover {
    box-shadow:
      0 4px 28px rgba(15, 23, 42, 0.08),
      0 8px 32px rgba(37, 99, 235, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.55);
  }
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid var(--color-border);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeaderTitle = styled.div`
  color: var(--color-text);
  font-size: 14px;
  font-weight: 600;
`;

const HistoryDate = styled.div`
  color: var(--color-textSecondary);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const FormulaTag = styled.span`
  background: rgba(0, 0, 0, 0.05);
  color: var(--color-primary);
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const HistoryActions = styled.div`
  display: flex;
  gap: 4px;
`;

const IconButton = styled.button`
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-textSecondary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: var(--color-text);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const FormulaDisplay = styled.div`
  padding: 32px 20px;
  text-align: center;
  min-height: 100px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow-x: auto;

  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }

  &:active {
    background: rgba(0, 0, 0, 0.06);
  }

  /* KaTeX 样式优化 */
  .katex-display {
    margin: 0;
  }

  .katex {
    font-size: 1.2em;
  }

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;
  }
`;

const FormulaError = styled.div`
  color: var(--color-error);
  font-size: 14px;
  padding: 12px;
`;

const NoMoreText = styled.div`
  text-align: center;
  color: #adb5bd;
  font-size: 14px;
  padding: 32px 0;
  margin-top: 20px;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border: 1px solid ${props => props.$active
    ? 'color-mix(in srgb, var(--color-primary) 40%, var(--color-border))'
    : 'transparent'};
  border-radius: 8px;
  background: ${props => props.$active
    ? 'color-mix(in srgb, var(--color-primary) 14%, transparent)'
    : 'transparent'};
  color: ${props => props.$active ? 'var(--color-primary)' : 'var(--color-textSecondary)'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: ${props => props.$active
      ? 'color-mix(in srgb, var(--color-primary) 18%, transparent)'
      : 'color-mix(in srgb, var(--color-text) 5%, transparent)'};
    color: ${props => props.$active ? 'var(--color-primary)' : 'var(--color-text)'};
    border-color: ${props => props.$active
      ? 'color-mix(in srgb, var(--color-primary) 45%, var(--color-border))'
      : 'transparent'};
  }

  &:disabled {
    opacity: 0.32;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }
`;

const PageInfo = styled.span`
  color: var(--color-textSecondary);
  font-size: 14px;
  padding: 0 12px;
`;

interface HistoryViewProps {
  history: HistoryItem[];
  onUse: (latex: string) => void;
  onDelete: (latex: string) => void;
  onClear: () => void;
}

const ITEMS_PER_PAGE = 6; // 每页显示6个公式

const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onUse,
  onDelete,
  onClear
}) => {
  const [showCopyDialog, setShowCopyDialog] = React.useState(false);
  const [currentLatex, setCurrentLatex] = React.useState('');
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);
  const [showClearDialog, setShowClearDialog] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);

  // 计算分页数据
  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = history.slice(startIndex, endIndex);

  // 当历史记录变化时，如果当前页超出范围，返回第一页
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [history.length, currentPage, totalPages]);

  const handleClear = () => {
    setShowClearDialog(true);
  };

  const handleConfirmClear = () => {
    onClear();
    setCurrentPage(1);
    setShowClearDialog(false);
  };

  const handleDelete = (latex: string) => {
    setDeleteTarget(latex);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget);
    }
    setShowDeleteDialog(false);
    setDeleteTarget(null);
  };

  const handleOpenCopyDialog = (latex: string) => {
    setCurrentLatex(latex);
    setShowCopyDialog(true);
  };

  const handleCopy = async (mode: CopyMode) => {
    if (!currentLatex.trim()) return;

    // MathML 模式需要特殊处理
    if (mode === 'mathml') {
      if (window.electronAPI) {
        try {
          const tempFilename = `temp-${Date.now()}`;
          await window.electronAPI.saveDocxFile(currentLatex, tempFilename);
        } catch (error) {
          console.error('转换为MathML失败:', error);
        }
      } else {
        // 浏览器环境下的简单处理
        navigator.clipboard.writeText(currentLatex);
      }
      return;
    }

    // 使用 formatLatex 格式化代码
    const formattedLatex = formatLatex(currentLatex, mode);
    
    if (window.electronAPI) {
      await window.electronAPI.copyToClipboard(formattedLatex);
    } else {
      try {
        await navigator.clipboard.writeText(formattedLatex);
      } catch (error) {
        console.error('复制到剪贴板失败:', error);
      }
    }
  };

  return (
    <>
    <HistoryContainer>
      <Content>
        <ScrollableContent>
          {history.length === 0 ? (
            <EmptyState>
              <EmptyIcon>
                <MaterialIcon name="history" size={80} />
              </EmptyIcon>
              <EmptyText>暂无历史记录</EmptyText>
              <p style={{ fontSize: '15px', color: '#95a5a6' }}>
                识别或输入的公式会自动保存到这里
              </p>
            </EmptyState>
          ) : (
            <>
              <HintBar>
                <HintBarLeft>
                  <MaterialIcon name="info" size={18} />
                  <span>💡 点击公式可编辑，点击复制按钮选择格式 | 共 {history.length} 条记录</span>
                </HintBarLeft>
                <ClearAllButton type="button" onClick={handleClear} title="清空全部历史记录">
                  <MaterialIcon name="delete_sweep" size={18} />
                  清空全部
                </ClearAllButton>
              </HintBar>
              <HistoryList>
                {currentItems.map((item, index) => (
                  <HistoryCard key={startIndex + index}>
                    <HistoryHeader>
                      <HeaderLeft>
                        <HeaderTitle>识别结果</HeaderTitle>
                        <HistoryDate>
                          {item.date}
                        </HistoryDate>
                        <FormulaTag>公式</FormulaTag>
                      </HeaderLeft>
                      <HistoryActions>
                        <IconButton 
                          onClick={() => handleOpenCopyDialog(item.latex)} 
                          title="复制"
                        >
                          <MaterialIcon name="content_copy" size={20} />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(item.latex)} title="删除">
                          <MaterialIcon name="delete" size={20} />
                        </IconButton>
                      </HistoryActions>
                    </HistoryHeader>
                    <FormulaDisplay onClick={() => onUse(item.latex)}>
                      {(() => {
                        try {
                          return <BlockMath math={item.latex} errorColor={'#e74c3c'} />;
                        } catch (error) {
                          return <FormulaError>公式渲染失败</FormulaError>;
                        }
                      })()}
                    </FormulaDisplay>
                  </HistoryCard>
                ))}
              </HistoryList>

              {totalPages <= 1 && <NoMoreText>─ 暂无更多记录 ─</NoMoreText>}
            </>
          )}
        </ScrollableContent>

        {/* 固定在底部的分页控件 */}
        {totalPages > 1 && (
          <FixedPagination>
            <PaginationContainer>
              <PageButton
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                title="上一页"
              >
                <MaterialIcon name="chevron_left" size={20} />
              </PageButton>

              {/* 页码按钮 - 固定显示3个页码 */}
              {(() => {
                const pages: number[] = [];
                
                if (totalPages <= 3) {
                  // 总页数不超过3页，显示所有页码
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  // 总页数超过3页，只显示当前页及其前后各1页
                  if (currentPage === 1) {
                    pages.push(1, 2, 3);
                  } else if (currentPage === totalPages) {
                    pages.push(totalPages - 2, totalPages - 1, totalPages);
                  } else {
                    pages.push(currentPage - 1, currentPage, currentPage + 1);
                  }
                }
                
                return pages.map((page) => (
                  <PageButton
                    key={page}
                    $active={currentPage === page}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </PageButton>
                ));
              })()}

              <PageButton
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                title="下一页"
              >
                <MaterialIcon name="chevron_right" size={20} />
              </PageButton>

              <PageInfo>
                第 {currentPage} / {totalPages} 页
              </PageInfo>
            </PaginationContainer>
          </FixedPagination>
        )}
      </Content>

    </HistoryContainer>
    {ReactDOM.createPortal(
      <>
        <CopyOptionsDialog
          isOpen={showCopyDialog}
          onClose={() => setShowCopyDialog(false)}
          onCopy={handleCopy}
        />
        <ConfirmDialog
          open={showDeleteDialog}
          title="删除历史记录"
          message="确定要删除这条历史记录吗？"
          confirmText="删除"
          cancelText="取消"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteDialog(false)}
        />
        <ConfirmDialog
          open={showClearDialog}
          title="清空历史记录"
          message="确定要清空所有历史记录吗？此操作不可撤销。"
          confirmText="清空"
          cancelText="取消"
          onConfirm={handleConfirmClear}
          onCancel={() => setShowClearDialog(false)}
        />
      </>,
      document.body
    )}
    </>
  );
};

export default HistoryView;
