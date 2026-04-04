/**
 * Integration-level tests for the Support screen.
 * The socket and service layers are fully mocked — this tests the
 * component tree wiring: status banners, message list, input, and send flow.
 */
import React from 'react';
import { screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { renderWithProviders } from '../utils/renderWithProviders';

// ── Socket mock (override the global setup one for fine-grained control) ──────
const mockSocket = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  connected: false,
};

jest.mock('@/services/socketService', () => ({
  createChatSocket: jest.fn(async () => mockSocket),
  createNotificationsSocket: jest.fn(async () => mockSocket),
}));

// ── Import AFTER mocks ────────────────────────────────────────────────────────
// eslint-disable-next-line import/first
import SupportScreen from '@/app/(tabs)/support';

function getRegisteredHandler(event: string) {
  const calls = (mockSocket.on as jest.Mock).mock.calls;
  const call = calls.find(([e]) => e === event);
  return call ? call[1] : null;
}

describe('SupportScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockSocket.on as jest.Mock).mockImplementation(() => {});
  });

  it('renders the welcome message on mount', async () => {
    renderWithProviders(<SupportScreen />);
    await waitFor(() => {
      expect(screen.getByText(/Welcome to Olayinka Furniture Palace support/i)).toBeTruthy();
    });
  });

  it('shows the connecting banner when socket is connecting', async () => {
    renderWithProviders(<SupportScreen />);
    await waitFor(() => {
      expect(screen.getByText(/Connecting to support/i)).toBeTruthy();
    });
  });

  it('shows the connected banner after socket connects', async () => {
    renderWithProviders(<SupportScreen />);

    await act(async () => {
      const connectHandler = getRegisteredHandler('connect');
      if (connectHandler) {
        // Simulate socket firing connect
        mockSocket.connected = true;
        connectHandler();
      }
    });

    await waitFor(() => {
      expect(screen.getByText(/Connected/i)).toBeTruthy();
    });
  });

  it('renders the chat input', async () => {
    renderWithProviders(<SupportScreen />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type message...')).toBeTruthy();
    });
  });

  it('emits chat:send with typed message when send is pressed', async () => {
    renderWithProviders(<SupportScreen />);

    await act(async () => {
      const connectHandler = getRegisteredHandler('connect');
      if (connectHandler) {
        mockSocket.connected = true;
        connectHandler();
        const initHandler = getRegisteredHandler('chat:initialized');
        if (initHandler) initHandler({ conversationId: 'conv-1', messages: [] });
      }
    });

    await act(async () => {
      fireEvent.changeText(screen.getByPlaceholderText('Type message...'), 'Hello support');
      fireEvent.press(screen.getByRole('button'));
    });

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'chat:send',
        expect.objectContaining({ message: 'Hello support', conversationId: 'conv-1' }),
        expect.any(Function),
      );
    });
  });

  it('shows sent message as an optimistic bubble', async () => {
    renderWithProviders(<SupportScreen />);

    await act(async () => {
      const connectHandler = getRegisteredHandler('connect');
      if (connectHandler) {
        mockSocket.connected = true;
        connectHandler();
        const initHandler = getRegisteredHandler('chat:initialized');
        if (initHandler) initHandler({ conversationId: 'conv-1', messages: [] });
      }
    });

    await act(async () => {
      fireEvent.changeText(screen.getByPlaceholderText('Type message...'), 'Test message');
      fireEvent.press(screen.getByRole('button'));
    });

    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeTruthy();
    });
  });

  it('appends an incoming assistant message', async () => {
    renderWithProviders(<SupportScreen />);

    await act(async () => {
      const connectHandler = getRegisteredHandler('connect');
      if (connectHandler) {
        mockSocket.connected = true;
        connectHandler();
        const initHandler = getRegisteredHandler('chat:initialized');
        if (initHandler) initHandler({ conversationId: 'conv-1', messages: [] });
      }
    });

    await act(async () => {
      const msgHandler = getRegisteredHandler('chat:message');
      if (msgHandler) {
        msgHandler({
          _id: 'msg-99',
          sender: { _id: 'admin-1', userId: 'admin-1', fullName: 'Support', role: 'admin' },
          message: 'Thanks for reaching out!',
          conversationId: 'conv-1',
          createdAt: new Date().toISOString(),
        });
      }
    });

    await waitFor(() => {
      expect(screen.getByText('Thanks for reaching out!')).toBeTruthy();
    });
  });

  it('shows the agent-joined system message', async () => {
    renderWithProviders(<SupportScreen />);

    await act(async () => {
      const connectHandler = getRegisteredHandler('connect');
      if (connectHandler) {
        mockSocket.connected = true;
        connectHandler();
      }
    });

    await act(async () => {
      const joinHandler = getRegisteredHandler('chat:admin-joined');
      if (joinHandler) joinHandler();
    });

    await waitFor(() => {
      expect(screen.getByText(/support agent has joined/i)).toBeTruthy();
    });
  });

  it('shows closed message when chat:closed is received', async () => {
    renderWithProviders(<SupportScreen />);

    await act(async () => {
      const connectHandler = getRegisteredHandler('connect');
      if (connectHandler) {
        mockSocket.connected = true;
        connectHandler();
      }
    });

    await act(async () => {
      const closedHandler = getRegisteredHandler('chat:closed');
      if (closedHandler) closedHandler();
    });

    await waitFor(() => {
      expect(screen.getByText(/conversation has been closed/i)).toBeTruthy();
    });
  });

  it('shows error message when chat:error is received', async () => {
    renderWithProviders(<SupportScreen />);

    await act(async () => {
      const connectHandler = getRegisteredHandler('connect');
      if (connectHandler) {
        mockSocket.connected = true;
        connectHandler();
      }
    });

    await act(async () => {
      const errorHandler = getRegisteredHandler('chat:error');
      if (errorHandler) errorHandler({ message: 'Server unavailable' });
    });

    await waitFor(() => {
      expect(screen.getByText('Server unavailable')).toBeTruthy();
    });
  });

  it('falls back to generic error message if chat:error has no message', async () => {
    renderWithProviders(<SupportScreen />);

    await act(async () => {
      const connectHandler = getRegisteredHandler('connect');
      if (connectHandler) {
        mockSocket.connected = true;
        connectHandler();
      }
    });

    await act(async () => {
      const errorHandler = getRegisteredHandler('chat:error');
      if (errorHandler) errorHandler({});
    });

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeTruthy();
    });
  });
});
