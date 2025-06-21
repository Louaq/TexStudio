import { ApiConfig } from '../types';
export declare const DEFAULT_API_CONFIG: ApiConfig;
/**
 * 生成随机字符串
 * @param length 字符串长度
 * @returns 随机字符串
 */
export declare function randomStr(length?: number): string;
/**
 * 生成API请求的签名和头部
 * @param reqData 请求数据
 * @param apiConfig API配置
 * @returns 请求头部和数据
 */
export declare function getReqData(reqData: Record<string, any> | undefined, apiConfig: ApiConfig): {
    header: Record<string, string>;
    reqData: Record<string, any>;
};
/**
 * 格式化LaTeX代码
 * @param latex 原始LaTeX代码
 * @param mode 格式化模式
 * @returns 格式化后的LaTeX代码
 */
export declare function formatLatex(latex: string, mode?: 'normal' | 'inline' | 'display'): string;
/**
 * 验证API配置
 * @param config API配置
 * @returns 是否有效
 */
export declare function validateApiConfig(config: ApiConfig): boolean;
/**
 * 获取当前时间戳字符串
 * @returns 格式化的时间字符串
 */
export declare function getCurrentTimestamp(): string;
//# sourceMappingURL=api.d.ts.map