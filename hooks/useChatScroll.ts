import { useEffect } from 'react';

export function useChatScroll(ref, deps) {
  useEffect(() => {
    ref.current?.scrollToEnd({ animated: true });
  }, deps);
}
