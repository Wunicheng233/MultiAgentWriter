<div align="center">

<!-- Hero Section -->
<br />
<img src="https://user-images.githubusercontent.com/97361651/210085073-83e6277e-8c3a-4501-a6d7-b2854f371156.svg" alt="StoryForge AI" width="120" height="120" />

# StoryForge AI

### 多智能体协作小说创作系统

**让 AI 成为你的专业创作团队——策划、写作、评审、修订，各司其职**

<br />

<!-- Badge Grid -->
<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Celery-37814A?style=for-the-badge&logo=celery&logoColor=white" alt="Celery" />
  <img src="https://img.shields.io/badge/Chroma-4B32C3?style=for-the-badge&logo=chroma&logoColor=white" alt="ChromaDB" />
</p>

<p align="center">
  <a href="#-核心特性"><strong>核心特性</strong></a> ·
  <a href="#-系统架构"><strong>架构概览</strong></a> ·
  <a href="#-快速开始"><strong>快速开始</strong></a> ·
  <a href="#-工作流程"><strong>工作流程</strong></a>
</p>

<br />

<!-- Visual Divider -->
<img src="https://user-images.githubusercontent.com/97361651/210085587-2f90366f-90a6-4d9a-8b7c-9c3d7f8e4b5a.svg" width="100%" alt="divider" />

</div>

<br />

<!-- ## ✨ 为什么选择 StoryForge? -->

<table>
<tr>
<td width="50%" valign="top">

### 🎯 专业创作团队，一人成团

不再是单一的 AI 写作工具。StoryForge 为你配备了一整个**专业创作团队**：

- **策划编辑** → 设定世界观、人物、分章大纲
- **专职作家** → 流畅生成完整章节内容
- **质量评审** → 多维度结构化诊断打分
- **修订专家** → 精准定位问题，局部修复

</td>
<td width="50%" valign="top">

### 🧠 记忆连贯，永不遗忘

AI 写作最头疼的问题？写着写着就忘了人物设定和剧情伏笔。

- **NovelState 动态状态追踪** → 角色、时间线、伏笔、文风实时更新
- **向量语义检索** → 自动关联前文内容，保证连贯性
- **世界管理系统** → 世界观规则统一，不前后矛盾

</td>
</tr>
</table>

<br />

<div align="center">
  <img src="https://user-images.githubusercontent.com/97361651/210085587-2f90366f-90a6-4d9a-8b7c-9c3d7f8e4b5a.svg" width="80%" alt="divider" />
</div>

<br />

## 🚀 核心特性

<div align="center">
<table>
<tr>
<td align="center" width="25%">
<br />
<img src="https://user-images.githubusercontent.com/97361651/210085073-83e6277e-8c3a-4501-a6d7-b2854f371156.svg" width="48" />

### 多 Agent 协作
Planner → Writer → Critic → Revise
<br />
各司其职，质量可控
<br />
<br />
</td>
<td align="center" width="25%">
<br />
<img src="https://user-images.githubusercontent.com/97361651/210085073-83e6277e-8c3a-4501-a6d7-b2854f371156.svg" width="48" />

### 人机共创
支持策划和章节级确认
<br />
你掌控方向，AI 负责执行
<br />
<br />
</td>
<td align="center" width="25%">
<br />
<img src="https://user-images.githubusercontent.com/97361651/210085073-83e6277e-8c3a-4501-a6d7-b2854f371156.svg" width="48" />

### 结构化评审
Critic v2 多维度打分
<br />
问题定位到 scene/span 级别
<br />
<br />
</td>
<td align="center" width="25%">
<br />
<img src="https://user-images.githubusercontent.com/97361651/210085073-83e6277e-8c3a-4501-a6d7-b2854f371156.svg" width="48" />

### 局部智能修复
只修改有问题的片段
<br />
Stitching 保证过渡自然
<br />
<br />
</td>
</tr>
</table>

