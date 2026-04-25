import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'
import type { BadgeVariant } from '../components/Badge'
import { Button } from '../components/Button'
import { ProgressBar } from '../components/ProgressBar'
import { getProject, getProjectWorkflowRuns, listChapters } from '../utils/endpoints'
import { getProjectStatusText, getTaskStatusText } from '../utils/workflow'
import type { WorkflowRun } from '../types/api'

function getChapterStatusColor(status: string): BadgeVariant {
  switch (status) {
    case 'generated':
      return 'agent'
    case 'edited':
      return 'status'
    case 'draft':
      return 'secondary'
    default:
      return 'genre'
  }
}

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

function formatDateTime(value?: string): string {
  if (!value) return '暂无'
  return new Date(value).toLocaleString()
}

function getRunSummary(run: WorkflowRun): string {
  if (run.status === 'waiting_confirm') {
    return run.current_chapter === 0
      ? '策划方案已生成，等待人工确认。'
      : `第 ${run.current_chapter ?? '-'} 章已生成，等待人工确认。`
  }

  if (run.status === 'failed') {
    return '本次运行失败，适合回看步骤和反馈记录，定位稳定性问题。'
  }

  if (run.status === 'completed') {
    return run.current_chapter
      ? `本次运行最终推进到第 ${run.current_chapter} 章。`
      : '本次运行已经完成。'
  }

  return run.current_step_key
    ? `当前停留在 ${run.current_step_key} 节点。`
    : '运行记录已创建，等待系统继续推进。'
}

