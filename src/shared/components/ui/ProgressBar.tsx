import React, { useState } from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '@theme/index';
import { Radius } from '@theme/radius';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  gradientColors?: [string, string]; // [startColor, endColor]
  height?: number;
  style?: ViewStyle;
}

export function ProgressBar({ progress, color, gradientColors, height = 6, style }: ProgressBarProps) {
  const { colors } = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);
  const clamped = Math.min(Math.max(progress, 0), 1);
  const r = height / 2;

  return (
    <View
      style={[
        {
          height,
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: r,
          overflow: 'hidden',
        },
        style,
      ]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {gradientColors && containerWidth > 0 ? (
        <Svg
          width={containerWidth}
          height={height}
          style={{ position: 'absolute', left: 0, top: 0 }}
        >
          <Defs>
            <LinearGradient id="pg" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={gradientColors[0]} />
              <Stop offset="1" stopColor={gradientColors[1]} />
            </LinearGradient>
          </Defs>
          <Rect
            x={0}
            y={0}
            width={containerWidth * clamped}
            height={height}
            rx={r}
            fill="url(#pg)"
          />
        </Svg>
      ) : (
        <View
          style={{
            height,
            width: `${clamped * 100}%`,
            backgroundColor: color ?? colors.brandPrimary,
            borderRadius: r,
          }}
        />
      )}
    </View>
  );
}
