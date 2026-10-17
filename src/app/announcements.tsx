import { Link } from 'expo-router';
import { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ResponsiveText as Text } from '@/components/responsive-text';
import { getPaletteForScheme, type RcsPalette } from '@/constants/theme';
import { useAppTheme } from '@/contexts/theme-context';
import { demoAnnouncements, formatDemoDate } from '@/data/demo-data';

export default function AnnouncementsScreen() {
  const { colorScheme } = useAppTheme();
  const palette = getPaletteForScheme(colorScheme);
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 960;
  const isCompact = width < 380;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={[styles.content, width < 600 && styles.mobileContent, isCompact && styles.compactContent, isDesktop && styles.desktopContent]}>
        <Link href="/home" asChild><Pressable accessibilityRole="button" style={styles.backButton}><Text style={styles.backButtonText}>‹ Home</Text></Pressable></Link>
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>STAY IN THE LOOP · DEMO FEED</Text>
          <Text style={styles.title}>Announcements</Text>
          <Text style={styles.subtitle}>Sample employee updates for a presentation walkthrough.</Text>
        </View>
        <View style={[styles.list, isDesktop && styles.desktopList]}>
          {demoAnnouncements.map((item) => <View key={item.id} style={[styles.card, isDesktop && styles.desktopCard]}>
            <View style={styles.cardTop}><Text style={styles.category}>{item.category}</Text><Text style={styles.date}>{formatDemoDate(item.date)}</Text></View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
            <Text style={styles.sampleId}>{item.id} · fictional sample notice</Text>
          </View>)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: Record<keyof RcsPalette, string>) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    content: { width: '100%', maxWidth: 720, alignSelf: 'center', padding: 24, paddingBottom: 36 },
    mobileContent: { padding: 18, paddingBottom: 30 },
    compactContent: { padding: 14, paddingBottom: 26 },
    desktopContent: { maxWidth: 1180, padding: 32, paddingBottom: 40 },
    backButton: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', paddingRight: 12, marginBottom: 26 },
    heading: { marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
    backButtonText: { color: colors.brownLight, fontSize: 14, fontWeight: '700' },
    eyebrow: { color: colors.brown, fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
    title: { marginTop: 8, color: colors.text, fontSize: 30, lineHeight: 36, fontWeight: '700', letterSpacing: -0.6 },
    subtitle: { marginTop: 8, marginBottom: 18, color: colors.gray, fontSize: 15, lineHeight: 22 },
    list: { gap: 12 },
    desktopList: { flexDirection: 'row', flexWrap: 'wrap' },
    card: { padding: 18, borderRadius: 4, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    desktopCard: { flexGrow: 1, flexBasis: '48%' },
    cardTop: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
    category: { flexShrink: 1, color: colors.brown, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
    date: { flexShrink: 0, color: colors.grayMuted, fontSize: 11 },
    cardTitle: { marginTop: 11, color: colors.text, fontSize: 16, fontWeight: '700' },
    body: { marginTop: 7, color: colors.grayDark, fontSize: 13, lineHeight: 20 },
    sampleId: { marginTop: 14, color: colors.grayMuted, fontSize: 10 },
  });
}
