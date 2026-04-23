import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'
import type { BadgeVariant } from '../components/Badge'
import { Button } from '../components/Button'
import {
  cleanStuckTasks,
  getProjectArtifacts,
  getProject,
  getProjectWorkflowRun,
  regenerateChapter,
  triggerGenerate,
} from '../utils/endpoints'
import type { JsonValue, WorkflowRun } from '../types/api'
import { getProjectStatusText } from '../utils/workflow'
import { useToast } from '../components/toastContext'
import {
  getArtifactDisplayName,
  getArtifactPreview,
  getArtifactScopeLabel,
} from '../utils/artifact'

function getRunStatusColor(status: string): BadgeVariant {
  switch (status) {
    case 'completed':
      return 'agent'
    case 'running':
    case 'waiting_confirm':
      return 'status'
    case 'failed':
    case 'cancelled':
      return 'genre'
    default:
      return 'secondary'
  }
}

function getRunStatusText(status: string): string {
  switch (status) {
    case 'pending':
      return '待执行'
    case 'running':
      return '执行中'
    case 'waiting_confirm':
      return '等待确认'
    case 'completed':
      return '已完成'
    case 'failed':
      return '失败'
    case 'cancelled':
      return '已取消'
    default:
      return status
  }
}

function getRunKindText(runKind: string): string {
  switch (runKind) {
    case 'generation':
      return '首次生成'
    case 'regeneration':
      return '重新生成'
    case 'revision':
      return '修订'
    case 'publish':
      return '发布'
    default:
      return runKind
  }
}

function getStepStatusColor(status: string): BadgeVariant {
  switch (status) {
    case 'completed':
      return 'agent'
    case 'running':
    case 'waiting_confirm':
      return 'status'
    case 'failed':
    case 'cancelled':
      return 'genre'
    default:
      return 'secondary'
  }
}

function formatDateTime(value?: string): string {
  if (!value) return '暂无'
  return new Date(value).toLocaleString()
}

function renderJsonValue(value: JsonValue): string {
  if (value === null) return 'null'
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return JSON.stringify(value)
}

function getRunHeadline(run: WorkflowRun): string {
  if (run.status === 'waiting_confirm') {
    return run.current_chapter === 0
      ? '策划方案已经生成，等待人工确认'
      : `第 ${run.current_chapter ?? '-'} 章已经生成，等待人工确认`
  }
  if (run.status === 'failed') {
    return '本次运行失败，适合用来回看步骤和反馈'
  }
  if (run.status === 'completed') {
    return '本次运行已经完成'
  }
  return '本次运行仍在推进中'
}

