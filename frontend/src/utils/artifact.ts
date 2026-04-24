import type { ArtifactDetail, ArtifactSummary, JsonValue } from '../types/api'

type ArtifactLike = ArtifactSummary | ArtifactDetail

const artifactTypeLabels: Record<string, string> = {
  chapter_draft: '章节草稿',
  chapter_evaluation: '章节评审',
  chapter_critique_v2: 'Critic v2 诊断',
  scene_anchor_plan: 'Scene Anchors',
  repair_trace: '局部修复轨迹',
  stitching_report: 'Stitching 报告',
  novel_state_snapshot: 'NovelState 快照',
  project_config_snapshot: '项目配置快照',
}

export function getArtifactDisplayName(artifactType: string): string {
  return artifactTypeLabels[artifactType] || artifactType
}

export function getArtifactScopeLabel(artifact: Pick<ArtifactLike, 'scope' | 'chapter_index'>): string {
  if (artifact.scope === 'chapter') {
    return artifact.chapter_index ? `第 ${artifact.chapter_index} 章` : '章节级'
  }
  if (artifact.scope === 'step') {
    return artifact.chapter_index ? `步骤 / 第 ${artifact.chapter_index} 章` : '步骤级'
  }
  return '项目级'
}

export function stringifyArtifactJson(value?: JsonValue[] | { [key: string]: JsonValue } | null): string {
  if (!value) return ''
  return JSON.stringify(value, null, 2)
}

export function getArtifactContentString(artifact: Pick<ArtifactDetail, 'content_text' | 'content_json'>): string {
  if (artifact.content_text?.trim()) return artifact.content_text
  return stringifyArtifactJson(artifact.content_json)
}

export function getArtifactPreview(
  artifact: Pick<ArtifactDetail, 'content_text' | 'content_json'>,
  maxLength = 500
): string {
  const content = getArtifactContentString(artifact)
  if (!content) return ''
  return content.length > maxLength ? `${content.slice(0, maxLength)}...` : content
}

export function getArtifactVersionKey(
  artifact: Pick<ArtifactLike, 'artifact_type' | 'scope' | 'chapter_index'>
): string {
  return `${artifact.artifact_type}:${artifact.scope}:${artifact.chapter_index ?? 'project'}`
}

export function getArtifactContentStats(content: string): {
  characters: number
  lines: number
  paragraphs: number
} {
  if (!content.trim()) {
    return { characters: 0, lines: 0, paragraphs: 0 }
  }

  const lines = content.split('\n')
  const paragraphs = content.split(/\n\s*\n/).filter(Boolean)

  return {
    characters: content.length,
    lines: lines.length,
    paragraphs: paragraphs.length,
  }
}

export function getArtifactCompareSummary(currentContent: string, compareContent: string): {
  changedLines: number
  addedLines: number
  removedLines: number
} {
  const currentLines = currentContent.split('\n')
  const compareLines = compareContent.split('\n')
  const maxLines = Math.max(currentLines.length, compareLines.length)

  let changedLines = 0
  let addedLines = 0
  let removedLines = 0

  for (let index = 0; index < maxLines; index += 1) {
    const currentLine = currentLines[index]
    const compareLine = compareLines[index]

    if (currentLine === compareLine) continue
    if (currentLine === undefined) {
      removedLines += 1
      continue
    }
    if (compareLine === undefined) {
      addedLines += 1
      continue
    }
    changedLines += 1
  }

  return {
    changedLines,
    addedLines,
    removedLines,
  }
}
