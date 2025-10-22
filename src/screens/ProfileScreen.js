import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Card from '../components/Card';
import { COLORS } from '../constants/colors';
import { SPACING, TYPOGRAPHY } from '../constants/spacing';
import { STRINGS } from '../constants/strings';

/**
 * ProfileScreen
 * User profile screen - placeholder for future features
 */
export default function ProfileScreen() {
  const APP_VERSION = STRINGS.profileScreen.version.appVersion;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Profile Icon */}
        <View style={styles.profileIconContainer}>
          <Text style={styles.profileIcon}>👤</Text>
        </View>

        {/* Coming Soon Message */}
        <Text style={styles.comingSoonTitle}>{STRINGS.profileScreen.title}</Text>
        <Text style={styles.comingSoonSubtitle}>
          {STRINGS.profileScreen.subtitle}
        </Text>

        {/* Placeholder Cards */}
        <View style={styles.featurePreview}>
          <Card style={styles.featureCard}>
            <Text style={styles.featureTitle}>{STRINGS.profileScreen.features.stats.title}</Text>
            <Text style={styles.featureText}>{STRINGS.profileScreen.features.stats.text}</Text>
          </Card>

          <Card style={styles.featureCard}>
            <Text style={styles.featureTitle}>{STRINGS.profileScreen.features.settings.title}</Text>
            <Text style={styles.featureText}>{STRINGS.profileScreen.features.settings.text}</Text>
          </Card>

          <Card style={styles.featureCard}>
            <Text style={styles.featureTitle}>{STRINGS.profileScreen.features.export.title}</Text>
            <Text style={styles.featureText}>{STRINGS.profileScreen.features.export.text}</Text>
          </Card>
        </View>

        {/* Version Info */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>VikFit v{APP_VERSION}</Text>
          <Text style={styles.versionSubtext}>{STRINGS.profileScreen.version.tagline}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.container,
    paddingVertical: SPACING.container,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gray,
    marginTop: SPACING.container,
  },
  profileIcon: {
    fontSize: 40,
  },
  comingSoonTitle: {
    ...TYPOGRAPHY.screenTitle,
    color: COLORS.textPrimary,
    marginTop: SPACING.container,
    marginBottom: SPACING.small,
  },
  comingSoonSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.container,
    paddingHorizontal: SPACING.element,
  },
  featurePreview: {
    width: '100%',
    paddingHorizontal: SPACING.small,
  },
  featureCard: {
    marginBottom: SPACING.element,
  },
  featureTitle: {
    ...TYPOGRAPHY.button,
    color: COLORS.textPrimary,
    marginBottom: SPACING.small,
  },
  featureText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: SPACING.container,
  },
  versionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: SPACING.small,
  },
  versionSubtext: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
});
