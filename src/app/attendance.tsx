import { Link } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RcsColors } from '@/constants/theme';

export default function AttendanceScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 960;
  const [previewClockIn, setPreviewClockIn] = useState<Date | null>(null);
  const [previewClockOut, setPreviewClockOut] = useState<Date | null>(null);

  const handlePreviewAction = () => {
    if (!previewClockIn) {
      setPreviewClockIn(new Date());
      setPreviewClockOut(null);
    } else if (!previewClockOut) {
      setPreviewClockOut(new Date());
    } else {
      setPreviewClockIn(null);
      setPreviewClockOut(null);
    }
  };

  const status = !previewClockIn
    ? 'NOT CONNECTED'
    : previewClockOut
      ? 'PREVIEW COMPLETE'
      : 'PREVIEW ACTIVE';
  const statusTitle = !previewClockIn
    ? 'Attendance data unavailable'
    : previewClockOut
      ? 'Preview shift complete'
      : 'Preview shift in progress';
  const statusDescription = !previewClockIn
    ? 'Connect this app to an approved attendance system to view your status and work hours.'
    : `Clocked in at ${previewClockIn.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      })}${previewClockOut
        ? ` · clocked out at ${previewClockOut.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          })}`
        : ''}`;
  const actionText = !previewClockIn
    ? 'Preview clock in'
    : previewClockOut
      ? 'Reset preview'
      : 'Preview clock out';

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={[styles.content, isDesktop && styles.desktopContent]}
        showsVerticalScrollIndicator={false}
      >
        <Link href="/" asChild>
          <Pressable accessibilityRole="button" style={styles.backButton}>
            <Text style={styles.backButtonText}>‹  Home</Text>
          </Pressable>
        </Link>

        <Text style={styles.eyebrow}>WORK HOURS</Text>
        <Text style={styles.title}>Attendance</Text>
        <Text style={styles.subtitle}>Your daily attendance and shift information.</Text>

        <View style={[styles.cardColumns, isDesktop && styles.desktopCardColumns]}>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.cardLabel}>TODAY&apos;S STATUS</Text>
            <View
              style={[
                styles.statusBadge,
                previewClockIn ? styles.previewBadgeActive : null,
                previewClockIn && !previewClockOut ? styles.activeBadge : null,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  previewClockIn ? styles.activeBadgeText : null,
                ]}
              >
                {status}
              </Text>
            </View>
          </View>
          <Text style={styles.statusTitle}>{statusTitle}</Text>
          <Text style={styles.statusDescription}>{statusDescription}</Text>
        </View>

        <View style={[styles.shiftCard, isDesktop && styles.desktopShiftCard]}>
          <Text style={styles.cardLabel}>SCHEDULED SHIFT</Text>
          <Text style={styles.shiftTitle}>No schedule connected</Text>
          <Text style={styles.shiftDescription}>
            Shift details will be shown here when an approved employee data source is available.
          </Text>
        </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            actionText
          }
          onPress={handlePreviewAction}
          style={({ pressed }) => [
            styles.actionButton,
            previewClockOut && styles.resetButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.actionButtonText, previewClockOut && styles.resetButtonText]}>
            {actionText}
          </Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          Prototype only. These preview times are held temporarily on this screen and are not sent
          to or recorded by RCS.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: RcsColors.background },
  content: { width: '100%', maxWidth: 620, alignSelf: 'center', padding: 24 },
  desktopContent: { maxWidth: 1180, padding: 32 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 8, paddingRight: 12, marginBottom: 26 },
  backButtonText: { color: RcsColors.brownLight, fontSize: 14, fontWeight: '700' },
  eyebrow: { color: RcsColors.brownLight, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  title: { marginTop: 8, color: RcsColors.brownDark, fontSize: 30, lineHeight: 36, fontWeight: '800' },
  subtitle: { marginTop: 8, marginBottom: 22, color: RcsColors.gray, fontSize: 15, lineHeight: 22 },
  cardColumns: { gap: 12 },
  desktopShiftCard: { marginTop: 0 },
  statusCard: {
    flex: 1,
    minWidth: 0,
    padding: 18,
    borderRadius: 14,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { color: RcsColors.grayMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: RcsColors.grayLight,
  },
  previewBadgeActive: { backgroundColor: RcsColors.yellowLight },
  activeBadge: { backgroundColor: '#F3E7BD' },
  statusBadgeText: { color: RcsColors.gray, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  activeBadgeText: { color: RcsColors.brown },
  statusTitle: { marginTop: 18, color: RcsColors.brownDark, fontSize: 19, fontWeight: '700' },
  statusDescription: { marginTop: 7, color: RcsColors.gray, fontSize: 13, lineHeight: 19 },
  shiftCard: {
    flex: 1,
    minWidth: 0,
    padding: 18,
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  desktopCardColumns: { flexDirection: 'row', alignItems: 'stretch', gap: 20 },
  shiftTitle: { marginTop: 10, color: RcsColors.brownDark, fontSize: 15, fontWeight: '700' },
  shiftDescription: { marginTop: 5, color: RcsColors.gray, fontSize: 12, lineHeight: 18 },
  actionButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    borderRadius: 10,
    backgroundColor: RcsColors.brown,
  },
  resetButton: { backgroundColor: RcsColors.yellowLight },
  actionButtonText: { color: RcsColors.white, fontSize: 14, fontWeight: '700' },
  resetButtonText: { color: RcsColors.brownDark },
  pressed: { opacity: 0.8 },
  disclaimer: {
    marginTop: 12,
    color: RcsColors.grayMuted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
  },
});
