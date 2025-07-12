import React, { useState } from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
`;

const Dialog = styled.div`
  background: linear-gradient(145deg, #fefefe 0%, #f8fafc 100%);
  border-radius: 20px;
  padding: 28px;
  width: 90%;
  max-width: 550px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  font-family: "Segoe UI", "Microsoft YaHei", sans-serif;
  max-height: 80vh;
  display: flex;
  flex-direction: column;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-40px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const CloseIcon = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
  
  &:before,
  &:after {
    content: '';
    position: absolute;
    width: 16px;
    height: 2px;
    background-color: #94a3b8;
    border-radius: 1px;
    transition: background-color 0.2s;
  }
  
  &:before {
    transform: rotate(45deg);
  }
  
  &:after {
    transform: rotate(-45deg);
  }
  
  &:hover:before,
  &:hover:after {
    background-color: #475569;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 20px;
  flex-shrink: 0;
`;

const Title = styled.h1`
  margin: 0;
  color: #1e293b;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const Content = styled.div`
  color: #475569;
  font-size: 14px;
  line-height: 1.7;
  overflow-y: auto;
  padding-right: 15px;
  margin-right: -15px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

const Section = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  color: #3b82f6;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 2px solid rgba(59, 130, 246, 0.2);
`;

const InstructionList = styled.ul`
  list-style-type: none;
  padding-left: 0;
`;

const InstructionItem = styled.li`
  margin-bottom: 8px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const Icon = styled.span`
  font-size: 18px;
  margin-top: 2px;
`;

const Key = styled.kbd`
  background-color: #f1f5f9;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 13px;
  color: #475569;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 1px rgba(0,0,0,0.05);
  font-family: "Segoe UI", "Microsoft YaHei", sans-serif;
`;

interface HelpDialogProps {
  onClose: () => void;
}

const HelpDialog: React.FC<HelpDialogProps> = ({ onClose }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDragging) {
      onClose();
    }
  };
  
  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleMouseDown = () => setIsDragging(false);
  const handleMouseMove = () => setIsDragging(true);

  return (
    <Overlay 
      onClick={handleOverlayClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setTimeout(() => setIsDragging(false), 10)}
    >
      <Dialog onClick={handleDialogClick}>
        <CloseIcon onClick={onClose} />
        <Header>
          <Title>
            <span role="img" aria-label="light-bulb">💡</span>
            使用帮助
          </Title>
        </Header>
        <Content>
          <Section>
            <SectionTitle>核心功能</SectionTitle>
            <InstructionList>
              <InstructionItem>
                <Icon>📷</Icon>
                <div><b>截图识别</b>: 点击菜单栏的截图按钮或使用快捷键 (<Key>Alt+A</Key>) 启动截图，截取屏幕上的公式区域进行识别。</div>
              </InstructionItem>
              <InstructionItem>
                <Icon>📤</Icon>
                <div><b>上传识别</b>: 点击上传按钮或使用快捷键 (<Key>Alt+S</Key>)，或直接将图片文件拖拽到软件窗口中。</div>
              </InstructionItem>
              <InstructionItem>
                <Icon>🤖</Icon>
                <div><b>识别模式</b>: 点击图标可在“自动识别”和“手动识别”模式间切换 (程序默认自动识别)。自动模式下，图片上传后立即识别；手动模式下，需要点击“开始识别”按钮。</div>
              </InstructionItem>
            </InstructionList>
          </Section>

          <Section>
            <SectionTitle>结果处理</SectionTitle>
            <InstructionList>
              <InstructionItem>
                <Icon>📋</Icon>
                <div><b>复制公式</b>: 点击复制按钮，可以选择复制纯 LaTeX 代码、行内公式 ($...$) 或块级公式 ($$...) 等多种格式。</div>
              </InstructionItem>
              <InstructionItem>
                <Icon>💾</Icon>
                <div><b>导出图片</b>: 点击导出按钮，可以将当前公式预览保存为 SVG、PNG 或 JPG 格式的图片。</div>
              </InstructionItem>
              <InstructionItem>
                <Icon>✍️</Icon>
                <div><b>编辑与预览</b>: 在左侧编辑器中可以直接修改 LaTeX 代码，右侧会实时渲染预览效果。</div>
              </InstructionItem>
            </InstructionList>
          </Section>

          <Section>
            <SectionTitle>其他功能</SectionTitle>
            <InstructionList>
              <InstructionItem>
                <Icon>🔐</Icon>
                <div><b>API 设置</b>: 如果识别服务需要，请在此处配置您的 API 密钥。AI 公式解释功能也需要配置相应的 Key。</div>
              </InstructionItem>
              <InstructionItem>
                <Icon>⌨️</Icon>
                <div><b>快捷键</b>: 在设置中可以自定义截图和上传功能的全局快捷键。</div>
              </InstructionItem>
              <InstructionItem>
                <Icon>🕒</Icon>
                <div><b>历史记录</b>: 查看、复用或删除您最近的识别记录。</div>
              </InstructionItem>
            </InstructionList>
          </Section>
        </Content>
      </Dialog>
    </Overlay>
  );
};

export default HelpDialog; 