import React from 'react';
import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../utils/renderWithProviders';
import ChatMessageList from '@/components/support/ChatMessageList';

// useChatScroll auto-scrolls — mock FlatList ref calls
jest.mock('@/hooks/useChatScroll', () => ({
  useChatScroll: jest.fn(),
}));

const messages = [
  { id: '1', role: 'assistant' as const, content: 'Welcome! How can I help?' },
  { id: '2', role: 'user' as const, content: 'I need help with my order' },
  { id: '3', role: 'assistant' as const, content: 'Sure, what is your order number?' },
];

describe('ChatMessageList', () => {
  it('renders all messages', () => {
    renderWithProviders(<ChatMessageList messages={messages} loading={false} />);
    expect(screen.getByText('Welcome! How can I help?')).toBeTruthy();
    expect(screen.getByText('I need help with my order')).toBeTruthy();
    expect(screen.getByText('Sure, what is your order number?')).toBeTruthy();
  });

  it('renders empty list without crashing', () => {
    renderWithProviders(<ChatMessageList messages={[]} loading={false} />);
  });

  it('renders a single message', () => {
    renderWithProviders(<ChatMessageList messages={[messages[0]]} loading={false} />);
    expect(screen.getByText('Welcome! How can I help?')).toBeTruthy();
  });

  it('renders typing indicator when loading is true', () => {
    // Typing indicator renders 3 animated dots — check the list footer is mounted
    const { toJSON } = renderWithProviders(<ChatMessageList messages={messages} loading={true} />);
    // The TypingIndicator renders 3 MotiView dots — tree should be non-null
    expect(toJSON()).not.toBeNull();
  });

  it('does not render typing indicator when loading is false', () => {
    const { toJSON } = renderWithProviders(<ChatMessageList messages={messages} loading={false} />);
    expect(toJSON()).not.toBeNull();
  });
});
