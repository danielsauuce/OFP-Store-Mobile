import { renderHook, act } from '@testing-library/react-native';
import { useState } from 'react';
import { useChatScroll } from '@/hooks/useChatScroll';

describe('useChatScroll', () => {
  it('calls scrollToEnd on mount', () => {
    const scrollToEnd = jest.fn();
    const ref = { current: { scrollToEnd } as never };

    renderHook(() => useChatScroll(ref, []));

    expect(scrollToEnd).toHaveBeenCalledWith({ animated: true });
  });

  it('calls scrollToEnd when a tracked state dep changes', async () => {
    const scrollToEnd = jest.fn();
    const ref = { current: { scrollToEnd } as never };

    // Drive dep changes via useState — the reliable pattern for testing hooks
    // that use variable dependency arrays
    let setCount!: (n: number) => void;

    renderHook(() => {
      const [count, _set] = useState(0);
      setCount = _set;
      useChatScroll(ref, [count]);
    });

    scrollToEnd.mockClear(); // reset after mount

    await act(async () => {
      setCount(1);
    });

    expect(scrollToEnd).toHaveBeenCalledWith({ animated: true });
  });

  it('does not throw if ref.current is null', () => {
    const ref = { current: null };
    expect(() => renderHook(() => useChatScroll(ref, []))).not.toThrow();
  });
});
