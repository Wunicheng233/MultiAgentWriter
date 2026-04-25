import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useChatStore } from '../store/useChatStore'
import ChatMessage from '../components/ai/ChatMessage'
import AIChatPanel from '../components/ai/AIChatPanel'

describe('Chat Store', () => {
  beforeEach(() => {
    useChatStore.setState({
      messages: [],
      isTyping: false,
      inputText: '',
    })
  })

  it('should have default empty state', () => {
    const state = useChatStore.getState()
    expect(state.messages).toEqual([])
    expect(state.isTyping).toBe(false)
    expect(state.inputText).toBe('')
  })

  it('should add a message', () => {
    useChatStore.getState().addMessage({
      id: '1',
      role: 'user',
      content: 'Hello',
      timestamp: 1234567890,
    })
    expect(useChatStore.getState().messages).toHaveLength(1)
    expect(useChatStore.getState().messages[0].content).toBe('Hello')
  })

  it('should set isTyping state', () => {
    useChatStore.getState().setIsTyping(true)
    expect(useChatStore.getState().isTyping).toBe(true)
    useChatStore.getState().setIsTyping(false)
    expect(useChatStore.getState().isTyping).toBe(false)
  })

  it('should set input text', () => {
    useChatStore.getState().setInputText('test message')
    expect(useChatStore.getState().inputText).toBe('test message')
  })

  it('should clear all messages', () => {
    useChatStore.getState().addMessage({
      id: '1',
      role: 'user',
      content: 'Hello',
      timestamp: 1234567890,
    })
    useChatStore.getState().clearMessages()
    expect(useChatStore.getState().messages).toEqual([])
  })
})

describe('ChatMessage Component', () => {
  it('should render user message correctly', () => {
    const message = {
      id: '1',
      role: 'user' as const,
      content: 'This is a user message',
      timestamp: 1234567890,
    }
    render(<ChatMessage message={message} />)
    expect(screen.getByText('This is a user message')).toBeTruthy()
  })

  it('should render assistant message correctly', () => {
    const message = {
      id: '1',
      role: 'assistant' as const,
      content: 'This is an assistant message',
      timestamp: 1234567890,
    }
    render(<ChatMessage message={message} />)
    expect(screen.getByText('This is an assistant message')).toBeTruthy()
  })
})

describe('AIChatPanel Component', () => {
  beforeEach(() => {
    useChatStore.setState({
      messages: [],
      isTyping: false,
      inputText: '',
    })
  })

  it('should render empty state when no messages', () => {
    render(<AIChatPanel />)
    expect(screen.getByText('Ask me anything about your story')).toBeTruthy()
  })

  it('should render messages when they exist', () => {
    // Set state BEFORE rendering so the component has the correct state on mount
    useChatStore.setState({
      messages: [
        {
          id: '1',
          role: 'user',
          content: 'Test message',
          timestamp: 1234567890,
        },
      ],
      isTyping: false,
      inputText: '',
    })
    render(<AIChatPanel />)
    expect(screen.getByText('Test message')).toBeTruthy()
  })

  it('should show typing indicator when isTyping is true', () => {
    // Set state BEFORE rendering so the component has the correct state on mount
    useChatStore.setState({
      messages: [],
      isTyping: true,
      inputText: '',
    })
    // Verify state was set correctly
    expect(useChatStore.getState().isTyping).toBe(true)
    render(<AIChatPanel />)
    expect(screen.getByTestId('typing-indicator')).toBeTruthy()
  })

  it('should have text input for messages', () => {
    render(<AIChatPanel />)
    expect(screen.getByPlaceholderText('Type your message...')).toBeTruthy()
  })

  it('should have send button', () => {
    render(<AIChatPanel />)
    expect(screen.getByText('Send')).toBeTruthy()
  })

  it('should disable send button when input is empty', () => {
    render(<AIChatPanel />)
    const sendButton = screen.getByText('Send')
    expect(sendButton).toBeDisabled()
  })

  it('should enable send button when input has text', () => {
    render(<AIChatPanel />)
    const textarea = screen.getByPlaceholderText('Type your message...')
    fireEvent.change(textarea, { target: { value: 'Hello' } })
    const sendButton = screen.getByText('Send')
    expect(sendButton).not.toBeDisabled()
  })
})
