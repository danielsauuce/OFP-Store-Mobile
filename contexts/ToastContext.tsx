import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { View, Text } from 'react-native';
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
  { icon: React.ComponentType<{ size: number; color: string }>; iconColor: string }
> = {
  success: { icon: CheckCircle2, iconColor: '#4ADE80' },
  error: { icon: XCircle, iconColor: '#F87171' },
  info: { icon: Info, iconColor: '#60A5FA' },
};

function ToastItem({ toast, onDone }: { toast: Toast; onDone: () => void }) {
  const { icon: Icon, iconColor } = TYPE_CONFIG[toast.type];

  return (
    <MotiView
      from={{ opacity: 0, translateY: -10, scale: 0.96 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 22, stiffness: 280 }}
      onDidAnimate={(key, finished) => {
        if (key === 'opacity' && finished) {
          setTimeout(onDone, 2400);
        }
      }}
      className="flex-row items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#1A1A1A]"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 14,
        elevation: 10,
      }}
    >
      <Icon size={18} color={iconColor} />
      <Text className="flex-1 text-white text-sm font-semibold leading-5" numberOfLines={2}>
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
      setToasts((prev) => [...prev.slice(-1), { id, message, type }]);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => remove(id), 3200);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View
        className="absolute left-4 right-4 gap-2"
        style={{ top: insets.top + 12, zIndex: 9999 }}
        pointerEvents="none"
      >
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
