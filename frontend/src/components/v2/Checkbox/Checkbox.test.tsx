import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox, CheckboxGroup } from './Checkbox'

describe('Checkbox', () => {
  it('renders correctly with label', () => {
    render(<Checkbox label="Accept terms" />)
    expect(screen.getByText(/Accept terms/i)).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('can be checked and unchecked', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Checkbox label="Check me" onChange={onChange} />)

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)
    expect(onChange).toHaveBeenCalledWith(true)

    await user.click(checkbox)
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('is disabled when disabled prop is true', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Checkbox label="Disabled" disabled onChange={onChange} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDisabled()

    await user.click(checkbox)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('can be controlled via checked prop', () => {
    const { rerender } = render(<Checkbox label="Controlled" checked={true} />)
    expect(screen.getByRole('checkbox')).toBeChecked()

    rerender(<Checkbox label="Controlled" checked={false} />)
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('supports indeterminate state', () => {
    render(<Checkbox label="Indeterminate" indeterminate={true} />)
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.indeterminate).toBe(true)
  })

  it('renders label on left side when labelPosition is left', () => {
    render(<Checkbox label="Left label" labelPosition="left" />)
    const container = screen.getByText(/Left label/i).parentElement
    expect(container?.firstChild?.textContent).toBe('Left label')
  })
})

describe('CheckboxGroup', () => {
  it('renders all checkboxes in group', () => {
    render(
      <CheckboxGroup label="Select options" defaultValue={['option1']}>
        <Checkbox value="option1" label="Option 1" />
        <Checkbox value="option2" label="Option 2" />
        <Checkbox value="option3" label="Option 3" />
      </CheckboxGroup>
    )

    expect(screen.getByText(/Select options/i)).toBeInTheDocument()
    expect(screen.getByText(/Option 1/i)).toBeInTheDocument()
    expect(screen.getByText(/Option 2/i)).toBeInTheDocument()
    expect(screen.getByText(/Option 3/i)).toBeInTheDocument()
  })

  it('tracks checked values in group', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <CheckboxGroup onChange={onChange}>
        <Checkbox value="option1" label="Option 1" />
        <Checkbox value="option2" label="Option 2" />
      </CheckboxGroup>
    )

    await user.click(screen.getByLabelText(/Option 1/i))
    expect(onChange).toHaveBeenCalledWith(['option1'])

    await user.click(screen.getByLabelText(/Option 2/i))
    expect(onChange).toHaveBeenCalledWith(['option1', 'option2'])

    await user.click(screen.getByLabelText(/Option 1/i))
    expect(onChange).toHaveBeenCalledWith(['option2'])
  })

  it('disables all checkboxes when group is disabled', () => {
    render(
      <CheckboxGroup disabled>
        <Checkbox value="option1" label="Option 1" />
        <Checkbox value="option2" label="Option 2" />
      </CheckboxGroup>
    )

    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach(checkbox => {
      expect(checkbox).toBeDisabled()
    })
  })

  it('supports horizontal layout', () => {
    render(
      <CheckboxGroup layout="horizontal">
        <Checkbox value="option1" label="Option 1" />
        <Checkbox value="option2" label="Option 2" />
      </CheckboxGroup>
    )

    const groupContainer = screen.getByRole('group').firstChild
    expect(groupContainer).toHaveClass('flex-row')
  })
})
