import React from 'react';

interface ModelIconProps {
  modelId: string;
  size?: number;
  className?: string;
}

/**
 * 模型图标组件
 * 使用内联SVG避免外部依赖
 */
const ModelIcon: React.FC<ModelIconProps> = ({ modelId, size = 20, className }) => {
  const renderIcon = () => {
    const lowerId = modelId.toLowerCase();
    
    const iconStyle: React.CSSProperties = {
      width: size,
      height: size,
    };
    
    // Qwen / 通义千问 - 使用品牌色 #615CED
    if (lowerId.includes('qwen')) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={iconStyle}>
          <rect width="24" height="24" rx="5" fill="#615CED"/>
          <path d="M12 4L6 9v6l6 5 6-5V9l-6-5zm0 8l-3-3h6l-3 3z" fill="white" fillOpacity="0.9"/>
        </svg>
      );
    }
    
    // Baichuan / 百川 - #FF6933
    if (lowerId.includes('baichuan')) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={iconStyle}>
          <rect width="24" height="24" rx="5" fill="#FF6933"/>
          <path d="M12 3L4 10h3v5h10v-5h3L12 3z" fill="white"/>
        </svg>
      );
    }
    
    // ChatGLM - #4268FA
    if (lowerId.includes('chatglm') || lowerId.includes('glm-')) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={iconStyle}>
          <rect width="24" height="24" rx="5" fill="#4268FA"/>
          <path d="M6 8h12v2H6V8zm0 3h8v2H6v-2zm0 3h10v2H6v-2z" fill="white"/>
        </svg>
      );
    }
    
    // MiniMax - #F23F5D
    if (lowerId.includes('minimax')) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={iconStyle}>
          <rect width="24" height="24" rx="5" fill="#F23F5D"/>
          <circle cx="12" cy="12" r="4" fill="white" fillOpacity="0.3"/>
          <path d="M12 8L12 16M8 12L16 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    }
    
    // DeepSeek - #4D6BFE
    if (lowerId.includes('deepseek')) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={iconStyle}>
          <rect width="24" height="24" rx="5" fill="#4D6BFE"/>
          <path d="M12 4L18 10H14V16H10V10H6L12 4Z" fill="white" fillOpacity="0.9"/>
        </svg>
      );
    }
    
    // Moonshot / Kimi - #00c896
    if (lowerId.includes('moonshot') || lowerId.includes('kimi')) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={iconStyle}>
          <rect width="24" height="24" rx="5" fill="#00c896"/>
          <circle cx="12" cy="12" r="5" fill="white" fillOpacity="0.3"/>
          <path d="M12 7L17 12L12 17L7 12L12 7Z" fill="white"/>
        </svg>
      );
    }
    
    // Spark AI / 科大讯飞 - #0070F0
    if (lowerId.includes('spark') || lowerId.includes('xfyun')) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={iconStyle}>
          <rect width="24" height="24" rx="5" fill="#0070F0"/>
          <path d="M12 2L6 12h4v8h4v-8h4L12 2z" fill="white"/>
        </svg>
      );
    }
    
    // Doubao / 豆包 - #8e47ff
    if (lowerId.includes('doubao') || lowerId.includes('bytedance')) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={iconStyle}>
          <rect width="24" height="24" rx="5" fill="#8e47ff"/>
          <circle cx="12" cy="12" r="6" fill="white" fillOpacity="0.2"/>
          <circle cx="12" cy="12" r="3" fill="white"/>
        </svg>
      );
    }
    
    // Zhipu / 智谱 - #3859FF
    if (lowerId.includes('zhipu') || lowerId.includes('glm-4')) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={iconStyle}>
          <rect width="24" height="24" rx="5" fill="#3859FF"/>
          <path d="M12 2L6 8h12L12 2zm6 14L12 22 6 16h12z" fill="white" fillOpacity="0.9"/>
        </svg>
      );
    }
    
    // 魔搭 ModelScope - #624AFF
    if (lowerId.includes('modelscope')) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={iconStyle}>
          <rect width="24" height="24" rx="5" fill="#624AFF"/>
          <circle cx="12" cy="8" r="3" fill="white" fillOpacity="0.8"/>
          <circle cx="8" cy="16" r="2" fill="white" fillOpacity="0.6"/>
          <circle cx="16" cy="16" r="2" fill="white" fillOpacity="0.6"/>
        </svg>
      );
    }
    
    // Yi / 零一万物 - #003425
    if (lowerId.includes('yi-')) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={iconStyle}>
          <rect width="24" height="24" rx="5" fill="#003425"/>
          <path d="M8 6h8v12H8V6zm4-4v4m0 12v4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    }
    
    // 阿里云 / 通义 - #FF6A00
    if (lowerId.includes('tongyi') || lowerId.includes('alibaba') || lowerId.includes('dashscope')) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={iconStyle}>
          <rect width="24" height="24" rx="5" fill="#FF6A00"/>
          <path d="M12 3L4 10h4v6h8V10h4L12 3z" fill="white"/>
        </svg>
      );
    }
    
    // 默认AI图标 - #8b5cf6
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={iconStyle}>
        <rect width="24" height="24" rx="5" fill="#8b5cf6"/>
        <circle cx="12" cy="12" r="6" fill="white" fillOpacity="0.2"/>
        <path d="M12 8L16 12L12 16L8 12L12 8Z" fill="white" fillOpacity="0.9"/>
      </svg>
    );
  };

  return <>{renderIcon()}</>;
};

export default ModelIcon;