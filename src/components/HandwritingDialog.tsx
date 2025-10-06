import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import MaterialIcon from './MaterialIcon';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-dialogOverlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Dialog = styled.div`
  background: var(--color-surface);
  border-radius: 8px;
  padding: 20px;
  width: clamp(600px, 80vw, 1200px);
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px color-mix(in srgb, var(--color-text) 15%, transparent);
  border: 1px solid var(--color-border);
  overflow: auto;
`;

const Title = styled.h2`
  margin: 0 0 20px;
  color: var(--color-text);
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CanvasContainer = styled.div`
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: color-mix(in srgb, var(--color-text) 3%, var(--color-surface));
  position: relative;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
`;

// 仅画布区域可缩放
const CanvasResizable = styled.div`
  position: relative;
  width: 100%;
  height: 300px;
  min-height: 200px;
  overflow: auto;
  background: white;
`;

const Canvas = styled.canvas`
  width: auto;
  height: auto;
  max-width: none;
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
    ? 'var(--color-buttonGradientStart)' 
    : 'color-mix(in srgb, var(--color-text) 5%, var(--color-surface))'};
  color: ${props => props.primary ? 'white' : 'var(--color-text)'};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 5px color-mix(in srgb, var(--color-text) 10%, transparent);
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
  border-bottom: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-text) 5%, var(--color-surface));
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  flex-wrap: wrap;
`;

const ColorButton = styled.button<{ selected?: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid ${props => props.selected ? 'var(--color-primary)' : 'transparent'};
  cursor: pointer;
  box-shadow: ${props => props.selected ? '0 0 0 2px color-mix(in srgb, var(--color-primary) 30%, transparent)' : 'none'};
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const SizeButton = styled.button<{ selected?: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  background: ${props => props.selected ? 'var(--color-primary)' : 'var(--color-surface)'};
  color: ${props => props.selected ? 'white' : 'var(--color-text)'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  
  &:hover {
    background: ${props => props.selected ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-text) 5%, var(--color-surface))'};
  }
`;

const ToolButton = styled.button<{ selected?: boolean }>`
  padding: 5px 10px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  background: ${props => props.selected ? 'var(--color-primary)' : 'var(--color-surface)'};
  color: ${props => props.selected ? 'white' : 'var(--color-text)'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  gap: 4px;
  
  &:hover {
    background: ${props => props.selected ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-text) 5%, var(--color-surface))'};
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background: var(--color-border);
  margin: 0 5px;
`;

