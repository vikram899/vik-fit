import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { X } from 'lucide-react-native';
import { useTheme } from '@theme/index';

// ── Layout constants ──────────────────────────────────────────────────────────

const ITEM_HEIGHT = 56;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS; // 280
const HALF_OFFSET = (PICKER_HEIGHT - ITEM_HEIGHT) / 2; // 112

// ── Wheel column ──────────────────────────────────────────────────────────────

interface WheelProps {
  scrollRef: React.RefObject<ScrollView>;
  data: number[];
  selectedIndex: number;
  onMomentumEnd: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onTapItem: (index: number) => void;
  bgColor: string;
  textColor: string;
  style?: object;
}

function WheelColumn({
  scrollRef,
  data,
  selectedIndex,
  onMomentumEnd,
  onTapItem,
  bgColor,
  textColor,
  style,
}: WheelProps) {
  return (
    <View style={[{ height: PICKER_HEIGHT, overflow: 'hidden', position: 'relative' }, style]}>
      {/* Center highlight bar */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: HALF_OFFSET,
          height: ITEM_HEIGHT,
          borderTopWidth: 1.5,
          borderBottomWidth: 1.5,
          borderColor: 'rgba(132,204,22,0.4)',
          backgroundColor: 'rgba(132,204,22,0.06)',
          zIndex: 2,
        }}
      />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumEnd}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: HALF_OFFSET, paddingBottom: HALF_OFFSET }}
      >
        {data.map((item, index) => {
          const dist = Math.abs(index - selectedIndex);
          const isSelected = dist === 0;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => onTapItem(index)}
              activeOpacity={0.7}
              style={{ height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text
                style={{
                  fontSize: isSelected ? 30 : dist === 1 ? 24 : 19,
                  fontWeight: isSelected ? '700' : '400',
                  color: isSelected ? '#84CC16' : textColor,
                  opacity: isSelected ? 1 : dist === 1 ? 0.5 : dist === 2 ? 0.25 : 0.1,
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Top fade */}
      <LinearGradient
        colors={[bgColor as string, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: HALF_OFFSET, zIndex: 1 }}
      />
      {/* Bottom fade */}
      <LinearGradient
        colors={['transparent', bgColor as string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        pointerEvents="none"
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: HALF_OFFSET, zIndex: 1 }}
      />
    </View>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  initialWeight?: number;
  imperial?: boolean;
  onSave: (weight: number) => void;
  onClose: () => void;
}

export default function WeightPickerModal({
  visible,
  initialWeight = 70,
  imperial = false,
  onSave,
  onClose,
}: Props) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const bgColor = colors.backgroundSecondary;
  const unit = imperial ? 'lbs' : 'kg';

  // Whole numbers: 30–200 kg  |  66–440 lbs
  const minWhole = imperial ? 66 : 30;
  const maxWhole = imperial ? 440 : 200;
  const WHOLE_DATA = Array.from({ length: maxWhole - minWhole + 1 }, (_, i) => minWhole + i);

  // Decimal digits: 0–9 (0.1 step for kg)  |  0, 5 (0.5 step for lbs)
  const DECIMAL_DATA = imperial ? [0, 5] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  // Derive initial indices
  const clamped = Math.max(minWhole, Math.min(maxWhole + 0.9, initialWeight));
  const initWhole = Math.floor(clamped);
  const initDecimalVal = Math.round((clamped - initWhole) * 10);
  const initWholeIdx = Math.max(0, Math.min(WHOLE_DATA.length - 1, initWhole - minWhole));
  const initDecimalIdx = imperial
    ? initDecimalVal >= 5 ? 1 : 0
    : Math.max(0, Math.min(9, initDecimalVal));

  const wholeRef = useRef<ScrollView>(null);
  const decimalRef = useRef<ScrollView>(null);
  const [wholeIdx, setWholeIdx] = useState(initWholeIdx);
  const [decimalIdx, setDecimalIdx] = useState(initDecimalIdx);

  // Called by Modal's onShow — fires after slide animation completes,
  // guaranteeing ScrollViews are fully laid out and ready to scroll.
  const handleModalShow = () => {
    setWholeIdx(initWholeIdx);
    setDecimalIdx(initDecimalIdx);
    wholeRef.current?.scrollTo({ x: 0, y: initWholeIdx * ITEM_HEIGHT, animated: false });
    decimalRef.current?.scrollTo({ x: 0, y: initDecimalIdx * ITEM_HEIGHT, animated: false });
  };

  const snapWhole = (index: number, animated = true) => {
    const c = Math.max(0, Math.min(WHOLE_DATA.length - 1, index));
    setWholeIdx(c);
    wholeRef.current?.scrollTo({ x: 0, y: c * ITEM_HEIGHT, animated });
  };

  const snapDecimal = (index: number, animated = true) => {
    const c = Math.max(0, Math.min(DECIMAL_DATA.length - 1, index));
    setDecimalIdx(c);
    decimalRef.current?.scrollTo({ x: 0, y: c * ITEM_HEIGHT, animated });
  };

  const handleWholeEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    snapWhole(Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT));
  };

  const handleDecimalEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    snapDecimal(Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT));
  };

  const selectedWeight = parseFloat(`${WHOLE_DATA[wholeIdx]}.${DECIMAL_DATA[decimalIdx]}`);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onShow={handleModalShow}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        {/* Backdrop */}
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Sheet */}
        <View
          style={{
            backgroundColor: bgColor,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderTopWidth: 1,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderColor: colors.border,
            paddingBottom: insets.bottom + spacing.xl,
          }}
        >
          {/* Drag handle */}
          <View
            style={{
              width: 36, height: 4, borderRadius: 2,
              backgroundColor: colors.border, alignSelf: 'center',
              marginTop: spacing.sm, marginBottom: spacing.base,
            }}
          />

          {/* Header */}
          <View
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              paddingHorizontal: spacing.xl, marginBottom: spacing.base,
            }}
          >
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: 'rgba(255,255,255,0.06)',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
              Log Weight
            </Text>

            <TouchableOpacity
              onPress={() => { onSave(selectedWeight); onClose(); }}
              style={{
                paddingHorizontal: 16, paddingVertical: 8,
                borderRadius: 99, backgroundColor: 'rgba(132,204,22,0.15)',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#84CC16' }}>Save</Text>
            </TouchableOpacity>
          </View>

          {/* Dual wheel */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl }}>
            {/* Whole number */}
            <WheelColumn
              scrollRef={wholeRef}
              data={WHOLE_DATA}
              selectedIndex={wholeIdx}
              onMomentumEnd={handleWholeEnd}
              onTapItem={snapWhole}
              bgColor={bgColor}
              textColor={colors.textPrimary}
              style={{ flex: 3 }}
            />

            {/* Decimal point */}
            <View style={{ width: 20, alignItems: 'center', paddingBottom: 6 }}>
              <Text style={{ fontSize: 34, fontWeight: '800', color: '#84CC16' }}>.</Text>
            </View>

            {/* Decimal digit */}
            <WheelColumn
              scrollRef={decimalRef}
              data={DECIMAL_DATA}
              selectedIndex={decimalIdx}
              onMomentumEnd={handleDecimalEnd}
              onTapItem={snapDecimal}
              bgColor={bgColor}
              textColor={colors.textPrimary}
              style={{ flex: 1 }}
            />

            {/* Unit */}
            <View style={{ width: 44, alignItems: 'flex-start', paddingLeft: 8, paddingBottom: 4 }}>
              <Text style={{ fontSize: 16, fontWeight: '500', color: 'rgba(255,255,255,0.4)' }}>
                {unit}
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View
            style={{
              alignItems: 'center',
              paddingTop: spacing.base,
              paddingBottom: spacing.sm,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              marginTop: spacing.base,
            }}
          >
            <Text style={{ fontSize: 12, color: colors.textTertiary, marginBottom: 4 }}>
              Selected Weight
            </Text>
            <Text style={{ fontSize: 40, fontWeight: '700', color: '#84CC16' }}>
              {selectedWeight.toFixed(1)}{' '}
              <Text style={{ fontSize: 20, fontWeight: '500', color: 'rgba(132,204,22,0.7)' }}>
                {unit}
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
