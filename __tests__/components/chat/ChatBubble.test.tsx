import React from 'react';
import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../utils/renderWithProviders';
import ChatBubble from '@/components/chat/ChatBubble';

describe('ChatBubble', () => {
  const userMsg = { id: '1', role: 'user' as const, content: 'Hello there' };
  const assistantMsg = { id: '2', role: 'assistant' as const, content: 'How can I help?' };

  it('renders the message text', () => {
    renderWithProviders(<ChatBubble message={userMsg} />);
    expect(screen.getByText('Hello there')).toBeTruthy();
  });

  it('renders assistant message text', () => {
    renderWithProviders(<ChatBubble message={assistantMsg} />);
    expect(screen.getByText('How can I help?')).toBeTruthy();
  });

  it('renders empty content without crashing', () => {
    const emptyMsg = { id: '3', role: 'user' as const, content: '' };
    renderWithProviders(<ChatBubble message={emptyMsg} />);
  });

  it('renders long content without truncation', () => {
    const long = 'A'.repeat(300);
    renderWithProviders(<ChatBubble message={{ id: '4', role: 'assistant', content: long }} />);
    expect(screen.getByText(long)).toBeTruthy();
  });
});
