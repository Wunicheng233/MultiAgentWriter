import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Card } from '../components/Card'
import { Input, Textarea } from '../components/Input'
import { Button } from '../components/Button'
import { ProgressBar } from '../components/ProgressBar'
import { createProject } from '../utils/endpoints'
import { useToast } from '../components/toastContext'
import { getErrorMessage } from '../utils/errorMessage'
import type { ProjectCreate } from '../types/api'

type ContentType = NonNullable<ProjectCreate['content_type']>

const steps = [
  {
    id: 1,
    title: '作品定位',
    description: '先定义作品是什么，以及它面向谁。',
  },
  {
    id: 2,
    title: '创作 Brief',
    description: '把故事卖点、背景和核心要求交给多 Agent。',
  },
  {
    id: 3,
    title: '协作方式',
    description: '决定生成范围、节奏和人在环路的介入深度。',
  },
  {
    id: 4,
    title: '确认创建',
    description: '检查信息并立即进入比赛版主路径。',
  },
]

const contentTypes = [
  { value: 'full_novel', label: '长篇小说', hint: '适合持续连载、分章推进和质量闭环演示。' },
  { value: 'short_story', label: '短篇小说', hint: '适合快速成稿，验证完整创作闭环。' },
  { value: 'script', label: '剧本', hint: '适合强调结构化场景和角色分工。' },
]

const briefPrompts = [
  '故事发生在什么世界，主角想要什么，最大的阻力是什么？',
  '你希望读者被什么钩子抓住，是悬念、反转、情绪还是设定？',
  '这部作品更偏快节奏推进，还是偏人物关系与氛围铺陈？',
]

function getModeLabel(formData: ProjectCreate): string {
  if (formData.skip_plan_confirmation && formData.skip_chapter_confirmation) {
    return '全自动生成'
  }
  if (!formData.skip_plan_confirmation && formData.skip_chapter_confirmation) {
    return '策划确认模式'
  }
  if (!formData.skip_plan_confirmation && !formData.skip_chapter_confirmation) {
    return '逐章共创模式'
  }
  return '章节接管模式'
}

function getModeDescription(formData: ProjectCreate): string {
  if (formData.skip_plan_confirmation && formData.skip_chapter_confirmation) {
    return '最适合快速跑完整条主路径，现场展示效率最高。'
  }
  if (!formData.skip_plan_confirmation && formData.skip_chapter_confirmation) {
    return '先确认策划，再自动生成正文，平衡可控性和效率。'
  }
  if (!formData.skip_plan_confirmation && !formData.skip_chapter_confirmation) {
    return '每章都可人工审阅，最能体现人在环路的创作控制权。'
  }
  return '适合跳过策划但对章节结果保持较强干预。'
}

