import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ResponsiveText as Text } from '@/components/responsive-text';
import { getPaletteForScheme } from '@/constants/theme';
import { useAuth, type EmployeeType } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { dateKey, demoMilestones, formatDemoDate, getRecentDemoAttendance } from '@/data/demo-data';

const workspaceContent: Record<EmployeeType, {
  summary: string;
  links: { label: string; detail: string; route: string }[];
}> = {
  employee: {
    summary: 'Your employee services and records, together in one place.',
    links: [
      { label: 'Attendance & DTR', detail: 'Review attendance and time records', route: '/attendance' },
      { label: 'Applications', detail: 'Submit or follow up on a request', route: '/applications' },
      { label: 'Employee inquiry', detail: 'Open your profile and balances', route: '/inquiry/basic-profile' },
    ],
  },
  merchandiser: {
    summary: 'Quick access to the services most useful to field teams.',
    links: [
      { label: 'Attendance & DTR', detail: 'Review your attendance record', route: '/attendance' },
      { label: 'Announcements', detail: 'Read the latest team updates', route: '/announcements' },
      { label: 'Help & guides', detail: 'Find instructions for common requests', route: '/help' },
    ],
  },
  guard: {
    summary: 'Keep attendance and important employee updates close at hand.',
    links: [
      { label: 'Attendance & DTR', detail: 'Review your attendance record', route: '/attendance' },
      { label: 'Announcements', detail: 'Read the latest team updates', route: '/announcements' },
      { label: 'Help & guides', detail: 'Find instructions for common requests', route: '/help' },
    ],
  },
  subcontractor: {
    summary: 'Start with requests, company updates, and practical support.',
    links: [
      { label: 'Applications', detail: 'Submit or follow up on a request', route: '/applications' },
      { label: 'Announcements', detail: 'Read the latest company updates', route: '/announcements' },
      { label: 'Help & guides', detail: 'Find instructions for common requests', route: '/help' },
    ],
  },
};

const today = new Date();
const greeting =
  today.getHours() < 12 ? 'Good morning' : today.getHours() < 18 ? 'Good afternoon' : 'Good evening';
const formattedDate = today.toLocaleDateString(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});
const recentAttendance = getRecentDemoAttendance();
const recentAttendanceDate = recentAttendance
  ? formatDemoDate(recentAttendance.date, { weekday: 'short', month: 'short', day: 'numeric' })
  : '';
const lastAttendanceWasYesterday = recentAttendance
  ? recentAttendance.date === dateKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1))
  : false;

