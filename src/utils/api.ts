import CryptoJS from 'crypto-js';
import { ApiConfig, SimpletexResponse } from '../types';

// SimpleTex API默认配置 - 确保不使用硬编码的API密钥
export const DEFAULT_API_CONFIG: ApiConfig = {
  appId: '',
  appSecret: ''
};

/**
 * 生成随机字符串
 * @param length 字符串长度
 * @returns 随机字符串
 */
export function randomStr(length: number = 16): string {
  const chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 生成API请求的签名和头部
 * @param reqData 请求数据
 * @param apiConfig API配置
 * @returns 请求头部和数据
 */
export function getReqData(reqData: Record<string, any> = {}, apiConfig: ApiConfig) {
  const header: Record<string, string> = {};
  header.timestamp = Math.floor(Date.now() / 1000).toString();
  header['random-str'] = randomStr(16);
  header['app-id'] = apiConfig.appId;

  const params: string[] = [];
  const sortedReqKeys = Object.keys(reqData).sort();
  for (const key of sortedReqKeys) {
    params.push(`${key}=${reqData[key]}`);
  }
  const headerKeys = ['app-id', 'random-str', 'timestamp'];
  for (const key of headerKeys) {
    params.push(`${key}=${header[key]}`);
  }
  
  params.push(`secret=${apiConfig.appSecret}`);
  const preSignString = params.join('&');
  header.sign = CryptoJS.MD5(preSignString).toString();
  
  return { header, reqData };
}

/**
 * 格式化LaTeX代码
 * @param latex 原始LaTeX代码
 * @param mode 格式化模式
 * @returns 格式化后的LaTeX代码
 */
export function formatLatex(latex: string, mode: 'normal' | 'inline' | 'display' | 'equation' | 'mathml' = 'normal'): string {
  if (!latex.trim()) return latex;
  
  switch (mode) {
    case 'inline':
      return `$${latex}$`;
    case 'display':
      return `$$${latex}$$`;
    case 'equation':
      return `\\begin{equation}\n${latex}\n\\end{equation}`;
    case 'mathml':
      return latex;
    default:
      return latex;
  }
}

/**
 * 验证API配置
 * @param config API配置
 * @returns 是否有效
 */
export function validateApiConfig(config: ApiConfig): boolean {
  return !!(config && 
            config.appId && 
            config.appSecret && 
            config.appId.trim() && 
            config.appSecret.trim());
}

/**
 * 获取当前时间戳字符串
 * @returns 格式化的时间字符串
 */
export function getCurrentTimestamp(): string {
  return new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
} 

// DeepSeek API 调用函数
export const explainFormulaWithDeepSeek = async (latex: string, apiKey: string): Promise<string> => {
  try {
    // 动态导入 OpenAI SDK 以避免在 Electron 渲染进程中的问题
    const { default: OpenAI } = await import('openai');
    
    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // 允许在浏览器环境中使用
    });

    const prompt = `请详细解释以下数学公式的含义、用途和相关概念。请用中文回答，回答要通俗易懂，并使用 Markdown 格式：

**LaTeX公式：** $${latex}$$

请从以下几个方面进行解释：

## 基本含义
公式的核心含义和表达的数学关系

## 符号说明
公式中各个符号和变量的具体作用

## 应用场景
这个公式在实际中的应用领域和使用场景

## 相关概念
相关的数学概念、定理或公式

## 示例说明
如果可能，请举一个简单的数值例子

**注意：**
- 请使用 Markdown 格式回答
- 数学公式请用 $...$ 包围（行内公式）或 $$...$$ 包围（块级公式）
- 使用标题、粗体、列表等 Markdown 语法使内容更清晰
- 保持回答简洁明了，大约250-350字`;

    const completion = await openai.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "你是一位优秀的数学教师，擅长用通俗易懂的语言解释复杂的数学概念。请用中文回答，语言要生动有趣，容易理解。请使用标准的 Markdown 格式来组织回答，包括标题、列表、粗体等格式。数学公式请使用 LaTeX 语法并用 $ 或 $$ 包围。" 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      model: "deepseek-chat",
      max_tokens: 1200,
      temperature: 0.7
    });

    return completion.choices[0]?.message?.content || '抱歉，无法获取公式解释。';
  } catch (error) {
    console.error('DeepSeek API 调用失败:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        throw new Error('API 密钥无效，请检查 DeepSeek API 密钥设置');
      } else if (error.message.includes('429')) {
        throw new Error('API 调用频率超限，请稍后再试');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error('网络连接失败，请检查网络连接');
      }
    }
    
    throw new Error(`调用 DeepSeek API 失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}; 