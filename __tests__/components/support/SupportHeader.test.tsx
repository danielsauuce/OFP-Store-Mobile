import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../utils/renderWithProviders';
import SupportHeader from '@/components/support/SupportHeader';

describe('SupportHeader', () => {
  it('renders the Support Chat title', () => {
    renderWithProviders(<SupportHeader />);
    expect(screen.getByText('Support Chat')).toBeTruthy();
  });

  it('renders the connection status', () => {
    renderWithProviders(<SupportHeader />);
    expect(screen.getByText('Connecting...')).toBeTruthy();
  });

  it('does NOT render History button when onViewHistory is not provided', () => {
    renderWithProviders(<SupportHeader />);
    expect(screen.queryByLabelText('History')).toBeNull();
  });

  it('renders History button when onViewHistory is provided', () => {
    renderWithProviders(<SupportHeader onViewHistory={jest.fn()} />);
    expect(screen.getByLabelText('History')).toBeTruthy();
  });

  it('calls onViewHistory when History button is pressed', () => {
    const onViewHistory = jest.fn();
    renderWithProviders(<SupportHeader onViewHistory={onViewHistory} />);
    fireEvent.press(screen.getByLabelText('History'));
    expect(onViewHistory).toHaveBeenCalledTimes(1);
  });

  it('does NOT render New chat button when onNewChat is not provided', () => {
    renderWithProviders(<SupportHeader />);
    expect(screen.queryByLabelText('New chat')).toBeNull();
  });

  it('renders New chat button when onNewChat is provided', () => {
    renderWithProviders(<SupportHeader onNewChat={jest.fn()} />);
    expect(screen.getByLabelText('New chat')).toBeTruthy();
  });

  it('calls onNewChat when New chat button is pressed', () => {
    const onNewChat = jest.fn();
    renderWithProviders(<SupportHeader onNewChat={onNewChat} />);
    fireEvent.press(screen.getByLabelText('New chat'));
    expect(onNewChat).toHaveBeenCalledTimes(1);
  });

  it('renders both action buttons when both props are provided', () => {
    renderWithProviders(<SupportHeader onViewHistory={jest.fn()} onNewChat={jest.fn()} />);
    expect(screen.getByLabelText('History')).toBeTruthy();
    expect(screen.getByLabelText('New chat')).toBeTruthy();
  });
});