export const WorkflowRunDetail: React.FC = () => {
  const { id, runId } = useParams<{ id: string; runId: string }>()
  const projectId = parseInt(id!, 10)
  const workflowRunId = parseInt(runId!, 10)
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId),
  })

  const { data: run, isLoading } = useQuery({
    queryKey: ['project-workflow-run', projectId, workflowRunId],
    queryFn: () => getProjectWorkflowRun(projectId, workflowRunId, {
      include_steps: true,
      include_feedback_items: true,
    }),
  })

  const { data: runArtifacts } = useQuery({
    queryKey: ['project-artifacts', projectId, 'run', workflowRunId],
    queryFn: () => getProjectArtifacts(projectId, {
      workflow_run_id: workflowRunId,
      include_content: true,
      limit: 20,
    }),
    enabled: !!run,
  })

  const restartProjectMutation = useMutation({
    mutationFn: (regenerate: boolean) => triggerGenerate(projectId, regenerate),
    onSuccess: () => {
      showToast('项目级重试任务已提交', 'success')
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      queryClient.invalidateQueries({ queryKey: ['project-workflow-runs', projectId] })
    },
    onError: () => {
      showToast('提交项目级重试失败', 'error')
    },
  })

  const regenerateChapterMutation = useMutation({
    mutationFn: (chapterIndex: number) => regenerateChapter(projectId, chapterIndex),
    onSuccess: () => {
      showToast('章节重生成任务已提交', 'success')
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      queryClient.invalidateQueries({ queryKey: ['project-workflow-runs', projectId] })
    },
    onError: () => {
      showToast('提交章节重生成失败', 'error')
    },
  })

  const cleanTasksMutation = useMutation({
    mutationFn: () => cleanStuckTasks(projectId),
    onSuccess: result => {
      showToast(result.message, result.cleaned_count > 0 ? 'success' : 'info')
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      queryClient.invalidateQueries({ queryKey: ['project-workflow-runs', projectId] })
      queryClient.invalidateQueries({ queryKey: ['project-workflow-run', projectId, workflowRunId] })
    },
    onError: () => {
      showToast('清理任务队列失败', 'error')
    },
  })

  if (isLoading) {
    return (
      <Layout>
        <p className="text-secondary">加载中...</p>
      </Layout>
    )
  }

  if (!run) {
    return (
      <Layout>
        <p className="text-secondary">运行记录不存在</p>
      </Layout>
    )
  }

  const metadataEntries = Object.entries(run.run_metadata || {})
  const stepCount = run.steps?.length ?? 0
  const feedbackCount = run.feedback_items?.length ?? 0
  const artifactCount = runArtifacts?.items.length ?? 0
  const hasRelatedChapter = typeof run.current_chapter === 'number' && run.current_chapter > 0
  const isActiveRun = run.status === 'running' || run.status === 'waiting_confirm'
  const isFailedRun = run.status === 'failed' || run.status === 'cancelled'
  const currentActiveRunId = project?.current_generation_task?.current_workflow_run?.id
  const hasOtherActiveRun = !!currentActiveRunId && currentActiveRunId !== run.id

  return (
    <Layout>
      <div className="mx-auto max-w-content space-y-6">
        <Card className="border-sage/20 bg-[linear-gradient(135deg,rgba(91,127,110,0.12),rgba(255,255,255,0.92),rgba(163,139,90,0.08))]">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Link to={`/projects/${projectId}/chapters`}>
                  <Button variant="secondary">返回章节与运行记录</Button>
                </Link>
                {project && <Badge variant="secondary">{getProjectStatusText(project.status)}</Badge>}
                <Badge variant={getRunStatusColor(run.status)}>
                  {getRunStatusText(run.status)}
                </Badge>
                <Badge variant="secondary">{getRunKindText(run.run_kind)}</Badge>
              </div>

              <h1 className="text-3xl md:text-4xl">运行详情 #{run.id}</h1>
              <p className="mt-3 text-body">{getRunHeadline(run)}</p>
              {project && <p className="mt-3 text-secondary">{project.name}</p>}
            </div>

            <div className="grid w-full max-w-xl grid-cols-2 gap-3 text-sm md:grid-cols-4">
              <div className="rounded-standard border border-border bg-parchment/70 p-3">
                <p className="text-secondary">开始时间</p>
                <p className="mt-1 text-body">{formatDateTime(run.started_at)}</p>
              </div>
              <div className="rounded-standard border border-border bg-parchment/70 p-3">
                <p className="text-secondary">结束时间</p>
                <p className="mt-1 text-body">{formatDateTime(run.completed_at)}</p>
              </div>
              <div className="rounded-standard border border-border bg-parchment/70 p-3">
                <p className="text-secondary">步骤数</p>
                <p className="mt-1 text-body">{stepCount}</p>
              </div>
              <div className="rounded-standard border border-border bg-parchment/70 p-3">
                <p className="text-secondary">反馈项</p>
                <p className="mt-1 text-body">{feedbackCount}</p>
              </div>
              <div className="rounded-standard border border-border bg-parchment/70 p-3">
                <p className="text-secondary">Artifacts</p>
                <p className="mt-1 text-body">{artifactCount}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <p className="text-xs uppercase tracking-[0.22em] text-secondary">Run Summary</p>
            <h2 className="mt-2 text-2xl">运行摘要</h2>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-standard border border-border bg-parchment/60 p-4">
                <p className="text-secondary">Run 类型</p>
                <p className="mt-1 text-body">{getRunKindText(run.run_kind)}</p>
              </div>
              <div className="rounded-standard border border-border bg-parchment/60 p-4">
                <p className="text-secondary">触发来源</p>
                <p className="mt-1 text-body">{run.trigger_source}</p>
              </div>
              <div className="rounded-standard border border-border bg-parchment/60 p-4">
                <p className="text-secondary">当前节点</p>
                <p className="mt-1 text-body">{run.current_step_key || '暂无'}</p>
              </div>
              <div className="rounded-standard border border-border bg-parchment/60 p-4">
                <p className="text-secondary">当前章节</p>
                <p className="mt-1 text-body">{run.current_chapter ?? '项目级'}</p>
              </div>
              <div className="rounded-standard border border-border bg-parchment/60 p-4">
                <p className="text-secondary">Generation Task</p>
                <p className="mt-1 text-body">{run.generation_task_id ?? '暂无'}</p>
              </div>
              <div className="rounded-standard border border-border bg-parchment/60 p-4">
                <p className="text-secondary">父级 Run</p>
                <p className="mt-1 text-body">{run.parent_run_id ?? '无'}</p>
              </div>
            </div>

            {run.current_chapter ? (
              <div className="mt-5">
                <Link to={`/projects/${projectId}/write/${run.current_chapter}`}>
                  <Button variant="secondary">打开相关章节</Button>
                </Link>
              </div>
            ) : null}
          </Card>

          <Card>
            <p className="text-xs uppercase tracking-[0.22em] text-secondary">Run Metadata</p>
            <h2 className="mt-2 text-2xl">上下文元数据</h2>

            {metadataEntries.length > 0 ? (
              <div className="mt-5 space-y-3">
                {metadataEntries.map(([key, value]) => (
                  <div key={key} className="rounded-standard border border-border bg-parchment/60 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-secondary">{key}</p>
                    <p className="mt-2 break-words text-body">{renderJsonValue(value)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-standard border border-dashed border-border p-4 text-secondary">
                当前没有额外的 run metadata。
              </div>
            )}
          </Card>
        </div>

        <Card>
          <p className="text-xs uppercase tracking-[0.22em] text-secondary">Recovery Actions</p>
          <h2 className="mt-2 text-2xl">恢复与下一步</h2>
          <p className="mt-2 text-secondary">
            这里把当前 run 的推荐动作收在一起。长期目标是让失败恢复、人工确认和重新生成都沿 workflow 语义自然发生，而不是依赖手工找按钮。
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-comfortable border border-border bg-parchment/60 p-4">
              <p className="text-secondary">推荐动作</p>
              <p className="mt-2 text-body">
                {run.status === 'waiting_confirm'
                  ? '回到编辑器处理人工确认'
                  : isFailedRun && hasOtherActiveRun
                    ? '项目已经有更新的活跃 run，优先查看当前活跃 run'
                    : isFailedRun
                    ? '优先判断是重试当前章节还是重跑整个项目'
                    : isActiveRun
                      ? '继续观察当前运行并在必要时清理卡住任务'
                      : '回看产出结果并决定是否进入下一轮优化'}
              </p>
            </div>

            <div className="rounded-comfortable border border-border bg-parchment/60 p-4">
              <p className="text-secondary">当前风险</p>
              <p className="mt-2 text-body">
                {isFailedRun && hasOtherActiveRun
                  ? '旧的失败 run 已不是当前主线，直接重试可能和当前任务冲突。'
                  : isFailedRun
                  ? '这次运行已经进入终态，若不处理，项目状态可能与用户预期脱节。'
                  : run.status === 'waiting_confirm'
                    ? '工作流暂停中，系统不会自动继续。'
                    : isActiveRun
                      ? '如果任务长时间不动，可能需要清理卡住队列。'
                      : '暂无明显恢复风险。'}
              </p>
            </div>

            <div className="rounded-comfortable border border-border bg-parchment/60 p-4">
              <p className="text-secondary">相关章节</p>
              <p className="mt-2 text-body">{hasRelatedChapter ? `第 ${run.current_chapter} 章` : '项目级运行'}</p>
            </div>

            <div className="rounded-comfortable border border-border bg-parchment/60 p-4">
              <p className="text-secondary">当前入口</p>
              <p className="mt-2 text-body">
                {run.status === 'waiting_confirm'
                  ? '编辑器确认面板'
                  : isFailedRun
                    ? '恢复操作面板'
                    : '运行详情回看'}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {run.status === 'waiting_confirm' && hasRelatedChapter && (
              <Link to={`/projects/${projectId}/write/${run.current_chapter}`}>
                <Button variant="primary">处理当前确认</Button>
              </Link>
            )}

            {run.status === 'waiting_confirm' && run.current_chapter === 0 && (
              <Link to={`/projects/${projectId}/overview`}>
                <Button variant="primary">回到项目总控台</Button>
              </Link>
            )}

            {isFailedRun && hasRelatedChapter && (
              <Button
                variant="primary"
                onClick={() => regenerateChapterMutation.mutate(run.current_chapter!)}
                disabled={regenerateChapterMutation.isPending || hasOtherActiveRun}
              >
                {regenerateChapterMutation.isPending ? '提交中...' : '重生成当前章节'}
              </Button>
            )}

            {isFailedRun && (
              <Button
                variant="secondary"
                onClick={() => restartProjectMutation.mutate(true)}
                disabled={restartProjectMutation.isPending || hasOtherActiveRun}
              >
                {restartProjectMutation.isPending ? '提交中...' : '重新生成整个项目'}
              </Button>
            )}

            {run.status === 'running' && (
              <Button
                variant="secondary"
                onClick={() => cleanTasksMutation.mutate()}
                disabled={cleanTasksMutation.isPending}
              >
                {cleanTasksMutation.isPending ? '清理中...' : '清理卡住任务'}
              </Button>
            )}

            {hasOtherActiveRun && currentActiveRunId && (
              <Link to={`/projects/${projectId}/workflows/${currentActiveRunId}`}>
                <Button variant="secondary">查看当前活跃 Run</Button>
              </Link>
            )}

            {!isActiveRun && !isFailedRun && (
              <Link to={`/projects/${projectId}/chapters`}>
                <Button variant="secondary">回到章节与运行记录</Button>
              </Link>
            )}
          </div>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-[0.22em] text-secondary">Artifacts</p>
          <h2 className="mt-2 text-2xl">运行产物</h2>
          <p className="mt-2 text-secondary">
            这里展示本次 run 真正沉淀下来的 artifacts。长期来看，这些内容会成为回放、对比和复用的核心资产。
          </p>

          <div className="mt-5 space-y-4">
            {runArtifacts?.items.map(artifact => {
              const preview = getArtifactPreview(artifact)

              return (
                <div key={artifact.id} className="rounded-comfortable border border-border bg-parchment/50 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg text-inkwell">{getArtifactDisplayName(artifact.artifact_type)}</h3>
                        <Badge variant="secondary">{artifact.scope}</Badge>
                        {artifact.is_current && <Badge variant="agent">current</Badge>}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-secondary">
                        <span>版本 v{artifact.version_number}</span>
                        <span>来源 {artifact.source}</span>
                        <span>{getArtifactScopeLabel(artifact)}</span>
                        <span>{formatDateTime(artifact.created_at)}</span>
                      </div>
                    </div>
                    <div className="text-sm text-secondary md:text-right">
                      <div>Artifact #{artifact.id}</div>
                      <div>Run #{artifact.workflow_run_id ?? '-'}</div>
                      <div className="mt-3">
                        <Link to={`/projects/${projectId}/artifacts/${artifact.id}`}>
                          <Button variant="tertiary" size="sm">查看详情</Button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {preview && (
                    <div className="mt-4 rounded-standard border border-border bg-white/70 p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-secondary">Preview</p>
                      <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs text-body">{preview}</pre>
                    </div>
                  )}
                </div>
              )
            })}

            {!runArtifacts?.items.length && (
              <div className="rounded-standard border border-dashed border-border p-4 text-secondary">
                当前运行还没有可展示的 artifacts。
              </div>
            )}
          </div>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-[0.22em] text-secondary">Step Timeline</p>
          <h2 className="mt-2 text-2xl">步骤时间线</h2>
          <p className="mt-2 text-secondary">
            这部分是后续做回放、失败归因、步骤级指标和 artifact 追踪的基础。
          </p>

          <div className="mt-5 space-y-4">
            {run.steps?.map((step, index) => {
              const contractSummary = step.step_data?.agent_contract
              const chapterNumber = step.chapter_index ?? run.current_chapter

              return (
                <div key={step.id} className="rounded-comfortable border border-border bg-parchment/50 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm text-secondary">0{index + 1}</span>
                        <h3 className="text-lg text-inkwell">{step.step_key}</h3>
                        <Badge variant={getStepStatusColor(step.status)}>
                          {getRunStatusText(step.status)}
                        </Badge>
                        <Badge variant="secondary">{step.step_type}</Badge>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-secondary">
                        <span>尝试次数 {step.attempt}</span>
                        <span>章节 {chapterNumber ?? '项目级'}</span>
                        <span>开始于 {formatDateTime(step.started_at)}</span>
                        <span>结束于 {formatDateTime(step.completed_at)}</span>
                      </div>
                    </div>

                    {chapterNumber ? (
                      <Link to={`/projects/${projectId}/write/${chapterNumber}`}>
                        <Button variant="tertiary" size="sm">打开章节</Button>
                      </Link>
                    ) : null}
                  </div>

                  {(step.input_artifact || step.output_artifact) && (
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-standard border border-border bg-white/70 p-3 text-sm">
                        <p className="text-secondary">输入 Artifact</p>
                        {step.input_artifact ? (
                          <div className="mt-1">
                            <p className="text-body">
                              {getArtifactDisplayName(step.input_artifact.artifact_type)} v{step.input_artifact.version_number}
                            </p>
                            <Link to={`/projects/${projectId}/artifacts/${step.input_artifact.id}`}>
                              <Button variant="tertiary" size="sm">查看输入产物</Button>
                            </Link>
                          </div>
                        ) : (
                          <p className="mt-1 text-body">暂无</p>
                        )}
                      </div>
                      <div className="rounded-standard border border-border bg-white/70 p-3 text-sm">
                        <p className="text-secondary">输出 Artifact</p>
                        {step.output_artifact ? (
                          <div className="mt-1">
                            <p className="text-body">
                              {getArtifactDisplayName(step.output_artifact.artifact_type)} v{step.output_artifact.version_number}
                            </p>
                            <Link to={`/projects/${projectId}/artifacts/${step.output_artifact.id}`}>
                              <Button variant="tertiary" size="sm">查看输出产物</Button>
                            </Link>
                          </div>
                        ) : (
                          <p className="mt-1 text-body">暂无</p>
                        )}
                      </div>
                    </div>
                  )}

                  {contractSummary && typeof contractSummary === 'object' && !Array.isArray(contractSummary) && (
                    <div className="mt-4 rounded-standard border border-sage/15 bg-sage/5 p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-secondary">Agent Contract</p>
                      <div className="mt-2 grid gap-2 text-sm md:grid-cols-2">
                        {Object.entries(contractSummary).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-secondary">{key}：</span>
                            <span className="text-body">{typeof value === 'string' ? value : renderJsonValue(value as JsonValue)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {!run.steps?.length && (
              <div className="rounded-standard border border-dashed border-border p-4 text-secondary">
                当前运行还没有沉淀步骤记录。
              </div>
            )}
          </div>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-[0.22em] text-secondary">Feedback Trace</p>
          <h2 className="mt-2 text-2xl">反馈记录</h2>

          <div className="mt-5 space-y-4">
            {run.feedback_items?.map(item => (
              <div key={item.id} className="rounded-comfortable border border-border bg-parchment/50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="secondary">{item.feedback_scope}</Badge>
                      <Badge variant="secondary">{item.feedback_type}</Badge>
                      <Badge variant={item.status === 'open' ? 'status' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </div>
                    <p className="mt-3 whitespace-pre-line text-body">{item.content}</p>
                  </div>
                  <div className="text-sm text-secondary">
                    <div>动作 {item.action_type}</div>
                    <div>章节 {item.chapter_index ?? '项目级'}</div>
                    <div>{formatDateTime(item.created_at)}</div>
                  </div>
                </div>
              </div>
            ))}

            {!run.feedback_items?.length && (
              <div className="rounded-standard border border-dashed border-border p-4 text-secondary">
                当前运行没有结构化反馈记录。
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  )
}

export default WorkflowRunDetail
