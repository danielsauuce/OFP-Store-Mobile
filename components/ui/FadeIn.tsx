import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { MotiView } from 'moti';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: Direction;
  style?: StyleProp<ViewStyle>;
}

const TRANSLATE: Record<Direction, object> = {
  up: { translateY: 20 },
  down: { translateY: -20 },
  left: { translateX: 20 },
  right: { translateX: -20 },
  none: {},
};

const RESET: Record<Direction, object> = {
  up: { translateY: 0 },
  down: { translateY: 0 },
  left: { translateX: 0 },
  right: { translateX: 0 },
  none: {},
};

export default function FadeIn({
  children,
  delay = 0,
  duration = 420,
  direction = 'up',
  style,
}: FadeInProps) {
  return (
    <MotiView
      from={{ opacity: 0, ...TRANSLATE[direction] }}
      animate={{ opacity: 1, ...RESET[direction] }}
      transition={{ type: 'timing', duration, delay }}
      style={style}
    >
      {children}
    </MotiView>
  );
}
