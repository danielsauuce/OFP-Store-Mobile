import { useEffect, RefObject, DependencyList } from 'react';
import { FlatList } from 'react-native';

export function useChatScroll(ref: RefObject<FlatList | null>, deps: DependencyList) {
  useEffect(() => {
    ref.current?.scrollToEnd({ animated: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
