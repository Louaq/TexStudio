# LaTeX公式识别工具 - TypeScript版

一个基于 Electron + React + TypeScript 的现代化 LaTeX 公式识别桌面应用程序。

## ✨ 功能特性

- 📸 **截图识别** - 支持全局快捷键截图识别公式
- 📁 **文件上传** - 支持拖拽或选择图片文件进行识别
- ✏️ **手写公式识别** - 支持直接手写数学公式并识别，配备橡皮擦工具
- 🤖 **AI 公式解释** - 集成 DeepSeek R1 大模型，智能解释数学公式含义和应用场景
- 📋 **多格式复制** - 支持复制原始代码、行内公式(\$...\$)、显示公式(\$$...\$$)格式
- 📁 **公式导出** - 支持导出为svg、png和jpg三种格式的图片
- 📚 **历史记录** - 自动保存识别历史，方便查看和复用
- ⌨️ **全局快捷键** - 可自定义快捷键，支持后台运行
- 🔑 **API配置** - 支持自定义[SimpleTex API](https://simpletex.cn/)配置和 [DeepSeek API](https://platform.deepseek.com/) 配置
- 🎨 **现代化界面** - 基于 Styled Components 的美观界面设计
- 🔄 **自动更新** - 支持检测和安装新版本，无需手动下载

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **桌面应用**: Electron 27
- **样式方案**: Styled Components
- **状态管理**: React Hooks
- **API服务**: SimpleTex OCR API + DeepSeek R1 API
- **AI集成**: OpenAI SDK（用于 DeepSeek API 调用）
- **构建工具**: Create React App + Electron Builder
- **自动更新**: electron-updater

## 📦 安装和运行

### 安装包下载

访问 [Release 页面](https://github.com/Louaq/TexStudio/releases) 下载最新版安装包

### 环境要求

- Node.js 16+ 
- npm 或 yarn

### 开发环境

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd SimpleTex-OCR
   ```

2. **安装依赖**
   
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
2. **本地运行**
   ```bash
   npm run start
   ```

3. **打包为可执行文件**
   ```bash
   npm run package
   ```

4. **生成安装包**
   ```bash
   npm run dist
   ```

## 🚀 快速使用

### 基本操作

1. **截图识别**
   - 使用快捷键 `Alt+A` 或点击菜单中的"截图"
   - 拖拽选择要识别的区域
   - 等待识别完成

2. **文件上传**
   - 使用快捷键 `Alt+S` 或点击菜单中的"上传图片"
   - 也可以直接拖拽图片文件到应用窗口

3. **手写公式识别**
   - 点击菜单中的"手写公式"按钮
   - 在弹出的画布上手写数学公式
   - 可以使用不同颜色和粗细的画笔
   - 使用橡皮擦工具可以擦除错误部分
   - 点击"提交识别"按钮进行识别
   - 识别结果将显示在主界面中

4. **复制结果**
   - 点击"复制LaTeX"按钮的下拉菜单
   - 选择需要的格式进行复制

5. **AI 公式解释**
   - 识别公式后，在右侧的"AI 公式解释"区域点击"解释公式"按钮
   - AI 会详细解释公式的含义、用途和相关概念
   - 需要先在API设置中配置 DeepSeek API 密钥

### 设置配置

1. **API设置**
   - 点击菜单"API设置"
   - 配置你的 [SimpleTex API](https://simpletex.cn/) 密钥（用于公式识别）
   - 配置 DeepSeek API 密钥（用于 AI 公式解释）
     - 访问 [DeepSeek 官网](https://platform.deepseek.com) 注册账号
     - 在控制台创建 API Key
     - 在设置中启用 DeepSeek 功能并填入 API Key

2. **快捷键设置**
   - 点击菜单""快捷键设置"
   - 自定义截图和上传的全局快捷键

3. **历史记录**
   - 点击菜单"历史记录"查看识别历史
   - 可以重新使用或删除历史记录

### 自动更新

应用支持自动更新功能，当有新版本发布时：

1. 应用启动后会自动检查更新
2. 如果发现新版本，会提示用户下载
3. 下载完成后，可选择立即重启应用安装新版本或稍后安装





