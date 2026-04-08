import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../utils/renderWithProviders';
import SupportHeader from '@/components/support/SupportHeader';

describe('SupportHeader', () => {
  it('renders the Live Support title', () => {
    renderWithProviders(<SupportHeader />);
    expect(screen.getByText('Live Support')).toBeTruthy();
  });

  it('renders the subtitle', () => {
    renderWithProviders(<SupportHeader />);
    expect(screen.getByText('We typically reply within minutes')).toBeTruthy();
  });

  it('does NOT render History button when onViewHistory is not provided', () => {
    renderWithProviders(<SupportHeader />);
    expect(screen.queryByText('History')).toBeNull();
  });

  it('renders History button when onViewHistory is provided', () => {
    renderWithProviders(<SupportHeader onViewHistory={jest.fn()} />);
    expect(screen.getByText('History')).toBeTruthy();
  });

  it('calls onViewHistory when History button is pressed', () => {
    const onViewHistory = jest.fn();
    renderWithProviders(<SupportHeader onViewHistory={onViewHistory} />);
    fireEvent.press(screen.getByText('History'));
    expect(onViewHistory).toHaveBeenCalledTimes(1);
  });

  it('does NOT render New chat button when onNewChat is not provided', () => {
    renderWithProviders(<SupportHeader />);
    expect(screen.queryByText('New chat')).toBeNull();
  });

  it('renders New chat button when onNewChat is provided', () => {
    renderWithProviders(<SupportHeader onNewChat={jest.fn()} />);
    expect(screen.getByText('New chat')).toBeTruthy();
  });

  it('calls onNewChat when New chat button is pressed', () => {
    const onNewChat = jest.fn();
    renderWithProviders(<SupportHeader onNewChat={onNewChat} />);
    fireEvent.press(screen.getByText('New chat'));
    expect(onNewChat).toHaveBeenCalledTimes(1);
  });

  it('renders both action buttons when both props are provided', () => {
    renderWithProviders(<SupportHeader onViewHistory={jest.fn()} onNewChat={jest.fn()} />);
    expect(screen.getByText('History')).toBeTruthy();
    expect(screen.getByText('New chat')).toBeTruthy();
  });
});
