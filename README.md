# 📖 Writer - Multi-Agent 小说创作系统

这是一个正在演进中的 **Multi-Agent 小说创作系统**。当前版本已经具备前端工作台、FastAPI 后端、Celery 异步生成、多角色 Agent 编排、章节编辑、导出、分享、质量评审、局部修复和过程可视化能力。

> 当前真实状态：系统核心仍由 `orchestrator` 驱动，但主链路已经升级为质量优先的 workflow v2：Chapter 仍是叙事主单位，scene/span 只作为规划、诊断、定位和局部修复单位。系统会记录 `WorkflowRun`、`WorkflowStepRun`、`Artifact`、`FeedbackItem`、`AgentContract`、`evaluation_harness` 和 workflow-v2 事件，方便在前端回放生成过程。

> **部署说明**: 本项目采用前后端分离架构，需要后端提供API服务。
> 
> 如果你只是想体验UI，前端可以编译为静态文件部署到 GitHub Pages / Vercel 等免费托管服务。完整功能需要后端配合。
> 
> 比赛展示可以参考下方「免费部署方案」将前后端都部署到免费平台，评委可以直接在线体验。

## ✨ 功能特点

- 🤖 **多角色创作链路** - Planner 负责策划与 scene anchors，Writer 连续生成整章，Critic v2 负责结构化诊断，Revise 负责局部修复
- 🧭 **工作流与工件追踪** - 记录 `WorkflowRun`、`WorkflowStepRun`、`Artifact`、结构化反馈、章节评审报告和 workflow-v2 事件
- 🧪 **Evaluation Harness 基座** - Critic v2 结果会标准化为章节评审报告，并沉淀为可版本化工件
- 🛡️ **系统层 Guardrails** - 在 Critic 前执行纯代码格式/标题/段落/字数等基础检查
- 🧩 **局部修复 + Stitching** - 问题定位到 scene/span 后只替换目标片段，并强制执行过渡、代词、情绪和语气拼接检查
- 🌍 **世界观与上下文管理** - Worldview Manager、NovelState 与向量检索共同支撑跨章节衔接
- 👀 **过程可视化** - 项目概览和 Workflow 详情页展示 Context Assembler、Critic v2、Failure Router、Local Revise、Stitching、NovelState 更新等真实过程
- 🔍 **向量语义检索** - ChromaDB存储相关历史内容，保证剧情连贯性
- ✅ **质量控制闭环** - Critic 打分、问题清单、修订循环和质量分析面板
- 📱 **移动端友好阅读** - 自动短段落排版，适配手机阅读
- 📦 **多格式导出** - 支持 EPUB / DOCX / HTML 三种格式导出
- 📜 **章节版本历史** - 每次保存自动创建版本，支持一键回滚
- 🧮 **Token用量统计** - 自动统计每个项目的Token消耗和预估成本
- 🔗 **只读分享链接** - 创建公开分享链接，无需登录即可阅读
- 👥 **项目协作** - 支持添加协作者，共同浏览项目
- 🤝 **可选人机交互确认** - 支持策划方案确认和每章生成确认，你可以掌控创作方向

## 🏗️ 当前系统架构

当前采用**前后端分离 + 异步任务队列 + 文件/数据库混合持久化**架构。长期目标是让数据库中的工作流与 Artifact 成为主事实源，文件系统逐步变为派生工件和兼容桥。