export const ChapterList: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const projectId = id ? parseInt(id, 10) : 0
  const isValidProjectId = !Number.isNaN(projectId) && projectId > 0

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId),
    enabled: isValidProjectId,
  })

  const { data: chapters, isLoading } = useQuery({
    queryKey: ['chapters', projectId],
    queryFn: () => listChapters(projectId),
    enabled: isValidProjectId,
  })

  const { data: workflowHistory } = useQuery({
    queryKey: ['project-workflow-runs', projectId],
    queryFn: () => getProjectWorkflowRuns(projectId, {
      limit: 6,
      include_steps: true,
      include_feedback_items: true,
    }),
    enabled: isValidProjectId && !!project,
  })

  const targetStart = project?.config?.start_chapter ?? 1
  const targetEnd = project?.config?.end_chapter ?? 10
  const targetChapters = Math.max(targetEnd - targetStart + 1, 0)
  const completedChapters = chapters?.length ?? 0
  const completionRate = targetChapters > 0 ? Math.min((completedChapters / targetChapters) * 100, 100) : 0
  const averageScore = chapters && chapters.length > 0
    ? chapters.reduce((sum, chapter) => sum + (chapter.quality_score || 0), 0) / chapters.length
    : 0
  const activeRun = workflowHistory?.items.find(run => run.status === 'running' || run.status === 'waiting_confirm')

  return (
    <Layout>
      <div className="mx-auto max-w-content space-y-6">
        <Card className="border-sage/20 bg-[linear-gradient(135deg,rgba(91,127,110,0.12),rgba(255,255,255,0.92),rgba(163,139,90,0.08))]">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Link to={`/projects/${id}/overview`}>
                  <Button variant="secondary">返回概览</Button>
                </Link>
                {project && <Badge variant="secondary">{getProjectStatusText(project.status)}</Badge>}
                {project?.current_generation_task && (
                  <Badge variant={project.current_generation_task.status === 'waiting_confirm' ? 'genre' : 'status'}>
                    {getTaskStatusText(project.current_generation_task)}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl">章节与运行记录</h1>
              <p className="mt-3 text-body">
                这一页同时承载作品章节列表和 workflow 历史。长期来看，它应该回答两个问题：现在产出了什么，以及系统是怎么把这些结果生成出来的。
              </p>
              {project && <p className="mt-3 text-secondary">{project.name}</p>}
            </div>

            <div className="w-full max-w-xl space-y-3">
              <ProgressBar progress={completionRate} message={`章节完成度 ${completedChapters}/${targetChapters || '-'} 章`} />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 text-sm">
                <div className="rounded-standard border border-border bg-parchment/70 p-3">
                  <p className="text-secondary">目标范围</p>
                  <p className="mt-1 text-body">{targetStart} - {targetEnd}</p>
                </div>
                <div className="rounded-standard border border-border bg-parchment/70 p-3">
                  <p className="text-secondary">当前章节数</p>
                  <p className="mt-1 text-body">{completedChapters}</p>
                </div>
                <div className="rounded-standard border border-border bg-parchment/70 p-3">
                  <p className="text-secondary">平均评分</p>
                  <p className="mt-1 text-body">{averageScore > 0 ? averageScore.toFixed(1) : '待生成'}</p>
                </div>
                <div className="rounded-standard border border-border bg-parchment/70 p-3">
                  <p className="text-secondary">历史运行</p>
                  <p className="mt-1 text-body">{workflowHistory?.total ?? 0}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-secondary">Chapters</p>
                <h2 className="mt-2 text-2xl">章节列表</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to={`/projects/${id}/analytics`}>
                  <Button variant="secondary">质量分析</Button>
                </Link>
                <Link to={`/projects/${id}/overview`}>
                  <Button variant="secondary">项目总控台</Button>
                </Link>
              </div>
            </div>

            {isLoading && <p className="mt-5 text-secondary">加载中...</p>}

            <div className="mt-5 space-y-4">
              {chapters?.map(chapter => (
                <Card key={chapter.id} hoverable className="border border-border/70 bg-white/70">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h3 className="font-serif text-xl text-inkwell">
                        {chapter.title || `第${chapter.chapter_index}章`}
                      </h3>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-secondary">
                        <span>字数 {chapter.word_count}</span>
                        <span>评分 {chapter.quality_score?.toFixed(1) || '-'}</span>
                        <span>创建于 {formatDateTime(chapter.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant={getChapterStatusColor(chapter.status)}>
                        {chapter.status}
                      </Badge>
                      <Link to={`/projects/${id}/read/${chapter.chapter_index}`}>
                        <Button variant="secondary" size="sm">阅读</Button>
                      </Link>
                      <Link to={`/projects/${id}/write/${chapter.chapter_index}`}>
                        <Button variant="primary" size="sm">编辑</Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}

              {!chapters?.length && (
                <Card>
                  <p className="py-6 text-center text-secondary">
                    还没有章节，开始生成后会在这里出现。
                  </p>
                </Card>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-secondary">Workflow History</p>
                <h2 className="mt-2 text-2xl">运行历史</h2>
                <p className="mt-2 text-secondary">
                  这些记录会成为后续回放、失败归因、质量对比和多轮修订的基础。
                </p>
              </div>
              {activeRun && (
                <Badge variant={getRunStatusColor(activeRun.status)}>
                  当前活跃 Run #{activeRun.id}
                </Badge>
              )}
            </div>

            <div className="mt-5 space-y-4">
              {workflowHistory?.items.map(run => {
                const stepCount = run.steps?.length ?? 0
                const feedbackCount = run.feedback_items?.length ?? 0

                return (
                  <div key={run.id} className="rounded-comfortable border border-border bg-parchment/50 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg text-inkwell">Run #{run.id}</h3>
                          <Badge variant={getRunStatusColor(run.status)}>
                            {getRunStatusText(run.status)}
                          </Badge>
                          <Badge variant="secondary">{getRunKindText(run.run_kind)}</Badge>
                        </div>
                        <p className="mt-3 text-sm text-secondary">{getRunSummary(run)}</p>
                      </div>
                      <div className="text-sm text-secondary">
                        <div>开始于 {formatDateTime(run.started_at)}</div>
                        <div>结束于 {formatDateTime(run.completed_at)}</div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-standard border border-border bg-white/70 p-3">
                        <p className="text-secondary">当前节点</p>
                        <p className="mt-1 text-body">{run.current_step_key || '暂无'}</p>
                      </div>
                      <div className="rounded-standard border border-border bg-white/70 p-3">
                        <p className="text-secondary">当前章节</p>
                        <p className="mt-1 text-body">{run.current_chapter ?? '项目级'}</p>
                      </div>
                      <div className="rounded-standard border border-border bg-white/70 p-3">
                        <p className="text-secondary">步骤数</p>
                        <p className="mt-1 text-body">{stepCount}</p>
                      </div>
                      <div className="rounded-standard border border-border bg-white/70 p-3">
                        <p className="text-secondary">反馈项</p>
                        <p className="mt-1 text-body">{feedbackCount}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      {run.steps && run.steps.length > 0 && (
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-secondary">Steps</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {run.steps.map(step => (
                              <span
                                key={step.id}
                                className="rounded-pill border border-border bg-white px-3 py-1 text-xs text-secondary"
                              >
                                {step.step_key}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <Link to={`/projects/${id}/workflows/${run.id}`}>
                        <Button variant="tertiary" size="sm">查看详情</Button>
                      </Link>
                    </div>

                    {run.feedback_items && run.feedback_items.length > 0 && (
                      <div className="mt-4 rounded-standard border border-terracotta/15 bg-terracotta/5 p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-secondary">Latest Feedback</p>
                        <p className="mt-2 text-sm text-body">{run.feedback_items[0].content}</p>
                      </div>
                    )}
                  </div>
                )
              })}

              {!workflowHistory?.items.length && (
                <div className="rounded-standard border border-dashed border-border p-4 text-secondary">
                  还没有 workflow 历史。触发生成后，这里会开始沉淀项目运行记录。
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

export default ChapterList