<table>
<tr>
<td align="center" width="20%">
<strong>📊 质量分析面板</strong><br />
雷达图 + 评分趋势
</td>
<td align="center" width="20%">
<strong>📦 多格式导出</strong><br />
EPUB / DOCX / HTML
</td>
<td align="center" width="20%">
<strong>🔗 只读分享</strong><br />
公开链接，无需登录
</td>
<td align="center" width="20%">
<strong>📜 版本历史</strong><br />
自动保存，一键回滚
</td>
<td align="center" width="20%">
<strong>👥 协作支持</strong><br />
协作者共同浏览
</td>
</tr>
</table>
</div>

<br />

<div align="center">
  <img src="https://user-images.githubusercontent.com/97361651/210085587-2f90366f-90a6-4d9a-8b7c-9c3d7f8e4b5a.svg" width="80%" alt="divider" />
</div>

<br />

## 🏗️ 系统架构

```mermaid
flowchart TD
    subgraph Frontend["React 19 + TypeScript 前端"]
        direction LR
        A[ProjectOverview<br />项目指挥中心]
        B[Editor<br />写作工作台]
        C[Reader<br />沉浸式阅读]
        D[QualityDashboard<br />质量分析]
        E[ChapterList<br />章节管理]
    end

    subgraph Backend["FastAPI 后端服务层"]
        direction LR
        F[RESTful API]
        G[Workflow Service]
        H[Evaluation Sync]
        I[Export Service]
    end

    subgraph Core["编排核心层"]
        direction LR
        J[Orchestrator<br />主编排器]
        K[NovelState<br />动态状态管理]
        L[Worldview Manager<br />世界观追踪]
        M[Evaluation Harness<br />标准化评审]
        N[System Guardrails<br />零Token格式检查]
    end

    subgraph Agents["多 Agent 协作层"]
        direction LR
        O[Planner<br />策划编辑]
        P[Context Assembler<br />上下文装配]
        Q[Writer<br />专职作家]
        R[Critic v2<br />质量评审]
        S[Failure Router<br />修复决策]
        T[Revise<br />局部修订]
        U[Stitching Pass<br />连贯检查]
    end

    subgraph Persistence["持久化层"]
        direction LR
        V[(PostgreSQL<br />业务数据)]
        W[ChromaDB<br />向量检索]
        X[Redis<br />任务队列]
        Y[File System<br />工件导出]
    end

    User((👤 用户)) --> Frontend
    Frontend --> Backend
    Backend --> Core
    Core --> Agents
    Agents --> Core
    Core --> Persistence
    Persistence --> Core
```

### 📁 项目结构

```
storyforge-ai/
├── 📁 frontend/               # React + TypeScript + Vite
│   ├── 📁 src/pages/         # 页面组件
│   │   ├── ProjectOverview   # 项目指挥中心
│   │   ├── Editor            # 写作工作台
│   │   ├── Reader            # 沉浸式阅读
│   │   └── QualityDashboard  # 质量分析面板
│   └── 📁 components/        # 可复用UI组件
│
├── 📁 backend/               # FastAPI 后端
│   ├── 📁 api/              # RESTful API 端点
│   ├── models.py            # SQLAlchemy ORM 模型
│   └── workflow_service.py  # 工作流服务
│
├── 📁 core/                 # 编排核心
│   ├── orchestrator.py      # 主编排器 (67KB)
│   ├── evaluation_harness.py # 评审标准化
│   ├── novel_state_service.py # 动态状态追踪
│   ├── workflow_optimization.py # v2 智能修复
│   └── system_guardrails.py # 零Token格式检查
│
├── 📁 agents/               # 多 Agent 实现
│   ├── planner_agent.py
│   ├── writer_agent.py
│   ├── critic_agent.py
│   └── revise_agent.py
│
├── 📁 tasks/                # Celery 异步任务
│   ├── writing_tasks.py
│   └── export_tasks.py
│
└── 📁 utils/                # 基础设施
    ├── volc_engine.py       # 火山引擎 API 客户端
    └── vector_db.py         # ChromaDB 向量检索
```

<br />

<div align="center">
  <img src="https://user-images.githubusercontent.com/97361651/210085587-2f90366f-90a6-4d9a-8b7c-9c3d7f8e4b5a.svg" width="80%" alt="divider" />
</div>

<br />

## 🔄 创作工作流