```
writer/
├── backend/                # FastAPI 后端 RESTful API
│   ├── api/                # API 端点（认证/项目/章节/任务/分享）
│   ├── models.py           # SQLAlchemy ORM 数据模型
│   ├── workflow_service.py # 工作流、工件、反馈服务
│   └── evaluation_sync.py  # harness 评审报告落库同步
├── frontend/               # React + TypeScript 前端
│   └── src/
│       ├── pages/          # 页面组件（登录/项目列表/编辑器/分析等）
│       └── utils/          # API 封装和工具
├── agents/                 # 当前启用的 Agent 函数
│   ├── planner_agent.py    # 小说策划
│   ├── writer_agent.py     # 章节生成
│   ├── critic_agent.py     # 章节评审
│   └── revise_agent.py     # 根据问题清单修订
├── core/
│   ├── config.py           # 配置中心（pydantic-settings）
│   ├── orchestrator.py     # 主编排器
│   ├── agent_contract.py   # Agent 契约定义
│   ├── evaluation_harness.py # 章节评审标准化基座
│   ├── workflow_optimization.py # scene anchors、Critic v2、局部修复和 stitching 工具
│   ├── novel_state_service.py # 项目内 NovelState 动态状态层
│   └── worldview_manager.py # 世界观状态管理
├── tasks/                  # Celery 异步任务
│   ├── writing_tasks.py    # 小说生成任务
│   └── export_tasks.py     # 导出任务
├── services/               # 业务服务层
│   └── export_service.py   # 多格式导出服务
├── prompts/                # 各 Agent 提示词模板
├── utils/                  # 工具函数
│   ├── volc_engine.py      # 火山引擎 API 客户端（自动记录 Token）
│   └── vector_db.py        # ChromaDB 向量检索
├── alembic/                # 数据库迁移
├── main.py                 # CLI 入口（也可直接生成）
└── requirements.txt        # Python 依赖
```

## 🚀 快速开始

### 1. 环境准备

需要预先安装：
- Python 3.10+
- Node.js 16+
- PostgreSQL 12+
- Redis

**在 macOS 上安装（Homebrew）：**
```bash
# 安装 PostgreSQL
brew install postgresql@14
brew services start postgresql

# 安装 Redis
brew install redis
brew services start redis
```

**在 Ubuntu/Debian 上安装：**
```bash
# 安装 PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib redis-server
sudo systemctl start postgresql
sudo systemctl start redis
```

