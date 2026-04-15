import React, { useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export const ITEM_H = 56;
const FADE = '#000'; // match background color for fade gradient

interface WheelColumnProps {
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  width: number;
  visibleItems?: number;
}

export function WheelColumn({ items, selectedIndex, onSelect, width, visibleItems = 5 }: WheelColumnProps) {
  const wheelH = ITEM_H * visibleItems;
  const half = (wheelH - ITEM_H) / 2;
  const ref = useRef<ScrollView>(null);
  const didScroll = useRef(false);
  const [activeIdx, setActiveIdx] = useState(selectedIndex);
  const lastHapticIdx = useRef(selectedIndex);

  const scrollTo = useCallback((idx: number, animated = true) => {
    ref.current?.scrollTo({ x: 0, y: idx * ITEM_H, animated });
  }, []);

  const handleLayout = useCallback(() => {
    if (!didScroll.current) {
      didScroll.current = true;
      scrollTo(selectedIndex, false);
    }
  }, [selectedIndex, scrollTo]);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    if (clamped !== lastHapticIdx.current) {
      lastHapticIdx.current = clamped;
      Haptics.selectionAsync();
    }
    setActiveIdx(clamped);
  }, [items.length]);

  const handleMomentumEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    setActiveIdx(clamped);
    onSelect(clamped);
  }, [items.length, onSelect]);

  return (
    <View style={{ width, height: wheelH, overflow: 'hidden' }}>
      <ScrollView
        ref={ref}
        onLayout={handleLayout}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumEnd}
        scrollEventThrottle={16}
        nestedScrollEnabled
        contentContainerStyle={{ paddingTop: half, paddingBottom: half }}
      >
        {items.map((label, i) => {
          const dist = Math.abs(i - activeIdx);
          return (
            <TouchableOpacity
              key={i}
              onPress={() => { onSelect(i); scrollTo(i); }}
              activeOpacity={1}
              style={{ height: ITEM_H, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{
                fontSize: dist === 0 ? 26 : dist === 1 ? 19 : 15,
                fontWeight: dist === 0 ? '700' : dist === 1 ? '500' : '400',
                color: dist === 0 ? '#fff' : dist === 1 ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.18)',
              }}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {/* Top fade */}
      <LinearGradient
        colors={[FADE, 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: half }}
      />
      {/* Bottom fade */}
      <LinearGradient
        colors={['transparent', FADE]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        pointerEvents="none"
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: half }}
      />
    </View>
  );
}

/** Container that renders the selection highlight band behind all columns */
export function WheelPicker({ children, visibleItems = 5, style }: { children: React.ReactNode; visibleItems?: number; style?: any }) {
  const wheelH = ITEM_H * visibleItems;
  const half = (wheelH - ITEM_H) / 2;
  return (
    <View style={[{ position: 'relative' }, style]}>
      {/* Unified selection highlight */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0, right: 0,
          top: half,
          height: ITEM_H,
          backgroundColor: 'rgba(120,120,128,0.28)',
          borderRadius: 14,
          zIndex: 1,
        }}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        {children}
      </View>
    </View>
  );
}
