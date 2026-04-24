# 项目体检报告 - 2026-04-24

## 体检环境

- 工作目录：`/Users/nobody1/Desktop/project/writer`
- 后端运行环境：`conda run -n novel_agent python`，Python 3.10.20
- 前端环境：`frontend/package.json` 中的 Vite + React + TypeScript
- 体检范围：Python 语法/测试、前端 lint/build、安全敏感点、导出链路、前后端内容渲染、依赖健康、部分重复与接口边界

## 已修复问题

1. Python 3.9 导入兼容隐患
   - 给仍使用 PEP 604 注解但缺少延迟注解的模块补充 `from __future__ import annotations`。
   - 影响文件：`backend/api/projects.py`、`backend/api/share.py`、`backend/auth.py`、`backend/task_status.py`、`utils/vector_db.py`、相关测试文件。

2. 测试默认数据库副作用
   - 在 `tests/__init__.py` 为测试默认设置 `DATABASE_URL=sqlite:///:memory:`，避免测试导入时误连本地 PostgreSQL。

3. 调试脚本密钥泄露风险
   - 移除调试脚本中的硬编码 JWT。
   - 禁止打印 `.env` 原文、JWT secret、用户 API Key 明文或 token 前缀。
   - 修复多个调试脚本 shebang 前空行。
   - 新增 `tests/test_security_hygiene.py` 防止回退。

4. 前端确认弹窗 XSS 风险
   - 移除章节预览中的原始 `dangerouslySetInnerHTML`。
   - 新增 `frontend/src/utils/safeContent.ts`，对 Markdown/HTML/纯文本分流处理：纯文本转义、Markdown 生成受控标签、已有 HTML 做 allowlist 净化。
   - 修复章节内容已是 HTML 时被再次包成段落的问题。

5. 导出文件 XSS 与路径问题
   - `services/export_service.py` 新增 HTML allowlist sanitizer。
   - HTML/EPUB 导出中的标题、作者、描述、章节标题做安全文本处理。
   - 导出文件名做路径安全化，避免标题中的 `/`、标签等导致写文件失败或路径异常。
   - 导出函数现在会确保输出目录存在。
   - 新增 `tests/test_export_service_security.py` 覆盖 HTML 导出净化。

6. 导出文件公开访问面
   - 移除 `backend/main.py` 中 `/exports` 对 `/tmp/storyforge-exports` 的无鉴权静态挂载。
   - 保留原有 `/api/projects/{project_id}/export/download` 鉴权下载接口。

7. 小型清理
   - `backend/database.py` 改用 SQLAlchemy 2 推荐的 `sqlalchemy.orm.declarative_base`，移除无用导入。
   - 导出清理逻辑去掉裸 `except`，改为捕获 `OSError`。

## 验证结果

全部验证命令均已通过：

- `conda run -n novel_agent python -m unittest discover -q`：62 tests OK
- `conda run -n novel_agent python -m py_compile $(git ls-files '*.py')`：通过
- `npm run lint`：通过
- `npm run build`：通过
- `conda run -n novel_agent python -m pip check`：No broken requirements found
- `npm_config_registry=https://registry.npmjs.org npm audit --omit=dev --audit-level=moderate`：found 0 vulnerabilities

## 环境说明

- `novel_agent` 环境中未安装 `pytest`，因此本次后端测试使用项目现有的标准库 `unittest` 入口。
- `ruff` 未安装，因此未作为本次体检的强制验证项。
- 默认 npm 镜像 `npmmirror` 不支持 `npm audit` 接口，本次安全审计临时切换到 npm 官方 registry 执行。

## 后续建议

1. 将 `pytest` 和 `ruff` 加入开发依赖或文档，形成统一的后端检查命令。
2. 生产环境不要使用默认 `jwt_secret_key`，建议在部署启动时强校验。
3. 仍有一些任务边界使用宽泛异常捕获，当前多用于日志兜底；后续可按模块逐步收窄。
4. 导出 HTML 已做基础 allowlist 净化，若未来允许更复杂富文本，建议引入成熟 sanitizer 并补充更完整的标签/属性策略。
