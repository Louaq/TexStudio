# LaTeX公式识别工具 - TypeScript版

一个基于 Electron + React + TypeScript 的现代化 LaTeX 公式识别桌面应用程序。

## ✨ 功能特性

- 📸 **截图识别** - 支持全局快捷键截图识别公式
- 📁 **文件上传** - 支持拖拽或选择图片文件进行识别
- 📋 **多格式复制** - 支持复制原始代码、行内公式($...$)、显示公式($$...$$)格式
- 📚 **历史记录** - 自动保存识别历史，方便查看和复用
- ⌨️ **全局快捷键** - 可自定义快捷键，支持后台运行
- 🔑 **API配置** - 支持自定义 SimpleTex API 配置
- 🎨 **现代化界面** - 基于 Styled Components 的美观界面设计

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **桌面应用**: Electron 27
- **样式方案**: Styled Components
- **状态管理**: React Hooks
- **API服务**: SimpleTex OCR API
- **构建工具**: Create React App + Electron Builder

## 📦 安装和运行

### 环境要求

- Node.js 16+ 
- npm 或 yarn

### 开发环境

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd latex-ocr-electron
   ```

2. **安装依赖**
   
   **推荐方法：使用自动安装脚本**
   ```bash
   # Windows 用户
   install.bat
   
   # macOS/Linux 用户
   chmod +x install.sh
   ./install.sh
   ```
   
   **手动安装方法：**
   
   如果遇到依赖冲突错误，请使用以下命令：
   ```bash
   # 推荐方法：使用 legacy peer deps
   npm install --legacy-peer-deps
   
   # 或者使用 force
   npm install --force
   ```
   
   正常情况下可以直接运行：
   ```bash
   npm install
   ```

3. **启动开发环境**
   ```bash
   npm run dev
   ```
   此命令会同时启动 React 开发服务器和 Electron 应用。

> **注意**: 项目已配置 `.npmrc` 文件来自动处理依赖冲突，但某些环境下仍可能需要手动添加参数。

### 生产构建

1. **构建应用**
   ```bash
   npm run build
   ```

2. **打包为可执行文件**
   ```bash
   npm run package
   ```

3. **生成安装包**
   ```bash
   npm run dist
   ```

## 🚀 快速使用

### 基本操作

1. **截图识别**
   - 使用快捷键 `Alt+C` 或点击菜单中的"截图"
   - 拖拽选择要识别的区域
   - 等待识别完成

2. **文件上传**
   - 使用快捷键 `Alt+U` 或点击菜单中的"上传图片"
   - 也可以直接拖拽图片文件到应用窗口

3. **复制结果**
   - 点击"复制LaTeX"按钮的下拉菜单
   - 选择需要的格式进行复制

### 设置配置

1. **API设置**
   - 点击菜单"设置" → "API设置"
   - 配置你的 SimpleTex API 密钥（可选，有默认配置）

2. **快捷键设置**
   - 点击菜单"设置" → "快捷键设置"
   - 自定义截图和上传的全局快捷键

3. **历史记录**
   - 点击菜单"历史记录"查看识别历史
   - 可以重新使用或删除历史记录

## 📁 项目结构

```
src/
├── electron/           # Electron 主进程代码
│   ├── main.ts        # 主进程入口
│   └── preload.ts     # 预加载脚本
├── components/        # React 组件
│   ├── MenuBar.tsx    # 菜单栏组件
│   ├── ImageDisplay.tsx # 图片显示组件
│   ├── LatexEditor.tsx  # LaTeX编辑器组件
│   ├── CopyButton.tsx   # 复制按钮组件
│   ├── StatusBar.tsx    # 状态栏组件
│   └── dialogs/         # 对话框组件
├── types/             # TypeScript 类型定义
├── utils/             # 工具函数
│   └── api.ts         # API 相关工具
├── App.tsx            # 主应用组件
└── index.tsx          # React 入口文件
```

## 🔧 开发说明

### 主要依赖

```json
{
  "electron": "^27.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "styled-components": "^6.0.0",
  "axios": "^1.5.0",
  "crypto-js": "^4.1.1",
  "electron-store": "^8.1.0",
  "react-dropzone": "^14.2.3"
}
```

### 构建配置

- **React 应用**: 使用 Create React App 构建
- **Electron 主进程**: 使用 TypeScript 编译到 `dist/` 目录
- **打包**: 使用 Electron Builder 生成各平台安装包

### API 集成

应用使用 SimpleTex API 进行公式识别：
- API 地址: `https://server.simpletex.cn/api/latex_ocr`
- 支持多种图片格式: PNG, JPG, JPEG, BMP, GIF
- 自动处理签名和请求头

## 🔒 安全性

- 使用 `contextIsolation` 和 `preload` 脚本确保安全
- 配置 Content Security Policy
- 禁用 Node.js 集成在渲染进程中

## 🎯 功能对比

| 功能 | Python版本 | TypeScript版本 |
|------|------------|----------------|
| 截图识别 | ✅ | ✅ |
| 文件上传 | ✅ | ✅ |
| 拖拽上传 | ❌ | ✅ |
| 历史记录 | ✅ | ✅ |
| 全局快捷键 | ✅ | ✅ |
| 现代化界面 | ❌ | ✅ |
| 跨平台支持 | ✅ | ✅ |
| 类型安全 | ❌ | ✅ |

## 📝 更新日志

### v1.0.3 - TypeScript版本
- 🚀 全新的 TypeScript + React + Electron 架构
- 🎨 现代化的界面设计和用户体验
- 📱 更好的响应式布局和交互
- 🔧 更完善的类型安全和错误处理
- ⚡ 更快的启动速度和运行性能

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📞 支持

如果您在使用过程中遇到问题，请：

1. 查看本文档的常见问题
2. 在 GitHub 上提交 Issue
3. 确保您的 Node.js 版本符合要求

---

**注意**: 本应用需要网络连接来使用 SimpleTex API 进行公式识别。首次使用时可能需要配置防火墙允许网络访问。



