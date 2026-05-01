import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../utils/renderWithProviders';
import ChatInput from '@/components/chat/ChatInput';

describe('ChatInput', () => {
  it('renders the text input', () => {
    renderWithProviders(<ChatInput value="" onChange={jest.fn()} onSend={jest.fn()} />);
    expect(screen.getByPlaceholderText('Type something...')).toBeTruthy();
  });

  it('calls onChange when user types', () => {
    const onChange = jest.fn();
    renderWithProviders(<ChatInput value="" onChange={onChange} onSend={jest.fn()} />);
    fireEvent.changeText(screen.getByPlaceholderText('Type something...'), 'hi');
    expect(onChange).toHaveBeenCalledWith('hi');
  });

  it('calls onSend when send button is pressed with non-empty input', () => {
    const onSend = jest.fn();
    renderWithProviders(<ChatInput value="hello" onChange={jest.fn()} onSend={onSend} />);
    fireEvent.press(screen.getByTestId('send-button'));
    expect(onSend).toHaveBeenCalled();
  });

  it('does NOT call onSend when input is empty', () => {
    const onSend = jest.fn();
    renderWithProviders(<ChatInput value="" onChange={jest.fn()} onSend={onSend} />);
    fireEvent.press(screen.getByTestId('send-button'));
    expect(onSend).not.toHaveBeenCalled();
  });

  it('does NOT call onSend when input is only whitespace', () => {
    const onSend = jest.fn();
    renderWithProviders(<ChatInput value="   " onChange={jest.fn()} onSend={onSend} />);
    fireEvent.press(screen.getByTestId('send-button'));
    expect(onSend).not.toHaveBeenCalled();
  });

  it('shows the current input value', () => {
    renderWithProviders(<ChatInput value="draft message" onChange={jest.fn()} onSend={jest.fn()} />);
    expect(screen.getByDisplayValue('draft message')).toBeTruthy();
  });
});
