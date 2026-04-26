import type { Meta, StoryObj } from '@storybook/react'
import { Card } from './Card'

const meta: Meta<typeof Card> = {
  title: 'v2/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outlined', 'elevated'],
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {
  args: {
    children: 'This is a default card with medium padding.',
  },
}

export const Hoverable: Story = {
  args: {
    hoverable: true,
    children: 'Hover over me to see the animation effect!',
  },
}

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: 'This is an elevated card with stronger shadow.',
  },
}

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: 'This is an outlined card with 2px border.',
  },
}
