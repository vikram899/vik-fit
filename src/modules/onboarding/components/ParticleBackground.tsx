import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');
const COLORS = ['#3B82F6', '#EC4899', '#06B6D4', '#8B5CF6', '#10B981', '#F59E0B', '#ffffff', '#60A5FA', '#F472B6'];

export function ParticleBackground({ height = 220 }: { height?: number }) {
  const particles = useRef(
    Array.from({ length: 32 }, (_, i) => ({
      x: new Animated.Value(20 + Math.random() * (SCREEN_W - 40)),
      y: new Animated.Value(10 + Math.random() * (height - 20)),
      opacity: new Animated.Value(0.1 + Math.random() * 0.5),
      size: 2 + Math.random() * 5,
      color: COLORS[i % COLORS.length],
    }))
  ).current;

  useEffect(() => {
    const anims: Animated.CompositeAnimation[] = [];
    particles.forEach((p) => {
      const a = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(p.x, { toValue: 20 + Math.random() * (SCREEN_W - 40), duration: 4000 + Math.random() * 6000, useNativeDriver: true }),
            Animated.timing(p.x, { toValue: 20 + Math.random() * (SCREEN_W - 40), duration: 4000 + Math.random() * 6000, useNativeDriver: true }),
            Animated.timing(p.x, { toValue: 20 + Math.random() * (SCREEN_W - 40), duration: 3000 + Math.random() * 5000, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(p.opacity, { toValue: 0.05 + Math.random() * 0.55, duration: 2500 + Math.random() * 3000, useNativeDriver: true }),
            Animated.timing(p.opacity, { toValue: 0.02 + Math.random() * 0.15, duration: 2000 + Math.random() * 3000, useNativeDriver: true }),
            Animated.timing(p.opacity, { toValue: 0.1 + Math.random() * 0.4, duration: 2000 + Math.random() * 4000, useNativeDriver: true }),
          ]),
        ])
      );
      a.start();
      anims.push(a);
    });
    return () => anims.forEach((a) => a.stop());
  }, []);

  return (
    <View style={{ height, overflow: 'hidden' }} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: p.color,
            transform: [{ translateX: p.x }, { translateY: p.y }],
            opacity: p.opacity,
          }}
        />
      ))}
    </View>
  );
}
