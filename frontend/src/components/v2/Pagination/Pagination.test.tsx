import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('renders page buttons correctly', () => {
    render(<Pagination current={1} total={50} pageSize={10} />)

    // Should show 1-5 buttons
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()

    // Prev/Next buttons
    expect(screen.getByLabelText('上一页')).toBeInTheDocument()
    expect(screen.getByLabelText('下一页')).toBeInTheDocument()
  })

  it('disables prev button on first page', () => {
    render(<Pagination current={1} total={50} pageSize={10} />)
    const prevBtn = screen.getByLabelText('上一页')
    expect(prevBtn).toBeDisabled()
  })

  it('disables next button on last page', () => {
    render(<Pagination current={5} total={50} pageSize={10} />)
    const nextBtn = screen.getByLabelText('下一页')
    expect(nextBtn).toBeDisabled()
  })

  it('calls onChange when page is clicked', async () => {
    const onChange = vi.fn()
    render(<Pagination current={1} total={50} pageSize={10} onChange={onChange} />)

    await fireEvent.click(screen.getByText('3'))
    expect(onChange).toHaveBeenCalledWith(3)
  })
})