export default function HomeScreen() {
  const { user } = useAuth();
  const { colorScheme } = useAppTheme();
  const colors = useMemo(() => getPaletteForScheme(colorScheme), [colorScheme]);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 960;
  const isWideScreen = Platform.OS === 'web' && width >= 960;
  const isMobile = width < 600;
  const [attendanceCardHeight, setAttendanceCardHeight] = useState<number | null>(null);
  const employeeType = user?.employeeType ?? 'employee';
  const workspace = workspaceContent[employeeType];

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
          <Text style={styles.workspaceEyebrow}>YOUR RCS WORKSPACE</Text>
          <Text style={[styles.greetingText, isDesktop && styles.desktopGreetingText]}>
            {user ? `${greeting}, ${user.displayName}` : greeting}
          </Text>
          <Text style={[styles.workspaceSummary, isDesktop && styles.desktopWorkspaceSummary]}>
            {workspace.summary}
          </Text>
          <View style={styles.identity}>
            <Text style={styles.dateText}>
              {user ? `${user.company.name} · ${employeeTypeLabel(employeeType)} · ` : ''}{formattedDate}
            </Text>
          </View>
        </View>

        <View style={styles.startSection}>
          <View style={styles.startHeading}>
            <Text style={[styles.sectionTitle, isDesktop && styles.desktopSectionTitle]}>Start here</Text>
            <Text style={styles.sectionHint}>A few useful places to begin</Text>
          </View>
          <View style={[styles.startGrid, isDesktop && styles.desktopStartGrid]}>
            {workspace.links.map((item, index) => (
              <Pressable
                key={item.label}
                accessibilityRole="link"
                onPress={() => router.push(item.route as never)}
                style={({ pressed }) => [styles.startCard, isDesktop && styles.desktopStartCard, pressed && styles.pressed]}
              >
                <Text style={styles.startNumber}>0{index + 1}</Text>
                <Text style={styles.startTitle}>{item.label}</Text>
                <Text style={styles.startDetail}>{item.detail}</Text>
                <Text style={styles.startArrow}>›</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View
          style={[
            styles.dashboardGrid,
            isDesktop && styles.desktopDashboardGrid,
            isWideScreen && styles.wideDashboardGrid,
          ]}
        >
          <View style={[styles.dashboardColumn, isWideScreen && styles.wideDashboardColumn]}>
            <Text style={[styles.sectionTitle, isDesktop && styles.desktopSectionTitle]}>
              {lastAttendanceWasYesterday ? 'Yesterday' : 'Last workday'} · {recentAttendanceDate}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open attendance and DTR"
              onPress={() => router.push('/attendance')}
              style={({ pressed }) => [
                styles.attendanceCard,
                pressed && styles.pressed,
              ]}
              onLayout={({ nativeEvent }) => {
                if (isWideScreen) setAttendanceCardHeight(nativeEvent.layout.height);
              }}
            >
              <View style={styles.attendanceTopRow}>
                <Text style={styles.attendanceLabel}>SAMPLE DTR</Text>
                <View style={styles.attendanceBadges}>
                  {recentAttendance?.status === 'Late' ? <View style={[styles.notConnectedBadge, styles.lateBadge]}>
                    <Text style={[styles.notConnectedText, styles.lateText]}>LATE {recentAttendance.lateByMinutes} MIN</Text>
                  </View> : null}
                  <View style={styles.notConnectedBadge}>
                    <Text style={styles.notConnectedText}>DEMO</Text>
                  </View>
                </View>
              </View>
              <View style={styles.punchList}>
                {recentAttendance?.punches.map((punch) => (
                  <PunchRow key={punch.label} label={punch.label} time={punch.time} />
                ))}
              </View>
              <View style={styles.punchTotalRow}>
                <Text style={styles.punchTotalLabel}>Total hours</Text>
                <Text style={styles.punchTotalValue}>{recentAttendance?.totalWorked ?? '—'}</Text>
              </View>
         
              <View style={styles.attendanceAction}>
                <Text style={styles.attendanceActionText}>View full attendance record</Text>
                <Text style={styles.attendanceArrow}>›</Text>
              </View>
            </Pressable>
          </View>

          <View style={[styles.dashboardColumn, isWideScreen && styles.wideDashboardColumn]}>
            <View style={[styles.sectionHeadingRow, isDesktop && styles.desktopSectionHeadingRow]}>
              <Text style={[styles.sectionTitle, isDesktop && styles.desktopSectionTitle]}>
                Employee milestones
              </Text>
            </View>
            <View style={[
              styles.milestonesCard,
              isDesktop && styles.desktopMilestonesCard,
              isWideScreen && attendanceCardHeight !== null && { height: attendanceCardHeight },
            ]}>
              <View style={[styles.milestoneColumns, isMobile && styles.mobileMilestoneColumns]}>
                <View style={styles.milestoneColumn}>
                  <Text style={styles.milestoneTitle}>Birthdays</Text>
                  {isWideScreen ? (
                    <ScrollView style={styles.milestoneList} nestedScrollEnabled showsVerticalScrollIndicator>
                      {demoMilestones.birthdays.map((milestone) => (
                        <Text key={milestone.name} style={styles.milestoneDescription}>
                          {milestone.name} · {milestone.date}
                        </Text>
                      ))}
                    </ScrollView>
                  ) : demoMilestones.birthdays.map((milestone) => (
                    <Text key={milestone.name} style={styles.milestoneDescription}>
                      {milestone.name} · {milestone.date}
                    </Text>
                  ))}
                </View>
                <View style={[styles.milestoneDivider, isMobile && styles.mobileMilestoneDivider]} />
                <View style={styles.milestoneColumn}>
                  <Text style={styles.milestoneTitle}>Anniversaries</Text>
                  {isWideScreen ? (
                    <ScrollView style={styles.milestoneList} nestedScrollEnabled showsVerticalScrollIndicator>
                      {demoMilestones.anniversaries.map((milestone) => (
                        <Text key={milestone.name} style={styles.milestoneDescription}>
                          {milestone.name} · {milestone.years} years · {milestone.date}
                        </Text>
                      ))}
                    </ScrollView>
                  ) : demoMilestones.anniversaries.map((milestone) => (
                    <Text key={milestone.name} style={styles.milestoneDescription}>
                      {milestone.name} · {milestone.years} years · {milestone.date}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>

          <View style={[styles.guideHeadingRow, isMobile && styles.mobileGuideHeadingRow]}>
          <View style={styles.guideCopy}>
            <Text style={[styles.sectionTitle, isDesktop && styles.desktopSectionTitle]}>
              Need help with a request?
            </Text>
            <Text style={styles.guideDescription}>
              Browse the application guide for instructions adapted from the legacy portal.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/help')}
            hitSlop={8}
            style={({ pressed }) => [styles.helpButton, pressed && styles.pressed]}
          >
            <Text style={styles.helpButtonText}>Open Help</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/ticket')}
            hitSlop={8}
            style={({ pressed }) => [styles.ticketButton, pressed && styles.pressed]}
          >
            <Text style={styles.ticketButtonText}>Submit a ticket</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>
          Demo presentation data · Not connected to RCS systems
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function employeeTypeLabel(type: string) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function PunchRow({ label, time }: { label: string; time: string }) {
  const { colorScheme } = useAppTheme();
  const colors = useMemo(() => getPaletteForScheme(colorScheme), [colorScheme]);
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.punchRow}>
      <Text style={styles.punchLabel}>{label}</Text>
      <View style={styles.punchDivider} />
      <Text style={styles.punchTime}>{time}</Text>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof getPaletteForScheme>) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', padding: 20, paddingBottom: 36 },
  desktopContent: { alignSelf: 'flex-start', padding: 38, paddingBottom: 56 },
  wideScreenContent: { paddingHorizontal: 52 },
  greeting: { position: 'relative', overflow: 'hidden', padding: 23, paddingLeft: 27, marginTop: 16, marginBottom: 27, borderRadius: 12, backgroundColor: colors.brownSurface, borderLeftWidth: 5, borderLeftColor: colors.yellow },
  desktopGreeting: { padding: 34, paddingLeft: 40, marginTop: 3, marginBottom: 30 },
  workspaceEyebrow: { color: colors.yellow, fontSize: 10, fontWeight: '800', letterSpacing: 1.6 },
  greetingText: { marginTop: 10, color: '#FFF9EF', fontFamily: 'Georgia', fontSize: 27, fontWeight: '700', letterSpacing: -0.2 },
  desktopGreetingText: { fontSize: 37, letterSpacing: -0.5 },
  workspaceSummary: { marginTop: 7, color: '#DED5C8', fontSize: 13, lineHeight: 20 },
  desktopWorkspaceSummary: { fontSize: 15, lineHeight: 23 },
  identity: { alignSelf: 'flex-start', marginTop: 15, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.1)' },
  dateText: { color: '#F4EDE1', fontSize: 11, lineHeight: 16, fontWeight: '600' },
  sectionTitle: { color: colors.brownDark, fontSize: 16, fontWeight: '800' },
  desktopSectionTitle: { fontSize: 20 },
  startSection: { marginBottom: 29 },
  startHeading: { marginBottom: 12 },
  sectionHint: { marginTop: 4, color: colors.grayMuted, fontSize: 12 },
  startGrid: { gap: 10 },
  desktopStartGrid: { flexDirection: 'row', gap: 14 },
  startCard: { position: 'relative', minHeight: 118, padding: 16, paddingRight: 34, borderRadius: 9, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderTopWidth: 2, borderTopColor: colors.yellow },
  desktopStartCard: { flex: 1, minWidth: 0, minHeight: 150, padding: 20 },
  startNumber: { color: colors.brown, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  startTitle: { marginTop: 12, color: colors.brownDark, fontSize: 14, fontWeight: '800' },
  startDetail: { marginTop: 5, color: colors.grayMuted, fontSize: 11, lineHeight: 16 },
  startArrow: { position: 'absolute', right: 13, bottom: 10, color: colors.brown, fontSize: 22 },
  dashboardGrid: { gap: 28 },
  desktopDashboardGrid: { gap: 36 },
  wideDashboardGrid: { flexDirection: 'row', gap: 32 },
  dashboardColumn: { minWidth: 0 },
  wideDashboardColumn: { flex: 1 },
  attendanceCard: {
    padding: 18,
    marginTop: 12,
    borderRadius: 11,
    backgroundColor: colors.brownSurface,
  },
  attendanceTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  attendanceBadges: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  attendanceLabel: { color: colors.yellow, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  notConnectedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  notConnectedText: { color: colors.yellow, fontSize: 9, fontWeight: '800', letterSpacing: 0.7 },
  lateBadge: { backgroundColor: 'rgba(255,120,100,0.2)' },
  lateText: { color: '#FFC1B5' },
  punchList: { marginTop: 10 },
  punchRow: { minHeight: 28, flexDirection: 'row', alignItems: 'center' },
  punchLabel: { width: 145, color: colors.yellow, fontSize: 10, fontWeight: '800', letterSpacing: 0.2 },
  punchDivider: { width: 4, height: 4, marginRight: 10, borderRadius: 2, backgroundColor: colors.brownLight },
  punchTime: { color: colors.white, fontSize: 12, fontWeight: '600' },
  punchTotalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 7, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  punchTotalLabel: { color: colors.mutedText, fontSize: 11 },
  punchTotalValue: { color: colors.yellowDeep, fontSize: 13, fontWeight: '800' },
  paidHoursNote: { marginTop: 4, color: colors.mutedText, fontSize: 10 },
  attendanceAction: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  attendanceActionText: { color: colors.yellow, fontSize: 13, fontWeight: '700' },
  attendanceArrow: { marginLeft: 5, color: colors.yellow, fontSize: 22, lineHeight: 24 },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 11,
  },
  desktopSectionHeadingRow: { marginTop: 0, marginBottom: 16 },
  seeAll: { color: colors.brownLight, fontSize: 12, fontWeight: '700' },
  milestonesCard: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  desktopMilestonesCard: { padding: 18, borderRadius: 10 },
  milestoneColumns: { flex: 1, flexDirection: 'row', alignItems: 'stretch', gap: 12 },
  mobileMilestoneColumns: { flexDirection: 'column', gap: 12 },
  milestoneColumn: { flex: 1, minWidth: 0, gap: 6 },
  milestoneList: { flex: 1, minHeight: 0 },
  milestoneDivider: { width: 1, backgroundColor: colors.border },
  mobileMilestoneDivider: { width: '100%', height: 1 },
  milestoneTitle: { color: colors.brownDark, fontSize: 13, fontWeight: '700' },
  milestoneDescription: { color: colors.grayMuted, fontSize: 11, lineHeight: 16 },
  guideHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 24,
    marginBottom: 11,
  },
  mobileGuideHeadingRow: { flexWrap: 'wrap' },
  guideCopy: { flex: 1, minWidth: 0, gap: 5 },
  guideDescription: { color: colors.grayMuted, fontSize: 12, lineHeight: 18 },
  helpButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colors.yellowLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  helpButtonText: { color: colors.brownDark, fontSize: 12, fontWeight: '700' },
  ticketButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colors.brown,
  },
  ticketButtonText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  pressed: { opacity: 0.8 },
  footer: { marginTop: 23, color: colors.grayMuted, fontSize: 10, lineHeight: 15, textAlign: 'center' },
});
