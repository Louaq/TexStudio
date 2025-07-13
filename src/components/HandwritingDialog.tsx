import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Dialog = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  width: 600px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const Title = styled.h2`
  margin: 0 0 20px;
  color: #3a4a5b;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CanvasContainer = styled.div`
  border: 1px solid #dce1e8;
  border-radius: 8px;
  background: #f8f9fa;
  position: relative;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 300px;
  cursor: crosshair;
  touch-action: none;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: space-between;
  margin-top: 10px;
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background: ${props => props.primary 
    ? 'linear-gradient(135deg, #4375b9 0%, #2c5282 100%)' 
    : '#f1f5f9'};
  color: ${props => props.primary ? 'white' : '#3a4a5b'};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ControlsRow = styled.div`
  display: flex;
  padding: 10px;
  gap: 10px;
  border-bottom: 1px solid #dce1e8;
  background: #f1f5f9;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  flex-wrap: wrap;
`;

const ColorButton = styled.button<{ selected?: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid ${props => props.selected ? '#4375b9' : 'transparent'};
  cursor: pointer;
  box-shadow: ${props => props.selected ? '0 0 0 2px rgba(67, 117, 185, 0.3)' : 'none'};
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const SizeButton = styled.button<{ selected?: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #dce1e8;
  background: ${props => props.selected ? '#4375b9' : 'white'};
  color: ${props => props.selected ? 'white' : '#3a4a5b'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  
  &:hover {
    background: ${props => props.selected ? '#4375b9' : '#f1f5f9'};
  }
`;

const ToolButton = styled.button<{ selected?: boolean }>`
  padding: 5px 10px;
  border-radius: 4px;
  border: 1px solid #dce1e8;
  background: ${props => props.selected ? '#4375b9' : 'white'};
  color: ${props => props.selected ? 'white' : '#3a4a5b'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  gap: 4px;
  
  &:hover {
    background: ${props => props.selected ? '#4375b9' : '#f1f5f9'};
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background: #dce1e8;
  margin: 0 5px;
`;

const StatusText = styled.div<{ isError?: boolean }>`
  padding: 10px;
  font-size: 14px;
  color: ${props => props.isError ? '#e74c3c' : '#3a4a5b'};
  text-align: center;
`;

interface HandwritingDialogProps {
  onClose: () => void;
  onRecognize: (imageData: string) => void;
  isRecognizing?: boolean;
}

// 定义工具类型
type Tool = 'pen' | 'eraser';

const HandwritingDialog: React.FC<HandwritingDialogProps> = ({ 
  onClose, 
  onRecognize,
  isRecognizing = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('在上方绘制区域手写您的数学公式');
  const [isError, setIsError] = useState(false);
  const [tool, setTool] = useState<Tool>('pen');
  const [eraserSize, setEraserSize] = useState(20);

  // 初始化画布
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 设置画布尺寸为实际像素尺寸
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // 设置白色背景
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 设置默认绘图样式
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
  }, [color, lineWidth]);

  // 处理鼠标/触摸事件
  const startDrawing = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    
    if (tool === 'pen') {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    } else if (tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(x, y);
      // 橡皮擦使用白色
      ctx.strokeStyle = 'white';
      ctx.lineWidth = eraserSize;
    }
    
    setIsError(false);
  };
  
  const draw = (x: number, y: number) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (tool === 'pen' || tool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
      setHasDrawing(true);
    }
  };
  
  const stopDrawing = () => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.closePath();
    setIsDrawing(false);
  };

  // 鼠标事件处理
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    startDrawing(x, y);
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    draw(x, y);
  };
  
  const handleMouseUp = () => {
    stopDrawing();
  };
  
  const handleMouseLeave = () => {
    stopDrawing();
  };

  // 触摸事件处理
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    startDrawing(x, y);
  };
  
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    draw(x, y);
  };
  
  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    stopDrawing();
  };

  // 清空画布
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
    setStatusMessage('在上方绘制区域手写您的数学公式');
    setIsError(false);
  };

  // 提交识别
  const handleRecognize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    if (!hasDrawing) {
      setStatusMessage('请先手写公式后再提交识别');
      setIsError(true);
      return;
    }
    
    try {
      const imageData = canvas.toDataURL('image/png');
      // 提交识别后立即关闭对话框
      onRecognize(imageData);
      // 不再设置状态，因为对话框会立即关闭
      onClose();
    } catch (error) {
      console.error('获取画布图像数据失败:', error);
      setStatusMessage('获取图像数据失败，请重试');
      setIsError(true);
    }
  };

  // 更改颜色
  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.strokeStyle = newColor;
    
    // 切换到画笔工具
    setTool('pen');
  };

  // 更改线宽
  const handleLineWidthChange = (newWidth: number) => {
    setLineWidth(newWidth);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineWidth = newWidth;
    
    // 切换到画笔工具
    setTool('pen');
  };

  // 更改橡皮擦大小
  const handleEraserSizeChange = (newSize: number) => {
    setEraserSize(newSize);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineWidth = newSize;
    
    // 切换到橡皮擦工具
    setTool('eraser');
  };

  // 更改工具
  const handleToolChange = (newTool: Tool) => {
    setTool(newTool);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (newTool === 'pen') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    } else if (newTool === 'eraser') {
      ctx.strokeStyle = 'white';
      ctx.lineWidth = eraserSize;
    }
  };

  // 根据当前工具设置光标样式
  const getCursorStyle = () => {
    if (tool === 'eraser') {
      return 'crosshair';
    } else {
      return 'crosshair';
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Dialog onClick={e => e.stopPropagation()}>
        <Title>✏️ 手写公式识别</Title>
        
        <CanvasContainer>
          <ControlsRow>
            {/* 工具选择 */}
            <ToolButton 
              selected={tool === 'pen'} 
              onClick={() => handleToolChange('pen')}
              title="画笔"
            >
              ✏️ 画笔
            </ToolButton>
            <ToolButton 
              selected={tool === 'eraser'} 
              onClick={() => handleToolChange('eraser')}
              title="橡皮擦"
            >
              🧽 橡皮擦
            </ToolButton>
            
            <Divider />
            
            {/* 颜色选择 - 只在画笔模式显示 */}
            {tool === 'pen' && (
              <>
                <ColorButton 
                  style={{ background: '#000000' }} 
                  selected={color === '#000000' && tool === 'pen'} 
                  onClick={() => handleColorChange('#000000')}
                  title="黑色"
                />
                <ColorButton 
                  style={{ background: '#3498db' }} 
                  selected={color === '#3498db' && tool === 'pen'} 
                  onClick={() => handleColorChange('#3498db')}
                  title="蓝色"
                />
                <ColorButton 
                  style={{ background: '#e74c3c' }} 
                  selected={color === '#e74c3c' && tool === 'pen'} 
                  onClick={() => handleColorChange('#e74c3c')}
                  title="红色"
                />
                
                <Divider />
                
                {/* 画笔大小选择 */}
                <SizeButton 
                  selected={lineWidth === 1 && tool === 'pen'} 
                  onClick={() => handleLineWidthChange(1)}
                  title="小号画笔"
                >
                  S
                </SizeButton>
                <SizeButton 
                  selected={lineWidth === 3 && tool === 'pen'} 
                  onClick={() => handleLineWidthChange(3)}
                  title="中号画笔"
                >
                  M
                </SizeButton>
                <SizeButton 
                  selected={lineWidth === 5 && tool === 'pen'} 
                  onClick={() => handleLineWidthChange(5)}
                  title="大号画笔"
                >
                  L
                </SizeButton>
              </>
            )}
            
            {/* 橡皮擦大小选择 - 只在橡皮擦模式显示 */}
            {tool === 'eraser' && (
              <>
                <SizeButton 
                  selected={eraserSize === 10 && tool === 'eraser'} 
                  onClick={() => handleEraserSizeChange(10)}
                  title="小号橡皮擦"
                >
                  S
                </SizeButton>
                <SizeButton 
                  selected={eraserSize === 20 && tool === 'eraser'} 
                  onClick={() => handleEraserSizeChange(20)}
                  title="中号橡皮擦"
                >
                  M
                </SizeButton>
                <SizeButton 
                  selected={eraserSize === 30 && tool === 'eraser'} 
                  onClick={() => handleEraserSizeChange(30)}
                  title="大号橡皮擦"
                >
                  L
                </SizeButton>
              </>
            )}
          </ControlsRow>
          
          <Canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ cursor: getCursorStyle() }}
          />
          
          <StatusText isError={isError}>
            {isRecognizing ? '🔄 正在识别...' : statusMessage}
          </StatusText>
        </CanvasContainer>
        
        <ButtonRow>
          <div>
            <Button onClick={clearCanvas} disabled={isRecognizing}>
              清空画布
            </Button>
          </div>
          <div>
            <Button onClick={onClose} style={{ marginRight: 10 }}>
              取消
            </Button>
            <Button 
              primary 
              onClick={handleRecognize}
              disabled={!hasDrawing || isRecognizing}
            >
              {isRecognizing ? '识别中...' : '提交识别'}
            </Button>
          </div>
        </ButtonRow>
      </Dialog>
    </Overlay>
  );
};

export default HandwritingDialog; 