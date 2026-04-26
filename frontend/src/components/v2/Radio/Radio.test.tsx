import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Radio, RadioGroup } from './Radio'

describe('Radio', () => {
  it('renders correctly with label', () => {
    render(<Radio value="option1" label="Option 1" name="test" />)
    expect(screen.getByText(/Option 1/i)).toBeInTheDocument()
    expect(screen.getByRole('radio')).toBeInTheDocument()
  })

  it('can be checked when clicked', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Radio value="option1" label="Option 1" name="test" onChange={onChange} />)

    const radio = screen.getByRole('radio')
    await user.click(radio)
    expect(onChange).toHaveBeenCalled()
    expect(radio).toBeChecked()
  })

  it('is disabled when disabled prop is true', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Radio value="option1" label="Disabled" name="test" disabled onChange={onChange} />)

    const radio = screen.getByRole('radio')
    expect(radio).toBeDisabled()

    await user.click(radio)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('applies size variant correctly', () => {
    const { rerender } = render(<Radio value="sm" label="Small" name="test" size="sm" />)
    let radio = screen.getByRole('radio').nextElementSibling
    expect(radio?.className).toContain('w-3')
    expect(radio?.className).toContain('h-3')

    rerender(<Radio value="lg" label="Large" name="test" size="lg" />)
    radio = screen.getByRole('radio').nextElementSibling
    expect(radio?.className).toContain('w-5')
    expect(radio?.className).toContain('h-5')
  })
})

describe('RadioGroup', () => {
  it('renders all radios in group', () => {
    render(
      <RadioGroup label="Select color" name="color" defaultValue="red">
        <Radio value="red" label="Red" />
        <Radio value="blue" label="Blue" />
        <Radio value="green" label="Green" />
      </RadioGroup>
    )

    expect(screen.getByText(/Select color/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Red/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Blue/i)).toBeInTheDocument()
  })

  it('tracks selected value in group', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <RadioGroup label="Color" name="color" onChange={onChange}>
        <Radio value="red" label="Red" />
        <Radio value="blue" label="Blue" />
      </RadioGroup>
    )

    await user.click(screen.getByLabelText(/Blue/i))
    expect(onChange).toHaveBeenCalledWith('blue')

    await user.click(screen.getByLabelText(/Red/i))
    expect(onChange).toHaveBeenCalledWith('red')
  })

  it('has only one checked radio at a time', async () => {
    const user = userEvent.setup()
    render(
      <RadioGroup label="Color" name="color" defaultValue="red">
        <Radio value="red" label="Red" />
        <Radio value="blue" label="Blue" />
        <Radio value="green" label="Green" />
      </RadioGroup>
    )

    expect(screen.getByLabelText(/Red/i)).toBeChecked()
    expect(screen.getByLabelText(/Blue/i)).not.toBeChecked()

    await user.click(screen.getByLabelText(/Green/i))
    expect(screen.getByLabelText(/Green/i)).toBeChecked()
    expect(screen.getByLabelText(/Red/i)).not.toBeChecked()
  })

  it('disables all radios when group is disabled', () => {
    render(
      <RadioGroup label="Color" name="color" disabled>
        <Radio value="red" label="Red" />
        <Radio value="blue" label="Blue" />
      </RadioGroup>
    )

    const radios = screen.getAllByRole('radio')
    radios.forEach(radio => {
      expect(radio).toBeDisabled()
    })
  })

  it('supports horizontal layout', () => {
    render(
      <RadioGroup label="Color" name="color" layout="horizontal">
        <Radio value="red" label="Red" />
        <Radio value="blue" label="Blue" />
      </RadioGroup>
    )

    const groupContainer = screen.getByRole('radiogroup').querySelector('div')
    expect(groupContainer).toHaveClass('flex-row')
  })

  it('passes size prop to child radios', () => {
    render(
      <RadioGroup label="Color" name="color" size="lg">
        <Radio value="red" label="Red" />
        <Radio value="blue" label="Blue" />
      </RadioGroup>
    )

    const radioElements = screen.getAllByRole('radio')
    radioElements.forEach(radio => {
      const indicator = radio.nextElementSibling
      expect(indicator?.className).toContain('w-5')
      expect(indicator?.className).toContain('h-5')
    })
  })
})
