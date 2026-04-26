# v2 组件库

StoryForge AI 项目的 v2 设计系统组件库，基于 React + TypeScript + Tailwind CSS 构建。

## 设计原则

- **CSS 变量驱动**：所有样式从 CSS 变量派生，支持主题切换
- **TypeScript 优先**：完整的类型定义，无 any 类型
- **无障碍友好**：完整的 ARIA 属性支持，键盘可访问
- **TDD 开发**：每个组件都有完整的测试覆盖

## CSS 变量

组件库使用以下 CSS 变量，你可以在全局样式中定义：

```css
:root {
  /* 背景色 */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
  
  /* 文本色 */
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-body: #374151;
  --text-muted: #9ca3af;
  
  /* 强调色 */
  --accent-primary: #4f46e5;
  
  /* 边框色 */
  --border-default: #e5e7eb;
}
```

## 组件列表

### 基础组件
- **Button** - 按钮组件，支持多种变体和尺寸
- **Card** - 卡片容器组件
- **Badge** - 徽章状态组件
- **Avatar** - 用户头像组件
- **Divider** - 分割线组件

### 表单组件
- **Input** - 输入框组件
- **Checkbox** - 复选框组件
- **Radio/RadioGroup** - 单选框组件
- **Switch** - 开关组件
- **Slider** - 滑块组件（新）

### 数据展示
- **Table** - 数据表格组件（新）
- **Pagination** - 分页组件（新）
- **Empty** - 空状态组件（新）

### 反馈组件
- **Alert** - 警告提示组件
- **Modal** - 模态框组件
- **Tooltip** - 工具提示组件
- **Popover** - 气泡卡片组件
- **Progress** - 进度条组件
- **Skeleton** - 骨架屏组件

### 导航组件
- **Tabs** - 标签页组件
- **DropdownMenu** - 下拉菜单组件

### 业务组件
- **AgentCard** - Agent 状态卡片

## 最佳实践

### 受控 vs 非受控

所有表单组件同时支持受控和非受控两种使用方式：

```tsx
// 受控模式
const [value, setValue] = useState('')
<Input value={value} onChange={setValue} />

// 非受控模式  
<Input defaultValue="默认值" />
```

### 组合模式

组件库采用组合模式，你可以灵活组合不同组件：

```tsx
<Card>
  <div className="flex items-center justify-between">
    <Badge variant="success">已完成</Badge>
    <Button size="sm">操作</Button>
  </div>
</Card>
```

### 无障碍

所有浮层组件都支持 Esc 键关闭，焦点管理，以及正确的 ARIA 属性。

## 快速开始

```tsx
import { Button, Card, Input } from '@/components/v2'

function MyComponent() {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-medium mb-4">标题</h2>
      <Input label="用户名" placeholder="请输入用户名" />
      <div className="mt-4">
        <Button variant="primary">提交</Button>
      </div>
    </Card>
  )
}
```

## 开发指南

- 新增组件请遵循 TDD 流程：先写测试再实现
- 所有组件必须支持 TypeScript
- 视觉样式使用 CSS 变量，不要硬编码颜色
- 添加组件后记得更新 index.ts 的导出

---

*文档最后更新：2026-04-26*
