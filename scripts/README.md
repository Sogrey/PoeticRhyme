# 数据处理脚本说明

## 概述

本目录包含诗词数据的获取、预处理和管理脚本。

## 数据源

使用 [chinese-poetry](https://github.com/chinese-poetry/chinese-poetry) 项目作为主要数据源。

### 数据类型

| 类型 | 数量    | 说明     |
| ---- | ------- | -------- |
| 唐诗 | ~57,973 | 全唐诗   |
| 宋词 | ~21,333 | 宋词合集 |
| 诗经 | 305     | 经典诗集 |
| 论语 | 20      | 论语章节 |
| 作者 | ~5,144  | 诗人     |

## 脚本说明

### 1. fetch-data.js - 数据获取

从 GitHub 下载并解压 chinese-poetry 数据包。

```bash
pnpm run data:fetch
```

**功能：**

- 检测当前环境（Windows PowerShell、Git Bash、macOS、Linux）
- 自动选择最优解压方式（tar、unzip、7z、PowerShell .NET）
- 将下载的 zip 文件解压到 `tmp/chinese-poetry` 目录
- 手动下载时将 zip 放入 `tmp` 目录即可

**支持的手动下载：**
如果网络下载慢，可手动下载 zip 文件：

- URL: https://github.com/chinese-poetry/chinese-poetry/archive/refs/heads/master.zip
- 保存到: `tmp/chinese-poetry-master.zip`
- 然后运行 `pnpm run data:fetch`

### 2. preprocess-data.js - 数据预处理

处理原始数据，生成网站可用的 JSON 文件。

```bash
pnpm run data:preprocess
```

**功能：**

- 读取 `tmp/chinese-poetry` 目录下的原始数据
- 统一数据格式（处理 `paragraphs` 字段）
- 合并同类数据
- **繁简转换**：自动将繁体字转换为简体字
- **自动拆分**：单文件超过 20MB 时自动拆分为多个小文件
- 输出到 `frontend/public/data` 目录

**输出文件（frontend/public/data/）：**

| 文件         | 说明              | 大小   |
| ------------ | ----------------- | ------ |
| poems.1.json | 诗词数据（拆分1） | ~21MB  |
| poems.2.json | 诗词数据（拆分2） | ~21MB  |
| poems.3.json | 诗词数据（拆分3） | ~14MB  |
| authors.json | 作者信息          | ~640KB |
| indexes.json | 索引数据          | ~394KB |
| shijing.json | 诗经              | ~70KB  |
| lunyu.json   | 论语              | ~134KB |
| stats.json   | 统计信息          | 小文件 |

### 3. update-data.js - 一键更新

执行完整的数据更新流程。

```bash
pnpm run data:update
```

等同于依次执行：

```bash
pnpm run data:fetch
pnpm run data:preprocess
```

## 数据格式

### 诗词条目 (poems.1.json 等)

```json
{
  "id": "唯一标识",
  "title": "诗词标题",
  "content": "诗词内容（换行分隔）",
  "author": "作者名",
  "authorId": "作者ID",
  "dynasty": "朝代",
  "tags": ["标签数组"],
  "rhythmic": "词牌名（宋词）",
  "paragraphs": ["原始段落数组"]
}
```

### 作者信息 (authors.json)

```json
{
  "id": "作者ID",
  "name": "作者名",
  "dynasty": "朝代",
  "description": "作者描述",
  "poetryCount": "诗词数量"
}
```

### 统计数据 (stats.json)

```json
{
  "totalPoems": 79611,
  "tangshiCount": 57973,
  "songciCount": 21333,
  "shijingCount": 305,
  "lunyuCount": 20,
  "authorsCount": 5144,
  "dynasties": ["唐", "宋", "先秦"],
  "processedAt": "处理时间"
}
```

## 环境说明

脚本支持跨平台自动检测：

| 环境               | 首选解压方式 | 备选  |
| ------------------ | ------------ | ----- |
| Windows PowerShell | .NET ZipFile | 7z    |
| Windows Git Bash   | tar          | unzip |
| macOS              | unzip        | tar   |
| Linux              | unzip        | tar   |

## 故障排除

### 解压失败

如果自动解压失败，可手动解压：

1. 下载 zip 文件
2. 解压到 `tmp/chinese-poetry` 目录
3. 删除 zip 文件
4. 运行 `pnpm run data:preprocess`

### 预处理无输出

检查入口判断是否正确：

```bash
node scripts/preprocess-data.js
```

### 数据文件过大

预处理脚本会自动拆分超过 20MB 的文件。如需调整，修改 `MAX_FILE_SIZE` 常量：

```javascript
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
```

## 繁简转换说明

预处理脚本包含自动繁简转换功能：

- 使用 `simplizeText()` 函数将繁体字转换为简体字
- 转换表包含数千个繁简字符对应关系
- 适用于诗词标题、内容、作者、标签等字段
