import type { Meta, StoryObj } from '@storybook/react'
import { Pagination } from './Pagination'

const meta: Meta<typeof Pagination> = {
  title: 'v2/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    current: { control: { type: 'number', min: 1, max: 10 } },
    total: { control: { type: 'number', min: 1 } },
    pageSize: { control: { type: 'number', min: 1 } },
  },
}

export default meta
type Story = StoryObj<typeof Pagination>

export const Default: Story = {
  args: {
    current: 1,
    total: 50,
    pageSize: 10,
  },
}

export const MiddlePage: Story = {
  args: {
    current: 5,
    total: 100,
    pageSize: 10,
  },
}

export const LastPage: Story = {
  args: {
    current: 10,
    total: 100,
    pageSize: 10,
  },
}

export const SmallTotal: Story = {
  args: {
    current: 2,
    total: 30,
    pageSize: 10,
  },
}