```mermaid
flowchart TD
    Start([👤 用户提交需求]) --> Planner

    Planner[Planner<br />生成设定圣经<br />与 scene anchors] --> |存入向量库| Loop

    subgraph Loop[逐章生成循环]
        direction TB
        Context[Context Assembler<br />装配章节上下文]
        Writer[Writer<br />连续生成整章]
        Guardrails[System Guardrails<br />零 Token 格式检查]
        Critic[Critic v2<br />多维度结构化评审]

        Context --> Writer
        Writer --> Guardrails
        Guardrails --> Critic
    end

    Critic --> Pass{通过质量门槛?}

    Pass -->|✅ 是| Next[保存章节<br />更新 NovelState<br />记录 Artifact]
    Pass -->|❌ 否| Failure[Failure Router<br />诊断问题类型]

    Failure -->|局部问题| Revise[Local Revise<br />只修改目标片段]
    Failure -->|连贯问题| Stitch[Stitching Pass<br />过渡/指代/情绪修复]
    Failure -->|严重问题| Rewrite[整章轻量重写]

    Revise --> Guardrails
    Stitch --> Guardrails
    Rewrite --> Guardrails

    Next --> More{还有章节?}
    More -->|是| Context
    More -->|否| Done([🎉 创作完成<br />可导出/分享])

    style Planner fill:#e8f5e9,stroke:#43a047,color:#1b5e20
    style Writer fill:#e3f2fd,stroke:#1976d2,color:#0d47a1
    style Critic fill:#fff3e0,stroke:#f57c00,color:#e65100
    style Revise fill:#fce4ec,stroke:#c2185b,color:#880e4f
```

### 📋 v2 工作流核心原则

| 原则 | 说明 |
|------|------|
| **章节为单位** | Chapter 是最终叙事单位，不拆成互不连贯的小作文 |
| **精确诊断** | Scene/span 只用于规划、诊断、定位和局部修复 |
| **强制衔接** | 局部修复必须携带前后邻接段，修后经 stitching 检查 |
| **渐进升级** | 连续两轮局部修复失败时，才升级为整章重写 |

---

### 📦 核心 Artifact 类型

| Artifact | 作用 |
|----------|------|
| `scene_anchor_plan` | 本章剧情路标、冲突、角色动机、状态变化、结尾钩子 |
| `chapter_critique_v2` | Critic v2 结构化诊断，含问题维度、证据、严重度、修复指令 |
| `repair_trace` | 局部修复批次、修复策略、替换范围、收益记录 |
| `stitching_report` | 过渡、代词、时间、情绪、语气连贯性检查结果 |
| `novel_state_snapshot` | 章节写前/写后的动态状态快照 |

<br />

<div align="center">
  <img src="https://user-images.githubusercontent.com/97361651/210085587-2f90366f-90a6-4d9a-8b7c-9c3d7f8e4b5a.svg" width="80%" alt="divider" />
</div>

<br />

## 🚀 快速开始

### 📋 前置要求

| 依赖 | 版本要求 |
|------|---------|
| Python | ≥ 3.10 |
| Node.js | ≥ 16 |
| PostgreSQL | ≥ 12 |
| Redis | ≥ 6 |

---

### 1️⃣ 一键环境安装 (macOS)

```bash
brew install postgresql@14 redis
brew services start postgresql
brew services start redis
```

### 2️⃣ 依赖安装

```bash
# Python 虚拟环境
conda create -n storyforge python=3.10
conda activate storyforge

# 后端依赖
pip install -r requirements.txt

# 前端依赖
cd frontend && npm install && cd ..
```

### 3️⃣ 环境配置

编辑 `.env` 文件：

```env
# ========== API Key（必需）==========
WRITER_API_KEY=your-volcano-engine-api-key-here

# ========== 数据库（本地开发可不用改）==========
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/storyforge

# ========== Redis（本地开发可不用改）==========
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

### 4️⃣ 数据库初始化

```bash
createdb storyforge
alembic upgrade head
```

### 5️⃣ 启动所有服务

> **需要 3 个终端窗口，都激活虚拟环境**

| 终端 | 服务 | 启动命令 |
|------|------|----------|
| **1** | FastAPI 后端 | `uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000` |
| **2** | Celery Worker | `celery -A celery_app worker --loglevel=info` |
| **3** | Vite 前端 | `cd frontend && npm run dev` |

### 6️⃣ 开始创作

访问 `http://localhost:5173` → 注册账号 → 创建项目 → 开始生成

