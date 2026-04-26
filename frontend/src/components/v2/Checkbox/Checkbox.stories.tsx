import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Checkbox, CheckboxGroup } from './Checkbox'

const meta: Meta<typeof Checkbox> = {
  title: 'v2/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    labelPosition: {
      control: 'select',
      options: ['left', 'right'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Checkbox>

export const Default: Story = {
  args: {
    label: 'Accept terms and conditions',
  },
}

export const Checked: Story = {
  args: {
    label: 'Checked checkbox',
    checked: true,
  },
}

export const Disabled: Story = {
  args: {
    label: 'Disabled checkbox',
    disabled: true,
  },
}

export const DisabledChecked: Story = {
  args: {
    label: 'Disabled and checked',
    disabled: true,
    checked: true,
  },
}

export const Indeterminate: Story = {
  args: {
    label: 'Indeterminate state',
    indeterminate: true,
  },
}

export const LabelLeft: Story = {
  args: {
    label: 'Label on left',
    labelPosition: 'left',
  },
}

export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = useState(false)
    return (
      <Checkbox
        label="Controlled checkbox"
        checked={checked}
        onChange={(newChecked) => setChecked(newChecked)}
      />
    )
  },
}

export const BasicGroup: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(['apple'])
    return (
      <CheckboxGroup
        label="Select your favorite fruits"
        value={value}
        onChange={setValue}
      >
        <Checkbox value="apple" label="Apple" />
        <Checkbox value="banana" label="Banana" />
        <Checkbox value="orange" label="Orange" />
      </CheckboxGroup>
    )
  },
}

export const HorizontalGroup: Story = {
  render: () => (
    <CheckboxGroup
      label="Select options (horizontal)"
      layout="horizontal"
      defaultValue={['option1']}
    >
      <Checkbox value="option1" label="Option 1" />
      <Checkbox value="option2" label="Option 2" />
      <Checkbox value="option3" label="Option 3" />
    </CheckboxGroup>
  ),
}

export const DisabledGroup: Story = {
  render: () => (
    <CheckboxGroup
      label="Disabled group"
      disabled
      defaultValue={['option1']}
    >
      <Checkbox value="option1" label="Option 1" />
      <Checkbox value="option2" label="Option 2" />
      <Checkbox value="option3" label="Option 3" />
    </CheckboxGroup>
  ),
}