const StatusText = styled.div<{ isError?: boolean }>`
  padding: 10px;
  font-size: 14px;
  color: ${props => props.isError ? 'var(--color-error)' : 'var(--color-text)'};
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
  const resizableRef = useRef<HTMLDivElement>(null);
  const overlayMouseDownOnSelf = useRef<boolean>(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('在上方绘制区域手写您的数学公式');
  const [isError, setIsError] = useState(false);
  const [tool, setTool] = useState<Tool>('pen');
  const [eraserSize, setEraserSize] = useState(20);
  const [canvasDisplayWidth, setCanvasDisplayWidth] = useState<number>(0);
  const [canvasDisplayHeight, setCanvasDisplayHeight] = useState<number>(0);

  // 以显示尺寸（CSS 像素）设置画布，支持内容位移（用于上/左扩展）
  const resizeCanvas = (
    displayWidth: number,
    displayHeight: number,
    preserveContent: boolean = true,
    shiftX: number = 0,
    shiftY: number = 0,
    prevDisplayWidth?: number,
    prevDisplayHeight?: number
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = (window.devicePixelRatio || 1);

    const targetWidth = Math.max(1, Math.floor(displayWidth * dpr));
    const targetHeight = Math.max(1, Math.floor(displayHeight * dpr));

    // 离屏复制，避免拉伸失真与裁剪缺失
    let offscreen: HTMLCanvasElement | null = null;
    if (preserveContent && canvas.width > 0 && canvas.height > 0) {
      offscreen = document.createElement('canvas');
      offscreen.width = canvas.width;   // 设备像素
      offscreen.height = canvas.height; // 设备像素
      const offctx = offscreen.getContext('2d');
      if (offctx) {
        offctx.drawImage(canvas, 0, 0);
      }
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // @ts-ignore setTransform 存在
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (tool === 'pen') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    } else {
      ctx.strokeStyle = 'white';
      ctx.lineWidth = eraserSize;
    }

    if (offscreen) {
      const ctx2 = canvas.getContext('2d');
      if (ctx2) {
        const prevW = prevDisplayWidth ?? Math.max(1, Math.floor(offscreen.width / dpr));
        const prevH = prevDisplayHeight ?? Math.max(1, Math.floor(offscreen.height / dpr));
        // 按旧显示尺寸粘贴，避免缩放拉伸；左/上扩展通过 shiftX/shiftY 平移
        ctx2.drawImage(
          offscreen,
          0,
          0,
          offscreen.width,
          offscreen.height,
          shiftX,
          shiftY,
          prevW,
          prevH
        );
      }
    }
  };

  // 初始化：以容器可视宽度创建画布，初始高度为容器高度
  useEffect(() => {
    const holder = resizableRef.current;
    const initialWidth = Math.max(1, Math.floor(holder?.getBoundingClientRect().width || 600));
    const initialHeight = Math.max(1, Math.floor(holder?.getBoundingClientRect().height || 300));
    setCanvasDisplayWidth(initialWidth);
    setCanvasDisplayHeight(initialHeight);
    resizeCanvas(initialWidth, initialHeight, false, 0, 0, initialWidth, initialHeight);
  }, []);

  // 当目标显示尺寸变更时，同步画布
  useEffect(() => {
    if (canvasDisplayWidth && canvasDisplayHeight) {
      resizeCanvas(canvasDisplayWidth, canvasDisplayHeight, true, 0, 0, canvasDisplayWidth, canvasDisplayHeight);
    }
  }, [canvasDisplayWidth, canvasDisplayHeight]);

  // 仅更新画笔样式（不清空、不改尺寸）
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (tool === 'pen') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    } else {
      ctx.strokeStyle = 'white';
      ctx.lineWidth = eraserSize;
    }
  }, [color, lineWidth, eraserSize, tool]);

  // 根据靠近四边自动扩展画布（只增大画布本身），并在上/左扩展时平移已有内容和滚动条
  const ensureSpaceForPoint = (x: number, y: number) => {
    const thresholdPx = 32;
    const stepPx = 120;

    let newW = canvasDisplayWidth || 0;
    let newH = canvasDisplayHeight || 0;
    let shiftX = 0;
    let shiftY = 0;
    let expanded = false;

    // 右边
    if (x > newW - thresholdPx) {
      newW = newW + stepPx;
      expanded = true;
    }
    // 下边
    if (y > newH - thresholdPx) {
      newH = newH + stepPx;
      expanded = true;
    }
    // 左边
    if (x < thresholdPx) {
      newW = newW + stepPx;
      shiftX = stepPx;
      expanded = true;
    }
    // 上边
    if (y < thresholdPx) {
      newH = newH + stepPx;
      shiftY = stepPx;
      expanded = true;
    }

    if (expanded) {
      const prevW = canvasDisplayWidth || newW - stepPx;
      const prevH = canvasDisplayHeight || newH - stepPx;
      setCanvasDisplayWidth(newW);
      setCanvasDisplayHeight(newH);
      // 立即同步并平移已有内容（使用之前的显示尺寸避免缩放失真）
      resizeCanvas(newW, newH, true, shiftX, shiftY, prevW, prevH);
      const holder = resizableRef.current;
      if (holder) {
        if (shiftX) holder.scrollLeft = holder.scrollLeft + shiftX;
        if (shiftY) holder.scrollTop = holder.scrollTop + shiftY;
      }
      return { x: x + shiftX, y: y + shiftY, expanded: true };
    }

    return { x, y, expanded: false };
  };

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
    
    // 如接近四边则扩展；上/左扩展后重建路径并偏移坐标
    const result = ensureSpaceForPoint(x, y);
    if (result.expanded) {
      ctx.beginPath();
      ctx.moveTo(result.x, result.y);
    }

    if (tool === 'pen' || tool === 'eraser') {
      ctx.lineTo(result.x, result.y);
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
        <Title><MaterialIcon name="edit" size={20} /> 手写公式识别</Title>
        
        <CanvasContainer>
          <ControlsRow>
            {/* 工具选择 */}
            <ToolButton 
              selected={tool === 'pen'} 
              onClick={() => handleToolChange('pen')}
              title="画笔"
            >
              <MaterialIcon name="brush" size={16} /> 画笔
            </ToolButton>
            <ToolButton 
              selected={tool === 'eraser'} 
              onClick={() => handleToolChange('eraser')}
              title="橡皮擦"
            >
              <MaterialIcon name="ink_eraser" size={16} /> 橡皮擦
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
          <CanvasResizable ref={resizableRef}>
            <Canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ cursor: getCursorStyle(), display: 'block' }}
            />
          </CanvasResizable>
          
          <StatusText isError={isError}>
            {isRecognizing ? (<><MaterialIcon name="autorenew" size={16} /> 正在识别...</>) : statusMessage}
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