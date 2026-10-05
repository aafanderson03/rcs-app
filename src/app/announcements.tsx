import { Link } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RcsColors } from '@/constants/theme';

const announcementSections = [
  {
    label: 'EMPLOYEE MILESTONES',
    title: 'Birthdays and anniversaries',
    description: 'Celebrate employee milestones when the official announcement feed is connected.',
  },
  {
    label: 'COMPANY NOTICES',
    title: 'Holidays and workplace updates',
    description: 'Company holidays and important notices will appear here from the approved feed.',
  },
  {
    label: 'APPLICATION GUIDES',
    title: 'Employee application guides',
    description: 'Guides and instructions will be available alongside each employee request.',
  },
];

export default function AnnouncementsScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 960;
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={[styles.content, isDesktop && styles.desktopContent]}>
        <Link href="/" asChild>
          <Pressable accessibilityRole="button" style={styles.backButton}>
            <Text style={styles.backButtonText}>‹  Home</Text>
          </Pressable>
        </Link>

        <Text style={styles.eyebrow}>STAY IN THE LOOP</Text>
        <Text style={styles.title}>Announcements</Text>
        <Text style={styles.subtitle}>Company news and workplace updates, all in one place.</Text>

        <View style={styles.previewNotice}>
          <Text style={styles.previewNoticeTitle}>Preview — no live company updates</Text>
          <Text style={styles.previewNoticeText}>
            This screen is ready for an approved company news source. The messages below describe
            planned sections; they are not official announcements.
          </Text>
        </View>

        <View style={[styles.cards, isDesktop && styles.desktopCards]}>
          {announcementSections.map((section) => (
            <View key={section.label} style={[styles.card, isDesktop && styles.desktopCard]}>
              <View style={styles.cardHeader}>
                <Text style={styles.category}>{section.label}</Text>
                <Text style={styles.sampleBadge}>PREVIEW</Text>
              </View>
              <Text style={styles.cardTitle}>{section.title}</Text>
              <Text style={styles.cardDescription}>{section.description}</Text>
            </View>
          ))}
        </View>

        <Link href="/dtr" asChild>
          <Pressable accessibilityRole="button" style={styles.dtrLink}>
            <Text style={styles.dtrLinkText}>Open DTR Viewer  ›</Text>
          </Pressable>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: RcsColors.background },
  content: { width: '100%', maxWidth: 620, alignSelf: 'center', padding: 24, paddingBottom: 36 },
  desktopContent: { maxWidth: 1180, padding: 32, paddingBottom: 40 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 8, paddingRight: 12, marginBottom: 26 },
  backButtonText: { color: RcsColors.brownLight, fontSize: 14, fontWeight: '700' },
  eyebrow: { color: RcsColors.brownLight, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  title: { marginTop: 8, color: RcsColors.brownDark, fontSize: 30, lineHeight: 36, fontWeight: '800' },
  subtitle: { marginTop: 8, marginBottom: 22, color: RcsColors.gray, fontSize: 15, lineHeight: 22 },
  previewNotice: {
    padding: 15,
    marginBottom: 14,
    borderRadius: 12,
    backgroundColor: RcsColors.yellowLight,
    borderWidth: 1,
    borderColor: RcsColors.yellow,
  },
  previewNoticeTitle: { color: RcsColors.brown, fontSize: 13, fontWeight: '700', marginBottom: 5 },
  previewNoticeText: { color: RcsColors.grayDark, fontSize: 12, lineHeight: 18 },
  cards: { gap: 12 },
  desktopCards: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: {
    flexGrow: 1,
    minWidth: 0,
    padding: 17,
    marginBottom: 12,
    borderRadius: 14,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  desktopCard: { flexGrow: 0, flexBasis: '48%', minWidth: 280 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  category: { color: RcsColors.brownLight, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  sampleBadge: { color: RcsColors.grayMuted, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  cardTitle: { marginTop: 12, color: RcsColors.brownDark, fontSize: 16, fontWeight: '700' },
  cardDescription: { marginTop: 6, color: RcsColors.gray, fontSize: 13, lineHeight: 19 },
  dtrLink: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    borderRadius: 11,
    backgroundColor: RcsColors.brown,
  },
  dtrLinkText: { color: RcsColors.white, fontSize: 13, fontWeight: '700' },
});
