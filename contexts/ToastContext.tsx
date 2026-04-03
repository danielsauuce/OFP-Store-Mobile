import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { CheckCircle2, XCircle, Info } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const TYPE_CONFIG: Record<
  ToastType,
  { bg: string; icon: React.ComponentType<{ size: number; color: string }> }
> = {
  success: { bg: '#1A1A1A', icon: CheckCircle2 },
  error: { bg: '#1A1A1A', icon: XCircle },
  info: { bg: '#1A1A1A', icon: Info },
};

const ICON_COLORS: Record<ToastType, string> = {
  success: '#4ADE80',
  error: '#F87171',
  info: '#60A5FA',
};

function ToastItem({ toast, onDone }: { toast: Toast; onDone: () => void }) {
  const config = TYPE_CONFIG[toast.type];
  const iconColor = ICON_COLORS[toast.type];

  return (
    <MotiView
      from={{ opacity: 0, translateY: -12, scale: 0.96 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      exit={{ opacity: 0, translateY: -8, scale: 0.96 }}
      transition={{ type: 'spring', damping: 20, stiffness: 260 }}
      style={[styles.toast, { backgroundColor: config.bg }]}
      onDidAnimate={(key, finished) => {
        if (key === 'opacity' && finished) {
          // auto-dismiss after 2.4s
          setTimeout(onDone, 2400);
        }
      }}
    >
      <config.icon size={18} color={iconColor} />
      <Text style={styles.message} numberOfLines={2}>
        {toast.message}
      </Text>
    </MotiView>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-1), { id, message, type }]); // max 2 visible
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => remove(id), 3200);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={[styles.container, { top: insets.top + 12 }]} pointerEvents="none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDone={() => remove(t.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
    pointerEvents: 'none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  message: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
