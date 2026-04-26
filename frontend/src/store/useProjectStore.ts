import { create } from 'zustand'

export type ProjectStatus = 'draft' | 'generating' | 'waiting_confirm' | 'completed' | 'failed'

interface ProjectState {
  currentProjectId: string | null
  currentProjectName: string | null
  projectStatus: ProjectStatus
  progressPercent: number
  isInProject: boolean

  setCurrentProject: (id: string, name: string) => void
  clearCurrentProject: () => void
  setProjectStatus: (status: ProjectStatus, progress?: number) => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  currentProjectId: null,
  currentProjectName: null,
  projectStatus: 'draft',
  progressPercent: 0,
  isInProject: false,

  setCurrentProject: (id: string, name: string) => set({
    currentProjectId: id,
    currentProjectName: name,
    isInProject: true,
  }),

  clearCurrentProject: () => set({
    currentProjectId: null,
    currentProjectName: null,
    isInProject: false,
    projectStatus: 'draft',
    progressPercent: 0,
  }),

  setProjectStatus: (status: ProjectStatus, progress = 0) => set({
    projectStatus: status,
    progressPercent: progress,
  }),
}))
