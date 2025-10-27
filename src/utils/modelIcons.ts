/**
 * 模型图标映射
 * 提供模型的颜色和显示名称
 */

/**
 * 获取模型颜色
 * 根据模型的品牌颜色返回对应的颜色值
 */
export function getModelColor(modelId: string): string {
  const lowerModelId = modelId.toLowerCase();
  
  // Qwen系列 - 紫色 #615CED
  if (lowerModelId.includes('qwen')) {
    return '#615CED';
  }
  
  // Baichuan - 橙色 #FF6933
  if (lowerModelId.includes('baichuan')) {
    return '#FF6933';
  }
  
  // ChatGLM - 蓝色 #4268FA
  if (lowerModelId.includes('chatglm') || lowerModelId.includes('glm')) {
    return '#4268FA';
  }
  
  // MiniMax - 红色 #F23F5D
  if (lowerModelId.includes('minimax')) {
    return '#F23F5D';
  }
  
  // DeepSeek - 蓝色 #4D6BFE
  if (lowerModelId.includes('deepseek')) {
    return '#4D6BFE';
  }
  
  // Moonshot - 黑色 #16191E
  if (lowerModelId.includes('moonshot')) {
    return '#16191E';
  }
  
  // Spark - 蓝色 #0070F0
  if (lowerModelId.includes('spark')) {
    return '#0070F0';
  }
  
  // Kimi - 绿色
  if (lowerModelId.includes('kimi')) {
    return '#00c896';
  }
  
  // Doubao - 紫色
  if (lowerModelId.includes('doubao')) {
    return '#8e47ff';
  }
  
  // Zhipu - 蓝色 #3859FF
  if (lowerModelId.includes('zhipu')) {
    return '#3859FF';
  }
  
  // 阿里云
  if (lowerModelId.includes('alibaba') || lowerModelId.includes('tongyi')) {
    return '#FF6A00';
  }
  
  // 百度
  if (lowerModelId.includes('baidu')) {
    return '#2932E1';
  }
  
  // 腾讯
  if (lowerModelId.includes('tencent')) {
    return '#0052D9';
  }
  
  // 智谱
  if (lowerModelId.includes('glm') || lowerModelId.includes('zhipu')) {
    return '#3859FF';
  }
  
  // 零一万物 Yi
  if (lowerModelId.includes('yi')) {
    return '#003425';
  }
  
  // MiniMax
  if (lowerModelId.includes('minimax')) {
    return '#F23F5D';
  }
  
  // 默认紫色
  return '#8b5cf6';
}

/**
 * 获取模型名称的显示文本
 * 将模型ID转换为友好的中文或英文显示名称
 */
export function getModelDisplayName(modelId: string): string {
  const lowerModelId = modelId.toLowerCase();
  
  // 常见模型的中文名称
  if (lowerModelId.includes('qwen')) return '通义千问';
  if (lowerModelId.includes('baichuan')) return '百川智能';
  if (lowerModelId.includes('chatglm')) return 'ChatGLM';
  if (lowerModelId.includes('minimax')) return 'MiniMax';
  if (lowerModelId.includes('deepseek')) return 'DeepSeek';
  if (lowerModelId.includes('moonshot')) return 'Moonshot';
  if (lowerModelId.includes('spark')) return 'Spark AI';
  if (lowerModelId.includes('kimi')) return 'Kimi';
  if (lowerModelId.includes('doubao')) return '豆包';
  if (lowerModelId.includes('zhipu')) return '智谱AI';
  if (lowerModelId.includes('baidu')) return '百度文心';
  if (lowerModelId.includes('yi')) return '零一万物';
  if (lowerModelId.includes('modelscope')) return '魔搭';
  if (lowerModelId.includes('openai')) return 'OpenAI';
  if (lowerModelId.includes('claude') || lowerModelId.includes('anthropic')) return 'Claude';
  if (lowerModelId.includes('gemini')) return 'Gemini';
  if (lowerModelId.includes('moonshot')) return 'Moonshot';
  
  // 如果没有匹配到，返回原始ID的最后一部分
  const parts = modelId.split('/');
  return parts[parts.length - 1];
}