export const CreateProject: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [formData, setFormData] = useState<ProjectCreate>({
    name: '',
    description: '',
    content_type: 'full_novel',
    novel_name: '',
    novel_description: '',
    core_requirement: '',
    genre: '',
    total_words: 100000,
    core_hook: '',
    target_platform: '网络小说',
    chapter_word_count: 2000,
    start_chapter: 1,
    end_chapter: 10,
    skip_plan_confirmation: false,
    skip_chapter_confirmation: false,
    allow_plot_adjustment: false,
  })

  const updateForm = (partial: Partial<ProjectCreate>) => {
    setFormData(prev => ({ ...prev, ...partial }))
  }

  const { mutate, isPending } = useMutation({
    mutationFn: () => createProject(formData),
    onSuccess: data => {
      showToast('项目创建成功', 'success')
      navigate(`/projects/${data.id}/overview`)
    },
    onError: (error: unknown) => {
      showToast(getErrorMessage(error, '创建失败'), 'error')
    },
  })

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100
  const currentStepMeta = steps[currentStep - 1]
  const targetChapters = Math.max((formData.end_chapter ?? 1) - (formData.start_chapter ?? 1) + 1, 0)
  const selectedContentType = contentTypes.find(type => type.value === formData.content_type)

  let stepBlockedReason = ''
  if (currentStep === 1 && !formData.name?.trim()) {
    stepBlockedReason = '先给作品起一个名字，后续工作流才能围绕它组织。'
  }
  if (currentStep === 2 && !formData.core_requirement?.trim()) {
    stepBlockedReason = '核心创作需求是多 Agent 协作的起点，这一步建议尽量写清楚。'
  }
  if (currentStep === 3 && (formData.end_chapter ?? 1) < (formData.start_chapter ?? 1)) {
    stepBlockedReason = '结束章节不能小于起始章节。'
  }

  const nextStep = () => {
    if (currentStep < steps.length && !stepBlockedReason) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    mutate()
  }

  return (
    <Layout>
      <div className="mx-auto max-w-content space-y-6">
        <Card className="border-sage/20 bg-[linear-gradient(135deg,rgba(91,127,110,0.12),rgba(250,247,242,0.96),rgba(163,139,90,0.1))]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Link to="/">
                  <Button variant="secondary" size="sm">返回书架</Button>
                </Link>
                <span className="rounded-pill border border-sage/20 bg-white/75 px-3 py-1 text-sm text-secondary">
                  Create Brief
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl">新建创作项目</h1>
              <p className="mt-3 max-w-2xl text-body">
                这不是单纯的表单，而是给多 Agent 创作系统准备一份执行 brief。填写越清楚，后面的策划、写作、评审和修订越稳定。
              </p>
            </div>

            <div className="w-full max-w-md rounded-comfortable border border-white/70 bg-white/75 p-5 shadow-standard backdrop-blur">
              <p className="text-xs uppercase tracking-[0.22em] text-secondary">Current Step</p>
              <h2 className="mt-2 text-2xl">{currentStepMeta.title}</h2>
              <p className="mt-2 text-secondary">{currentStepMeta.description}</p>
              <div className="mt-5">
                <ProgressBar progress={progress} message={`步骤 ${currentStep}/${steps.length}: ${currentStepMeta.title}`} />
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <div className="mb-6 flex flex-wrap gap-3">
              {steps.map(step => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className={`rounded-pill px-4 py-2 text-sm transition-colors ${
                    currentStep === step.id
                      ? 'bg-sage text-parchment'
                      : 'border border-border bg-parchment/60 text-secondary hover:border-sage/30 hover:text-inkwell'
                  }`}
                >
                  {step.id}. {step.title}
                </button>
              ))}
            </div>

            {currentStep === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl">先定义作品外壳</h2>
                  <p className="mt-2 text-secondary">
                    这一页决定项目在系统里的身份。比赛演示时，推荐用一个清晰、有记忆点的名字和一句简介。
                  </p>
                </div>

                <Input
                  label="项目名称"
                  placeholder="给你的作品起一个能被记住的名字"
                  value={formData.name || ''}
                  onChange={event => updateForm({ name: event.target.value })}
                />

                <Textarea
                  label="项目简介"
                  placeholder="一句话说明这部作品最值得被看见的地方"
                  value={formData.description || ''}
                  onChange={event => updateForm({ description: event.target.value })}
                />

                <div className="space-y-3">
                  <label className="text-body text-sm font-medium">内容类型</label>
                  <div className="grid gap-3 md:grid-cols-3">
                    {contentTypes.map(type => (
                      <label
                        key={type.value}
                        className={`cursor-pointer rounded-comfortable border p-4 transition-colors ${
                          formData.content_type === type.value
                            ? 'border-sage bg-sage/10 text-inkwell'
                            : 'border-border bg-parchment/40 text-secondary hover:border-sage/30'
                        }`}
                      >
                        <input
                          type="radio"
                          name="content_type"
                          value={type.value}
                          checked={formData.content_type === type.value}
                          onChange={event => updateForm({ content_type: event.target.value as ContentType })}
                          className="sr-only"
                        />
                        <div className="font-medium">{type.label}</div>
                        <p className="mt-2 text-sm">{type.hint}</p>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl">把故事 brief 交给系统</h2>
                  <p className="mt-2 text-secondary">
                    这一页最重要。你写下的是多 Agent 后续共同使用的创作上下文，不只是给单次生成的一段 prompt。
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="小说名称"
                    placeholder="和项目名称相同也可以"
                    value={formData.novel_name || ''}
                    onChange={event => updateForm({ novel_name: event.target.value })}
                  />
                  <Input
                    label="小说题材"
                    placeholder="都市重生 / 玄幻穿越 / 历史架空..."
                    value={formData.genre || ''}
                    onChange={event => updateForm({ genre: event.target.value })}
                  />
                </div>

                <Textarea
                  label="小说简介"
                  placeholder="介绍故事背景、主要人物关系和核心主题"
                  value={formData.novel_description || ''}
                  onChange={event => updateForm({ novel_description: event.target.value })}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="目标总字数"
                    type="number"
                    placeholder="100000"
                    value={formData.total_words || ''}
                    onChange={event => updateForm({ total_words: parseInt(event.target.value, 10) || 0 })}
                  />
                  <Input
                    label="核心卖点 / 钩子"
                    placeholder="一句话说清它为什么抓人"
                    value={formData.core_hook || ''}
                    onChange={event => updateForm({ core_hook: event.target.value })}
                  />
                </div>

                <Textarea
                  label="核心创作需求"
                  placeholder="详细描述你想要的故事，包括风格、节奏、角色关系、禁忌项和特殊要求"
                  className="min-h-[180px]"
                  value={formData.core_requirement || ''}
                  onChange={event => updateForm({ core_requirement: event.target.value })}
                />

                <div className="rounded-comfortable border border-border bg-parchment/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-secondary">Prompting Guide</p>
                  <div className="mt-3 space-y-2 text-sm text-secondary">
                    {briefPrompts.map(prompt => (
                      <p key={prompt}>{prompt}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl">选择比赛版协作方式</h2>
                  <p className="mt-2 text-secondary">
                    这一页决定你是追求速度、可控性，还是更强的人在环路展示感。你可以随时在项目创建后再调整。
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="目标发布平台"
                    placeholder="网络小说 / 出版 / 公众号..."
                    value={formData.target_platform || ''}
                    onChange={event => updateForm({ target_platform: event.target.value })}
                  />
                  <Input
                    label="每章字数"
                    type="number"
                    placeholder="2000"
                    value={formData.chapter_word_count || ''}
                    onChange={event => updateForm({ chapter_word_count: parseInt(event.target.value, 10) || 0 })}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="起始章节"
                    type="number"
                    placeholder="1"
                    value={formData.start_chapter || ''}
                    onChange={event => updateForm({ start_chapter: parseInt(event.target.value, 10) || 1 })}
                  />
                  <Input
                    label="结束章节"
                    type="number"
                    placeholder="10"
                    value={formData.end_chapter || ''}
                    onChange={event => updateForm({ end_chapter: parseInt(event.target.value, 10) || 1 })}
                  />
                </div>

                <div className="space-y-3 rounded-comfortable border border-border bg-parchment/50 p-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="skip_plan_confirm"
                      checked={formData.skip_plan_confirmation}
                      onChange={event => updateForm({ skip_plan_confirmation: event.target.checked })}
                      className="rounded border-border text-sage focus:ring-sage"
                    />
                    <span>跳过策划方案人工确认</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="skip_chapter_confirm"
                      checked={formData.skip_chapter_confirmation}
                      onChange={event => updateForm({ skip_chapter_confirmation: event.target.checked })}
                      className="rounded border-border text-sage focus:ring-sage"
                    />
                    <span>跳过章节级人工确认</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="allow_plot_adjustment"
                      checked={formData.allow_plot_adjustment}
                      onChange={event => updateForm({ allow_plot_adjustment: event.target.checked })}
                      className="rounded border-border text-sage focus:ring-sage"
                    />
                    <span>允许每章后调整下一章剧情</span>
                  </label>
                </div>

                <div className="rounded-comfortable border border-sage/20 bg-sage/8 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-secondary">Selected Mode</p>
                  <h3 className="mt-2 text-xl">{getModeLabel(formData)}</h3>
                  <p className="mt-2 text-secondary">{getModeDescription(formData)}</p>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl">确认并启动项目</h2>
                  <p className="mt-2 text-secondary">
                    创建后会直接进入项目概览页。那里已经被收口成比赛版总控台，可以立刻开始生成和展示进度。
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-standard border border-border bg-parchment/60 p-4">
                    <p className="text-secondary">项目名称</p>
                    <p className="mt-1 text-body">{formData.name || '未填写'}</p>
                  </div>
                  <div className="rounded-standard border border-border bg-parchment/60 p-4">
                    <p className="text-secondary">内容类型</p>
                    <p className="mt-1 text-body">{selectedContentType?.label || '未选择'}</p>
                  </div>
                  <div className="rounded-standard border border-border bg-parchment/60 p-4">
                    <p className="text-secondary">章节范围</p>
                    <p className="mt-1 text-body">{formData.start_chapter} - {formData.end_chapter}</p>
                  </div>
                  <div className="rounded-standard border border-border bg-parchment/60 p-4">
                    <p className="text-secondary">协作模式</p>
                    <p className="mt-1 text-body">{getModeLabel(formData)}</p>
                  </div>
                </div>

                <div className="rounded-comfortable border border-border bg-white/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-secondary">Core Requirement</p>
                  <div className="mt-3 space-y-3 text-sm text-body">
                    <p><span className="text-secondary">小说名称：</span>{formData.novel_name || formData.name || '未填写'}</p>
                    <p><span className="text-secondary">题材：</span>{formData.genre || '未填写'}</p>
                    <p><span className="text-secondary">核心钩子：</span>{formData.core_hook || '未填写'}</p>
                    <p><span className="text-secondary">目标总字数：</span>{formData.total_words || '未填写'}</p>
                    <p><span className="text-secondary">发布平台：</span>{formData.target_platform || '未填写'}</p>
                    {formData.core_requirement && (
                      <div>
                        <p className="text-secondary">创作需求：</p>
                        <p className="mt-2 whitespace-pre-line">{formData.core_requirement}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
              <Button
                variant="secondary"
                onClick={prevStep}
                disabled={currentStep === 1 || isPending}
              >
                上一步
              </Button>

              <div className="flex flex-col items-end gap-2">
                {stepBlockedReason && currentStep < steps.length && (
                  <p className="text-sm text-secondary">{stepBlockedReason}</p>
                )}
                {currentStep < steps.length ? (
                  <Button variant="primary" onClick={nextStep} disabled={isPending || !!stepBlockedReason}>
                    下一步
                  </Button>
                ) : (
                  <Button variant="primary" onClick={handleSubmit} disabled={isPending}>
                    {isPending ? '创建中...' : '创建项目'}
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <p className="text-xs uppercase tracking-[0.22em] text-secondary">Live Summary</p>
              <h2 className="mt-2 text-2xl">实时项目摘要</h2>

              <div className="mt-5 space-y-3">
                <div className="rounded-standard border border-border bg-parchment/60 p-4">
                  <p className="text-secondary">作品名称</p>
                  <p className="mt-1 text-body">{formData.name || '等待填写'}</p>
                </div>
                <div className="rounded-standard border border-border bg-parchment/60 p-4">
                  <p className="text-secondary">内容类型</p>
                  <p className="mt-1 text-body">{selectedContentType?.label || '等待选择'}</p>
                </div>
                <div className="rounded-standard border border-border bg-parchment/60 p-4">
                  <p className="text-secondary">核心钩子</p>
                  <p className="mt-1 text-body">{formData.core_hook || '等待填写'}</p>
                </div>
                <div className="rounded-standard border border-border bg-parchment/60 p-4">
                  <p className="text-secondary">生成范围</p>
                  <p className="mt-1 text-body">
                    {formData.start_chapter} - {formData.end_chapter} 章，共 {targetChapters} 章
                  </p>
                </div>
                <div className="rounded-standard border border-border bg-parchment/60 p-4">
                  <p className="text-secondary">协作模式</p>
                  <p className="mt-1 text-body">{getModeLabel(formData)}</p>
                  <p className="mt-2 text-sm text-secondary">{getModeDescription(formData)}</p>
                </div>
              </div>
            </Card>

            <Card>
              <p className="text-xs uppercase tracking-[0.22em] text-secondary">What Happens Next</p>
              <h2 className="mt-2 text-2xl">创建后会发生什么</h2>
              <div className="mt-5 space-y-3 text-sm text-secondary">
                <p>1. Planner 会先把你的需求拆成设定圣经和分章大纲。</p>
                <p>2. Writer 逐章生成正文，Guardrails 和 Critic 自动做首轮质量控制。</p>
                <p>3. Revise 在需要时根据问题清单修订章节。</p>
                <p>4. 你可以在项目概览页直接看到当前运行态、质量结果和导出入口。</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default CreateProject
