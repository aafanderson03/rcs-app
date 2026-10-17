import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ResponsiveText as Text } from '@/components/responsive-text';
import { getCompanyBranding } from '@/constants/company-branding';
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
  const employeeType = user?.employeeType ?? 'employee';
  const workspace = workspaceContent[employeeType];
  const companyBranding = getCompanyBranding(user?.company.slug, user?.company.name);

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
          <View style={styles.introMeta}>
            <Text style={styles.workspaceEyebrow}>{companyBranding.name.toUpperCase()} / EMPLOYEE PORTAL</Text>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
          <Text style={[styles.greetingText, isDesktop && styles.desktopGreetingText]}>
            {user ? `${greeting}, ${user.displayName}` : greeting}
          </Text>
          <Text style={[styles.workspaceSummary, isDesktop && styles.desktopWorkspaceSummary]}>
            {workspace.summary}
          </Text>
          {user ? (
            <Text style={styles.identity}>
              {companyBranding.name} <Text style={styles.identityDivider}>/</Text> {employeeTypeLabel(employeeType)}
            </Text>
          ) : null}
        </View>

        <View style={styles.startSection}>
          <View style={styles.startHeading}>
            <Text style={[styles.sectionTitle, isDesktop && styles.desktopSectionTitle]}>Quick access</Text>
            <Text style={styles.sectionHint}>The services you use most</Text>
          </View>
          <View style={isDesktop && styles.desktopStartGrid}>
            {workspace.links.map((item, index) => (
              <Pressable
                key={item.label}
                accessibilityRole="link"
                onPress={() => router.push(item.route as never)}
                style={({ pressed }) => [
                  styles.startCard,
                  isDesktop && styles.desktopStartCard,
                  isDesktop && index > 0 && styles.desktopStartCardDivider,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.startNumber}>0{index + 1}</Text>
                <View style={styles.startCopy}>
                  <Text style={styles.startTitle}>{item.label}</Text>
                  <Text style={styles.startDetail}>{item.detail}</Text>
                </View>
                <Text style={styles.startArrow}>→</Text>
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
            <View style={styles.sectionHeadingRow}>
              <View>
                <Text style={styles.panelEyebrow}>ATTENDANCE</Text>
                <Text style={[styles.sectionTitle, isDesktop && styles.desktopSectionTitle]}>
                  {lastAttendanceWasYesterday ? 'Yesterday' : 'Last workday'}
                </Text>
              </View>
              <Text style={styles.panelDate}>{recentAttendanceDate}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open attendance and DTR"
              onPress={() => router.push('/attendance')}
              style={({ pressed }) => [styles.attendanceCard, pressed && styles.pressed]}
            >
              <View style={styles.attendanceTopRow}>
                <Text style={styles.attendanceLabel}>DAILY TIME RECORD</Text>
                <View style={styles.attendanceBadges}>
                  {recentAttendance?.status === 'Late' ? (
                    <View style={[styles.notConnectedBadge, styles.lateBadge]}>
                      <Text style={[styles.notConnectedText, styles.lateText]}>
                        Late {recentAttendance.lateByMinutes} min
                      </Text>
                    </View>
                  ) : null}
                  <Text style={styles.demoLabel}>SAMPLE</Text>
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
                <Text style={styles.attendanceActionText}>View attendance record</Text>
                <Text style={styles.attendanceArrow}>→</Text>
              </View>
            </Pressable>
          </View>

          <View style={[styles.dashboardColumn, isWideScreen && styles.wideDashboardColumn]}>
            <View style={[styles.sectionHeadingRow, styles.milestoneHeading]}>
              <View>
                <Text style={styles.panelEyebrow}>PEOPLE</Text>
              <Text style={[styles.sectionTitle, isDesktop && styles.desktopSectionTitle]}>
                Employee milestones
              </Text>
              </View>
            </View>
            <View style={[styles.milestonesCard, isDesktop && styles.desktopMilestonesCard]}>
              <View style={[styles.milestoneColumns, isMobile && styles.mobileMilestoneColumns]}>
                <View style={styles.milestoneColumn}>
                  <Text style={styles.milestoneTitle}>Birthdays</Text>
                  {demoMilestones.birthdays.map((milestone) => (
                    <Text key={milestone.name} style={styles.milestoneDescription}>
                      {milestone.name} <Text style={styles.milestoneDate}>/ {milestone.date}</Text>
                    </Text>
                  ))}
                </View>
                <View style={[styles.milestoneDivider, isMobile && styles.mobileMilestoneDivider]} />
                <View style={styles.milestoneColumn}>
                  <Text style={styles.milestoneTitle}>Anniversaries</Text>
                  {demoMilestones.anniversaries.map((milestone) => (
                    <Text key={milestone.name} style={styles.milestoneDescription}>
                      {milestone.name} <Text style={styles.milestoneDate}>/ {milestone.years} years · {milestone.date}</Text>
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.guideHeadingRow, isMobile && styles.mobileGuideHeadingRow]}>
          <View style={styles.guideCopy}>
            <Text style={styles.panelEyebrow}>SUPPORT</Text>
            <Text style={[styles.sectionTitle, isDesktop && styles.desktopSectionTitle]}>
              Here when you need us
            </Text>
            <Text style={styles.guideDescription}>
              Find request instructions or send a question to the support team.
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
          Sample information · Not connected to company systems
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
      <Text style={styles.punchTime}>{time}</Text>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof getPaletteForScheme>) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', padding: 22, paddingBottom: 40 },
  desktopContent: { alignSelf: 'center', maxWidth: 1320, padding: 42, paddingBottom: 60 },
  wideScreenContent: { paddingHorizontal: 56 },
  greeting: { paddingTop: 15, paddingBottom: 25, marginBottom: 28, borderBottomWidth: 1, borderBottomColor: colors.border },
  desktopGreeting: { paddingTop: 8, paddingBottom: 31, marginBottom: 34 },
  introMeta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  workspaceEyebrow: { color: colors.brown, fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  dateText: { color: colors.grayMuted, fontSize: 11, fontWeight: '600' },
  greetingText: { marginTop: 20, color: colors.text, fontSize: 30, fontWeight: '700', letterSpacing: -0.7 },
  desktopGreetingText: { fontSize: 40, letterSpacing: -1.1 },
  workspaceSummary: { maxWidth: 620, marginTop: 8, color: colors.mutedText, fontSize: 14, lineHeight: 21 },
  desktopWorkspaceSummary: { fontSize: 15, lineHeight: 23 },
  identity: { marginTop: 16, color: colors.grayMuted, fontSize: 11, fontWeight: '600' },
  identityDivider: { color: colors.brown, fontWeight: '700' },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '700', letterSpacing: -0.25 },
  desktopSectionTitle: { fontSize: 19 },
  startSection: { marginBottom: 34 },
  startHeading: { marginBottom: 13 },
  sectionHint: { marginTop: 4, color: colors.grayMuted, fontSize: 12 },
  desktopStartGrid: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
  startCard: { minHeight: 74, flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.border },
  desktopStartCard: { flex: 1, minWidth: 0, minHeight: 96, paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 0 },
  desktopStartCardDivider: { borderLeftWidth: 1, borderLeftColor: colors.border },
  startNumber: { width: 24, color: colors.brown, fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  startCopy: { flex: 1, minWidth: 0 },
  startTitle: { color: colors.text, fontSize: 13, fontWeight: '700' },
  startDetail: { marginTop: 4, color: colors.grayMuted, fontSize: 11, lineHeight: 16 },
  startArrow: { color: colors.brown, fontSize: 17 },
  dashboardGrid: { gap: 28 },
  desktopDashboardGrid: { gap: 36 },
  wideDashboardGrid: { flexDirection: 'row', gap: 32 },
  dashboardColumn: { minWidth: 0 },
  wideDashboardColumn: { flex: 1 },
  panelEyebrow: { marginBottom: 5, color: colors.brown, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  panelDate: { color: colors.grayMuted, fontSize: 11 },
  attendanceCard: {
    padding: 17,
    marginTop: 11,
    borderRadius: 5,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  attendanceTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  attendanceBadges: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  attendanceLabel: { color: colors.grayMuted, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  notConnectedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
    backgroundColor: colors.yellowLight,
  },
  notConnectedText: { color: colors.yellowDeep, fontSize: 9, fontWeight: '700' },
  demoLabel: { color: colors.grayMuted, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  lateBadge: { backgroundColor: colors.grayLight },
  lateText: { color: colors.danger },
  punchList: { marginTop: 13 },
  punchRow: { minHeight: 31, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.grayLight },
  punchLabel: { flex: 1, color: colors.grayMuted, fontSize: 11, fontWeight: '600' },
  punchTime: { color: colors.text, fontSize: 12, fontWeight: '600' },
  punchTotalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 11, borderTopWidth: 1, borderTopColor: colors.border },
  punchTotalLabel: { color: colors.mutedText, fontSize: 11 },
  punchTotalValue: { color: colors.brown, fontSize: 14, fontWeight: '700' },
  attendanceAction: { flexDirection: 'row', alignItems: 'center', marginTop: 16, paddingTop: 13, borderTopWidth: 1, borderTopColor: colors.border },
  attendanceActionText: { color: colors.brown, fontSize: 12, fontWeight: '700' },
  attendanceArrow: { marginLeft: 7, color: colors.brown, fontSize: 15 },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 51,
    marginBottom: 11,
  },
  milestoneHeading: { justifyContent: 'flex-start' },
  milestonesCard: {
    padding: 16,
    borderRadius: 5,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  desktopMilestonesCard: { padding: 18 },
  milestoneColumns: { flexDirection: 'row', alignItems: 'stretch', gap: 14 },
  mobileMilestoneColumns: { flexDirection: 'column', gap: 12 },
  milestoneColumn: { flex: 1, minWidth: 0, gap: 8 },
  milestoneDivider: { width: 1, backgroundColor: colors.border },
  mobileMilestoneDivider: { width: '100%', height: 1 },
  milestoneTitle: { marginBottom: 3, color: colors.text, fontSize: 12, fontWeight: '700' },
  milestoneDescription: { color: colors.text, fontSize: 11, lineHeight: 17 },
  milestoneDate: { color: colors.grayMuted, fontSize: 10 },
  guideHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 30,
    paddingTop: 21,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  mobileGuideHeadingRow: { flexWrap: 'wrap', alignItems: 'flex-start' },
  guideCopy: { flex: 1, minWidth: 210, gap: 5 },
  guideDescription: { color: colors.grayMuted, fontSize: 12, lineHeight: 18 },
  helpButton: {
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 13,
    borderRadius: 4,
    backgroundColor: colors.yellowLight,
  },
  helpButtonText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  ticketButton: {
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 13,
    borderRadius: 4,
    backgroundColor: colors.brown,
  },
  ticketButtonText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  pressed: { opacity: 0.8 },
  footer: { marginTop: 25, color: colors.grayMuted, fontSize: 10, lineHeight: 15 },
});
