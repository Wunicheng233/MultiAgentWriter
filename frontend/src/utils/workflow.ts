import type { GenerationTask, Project } from '../types/api'

export type WorkflowAgentKey = 'planner' | 'writer' | 'critic' | 'revise'
export type WorkflowAgentState = 'idle' | 'running' | 'done' | 'error'
export type ProjectFlowStep = 'idea' | 'plan' | 'draft' | 'review' | 'deliver'

type RuntimeSnapshot = {
  projectStatus?: string
  taskStatus?: string | null
  currentStep?: string | null
  currentChapter?: number | null
  progress?: number | null
}

const defaultAgentStates: Record<WorkflowAgentKey, WorkflowAgentState> = {
  planner: 'idle',
  writer: 'idle',
  critic: 'idle',
  revise: 'idle',
}

function normalizeStepText(...parts: Array<string | null | undefined>): string {
  return parts
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function getProjectStatusText(status: string): string {
  switch (status) {
    case 'draft':
      return '草稿'
    case 'generating':
      return '生成中'
    case 'completed':
      return '已完成'
    case 'failed':
      return '失败'
    default:
      return status
  }
}

export function getTaskStatusText(task?: GenerationTask | null): string {
  if (!task) return '尚未启动'

  switch (task.status) {
    case 'pending':
      return '排队中'
    case 'started':
      return '已启动'
    case 'progress':
      return '执行中'
    case 'waiting_confirm':
      return '等待确认'
    case 'success':
      return '已完成'
    case 'failure':
      return '失败'
    default:
      return task.status
  }
}

export function inferFlowStepFromRuntime(snapshot: RuntimeSnapshot): ProjectFlowStep {
  if (snapshot.projectStatus === 'draft') return 'idea'
  if (snapshot.projectStatus === 'completed') return 'deliver'

  const stepKey = normalizeStepText(snapshot.currentStep)

  if (snapshot.taskStatus === 'waiting_confirm') {
    return snapshot.currentChapter === 0 ? 'plan' : 'review'
  }
  if (stepKey.includes('plan') || stepKey.includes('planner') || stepKey.includes('planning') || stepKey.includes('策划')) {
    return 'plan'
  }
  if (stepKey.includes('critic') || stepKey.includes('review') || stepKey.includes('revise') || stepKey.includes('评审') || stepKey.includes('修订')) {
    return 'review'
  }
  if (stepKey.includes('writer') || stepKey.includes('draft') || stepKey.includes('chapter') || stepKey.includes('生成')) {
    return 'draft'
  }

  if ((snapshot.progress ?? 0) > 0 || snapshot.projectStatus === 'generating') {
    return 'draft'
  }

  return 'idea'
}

export function inferCurrentFlowStep(project: Project): ProjectFlowStep {
  return inferFlowStepFromRuntime({
    projectStatus: project.status,
    taskStatus: project.current_generation_task?.status,
    currentStep: normalizeStepText(
      project.current_generation_task?.current_workflow_run?.current_step_key,
      project.current_generation_task?.current_step,
    ),
    currentChapter:
      project.current_generation_task?.current_workflow_run?.current_chapter ??
      project.current_generation_task?.current_chapter,
    progress: project.current_generation_task?.progress,
  })
}

export function getWorkflowAgentStatesFromRuntime(snapshot: RuntimeSnapshot): Record<WorkflowAgentKey, WorkflowAgentState> {
  if (snapshot.projectStatus === 'completed') {
    return {
      planner: 'done',
      writer: 'done',
      critic: 'done',
      revise: 'done',
    }
  }

  if (snapshot.projectStatus === 'failed' || snapshot.taskStatus === 'failure') {
    return {
      ...defaultAgentStates,
      writer: 'error',
    }
  }

  if (snapshot.taskStatus === 'success') {
    return {
      planner: 'done',
      writer: 'done',
      critic: 'done',
      revise: 'done',
    }
  }

  if (snapshot.projectStatus === 'draft' && !snapshot.taskStatus) {
    return { ...defaultAgentStates }
  }

  if (snapshot.taskStatus === 'waiting_confirm') {
    if (snapshot.currentChapter === 0) {
      return {
        planner: 'done',
        writer: 'idle',
        critic: 'idle',
        revise: 'idle',
      }
    }

    return {
      planner: 'done',
      writer: 'done',
      critic: 'done',
      revise: 'done',
    }
  }

  const stepKey = normalizeStepText(snapshot.currentStep)

  if (stepKey.includes('plan') || stepKey.includes('planner') || stepKey.includes('planning') || stepKey.includes('策划')) {
    return {
      planner: 'running',
      writer: 'idle',
      critic: 'idle',
      revise: 'idle',
    }
  }
  if (stepKey.includes('critic') || stepKey.includes('review') || stepKey.includes('评审')) {
    return {
      planner: 'done',
      writer: 'done',
      critic: 'running',
      revise: 'idle',
    }
  }
  if (stepKey.includes('revise') || stepKey.includes('修订')) {
    return {
      planner: 'done',
      writer: 'done',
      critic: 'done',
      revise: 'running',
    }
  }
  if (stepKey.includes('writer') || stepKey.includes('draft') || stepKey.includes('chapter') || stepKey.includes('生成')) {
    return {
      planner: snapshot.progress && snapshot.progress > 0.15 ? 'done' : 'idle',
      writer: 'running',
      critic: 'idle',
      revise: 'idle',
    }
  }

  if ((snapshot.progress ?? 0) > 0 || snapshot.projectStatus === 'generating') {
    return {
      planner: 'done',
      writer: 'running',
      critic: 'idle',
      revise: 'idle',
    }
  }

  return { ...defaultAgentStates }
}

export function getAgentStates(project: Project): Record<WorkflowAgentKey, WorkflowAgentState> {
  return getWorkflowAgentStatesFromRuntime({
    projectStatus: project.status,
    taskStatus: project.current_generation_task?.status,
    currentStep: normalizeStepText(
      project.current_generation_task?.current_workflow_run?.current_step_key,
      project.current_generation_task?.current_step,
    ),
    currentChapter:
      project.current_generation_task?.current_workflow_run?.current_chapter ??
      project.current_generation_task?.current_chapter,
    progress: project.current_generation_task?.progress,
  })
}

export function getChapterRunSummary(snapshot: RuntimeSnapshot, chapterIndex: number): { headline: string; detail: string } {
  if (snapshot.taskStatus === 'waiting_confirm') {
    if (snapshot.currentChapter === 0) {
      return {
        headline: '策划方案正在等待确认',
        detail: '先确认整体路线，再继续推进正文生成。这一步很适合保留人为控制权。',
      }
    }

    return {
      headline: `第 ${snapshot.currentChapter ?? chapterIndex} 章等待作者确认`,
      detail: '当前章节已经走完多 Agent 主流程，现在可以决定直接通过，还是带反馈重新优化。',
    }
  }

  if (snapshot.taskStatus === 'failure' || snapshot.projectStatus === 'failed') {
    return {
      headline: '本次章节生成失败',
      detail: '建议保留当前内容，检查任务状态后重新生成，避免直接刷新页面丢失上下文。',
    }
  }

  if (snapshot.projectStatus === 'completed') {
    return {
      headline: '该章节已进入可编辑状态',
      detail: '你现在看到的是工作流产出的最终版本，可以继续人工润色、恢复历史版本或重新生成。',
    }
  }

  if (snapshot.taskStatus && snapshot.taskStatus !== 'success') {
    return {
      headline: `第 ${snapshot.currentChapter ?? chapterIndex} 章工作流正在运行`,
      detail: snapshot.currentStep || '系统正在推进当前章节的生成、评审和修订。',
    }
  }

  return {
    headline: '当前章节可手动编辑',
    detail: '如果你已经拿到结果，可以直接修改内容；如果还不满意，也可以重新触发生成。',
  }
}
