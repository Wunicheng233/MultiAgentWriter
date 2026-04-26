import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Table } from './Table'

interface TestData {
  id: number
  name: string
  status: string
}

const columns = [
  { key: 'id', title: 'ID' },
  { key: 'name', title: '名称' },
  { key: 'status', title: '状态' },
]

const dataSource: TestData[] = [
  { id: 1, name: '项目一', status: '进行中' },
  { id: 2, name: '项目二', status: '已完成' },
]

describe('Table', () => {
  it('renders table with headers and data correctly', () => {
    render(<Table columns={columns} dataSource={dataSource} rowKey="id" />)

    // Headers
    expect(screen.getByText('ID')).toBeInTheDocument()
    expect(screen.getByText('名称')).toBeInTheDocument()
    expect(screen.getByText('状态')).toBeInTheDocument()

    // Data
    expect(screen.getByText('项目一')).toBeInTheDocument()
    expect(screen.getByText('项目二')).toBeInTheDocument()
  })

  it('renders empty state when no data', () => {
    render(<Table columns={columns} dataSource={[]} rowKey="id" />)
    expect(screen.getByText('暂无数据')).toBeInTheDocument()
  })

  it('renders with custom render function', () => {
    const customColumns = [
      { key: 'name', title: '名称' },
      {
        key: 'status',
        title: '状态',
        render: (value: string) => <span className="custom-status">{value}</span>,
      },
    ]

    render(<Table columns={customColumns} dataSource={dataSource} rowKey="id" />)

    // The rendered content should be findable
    expect(screen.getByText('进行中')).toBeInTheDocument()
  })

  it('applies hoverable styles when enabled', () => {
    render(<Table columns={columns} dataSource={dataSource} rowKey="id" hoverable />)
    // Just verify it renders without crashing
    expect(screen.getByText('项目一')).toBeInTheDocument()
  })
})
