# StoryForge AI 项目健康审计报告

**日期**: 2026-04-24  
**审计范围**: 后端、前端、工作流、文档、Git 状态与安全边界

## 验证结果

| 检查项 | 结果 |
|---|---|
| `conda run -n novel_agent python -m unittest discover -q` | 通过，71 tests OK |
| `conda run -n novel_agent python -m py_compile $(git ls-files '*.py')` | 通过 |
| `npm run lint` | 通过 |
| `npm run build` | 通过 |
| `git diff --check` | 通过 |
| `npm audit --registry=https://registry.npmjs.org --audit-level=high --omit=dev` | 通过，0 vulnerabilities |

## 已修正的问题

### P0: 关键 plan 文档被删除

最新 UI 提交中删除了：

- `plan/00-DESIGN.md`
- `plan/02-flow.md`
- `plan/05-Master Execution Plan.md`

其中 `00-DESIGN.md` 仍被 `core/orchestrator.py` 和 UI 优化报告引用，`05-Master Execution Plan.md` 仍被 `plan/06-Architecture Program Board.md` 引用。删除会导致设计基线和架构文档断链。

处理：已从上一提交恢复这三个文档。

### P1: 本地 Claude 配置被提交

`.claude/settings.json` 是本地工具权限配置，不应进入仓库主线。

处理：

- 已将 `.claude/` 加入 `.gitignore`
- 已将 `.claude/settings.json` 从 Git 追踪中移除，保留本地文件

### P1: 旧审计报告存在不准确结论

上一版审计报告把 `00-DESIGN.md` 标为可删除，但代码和 UI 计划仍在引用它；还把 `core/orchestrator.py` 行数写成 67641 行，实际约 1389 行。

处理：已重写本报告，避免把错误建议继续沉淀到仓库。

## 当前仍需关注的问题

### P1: 当前默认 npm 镜像不支持 audit

`npmmirror` 返回 `[NOT_IMPLEMENTED] /-/npm/v1/security/* not implemented yet`。本轮已临时切到官方 registry 复核，结果为 `0 vulnerabilities`。

### P2: Agent 状态 UI 仍有轻微重复

`frontend/src/components/AgentCard.tsx` 用在 Editor；`ProjectOverview.tsx` 内联了更轻量的 Agent Strip。当前是有意设计：总览页需要低视觉重量，写作台需要可展开细节。

后续若要进一步收敛，可以给 `AgentCard` 增加 `variant="compact"`，统一 Badge 与状态映射。

### P2: Debug 脚本仍可进一步收口

`debug/` 下脚本不包含硬编码真实密钥，但有脚本会打印新生成 JWT 的前缀或解码 payload。更稳妥的做法是只打印长度、是否成功和字段名，不打印 token 片段。

### P2: JWT 存储在 `localStorage`

前端当前把 access token 存在 `localStorage`，实现简单，但 XSS 风险下 token 可被读取。当前已有 Markdown/HTML sanitization，短期可接受；若进入生产，应考虑 HttpOnly cookie 或更严格的 CSP。

### P2: Orchestrator 仍偏大

`core/orchestrator.py` 约 1389 行，已经承载编排、状态、修复、artifact 同步等职责。功能上可运行，但后续建议拆出：

- chapter generation pipeline
- artifact/state persistence adapter
- repair/stitching coordinator
- progress/event reporter

## 安全边界复核

- `.env` 仍被忽略，未发现真实 API Key 或私钥进入本轮可提交文件。
- 用户自定义 API Key 已有加密存储相关测试覆盖。
- 分享 token 使用随机 URL safe token。
- 前端 `dangerouslySetInnerHTML` 当前只用于 `renderSafeMarkdown` 结果，且有白名单与协议过滤。

## 总体结论

当前代码路径通过单元测试、Python 编译、前端 lint 和生产构建。最大风险不在运行时，而在仓库整理：关键设计文档不能被误删，本地工具配置不能进入主线。上述两项已在本轮体检中修正。
