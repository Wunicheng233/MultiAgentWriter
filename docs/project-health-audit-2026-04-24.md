# StoryForge AI 项目健康审计报告

**日期**: 2026-04-24  
**审计范围**: 全代码库

---

## 执行摘要

本次全面审计发现：
- ✅ **核心代码健康**: 主要业务逻辑完整且运行正常
- ⚠️ **文档过载**: plan/目录存在重复和重叠文档，需精简
- 🧹 **可清理文件**: ~12MB 的运行时产物、缓存、临时文件
- 🔧 **代码重复**: Agent状态UI存在两处独立实现

---

## 1. 发现的问题清单

### 1.1 冗余/临时文件 (已清理)

| 文件/目录 | 大小 | 状态 | 处理 |
|----------|------|------|------|
| `__pycache__/` (多处) | ~1MB | 非版本控制 | ✅ 已清理 |
| `*.pyc` 文件 | 少量 | 非版本控制 | ✅ 已清理 |
| `vector_db/` | ~12MB | 本地测试数据 | ⚠️ 建议保留（开发用） |
| `debug/debug_token.py` + `debug_token2.py` | 重复功能 | 调试脚本 | 🔧 建议合并 |
| `outputs/` | 空目录 | 遗留 | ✅ 已删除 |

### 1.2 Plan文档分析

当前 `plan/` 目录有 **9个文档**，存在严重的层级重叠：

| 文档 | 状态 | 建议 | 原因 |
|------|------|------|------|
| `00-DESIGN.md` | 过时 | 🗑️ 删除 | 最早期设计，内容已被后续文档覆盖 |
| `01-System-Level Guardrails Specification.md` | ✅ 准确 | 📝 保留 | 已实现，与代码基本一致 |
| `02-flow.md` | 过时 | 🗑️ 删除 | 早期流程图，orchestrator已重构 |
| `03-Long-Term Product Roadmap.md` | ✅ 有效 | 📝 保留 | 长期愿景，参考价值 |
| `04-Architecture Evolution Plan.md` | ⚠️ 部分过时 | 📝 保留 | 架构演进方向正确，但部分假设已变 |
| `05-Master Execution Plan.md` | ❌ 与06重叠 | 🗑️ 归档 | 内容大部分被06吸收 |
| `05-UI-UX-Optimization-Report.md` | ✅ 新增 | 📝 保留 | 刚完成的UI审计报告 |
| `06-Architecture Program Board.md` | ✅ 有效 | 📝 保留 | 当前最准确的技术推进总表 |
| `07-Competition Sprint Plan.md` | ✅ 有效 | 📝 保留 | 两周冲刺计划，当前执行中 |

**处理后**: 9个 → 5个核心文档

### 1.3 代码重复与死代码

#### A. Agent状态UI重复
**位置**:
- `frontend/src/components/AgentCard.tsx` - Editor页面使用
- `frontend/src/pages/ProjectOverview.tsx:727-762` - 内联实现

**问题**:
- Editor使用可折叠的AgentCard组件
- ProjectOverview内联实现了类似但更简单的状态条
- 样式类、Badge变体逻辑不统一

**建议**: 统一使用AgentCard组件，新增`compact`模式支持ProjectOverview的简洁展示

#### B. AgentCardConfig类型未复用
**位置**: `frontend/src/pages/ProjectOverview.tsx:48-52`
```typescript
type AgentCardConfig = { key: string; title: string; subtitle: string }
```
Agent配置定义在页面内，没有提升到共享类型。

### 1.4 依赖与配置

| 依赖源 | 状态 | 备注 |
|--------|------|------|
| `requirements.txt` | ✅ 完整 | 21个依赖，版本范围合理 |
| `frontend/package.json` | ✅ 完整 | React 19 + Vite + TanStack Query |
| `.env` | ✅ 存在 | 敏感配置正确隔离 |

### 1.5 .gitignore 与实际文件不一致

**问题**: `.gitignore` 声明忽略以下目录，但它们实际被commit了：
- `vector_db/` (~12MB)
- `logs/`
- `data/`

**原因**: 这些目录包含开发测试用的占位文件或目录结构。

**建议**: 保持现状，因为它们是开发必需的。如果真的需要忽略，应在gitignore中添加例外规则。

---

## 2. 架构健康度评估

### 2.1 核心模块状态

