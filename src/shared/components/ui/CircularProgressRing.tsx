import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CircularProgressRingProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0 to 1
  color: string;
  trackColor?: string;
  children?: React.ReactNode;
}

export function CircularProgressRing({
  size,
  strokeWidth,
  progress,
  color,
  trackColor = '#2A2A38',
  children,
}: CircularProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = circumference * (1 - clamped);
  const center = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={trackColor}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      {children}
    </View>
  );
}
