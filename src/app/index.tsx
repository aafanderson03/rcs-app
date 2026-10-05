import { useRouter } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RcsColors } from '@/constants/theme';

const today = new Date();
const greeting =
  today.getHours() < 12 ? 'Good morning' : today.getHours() < 18 ? 'Good afternoon' : 'Good evening';
const formattedDate = today.toLocaleDateString(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 960;
  const isWideScreen = Platform.OS === 'web' && width >= 960;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          isDesktop && styles.desktopContent,
          isWideScreen && styles.wideScreenContent,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.greeting, isDesktop && styles.desktopGreeting]}>
          <Text style={[styles.greetingText, isDesktop && styles.desktopGreetingText]}>{greeting}</Text>
          <Text style={[styles.dateText, isDesktop && styles.desktopDateText]}>{formattedDate}</Text>
        </View>

        <View
          style={[
            styles.dashboardGrid,
            isDesktop && styles.desktopDashboardGrid,
            isWideScreen && styles.wideDashboardGrid,
          ]}
        >
          <View style={styles.dashboardColumn}>
            <Text style={[styles.sectionTitle, isDesktop && styles.desktopSectionTitle]}>Today</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/attendance')}
              style={({ pressed }) => [
                styles.attendanceCard,
                isDesktop && styles.desktopCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.attendanceTopRow}>
                <Text style={styles.attendanceLabel}>ATTENDANCE</Text>
                <View style={styles.notConnectedBadge}>
                  <Text style={styles.notConnectedText}>DEMO</Text>
                </View>
              </View>
              <Text style={[styles.attendanceTitle, isDesktop && styles.desktopCardTitle]}>Ready to start your day?</Text>
              <Text style={[styles.attendanceDescription, isDesktop && styles.desktopCardDescription]}>
                Try the clock-in flow in this app preview.
              </Text>
              <View style={styles.attendanceAction}>
                <Text style={styles.attendanceActionText}>Open attendance</Text>
                <Text style={styles.attendanceArrow}>›</Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.dashboardColumn}>
            <View
              style={[
                styles.sectionHeadingRow,
                isDesktop && styles.desktopSectionHeadingRow,
                isWideScreen && styles.wideSectionHeadingRow,
              ]}
            >
              <Text style={[styles.sectionTitle, isDesktop && styles.desktopSectionTitle]}>Announcements</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/announcements')}
                hitSlop={8}
              >
                <Text style={styles.seeAll}>See all</Text>
              </Pressable>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/announcements')}
              style={({ pressed }) => [
                styles.announcementCard,
                isDesktop && styles.desktopAnnouncementCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.announcementIcon}>
                <Text style={styles.announcementIconText}>i</Text>
              </View>
              <View style={styles.announcementCopy}>
                <Text style={styles.announcementTitle}>Company updates will appear here</Text>
                <Text style={styles.announcementDescription}>
                  No live announcement source is connected yet.
                </Text>
              </View>
              <Text style={styles.announcementChevron}>›</Text>
            </Pressable>
          </View>
        </View>

        <Text
          style={[
            styles.sectionTitle,
            styles.toolsHeading,
            isDesktop && styles.desktopSectionTitle,
            isDesktop && styles.desktopToolsHeading,
          ]}
        >
          Quick access
        </Text>
        <View style={[styles.quickAccess, isDesktop && styles.desktopQuickAccess]}>
          <QuickAccessButton
            title="DTR Viewer"
            subtitle="Browse daily time records"
            icon="▦"
            onPress={() => router.push('/dtr')}
            desktop={isDesktop}
          />
          <QuickAccessButton
            title="Applications"
            subtitle="Start or track a request"
            icon="✓"
            onPress={() => router.push('/applications')}
            desktop={isDesktop}
          />
          <QuickAccessButton
            title="Employee inquiry"
            subtitle="Profile and balances"
            icon="⌕"
            onPress={() =>
              router.push({
                pathname: '/inquiry/[section]',
                params: { section: 'basic-profile' },
              })
            }
            desktop={isDesktop}
          />
        </View>

        <Text style={styles.footer}>
          Preview only · Attendance and announcements are not connected to RCS systems
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAccessButton({
  title,
  subtitle,
  icon,
  onPress,
  desktop,
}: {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
  desktop: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickAccessButton,
        desktop && styles.desktopQuickAccessButton,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.quickAccessIcon}>
        <Text style={styles.quickAccessIconText}>{icon}</Text>
      </View>
      <Text style={[styles.quickAccessTitle, desktop && styles.desktopQuickAccessTitle]}>{title}</Text>
      <Text style={[styles.quickAccessSubtitle, desktop && styles.desktopQuickAccessSubtitle]}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: RcsColors.background },
  content: { width: '100%', padding: 24, paddingBottom: 36 },
  desktopContent: { alignSelf: 'flex-start', padding: 44, paddingBottom: 56 },
  wideScreenContent: { paddingHorizontal: 56 },
  greeting: { marginTop: 30, marginBottom: 23 },
  desktopGreeting: { marginTop: 18, marginBottom: 34 },
  greetingText: { color: RcsColors.brownDark, fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },
  desktopGreetingText: { fontSize: 34, letterSpacing: -0.5 },
  dateText: { marginTop: 5, color: RcsColors.grayMuted, fontSize: 13 },
  desktopDateText: { fontSize: 15 },
  sectionTitle: { color: RcsColors.brown, fontSize: 17, fontWeight: '700' },
  desktopSectionTitle: { fontSize: 20 },
  dashboardGrid: { gap: 28 },
  desktopDashboardGrid: { gap: 36 },
  wideDashboardGrid: { flexDirection: 'row', gap: 32 },
  dashboardColumn: { flex: 1, minWidth: 0 },
  desktopCard: { padding: 26, marginTop: 16, borderRadius: 20, minHeight: 230 },
  desktopCardTitle: { marginTop: 25, fontSize: 25 },
  desktopCardDescription: { marginTop: 9, fontSize: 15, lineHeight: 23 },
  attendanceCard: {
    padding: 18,
    marginTop: 12,
    borderRadius: 17,
    backgroundColor: RcsColors.brown,
  },
  attendanceTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  attendanceLabel: { color: RcsColors.yellowLight, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  notConnectedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  notConnectedText: { color: RcsColors.yellowLight, fontSize: 9, fontWeight: '800', letterSpacing: 0.7 },
  attendanceTitle: { marginTop: 16, color: RcsColors.white, fontSize: 20, fontWeight: '700' },
  attendanceDescription: { marginTop: 5, color: '#E4D9C9', fontSize: 13, lineHeight: 19 },
  attendanceAction: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  attendanceActionText: { color: RcsColors.yellow, fontSize: 13, fontWeight: '700' },
  attendanceArrow: { marginLeft: 5, color: RcsColors.yellow, fontSize: 22, lineHeight: 24 },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 11,
  },
  desktopSectionHeadingRow: { marginTop: 0, marginBottom: 16 },
  wideSectionHeadingRow: { marginTop: 0 },
  seeAll: { color: RcsColors.brownLight, fontSize: 12, fontWeight: '700' },
  announcementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 14,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  desktopAnnouncementCard: { minHeight: 112, padding: 22, borderRadius: 18 },
  announcementIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: RcsColors.yellowLight,
  },
  announcementIconText: { color: RcsColors.brown, fontSize: 19, fontWeight: '800' },
  announcementCopy: { flex: 1, marginLeft: 11, marginRight: 6 },
  announcementTitle: { color: RcsColors.brownDark, fontSize: 13, fontWeight: '700' },
  announcementDescription: { marginTop: 4, color: RcsColors.grayMuted, fontSize: 11, lineHeight: 16 },
  announcementChevron: { color: RcsColors.grayMuted, fontSize: 23 },
  toolsHeading: { marginTop: 28, marginBottom: 11 },
  desktopQuickAccess: { flexWrap: 'wrap', gap: 18 },
  desktopToolsHeading: { marginTop: 38, marginBottom: 16 },
  quickAccess: { flexDirection: 'row', gap: 11 },
  quickAccessButton: {
    flex: 1,
    minHeight: 116,
    padding: 14,
    borderRadius: 14,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  desktopQuickAccessButton: {
    flexGrow: 0,
    flexBasis: '48%',
    minWidth: 220,
    minHeight: 150,
    padding: 22,
    borderRadius: 18,
  },
  quickAccessIcon: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: RcsColors.yellowLight,
  },
  quickAccessIconText: { color: RcsColors.brown, fontSize: 17, fontWeight: '700' },
  quickAccessTitle: { marginTop: 11, color: RcsColors.brownDark, fontSize: 12, fontWeight: '700' },
  desktopQuickAccessTitle: { marginTop: 16, fontSize: 16 },
  quickAccessSubtitle: { marginTop: 3, color: RcsColors.grayMuted, fontSize: 10 },
  desktopQuickAccessSubtitle: { fontSize: 13 },
  pressed: { opacity: 0.8 },
  footer: { marginTop: 23, color: RcsColors.grayMuted, fontSize: 10, lineHeight: 15, textAlign: 'center' },
});
