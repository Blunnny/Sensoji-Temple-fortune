# Sensoji-Temple-fortune (浅草缘签)

**浅草缘签** 是一款基于 Web 的“赛博占卜”应用，旨在复刻日本浅草寺的传统抽签仪式。通过数字化手段，用户不仅可以通过点击互动体验传统的百签占卜，还能通过摄像头手势识别，体验极具沉浸感的“隔空抽签”。

---

## 🌟 功能特色

### 1. **双模式抽签体验**
- **点击抽签**：经典的网页交互模式，点击九宫格抽屉即可完成抽签，适合所有设备。
- **手势抽签**：基于计算机视觉（Computer Vision）的创新模式。
  - 调用设备摄像头捕捉手部动作。
  - **悬停选择**：手指在空中移动，屏幕上的抽屉会实时响应高亮。
  - **捏合确认**：拇指与食指捏合保持 2 秒，即可完成“取签”动作。
  - **隔空换批**：拇指与中指捏合，可刷新当前的抽屉排列。

### 2. **完整还原百签内容**
- 收录了浅草寺观音灵签的全部 100 支签文。
- **双语展示**：包含中文签文及日文原文对照。
- **详尽解读**：提供签诗原文、白话文解读以及针对“愿望、疾病、失物、等待的人”等具体事项的详细指引。
- **吉凶判定**：严格遵循凶、吉、末吉、半吉等七种吉凶等级。

### 3. **沉浸式 UI 设计**
- 采用 **Noto Serif SC**（思源宋体）营造庄重的传统文化氛围。
- 响应式设计，完美适配桌面端、平板及手机屏幕。
- 细腻的视觉反馈：木质纹理的抽屉、金色的高亮边框、以及抽到签后的展开动画。

### 4. **本地历史记录**
- 自动保存最近 5 次抽签结果。
- 方便用户随时回顾之前的签文与解读。

---

## 🛠️ 技术栈

- **核心框架**：[Vite](https://vitejs.dev/) + TypeScript
- **手势识别**：[MediaPipe Hands](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker) (Google)
- **样式处理**：原生 CSS3 (Flexbox/Grid, CSS Variables)
- **部署平台**：Vercel

---

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/your-username/Sensoji-Temple-fortune.git
cd Sensoji-Temple-fortune
```

### 2. 安装依赖
```bash
npm install
# 或者
yarn
```

### 3. 启动开发服务器
```bash
npm run dev
```
打开浏览器访问 `http://localhost:5173` 即可预览。

### 4. 构建生产版本
```bash
npm run build
```
构建产物将输出到 `dist` 目录。

---

## 📱 手势模式使用指南

由于浏览器安全策略限制，手势识别功能需要满足以下条件之一才能正常使用：
1. **本地开发环境**：使用 `http://localhost` 访问。
2. **线上环境**：必须使用 **HTTPS** 协议访问。

**注意**：部分移动端浏览器（如 iOS Safari）可能存在兼容性差异，建议使用 Chrome 桌面版或安卓 Chrome 体验最佳效果。

---

## 📂 项目结构

```
.
├── public/              # 静态资源 (图片、图标)
├── src/
│   ├── contents.json    # 100 支签的完整数据
│   ├── contents.ts      # 数据类型定义与加载逻辑
│   ├── main.ts          # 核心业务逻辑 (手势识别、DOM 操作、状态管理)
│   ├── style.css        # 全局样式
│   └── vite-env.d.ts    # Vite 类型声明
├── index.html           # 入口 HTML
├── package.json         # 项目配置
└── tsconfig.json        # TypeScript 配置
```

---

## 📜 许可证

本项目仅供学习与交流使用。签文内容源自传统文化典籍。

