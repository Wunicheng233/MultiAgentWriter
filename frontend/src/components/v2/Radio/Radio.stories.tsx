import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Radio, RadioGroup } from './Radio'

const meta: Meta<typeof Radio> = {
  title: 'v2/Radio',
  component: Radio,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Radio>

export const Default: Story = {
  args: {
    label: 'Radio option',
    value: 'option1',
    name: 'test',
  },
}

export const Checked: Story = {
  args: {
    label: 'Checked radio',
    value: 'option1',
    name: 'test',
    checked: true,
  },
}

export const Disabled: Story = {
  args: {
    label: 'Disabled radio',
    value: 'option1',
    name: 'test',
    disabled: true,
  },
}

export const DisabledChecked: Story = {
  args: {
    label: 'Disabled and checked',
    value: 'option1',
    name: 'test',
    disabled: true,
    checked: true,
  },
}

export const Small: Story = {
  args: {
    label: 'Small size',
    value: 'option1',
    name: 'test',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    label: 'Large size',
    value: 'option1',
    name: 'test',
    size: 'lg',
  },
}

export const BasicGroup: Story = {
  render: () => {
    const [value, setValue] = useState('apple')
    return (
      <RadioGroup
        label="Select your favorite fruit"
        name="fruit"
        value={value}
        onChange={setValue}
      >
        <Radio value="apple" label="Apple" />
        <Radio value="banana" label="Banana" />
        <Radio value="orange" label="Orange" />
      </RadioGroup>
    )
  },
}

export const HorizontalGroup: Story = {
  render: () => (
    <RadioGroup
      label="Select color (horizontal)"
      name="color"
      layout="horizontal"
      defaultValue="blue"
      size="lg"
    >
      <Radio value="red" label="Red" />
      <Radio value="blue" label="Blue" />
      <Radio value="green" label="Green" />
    </RadioGroup>
  ),
}

export const DisabledGroup: Story = {
  render: () => (
    <RadioGroup
      label="Disabled group"
      name="test"
      disabled
      defaultValue="option1"
    >
      <Radio value="option1" label="Option 1" />
      <Radio value="option2" label="Option 2" />
    </RadioGroup>
  ),
}
