import type { Meta, StoryObj } from '@storybook/react'
import { Table } from './Table'

const meta: Meta<typeof Table> = {
  title: 'v2/Table',
  component: Table,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Table>

interface DataItem {
  id: number
  name: string
  status: string
  progress: number
}

const columns = [
  { key: 'id', title: 'ID', width: '80px' },
  { key: 'name', title: '项目名称' },
  { key: 'status', title: '状态' },
  {
    key: 'progress',
    title: '进度',
    render: (value: number) => (
      <div className="flex items-center gap-2">
        <div className="w-20 h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--accent-primary)] rounded-full"
            style={{ width: `${value}%` }}
          />
        </div>
        <span className="text-sm text-[var(--text-secondary)]">{value}%</span>
      </div>
    ),
  },
]

const dataSource: DataItem[] = [
  { id: 1, name: '长篇小说创作', status: '进行中', progress: 65 },
  { id: 2, name: '短篇故事集', status: '已完成', progress: 100 },
  { id: 3, name: '剧本创作', status: '待开始', progress: 0 },
]

export const Default: Story = {
  args: {
    columns,
    dataSource,
    rowKey: 'id',
  },
}

export const Striped: Story = {
  args: {
    columns,
    dataSource,
    rowKey: 'id',
    striped: true,
  },
}

export const Small: Story = {
  args: {
    columns,
    dataSource,
    rowKey: 'id',
    size: 'sm',
  },
}

export const Empty: Story = {
  args: {
    columns,
    dataSource: [],
    rowKey: 'id',
  },
}
