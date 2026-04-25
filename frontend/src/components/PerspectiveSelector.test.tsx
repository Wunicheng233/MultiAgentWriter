import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, describe, test, vi } from 'vitest';
import React from 'react';
import PerspectiveSelector from './PerspectiveSelector';

// Mock API
vi.mock('../utils/endpoints', () => ({
  listPerspectives: vi.fn().mockResolvedValue({
    perspectives: [
      {
        id: 'liu-cixin',
        name: '刘慈欣',
        genre: '科幻',
        description: '思想实验公理框架',
        strength_recommended: 0.8,
        builtin: true,
        strengths: ['科幻世界观', '宏大叙事'],
        weaknesses: [],
      },
      {
        id: 'jin-yong',
        name: '金庸',
        genre: '武侠',
        description: '历史厚重感',
        strength_recommended: 0.7,
        builtin: true,
        strengths: ['武侠世界观', '武学哲学'],
        weaknesses: [],
      },
    ],
  }),
  updateProjectPerspective: vi.fn().mockResolvedValue({ status: 'ok' }),
}));

vi.mock('./toastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

function renderWithProviders(ui: React.ReactElement) {
  // 为每个测试创建新的 QueryClient，避免共享状态导致的 hook 问题
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

describe('PerspectiveSelector', () => {
  test('renders with null value initially', async () => {
    renderWithProviders(
      <PerspectiveSelector
        projectId={1}
        value={null}
      />
    );

    const defaultOption = await screen.findByText('默认创作模式（无特定风格）');
    expect(defaultOption).toBeInTheDocument();
  });

  test('displays perspective options from API', async () => {
    renderWithProviders(
      <PerspectiveSelector
        projectId={1}
        value={null}
      />
    );

    const liuCixin = await screen.findByText('刘慈欣');
    const jinYong = await screen.findByText('金庸');

    expect(liuCixin).toBeInTheDocument();
    expect(jinYong).toBeInTheDocument();
  });

  test('groups perspectives by genre', async () => {
    renderWithProviders(
      <PerspectiveSelector
        projectId={1}
        value={null}
      />
    );

    const sciFi = await screen.findByText('科幻');
    const wuxia = await screen.findByText('武侠');

    expect(sciFi).toBeInTheDocument();
    expect(wuxia).toBeInTheDocument();
  });

  test('shows strength slider when perspective selected', async () => {
    renderWithProviders(
      <PerspectiveSelector
        projectId={1}
        value="liu-cixin"
      />
    );

    const strengthSlider = await screen.findByText('风格融入强度');
    expect(strengthSlider).toBeInTheDocument();
  });

  test('does not show strength slider in compact mode', async () => {
    renderWithProviders(
      <PerspectiveSelector
        projectId={1}
        value="liu-cixin"
        compact={true}
      />
    );

    // 紧凑模式不应该显示强度滑块
    await screen.findByText('刘慈欣');
    expect(screen.queryByText('风格融入强度')).not.toBeInTheDocument();
  });
});
