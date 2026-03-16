import React, { useEffect, useRef, useCallback } from 'react';
import {
  View, Text, Animated, TouchableOpacity, BackHandler, Alert, StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Dumbbell } from 'lucide-react-native';
import { OnboardingStackParamList } from '@core/navigation/stacks/OnboardingStack';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  // ── Animation values ──────────────────────────────────────────────────────
  const logoAnim    = useRef(new Animated.Value(0)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;
  const bodyAnim    = useRef(new Animated.Value(0)).current;
  const buttonAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(130, [
      Animated.spring(logoAnim,    { toValue: 1, tension: 45, friction: 7, useNativeDriver: true }),
      Animated.timing(taglineAnim, { toValue: 1, duration: 480, useNativeDriver: true }),
      Animated.timing(bodyAnim,    { toValue: 1, duration: 480, useNativeDriver: true }),
      Animated.timing(buttonAnim,  { toValue: 1, duration: 480, useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Android back → exit confirmation ─────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      const onBack = () => {
        Alert.alert('Exit VikFit', 'Are you sure you want to exit?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Exit', style: 'destructive', onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [])
  );

  // ── Interpolations ────────────────────────────────────────────────────────
  const logoScale   = logoAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const logoOpacity = logoAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  const taglineStyle = {
    opacity: taglineAnim,
    transform: [{ translateY: taglineAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
  };
  const bodyStyle = {
    opacity: bodyAnim,
    transform: [{ translateY: bodyAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
  };
  const buttonStyle = {
    opacity: buttonAnim,
    transform: [{ translateY: buttonAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F0F10' }} edges={['top']}>
      {/* Background glows */}
      <View style={{ ...StyleSheet.absoluteFillObject, overflow: 'hidden' }}>
        <LinearGradient
          colors={['rgba(59,130,246,0.18)', 'transparent']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', top: -60, left: -60, width: 320, height: 320, borderRadius: 160 }}
        />
        <LinearGradient
          colors={['rgba(132,204,22,0.14)', 'transparent']}
          start={{ x: 1, y: 1 }} end={{ x: 0, y: 0 }}
          style={{ position: 'absolute', bottom: -80, right: -80, width: 360, height: 360, borderRadius: 180 }}
        />
      </View>

      {/* Center content */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        {/* Logo */}
        <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }], marginBottom: 32 }}>
          <LinearGradient
            colors={['#3B82F6', '#84CC16']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{
              width: 88, height: 88, borderRadius: 28,
              alignItems: 'center', justifyContent: 'center',
              shadowColor: '#84CC16', shadowOpacity: 0.35, shadowRadius: 24, shadowOffset: { width: 0, height: 8 },
              elevation: 12,
            }}
          >
            <Dumbbell size={40} color="#fff" strokeWidth={2} />
          </LinearGradient>
        </Animated.View>

        {/* App name + tagline */}
        <Animated.View style={[{ alignItems: 'center', marginBottom: 16 }, taglineStyle]}>
          <Text style={{ fontSize: 48, fontWeight: '800', color: '#F5F5F7', letterSpacing: -1, lineHeight: 52 }}>
            VikFit
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#84CC16', marginTop: 6, letterSpacing: 0.2 }}>
            Your fitness, your rules.
          </Text>
        </Animated.View>

        {/* Body text */}
        <Animated.Text style={[{
          fontSize: 15, color: 'rgba(255,255,255,0.45)', textAlign: 'center',
          lineHeight: 23, maxWidth: 280,
        }, bodyStyle]}>
          Track meals, plan workouts, and hit your goals — all offline, all private.
        </Animated.Text>
      </View>

      {/* CTA button */}
      <Animated.View style={[{
        paddingHorizontal: 24,
        paddingBottom: insets.bottom + 24,
      }, buttonStyle]}>
        <TouchableOpacity
          onPress={() => navigation.navigate('BasicInfo')}
          activeOpacity={1}
          style={{ borderRadius: 16, overflow: 'hidden' }}
        >
          <LinearGradient
            colors={['#84CC16', '#65A30D']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{
              paddingVertical: 18, alignItems: 'center',
              shadowColor: '#84CC16', shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 4 },
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#000', letterSpacing: 0.3 }}>
              Get Started
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 16 }}>
          No account needed · Works offline
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