<br />

<div align="center">
  <img src="https://user-images.githubusercontent.com/97361651/210085587-2f90366f-90a6-4d9a-8b7c-9c3d7f8e4b5a.svg" width="80%" alt="divider" />
</div>

<br />

## 🤖 Agent 团队

<table>
<tr>
<td width="14%" align="center">
<img src="https://user-images.githubusercontent.com/97361651/210085073-83e6277e-8c3a-4501-a6d7-b2854f371156.svg" width="48" />

### Planner
策划编辑
</td>
<td width="86%">
生成小说整体策划、设定圣经、分章大纲、scene anchors
</td>
</tr>
<tr>
<td align="center">
<img src="https://user-images.githubusercontent.com/97361651/210085073-83e6277e-8c3a-4501-a6d7-b2854f371156.svg" width="48" />

### Writer
专职作家
</td>
<td>
连续生成完整章节，按 scene anchors 推进但不拆段独立生成
</td>
</tr>
<tr>
<td align="center">
<img src="https://user-images.githubusercontent.com/97361651/210085073-83e6277e-8c3a-4501-a6d7-b2854f371156.svg" width="48" />

### Critic v2
质量评审
</td>
<td>
多维度章节评审、打分、输出定位到 scene/span 的结构化问题清单
</td>
</tr>
<tr>
<td align="center">
<img src="https://user-images.githubusercontent.com/97361651/210085073-83e6277e-8c3a-4501-a6d7-b2854f371156.svg" width="48" />

### Revise
修订专家
</td>
<td>
根据 Critic 或用户反馈，执行局部片段精准修复
</td>
</tr>
<tr>
<td align="center">
<img src="https://user-images.githubusercontent.com/97361651/210085073-83e6277e-8c3a-4501-a6d7-b2854f371156.svg" width="48" />

### NovelState
状态记忆
</td>
<td>
追踪角色、时间线、伏笔、文风和世界观动态事实，永不遗忘
</td>
</tr>
</table>

<br />

<div align="center">
  <img src="https://user-images.githubusercontent.com/97361651/210085587-2f90366f-90a6-4d9a-8b7c-9c3d7f8e4b5a.svg" width="80%" alt="divider" />
</div>

<br />

## 📊 项目健康度

> **审计日期：2026-04-24**

| 维度 | 评分 | 说明 |
|------|------|------|
| 核心业务逻辑 | 9/10 | 完整、可运行、架构设计优秀 |
| 代码质量 | 7/10 | 存在少量重复，个别文件过大 |
| 测试覆盖 | 6/10 | 新功能有测试，核心流程待加强 |
| 架构前瞻性 | 9/10 | DB 模型超前，为扩展预留空间 |
| **总体健康度** | **7.8/10** | 🟢 优秀的 AI 写作产品原型 |

---

### 📝 已知优化点

- [ ] ProjectOverview 信息密度过高，需改为标签页架构
- [ ] Editor 专注模式，提升写作空间占比
- [ ] Agent 状态 UI 组件统一
- [ ] orchestrator.py 模块拆分

详见：`plan/05-UI-UX-Optimization-Report.md`

<br />

<div align="center">
  <img src="https://user-images.githubusercontent.com/97361651/210085587-2f90366f-90a6-4d9a-8b7c-9c3d7f8e4b5a.svg" width="80%" alt="divider" />
</div>

<br />

## 📄 许可证

MIT License - 可自由使用、修改、分发

---

## 🙏 致谢

基于多智能体协作架构思想，使用**火山引擎 Doubao** 模型提供强大的 AI 生成能力。

<br />

---

<div align="center">
<strong>Made with ❤️ for writers who want to create more, better, faster.</strong>

<br />
<br />

[⬆️ 回到顶部](#storyforge-ai)

</div>
