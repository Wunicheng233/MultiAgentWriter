import type { Meta, StoryObj } from '@storybook/react'
import { useState, useEffect } from 'react'
import { Progress, CircularProgress } from './Progress'

const meta: Meta<typeof Progress> = {
  title: 'v2/Progress',
  component: Progress,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
  },
}

export default meta
type Story = StoryObj<typeof Progress>

export const Default: Story = {
  args: {
    value: 50,
  },
}

export const WithLabel: Story = {
  args: {
    value: 75,
    showLabel: true,
  },
}

export const Small: Story = {
  args: {
    value: 50,
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    value: 50,
    size: 'lg',
  },
}

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
  },
}

export const AnimatedProgress: Story = {
  render: () => {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
      const timer = setInterval(() => {
        setProgress(prev => prev >= 100 ? 0 : prev + 1)
      }, 50)
      return () => clearInterval(timer)
    }, [])

    return <Progress value={progress} showLabel />
  },
}

// Circular Progress stories
export const Circular: Story = {
  render: () => <CircularProgress value={60} />,
}

export const CircularWithLabel: Story = {
  render: () => <CircularProgress value={75} showLabel size={80} />,
}

export const CircularSmall: Story = {
  render: () => <CircularProgress value={50} size={32} />,
}

export const CircularLarge: Story = {
  render: () => <CircularProgress value={50} size={96} thickness={8} />,
}

export const CircularIndeterminate: Story = {
  render: () => <CircularProgress indeterminate size={48} />,
}

export const MultipleCircular: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <CircularProgress value={25} showLabel size={64} />
      <CircularProgress value={50} showLabel size={64} />
      <CircularProgress value={75} showLabel size={64} />
      <CircularProgress value={100} showLabel size={64} />
    </div>
  ),
}
