"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentTimestamp = exports.validateApiConfig = exports.formatLatex = exports.getReqData = exports.randomStr = exports.DEFAULT_API_CONFIG = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
// SimpleTex API默认配置 - 不使用硬编码的API密钥
exports.DEFAULT_API_CONFIG = {
    appId: '',
    appSecret: ''
};
/**
 * 生成随机字符串
 * @param length 字符串长度
 * @returns 随机字符串
 */
function randomStr(length = 16) {
    const chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
exports.randomStr = randomStr;
/**
 * 生成API请求的签名和头部
 * @param reqData 请求数据
 * @param apiConfig API配置
 * @returns 请求头部和数据
 */
function getReqData(reqData = {}, apiConfig) {
    const header = {};
    header.timestamp = Math.floor(Date.now() / 1000).toString();
    header['random-str'] = randomStr(16);
    header['app-id'] = apiConfig.appId;
    // 构建签名字符串
    const params = [];
    // 添加请求参数
    const sortedReqKeys = Object.keys(reqData).sort();
    for (const key of sortedReqKeys) {
        params.push(`${key}=${reqData[key]}`);
    }
    // 添加头部参数
    const headerKeys = ['app-id', 'random-str', 'timestamp'];
    for (const key of headerKeys) {
        params.push(`${key}=${header[key]}`);
    }
    // 添加密钥
    params.push(`secret=${apiConfig.appSecret}`);
    // 生成签名
    const preSignString = params.join('&');
    header.sign = crypto_js_1.default.MD5(preSignString).toString();
    return { header, reqData };
}
exports.getReqData = getReqData;
/**
 * 格式化LaTeX代码
 * @param latex 原始LaTeX代码
 * @param mode 格式化模式
 * @returns 格式化后的LaTeX代码
 */
function formatLatex(latex, mode = 'normal') {
    if (!latex.trim())
        return latex;
    switch (mode) {
        case 'inline':
            return `$${latex}$`;
        case 'display':
            return `$$${latex}$$`;
        default:
            return latex;
    }
}
exports.formatLatex = formatLatex;
/**
 * 验证API配置
 * @param config API配置
 * @returns 是否有效
 */
function validateApiConfig(config) {
    // 检查API配置是否有效（appId和appSecret都不为空）
    return !!(config && config.appId && config.appSecret);
}
exports.validateApiConfig = validateApiConfig;
/**
 * 获取当前时间戳字符串
 * @returns 格式化的时间字符串
 */
function getCurrentTimestamp() {
    return new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}
exports.getCurrentTimestamp = getCurrentTimestamp;
//# sourceMappingURL=api.js.map 