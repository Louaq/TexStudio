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