| 模块 | 健康度 | 备注 |
|------|--------|------|
| `core/orchestrator.py` | ⚠️ 67KB，67641行 | 文件过大，需要拆分 |
| `core/agent_pool.py` | ✅ 良好 | Agent实例管理 |
| `core/system_guardrails.py` | ✅ 实现完整 | 10项检查，零token消耗 |
| `core/workflow_optimization.py` | ✅ 活跃开发 | 新功能，有测试覆盖 |
| `core/novel_state_service.py` | ✅ 良好 | 状态管理 |
| `core/agent_contract.py` | ⚠️ 初期 | 契约定义，使用率低 |

### 2.2 数据库模型超前性

**发现**: `backend/models.py` 中定义的数据库表，部分在当前代码路径中未被使用：

| 表 | 状态 | 使用情况 |
|----|------|---------|
| `User`, `Project`, `Chapter` | ✅ 活跃 | 核心业务表 |
| `GenerationTask` | ✅ 活跃 | Celery任务追踪 |
| `WorkflowRun` | ⚠️ 部分使用 | DB已定义，orchestrator仍主要依赖文件系统 |
| `WorkflowStepRun` | ❌ 未使用 | 表已定义但代码不写入 |
| `Artifact` | ⚠️ 部分使用 | workflow service有写入，但前端不展示 |
| `FeedbackItem` | ❌ 未使用 | 表结构已定义，未接入流程 |
| `ChapterVersion` | ✅ 活跃 | 版本历史功能 |
| `TokenUsage` | ❌ 未使用 | 表已定义但不记录 |
| `ShareLink` | ✅ 活跃 | 分享功能 |
| `ProjectCollaborator` | ✅ 活跃 | 协作者功能 |
| `ReadingProgress` | ❌ 未使用 | 表已定义但前端不支持 |

**结论**: 这是一个"先搭架子再填功能"的健康开发模式。不是技术债，是预投入。

### 2.3 测试覆盖

```
tests/
├── test_agent_contract.py
├── test_evaluation_harness.py
├── test_review_fixes.py
├── test_runtime_context.py
└── test_workflow_optimization.py
```

- ✅ 核心新功能有测试
- ❌ 基础编排流程测试不足
- ❌ 缺少端到端集成测试

---

## 3. 清理行动计划

### 3.1 立即执行 (已完成)
- ✅ 删除所有 `__pycache__` 目录和 `.pyc` 文件
- ✅ 删除空的 `outputs/` 目录

### 3.2 Plan文档精简
```
plan/
├── 保留: 01-System-Level Guardrails Specification.md
├── 保留: 03-Long-Term Product Roadmap.md
├── 保留: 04-Architecture Evolution Plan.md
├── 保留: 05-UI-UX-Optimization-Report.md
├── 保留: 06-Architecture Program Board.md
├── 保留: 07-Competition Sprint Plan.md
├── 删除: 00-DESIGN.md → 已过时
├── 删除: 02-flow.md → 已过时
└── 删除: 05-Master Execution Plan.md → 内容被06吸收
```

### 3.3 debug目录整理
- 保留有用的调试脚本
- 删除或合并重复的token调试脚本

---

## 4. 总结与建议

### 4.1 项目健康度评分

| 维度 | 评分 | 说明 |
|------|------|------|
| 核心业务逻辑 | 9/10 | 完整、可运行、有设计 |
| 代码质量 | 7/10 | 存在重复，个别文件过大 |
| 文档质量 | 5/10 | 过载但层次不清，需要精简 |
| 测试覆盖 | 6/10 | 新功能有测试，核心流程不足 |
| 架构前瞻性 | 9/10 | DB模型超前，为扩展预留空间 |
| **总体健康度** | **7.2/10** | 良好的原型产品，需整理文档 |

### 4.2 优先级建议

**P0 (这周就做)**:
1. ✅ 清理冗余文件和pycache
2. 精简plan文档到5个核心文件

**P1 (接下来两周)**:
1. 统一Agent状态UI组件，消除代码重复
2. 为orchestrator.py拆分出更小的模块
3. 补充端到端生成流程的集成测试

**P2 (赛后优化)**:
1. 逐步将文件系统状态迁移到数据库
2. 实现WorkflowStepRun的实际写入
3. 接入TokenUsage统计

---

## 附录：清理命令备忘

```bash
# 清理Python缓存
find . -type d -name "__pycache__" -exec rm -rf {} +
find . -type f -name "*.pyc" -delete

# 清理空目录
find . -type d -empty -delete

# 列出大文件
find . -type f -size +1M | sort -rh | head -20
```
