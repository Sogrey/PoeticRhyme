# 书香诗韵 PoeticRhyme

专注儿童诗词启蒙的国学学习平台

## ✨ 特色功能

- 🎨 **水墨古风 UI** - 使用 shuimo-ui 水墨风 UI 框架
- 🌈 **多主题切换** - 清新/暖阳/静谧三种护眼主题
- 📜 **磨砂纸质感** - 仿真纸质纹理背景
- 📱 **响应式设计** - 适配宽屏与移动端
- 👶 **儿童友好** - 专为 6-12 岁儿童设计
- 🚀 **高性能** - 使用 WebAssembly 实现本地数据库操作
- 🔒 **隐私安全** - 所有数据存储在本地，无需网络连接
- 📶 **离线可用** - 无网络环境下完全正常使用

## 🏗️ 技术架构

### 纯前端架构

本项目采用 **纯前端架构**，使用 WebAssembly 实现本地数据库操作：

```
PoeticRhyme/
├── frontend/              # 前端应用
│   ├── src/              # 前端源代码
│   │   ├── wasm/         # WebAssembly 模块
│   │   ├── components/   # 组件
│   │   ├── views/        # 页面
│   │   ├── stores/       # 状态管理
│   │   ├── utils/        # 工具函数
│   │   └── assets/       # 静态资源
│   ├── wasm-poetry-db/   # Rust WebAssembly 源码
│   └── package.json      # 前端依赖
├── scripts/              # 数据处理脚本
├── pnpm-workspace.yaml   # pnpm 工作空间配置
├── turbo.json            # Turborepo 构建配置
└── package.json          # 根项目配置
```

### 技术栈

**前端**

| 技术                | 说明                   |
| ------------------- | ---------------------- |
| Vue 3 + TypeScript  | 渐进式 JavaScript 框架 |
| Vite                | 下一代前端构建工具     |
| shuimo-ui           | 水墨风 UI 组件库       |
| Vue Router          | 官方路由管理           |
| Pinia               | 状态管理               |
| ECharts + wordcloud | 数据可视化             |
| IndexedDB           | 本地存储               |

**WebAssembly**

| 技术      | 说明                 |
| --------- | -------------------- |
| Rust      | 系统级编程语言       |
| wasm-pack | WebAssembly 构建工具 |
| rusqlite  | SQLite 数据库绑定    |

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8
- Rust + wasm-pack（如需重新编译 WebAssembly 模块）

### 安装与启动

```sh
# 安装所有工作空间依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 类型检查
pnpm type-check

# 代码规范检查
pnpm lint
```

### 数据处理

```sh
# 一键更新数据（下载+预处理）
pnpm data:update

# 仅下载数据
pnpm data:fetch

# 仅预处理数据
pnpm data:preprocess
```

## 📋 开发计划

| 阶段   | 内容                                    | 状态      |
| ------ | --------------------------------------- | --------- |
| 阶段一 | 基础搭建（UI 框架、主题系统、背景效果） | ✅ 已完成 |
| 阶段二 | 数据存储与清洗（预处理脚本、数据优化）  | ✅ 已完成 |
| 阶段三 | WebAssembly 模块开发（Rust + SQLite）   | 📋 开发中 |
| 阶段四 | 首页开发（导航、搜索、分类卡片）        | ✅ 已完成 |
| 阶段五 | 诗词频道页（列表、筛选、搜索）          | 📋 开发中 |
| 阶段六 | 诗词详情页（正文、译文、赏析）          | 📋 待开发 |

## 📂 项目结构详解

### 前端结构 (frontend/)

```
frontend/
├── src/
│   ├── assets/
│   │   ├── fonts/          # 字体文件
│   │   ├── imgs/           # 图片资源
│   │   └── main.css        # 全局样式
│   ├── components/
│   │   └── layout/         # 布局组件
│   │       ├── AppHeader.vue     # 顶部导航
│   │       ├── AppFooter.vue     # 底部版权
│   │       ├── AppLayout.vue     # 主布局
│   │       └── ThemeSwitcher.vue # 主题切换
│   ├── composables/        # 组合式函数
│   ├── router/            # 路由配置
│   ├── stores/             # Pinia 状态管理
│   ├── utils/              # 工具函数
│   ├── views/              # 页面视图
│   ├── wasm/               # WebAssembly 模块（构建产物）
│   ├── wasm-poetry-db/     # Rust WebAssembly 源码
│   ├── App.vue
│   └── main.ts
├── package.json
├── vite.config.ts
└── tsconfig.app.json
```

## 📚 数据处理

### 数据统计

| 类型 | 数量    |
| ---- | ------- |
| 唐诗 | ~57,973 |
| 宋词 | ~21,333 |
| 诗经 | 305     |
| 论语 | 20      |
| 作者 | ~5,144  |
| 合计 | ~79,611 |

### 数据命令

```sh
# 一键更新数据（下载+预处理）
pnpm data:update

# 仅下载数据到 tmp/
pnpm data:fetch

# 仅预处理数据
pnpm data:preprocess
```

详细说明请查看 [数据处理脚本](./scripts/README.md)

## 📚 数据来源

- [chinese-poetry](https://github.com/chinese-poetry/chinese-poetry) - 最全中华古诗词数据库
- [Werneror/Poetry](https://github.com/Werneror/Poetry) - 85 万余首古诗词

## 📖 相关文档

- [开发计划](./doc/开发计划.md) - 详细开发计划与进度
- [需求文档](./doc/需求.md) - 产品需求说明

## 🎯 目标用户

- 小学生（6-12 岁）
- 家长与教师
- 诗词爱好者
