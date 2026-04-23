import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { getProject, getProjectArtifact, getProjectArtifacts } from '../utils/endpoints'
import {
  getArtifactCompareSummary,
  getArtifactContentStats,
  getArtifactContentString,
  getArtifactDisplayName,
  getArtifactScopeLabel,
  getArtifactVersionKey,
} from '../utils/artifact'

function formatDateTime(value?: string): string {
  if (!value) return '暂无'
  return new Date(value).toLocaleString()
}

export const ArtifactDetail: React.FC = () => {
  const { id, artifactId } = useParams<{ id: string; artifactId: string }>()
  const [searchParams] = useSearchParams()
  const projectId = parseInt(id!, 10)
  const currentArtifactId = parseInt(artifactId!, 10)

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId),
  })

  const { data: artifact, isLoading } = useQuery({
    queryKey: ['project-artifact', projectId, currentArtifactId],
    queryFn: () => getProjectArtifact(projectId, currentArtifactId),
  })

  const { data: versionChain } = useQuery({
    queryKey: ['project-artifacts', projectId, 'chain', artifact?.id],
    queryFn: () =>
      getProjectArtifacts(projectId, {
        artifact_type: artifact!.artifact_type,
        scope: artifact!.scope,
        chapter_index: artifact!.chapter_index,
        include_content: false,
        limit: 50,
      }),
    enabled: !!artifact,
  })

  const versions = React.useMemo(() => {
    return [...(versionChain?.items || [])].sort((left, right) => right.version_number - left.version_number)
  }, [versionChain])

  const compareArtifactId = React.useMemo(() => {
    const compareId = searchParams.get('compare')
    if (compareId) return parseInt(compareId, 10)

    const currentIndex = versions.findIndex(item => item.id === currentArtifactId)
    if (currentIndex >= 0 && currentIndex < versions.length - 1) {
      return versions[currentIndex + 1].id
    }
    return undefined
  }, [currentArtifactId, searchParams, versions])

  const { data: compareArtifact } = useQuery({
    queryKey: ['project-artifact', projectId, compareArtifactId],
    queryFn: () => getProjectArtifact(projectId, compareArtifactId!),
    enabled: !!compareArtifactId && compareArtifactId !== currentArtifactId,
  })

  if (isLoading) {
    return (
      <Layout>
        <p className="text-secondary">加载中...</p>
      </Layout>
    )
  }

  if (!artifact) {
    return (
      <Layout>
        <p className="text-secondary">Artifact 不存在</p>
      </Layout>
    )
  }

  const artifactContent = getArtifactContentString(artifact)
  const artifactStats = getArtifactContentStats(artifactContent)
  const compareContent = compareArtifact ? getArtifactContentString(compareArtifact) : ''
  const compareStats = compareArtifact ? getArtifactContentStats(compareContent) : null
  const compareSummary =
    compareArtifact && artifactContent && compareContent
      ? getArtifactCompareSummary(artifactContent, compareContent)
      : null

  return (
    <Layout>
      <div className="mx-auto max-w-content space-y-6">
        <Card className="border-sage/20 bg-[linear-gradient(135deg,rgba(91,127,110,0.12),rgba(255,255,255,0.94),rgba(163,139,90,0.08))]">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Link to={`/projects/${projectId}/overview`}>
                  <Button variant="secondary">返回项目总控台</Button>
                </Link>
                {artifact.workflow_run_id && (
                  <Link to={`/projects/${projectId}/workflows/${artifact.workflow_run_id}`}>
                    <Button variant="secondary">查看所属 Run</Button>
                  </Link>
                )}
                {artifact.chapter_index && (
                  <Link to={`/projects/${projectId}/write/${artifact.chapter_index}`}>
                    <Button variant="secondary">打开相关章节</Button>
                  </Link>
                )}
                <Badge variant="secondary">{artifact.scope}</Badge>
                {artifact.is_current && <Badge variant="agent">current</Badge>}
              </div>

              <h1 className="text-3xl md:text-4xl">{getArtifactDisplayName(artifact.artifact_type)}</h1>
              <p className="mt-3 text-body">
                这是 artifact #{artifact.id} 的完整详情页，承接单个产物的内容、版本链和对比入口。
              </p>
              {project && <p className="mt-3 text-secondary">{project.name}</p>}
            </div>

            <div className="grid w-full max-w-2xl grid-cols-2 gap-3 text-sm md:grid-cols-4">
              <div className="rounded-standard border border-border bg-parchment/70 p-3">
                <p className="text-secondary">版本</p>
                <p className="mt-1 text-body">v{artifact.version_number}</p>
              </div>
              <div className="rounded-standard border border-border bg-parchment/70 p-3">
                <p className="text-secondary">范围</p>
                <p className="mt-1 text-body">{getArtifactScopeLabel(artifact)}</p>
              </div>
              <div className="rounded-standard border border-border bg-parchment/70 p-3">
                <p className="text-secondary">版本链长度</p>
                <p className="mt-1 text-body">{versions.length}</p>
              </div>
              <div className="rounded-standard border border-border bg-parchment/70 p-3">
                <p className="text-secondary">创建时间</p>
                <p className="mt-1 text-body">{formatDateTime(artifact.created_at)}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
          <Card>
            <p className="text-xs uppercase tracking-[0.22em] text-secondary">Artifact Summary</p>
            <h2 className="mt-2 text-2xl">产物摘要</h2>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-standard border border-border bg-parchment/60 p-4">
                <p className="text-secondary">类型</p>
                <p className="mt-1 text-body">{artifact.artifact_type}</p>
              </div>
              <div className="rounded-standard border border-border bg-parchment/60 p-4">
                <p className="text-secondary">版本链键</p>
                <p className="mt-1 break-words text-body">{getArtifactVersionKey(artifact)}</p>
              </div>
              <div className="rounded-standard border border-border bg-parchment/60 p-4">
                <p className="text-secondary">来源</p>
                <p className="mt-1 text-body">{artifact.source}</p>
              </div>
              <div className="rounded-standard border border-border bg-parchment/60 p-4">
                <p className="text-secondary">所属 Run</p>
                <p className="mt-1 text-body">{artifact.workflow_run_id ?? '暂无'}</p>
              </div>
              <div className="rounded-standard border border-border bg-parchment/60 p-4">
                <p className="text-secondary">字符数</p>
                <p className="mt-1 text-body">{artifactStats.characters}</p>
              </div>
              <div className="rounded-standard border border-border bg-parchment/60 p-4">
                <p className="text-secondary">行数 / 段落</p>
                <p className="mt-1 text-body">
                  {artifactStats.lines} / {artifactStats.paragraphs}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <p className="text-xs uppercase tracking-[0.22em] text-secondary">Version Chain</p>
            <h2 className="mt-2 text-2xl">版本链</h2>
            <p className="mt-2 text-secondary">
              这里按同类 artifact 的版本链展示历史。它是后面做回放、审计和自动评测对照的基础。
            </p>

            <div className="mt-5 space-y-3">
              {versions.map(version => {
                const isActive = version.id === artifact.id
                const compareTarget = version.id === compareArtifact?.id

                return (
                  <div
                    key={version.id}
                    className={`rounded-standard border p-4 ${
                      isActive ? 'border-sage bg-sage/10' : 'border-border bg-parchment/50'
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-inkwell">v{version.version_number}</span>
                          {version.is_current && <Badge variant="agent">current</Badge>}
                          {isActive && <Badge variant="status">当前查看</Badge>}
                          {compareTarget && <Badge variant="secondary">对照版本</Badge>}
                        </div>
                        <div className="mt-2 text-sm text-secondary">
                          Artifact #{version.id} · {formatDateTime(version.created_at)}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!isActive && (
                          <Link to={`/projects/${projectId}/artifacts/${version.id}`}>
                            <Button variant="secondary" size="sm">查看该版本</Button>
                          </Link>
                        )}
                        {!isActive && (
                          <Link to={`/projects/${projectId}/artifacts/${artifact.id}?compare=${version.id}`}>
                            <Button variant="tertiary" size="sm">设为对照</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {!versions.length && (
                <div className="rounded-standard border border-dashed border-border p-4 text-secondary">
                  当前还没有可展示的版本链记录。
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card>
          <p className="text-xs uppercase tracking-[0.22em] text-secondary">Compare View</p>
          <h2 className="mt-2 text-2xl">版本对照</h2>
          <p className="mt-2 text-secondary">
            默认会选择上一版作为对照，这样用户可以快速看出当前产物和历史版本之间的变化规模。
          </p>

          {compareArtifact ? (
            <>
              <div className="mt-5 grid gap-3 md:grid-cols-4">
                <div className="rounded-standard border border-border bg-parchment/60 p-4">
                  <p className="text-secondary">当前版本</p>
                  <p className="mt-1 text-body">v{artifact.version_number}</p>
                </div>
                <div className="rounded-standard border border-border bg-parchment/60 p-4">
                  <p className="text-secondary">对照版本</p>
                  <p className="mt-1 text-body">v{compareArtifact.version_number}</p>
                </div>
                <div className="rounded-standard border border-border bg-parchment/60 p-4">
                  <p className="text-secondary">改动行</p>
                  <p className="mt-1 text-body">{compareSummary?.changedLines ?? 0}</p>
                </div>
                <div className="rounded-standard border border-border bg-parchment/60 p-4">
                  <p className="text-secondary">新增 / 删除</p>
                  <p className="mt-1 text-body">
                    {compareSummary?.addedLines ?? 0} / {compareSummary?.removedLines ?? 0}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                <div className="rounded-comfortable border border-border bg-parchment/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-secondary">Current</p>
                      <h3 className="mt-2 text-lg">v{artifact.version_number}</h3>
                    </div>
                    <p className="text-sm text-secondary">
                      {artifactStats.characters} chars / {artifactStats.lines} lines
                    </p>
                  </div>
                  <pre className="mt-4 max-h-[36rem] overflow-auto whitespace-pre-wrap rounded-standard border border-border bg-white/70 p-4 text-sm text-body">
                    {artifactContent || '当前产物没有可展示内容。'}
                  </pre>
                </div>

                <div className="rounded-comfortable border border-border bg-parchment/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-secondary">Compared</p>
                      <h3 className="mt-2 text-lg">v{compareArtifact.version_number}</h3>
                    </div>
                    <p className="text-sm text-secondary">
                      {compareStats?.characters ?? 0} chars / {compareStats?.lines ?? 0} lines
                    </p>
                  </div>
                  <pre className="mt-4 max-h-[36rem] overflow-auto whitespace-pre-wrap rounded-standard border border-border bg-white/70 p-4 text-sm text-body">
                    {compareContent || '对照版本没有可展示内容。'}
                  </pre>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-standard border border-dashed border-border p-4 text-secondary">
              当前没有更早版本可用于对照，下面保留当前产物的完整内容。
            </div>
          )}
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-[0.22em] text-secondary">Artifact Content</p>
          <h2 className="mt-2 text-2xl">完整内容</h2>

          <pre className="mt-5 max-h-[44rem] overflow-auto whitespace-pre-wrap rounded-comfortable border border-border bg-parchment/50 p-4 text-sm text-body">
            {artifactContent || '当前产物没有保存可展示内容。'}
          </pre>
        </Card>
      </div>
    </Layout>
  )
}

export default ArtifactDetail
