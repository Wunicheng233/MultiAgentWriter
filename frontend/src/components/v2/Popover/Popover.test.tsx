import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Popover, PopoverTrigger, PopoverContent } from './Popover'
import { Button } from '../Button/Button'

describe('Popover', () => {
  it('renders trigger correctly', () => {
    render(
      <Popover>
        <PopoverTrigger>
          <Button>Open Popover</Button>
        </PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>
    )

    expect(screen.getByText('Open Popover')).toBeInTheDocument()
  })

  it('opens popover when trigger is clicked', async () => {
    render(
      <Popover>
        <PopoverTrigger>
          <Button>Open</Button>
        </PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>
    )

    await fireEvent.click(screen.getByText('Open'))
    expect(screen.getByText('Popover content')).toBeInTheDocument()
  })

  it('closes when clicking outside', async () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <Popover>
          <PopoverTrigger>
            <Button>Open</Button>
          </PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>
      </div>
    )

    await fireEvent.click(screen.getByText('Open'))
    expect(screen.getByText('Popover content')).toHaveClass('opacity-100')

    await fireEvent.mouseDown(screen.getByTestId('outside'))
    await waitFor(() => {
      expect(screen.getByText('Popover content')).toHaveClass('opacity-0')
    })
  })

  it('closes when Escape is pressed', async () => {
    render(
      <Popover>
        <PopoverTrigger>
          <Button>Open</Button>
        </PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>
    )

    await fireEvent.click(screen.getByText('Open'))
    expect(screen.getByText('Popover content')).toHaveClass('opacity-100')

    await fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    await waitFor(() => {
      expect(screen.getByText('Popover content')).toHaveClass('opacity-0')
    })
  })
})