**在 Windows 上：**
- 下载安装 [PostgreSQL](https://www.postgresql.org/download/windows/)
- 下载安装 [Redis](https://github.com/microsoftarchive/redis/releases) 或使用 WSL2 安装
- 推荐使用 WSL2 运行，体验更好

**不限制平台：** 理论上支持 macOS / Linux / Windows（WSL2），只要能运行 Python/Node.js/PostgreSQL/Redis 即可。

### 2. 安装依赖

```bash
# 创建虚拟环境
conda create -n novel_agent python=3.10
conda activate novel_agent

# 安装 Python 依赖
pip install -r requirements.txt

# 安装前端依赖
cd frontend
npm install
cd ..
```

### 3. 配置环境变量

编辑 `.env` 文件：
```env
# ========== API Key（必需）==========
WRITER_API_KEY=your-volcano-engine-api-key-here

# ========== 数据库（默认本地开发可不用改）==========
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mutiagent_writer

# ========== Redis（默认本地开发可不用改）==========
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

### 4. 初始化数据库

```bash
# 创建数据库
createdb mutiagent_writer

# 运行迁移建表
alembic upgrade head
```

### 5. 启动所有服务

**❗ 重要：需要同时打开 3 个终端窗口，都激活你的 Python 虚拟环境：**

| 终端 | 作用 | 启动命令 |
|------|------|----------|
| **终端 1** | FastAPI 后端服务（处理HTTP请求） | ```bash\nconda activate novel_agent\ncd /path/to/writer\nuvicorn backend.main:app --reload --host 0.0.0.0 --port 8000\n``` |
| **终端 2** | Celery Worker（异步处理AI生成任务） | ```bash\nconda activate novel_agent\ncd /path/to/writer\ncelery -A celery_app worker --loglevel=info\n``` |
| **终端 3** | Vite 前端开发服务器 | ```bash\nconda activate novel_agent\ncd /path/to/writer/frontend\nnpm run dev\n``` |

**为什么需要 3 个终端？**
- FastAPI 负责处理网页 API 请求
- Celery Worker 负责在后台运行耗时的AI生成任务，不会阻塞网页响应
- Vite 提供前端热重载开发服务

三者都必须运行，系统才能正常工作！

### 6. 使用系统

打开浏览器访问：`http://localhost:5173`

1. 注册新用户账号
2. 在设置页面填入你的火山引擎 API Key；如果服务器已经配置统一 Key，也可以不填自定义 Key
3. 登录后点击"创建新项目"
4. 填写小说需求：
   - **跳过策划确认**: 开启后自动通过策划方案，不需要人工确认
   - **跳过章节确认**: 开启后自动生成所有章节，不需要逐章确认
   - *如果两个都关闭*，系统会在生成完策划方案后停下来，等待你审阅确认，确认通过后才会开始生成正文
5. 点击"开始生成"，生成在后台异步运行
6. 刷新页面查看进度，当等待你确认时，会弹出确认对话框：
   - 可以预览策划方案或已生成章节（Markdown 自动渲染，包括表格）
   - 选择"通过，继续生成" → 系统继续生成下一步
   - 填写修改意见后选择"不通过，按修改意见重新优化" → AI 根据你的反馈重新修改
7. 全部生成完成后可以：
   - 阅读/编辑章节
   - 查看质量分析（总体评分、雷达图、章节评分趋势）
   - 导出 EPUB/DOCX/HTML
   - 创建分享链接
   - 添加协作者

---

## 📊 当前工作流程

```
用户需求加载
    ↓
Planner → 生成设定圣经、章节大纲、scene anchors → 存入向量数据库
    ↓
对每一章：
  1. Context Assembler 装配章节目标、scene anchors、前文摘要、设定、NovelState 和风格约束
  ↓
  2. Writer 连续生成完整章节，scene anchors 只作为内部路标
  ↓
  3. system_guardrails 执行标题/格式/字数/段落等基础检查
  ↓
  4. Critic v2 生成结构化诊断，问题定位到 scene/span
  ↓
  5. 未通过时 Failure Router 选择修复策略，Local Revise 只替换目标片段
  ↓
  6. Stitching Pass 修复过渡、指代、时间跳跃、情绪断裂和语气不一致
  ↓
  7. evaluation_harness 标准化评审结果，写入 info.json，并同步为 Artifact
  ↓
  8. 保存章节 → 更新 NovelState → 同步数据库 → 记录 chapter_draft / chapter_evaluation / workflow-v2 工件
  ↓
所有章节完成 → 可导出多种格式
```

workflow v2 的关键原则：
- Chapter 仍是最终叙事单位，避免把章节拆成互不连贯的小作文。
- Scene/span 只用于规划、诊断、定位和局部修复。
- 局部修复必须携带前后邻接段，修后必须经过 chapter-level stitching。
- 连续两轮局部修复仍失败时，才升级为整章轻量重写。

主要 Artifact 类型：
- `scene_anchor_plan`：本章剧情路标、冲突、角色动机、状态变化和结尾钩子。
- `chapter_critique_v2`：Critic v2 结构化诊断，包含问题维度、证据片段、严重度和修复指令。
- `repair_trace`：局部修复批次、修复策略、替换范围和收益记录。
- `stitching_report`：过渡、代词、时间、情绪和语气连贯性检查结果。
- `novel_state_snapshot`：章节写前/写后的角色、时间线、伏笔和文风动态状态快照。

---

## 🎯 新功能详解

### 1. 多格式导出
- **EPUB**: 可用于电子书阅读器
- **DOCX**: 可用于 Word/Pages 编辑
- **HTML**: 静态网页打包，适合分享

### 2. 章节版本历史
- 每次保存章节自动创建新版本
- 保留最近 10 个版本
- 在编辑器侧边栏可查看历史、预览、恢复任何版本

### 3. Token 使用量统计
- 每次 LLM 调用自动记录 Token 消耗
- 项目概览显示总 Token 和预估美元成本
- 设置页面显示用户月度统计

### 4. 只读分享链接
- 项目所有者可创建公开分享链接
- 任何人打开链接都可以阅读，无需登录
- 纯只读，无法编辑

### 5. 项目协作
- 项目所有者可以通过用户名添加协作者
- 协作者有只读权限，可以查看项目和章节
- 随时可以移除协作者

### 6. 人机交互确认模式（开发中）

> ⚠️ **当前状态**: 功能正在完善中，可能存在交互问题。稳定使用建议勾选"跳过策划确认"和"跳过章节确认"开启全自动模式。

开启方式：创建项目时关闭"跳过策划确认"和"跳过章节确认"

计划工作流程：
1. AI 生成完策划方案 → 弹出确认对话框 → 你预览 → 确认通过 / 修改后重新生成
2. AI 生成完每一章 → 弹出确认对话框 → 你预览 → 确认通过 / 修改后重新优化
3. 完全掌控创作方向，不满意可以随时调整

适合：
- 对小说要求高，想要亲自把关每一步
- 初次创作，不确定方向，需要逐步调整
- 重要作品，不想完全全自动

全自动模式（推荐稳定使用）：创建项目时勾选"跳过策划确认"和"跳过章节确认"，系统会全自动生成所有章节。

---

## 🔧 配置参数

所有可配置参数都在 `core/config.py`：

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `MAX_FIX_RETRIES` | 初稿修复最多重试轮数 | 4 |
| `MAX_PARALLEL_CHECKS` | 并行检查最大线程数 | 3 |
| `WORD_COUNT_DEVIATION_ALLOWED` | 允许字数偏差比例 | 0.15 |
| `LONG_PARAGRAPH_THRESHOLD` | 长段落判断阈值（字符） | 300 |
| `AI_CLICHE_REPEAT_THRESHOLD` | AI 套话多少次算重复 | 2 |
| `VECTOR_CHUNK_SIZE` | 向量数据库分块大小 | 500 |
| `CRITIC_PASS_SCORE` | Critic 及格线 | 8 |

> 注：部分历史配置项仍保留在配置文件中，当前主链路以 Planner / Context Assembler / Writer / Guardrails / Critic v2 / Failure Router / Local Revise / Stitching / Evaluation Harness / NovelState 为准。

---

## 🧑‍💼 Agent 职责分工

| Agent | 职责 |
|-------|------|
| Planner | 生成小说整体策划大纲 |
| Context Assembler | 汇总章节目标、scene anchors、前文、设定、风格和 NovelState |
| Writer | 连续生成完整章节，按 scene anchors 推进但不拆段独立生成 |
| Critic v2 | 章节评审、打分、输出定位到 scene/span 的结构化问题 |
| Failure Router | 根据问题类型选择局部修复、stitching 或整章轻量重写 |
| Revise | 根据 Critic 或用户反馈执行局部片段修复 |
| Stitching Pass | 修复过渡、指代、时间跳跃、情绪断裂和语气不一致 |
| Evaluation Harness | 标准化 Critic 输出，沉淀可追踪评审报告 |
| NovelState / Worldview Manager | 追踪角色、时间线、伏笔、文风和世界观动态事实 |

## 🧹 Git 与运行时产物

`data/projects/**/chapters/`、`data/projects/**/info.json`、`data/projects/**/novel_state.json` 等是本地生成产物，已加入 `.gitignore`。仓库保留需求、大纲和设定等可复用输入文件；实际生成的章节、评分快照和动态状态留在本机，避免每次试跑都产生无关提交。

---

## 📝 说明

- 所有 Agent 的 API Key 都使用火山引擎方舟平台
- 默认配置使用统一 API Key，简单方便
- 需要自己准备火山引擎账号和 API Key

## 📄 许可证

MIT License

## 🙏 致谢

基于多 Agent 协作架构思想，使用火山引擎 Doubao 模型提供强大的 AI 生成能力。
