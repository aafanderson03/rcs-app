import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NotificationBell } from '@/components/notification-bell';
import { PortalCalendar } from '@/components/portal-ui';
import { ResponsiveText as Text } from '@/components/responsive-text';
import { getCompanyBranding } from '@/constants/company-branding';
import { getPaletteForScheme } from '@/constants/theme';
import { useAuth, type EmployeeType } from '@/contexts/auth-context';
import { useDemoSubmissions } from '@/contexts/demo-submissions-context';
import { useAppTheme } from '@/contexts/theme-context';
import {
  dateKey,
  demoAnnouncements,
  demoLeaveBalances,
  formatDemoDate,
  formatDemoDuration,
  getDemoMonthlyLateSummary,
  getRecentDemoAttendance,
} from '@/data/demo-data';
import { getHolidays } from '@/data/holidays';
import { getDemoMilestones } from '@/data/milestones';

const workspaceContent: Record<EmployeeType, {
  links: { label: string; detail: string; route: string }[];
}> = {
  employee: {
    links: [
      { label: 'Attendance & DTR', detail: 'Review attendance and time records', route: '/attendance' },
      { label: 'Applications', detail: 'Submit or follow up on a request', route: '/applications' },
      { label: 'Employee inquiry', detail: 'Open your profile and balances', route: '/inquiry/basic-profile' },
    ],
  },
  merchandiser: {
    links: [
      { label: 'Attendance & DTR', detail: 'Review your attendance record', route: '/attendance' },
      { label: 'Announcements', detail: 'Read the latest team updates', route: '/announcements' },
      { label: 'Help & guides', detail: 'Find instructions for common requests', route: '/help' },
    ],
  },
  guard: {
    links: [
      { label: 'Attendance & DTR', detail: 'Review your attendance record', route: '/attendance' },
      { label: 'Announcements', detail: 'Read the latest team updates', route: '/announcements' },
      { label: 'Help & guides', detail: 'Find instructions for common requests', route: '/help' },
    ],
  },
  subcontractor: {
    links: [
      { label: 'Applications', detail: 'Submit or follow up on a request', route: '/applications' },
      { label: 'Announcements', detail: 'Read the latest company updates', route: '/announcements' },
      { label: 'Help & guides', detail: 'Find instructions for common requests', route: '/help' },
    ],
  },
};

const routeGlyphs: Record<string, string> = {
  '/attendance': '◷',
  '/applications': '✎',
  '/inquiry/basic-profile': '☷',
  '/announcements': '✉',
  '/help': '?',
};

// Payday: the 20th (for the 1st–15th period) and the 5th (for the 16th–end period).
// A weekend payday moves to the Friday before.
function nextPayday(from: Date) {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const candidates: Date[] = [];
  for (let offset = -1; offset <= 2; offset += 1) {
    for (const day of [5, 20]) {
      const date = new Date(start.getFullYear(), start.getMonth() + offset, day);
      if (date.getDay() === 6) date.setDate(date.getDate() - 1);
      if (date.getDay() === 0) date.setDate(date.getDate() - 2);
      candidates.push(date);
    }
  }
  const next = candidates.filter((date) => date >= start).sort((a, b) => a.getTime() - b.getTime())[0];
  const days = Math.round((next.getTime() - start.getTime()) / 86400000);
  return { date: next, days };
}

// Paydays in the month before, of, and after the given month (for calendar markers)
function paydaysAround(month: Date) {
  const days: Date[] = [];
  for (let offset = -1; offset <= 1; offset += 1) {
    for (const day of [5, 20]) {
      const date = new Date(month.getFullYear(), month.getMonth() + offset, day);
      if (date.getDay() === 6) date.setDate(date.getDate() - 1);
      if (date.getDay() === 0) date.setDate(date.getDate() - 2);
      days.push(date);
    }
  }
  return days;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { applications } = useDemoSubmissions();
  const { colorScheme } = useAppTheme();
  const colors = useMemo(() => getPaletteForScheme(colorScheme), [colorScheme]);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 960;
  const isMobile = width < 600;
  const isWide = isDesktop && width >= 1200; // room for birthdays and anniversaries side by side
  const employeeType = user?.employeeType ?? 'employee';
  const workspace = workspaceContent[employeeType];
  const companyBranding = getCompanyBranding(user?.company.slug, user?.company.name);

  // Computed on render, so it stays correct if the app is left open past midnight
  const today = new Date();
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const formattedDate = today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const firstName = user?.displayName?.trim().split(/\s+/)[0] ?? '';

  const recentAttendance = getRecentDemoAttendance();
  const recentAttendanceDate = recentAttendance
    ? formatDemoDate(recentAttendance.date, { weekday: 'short', month: 'short', day: 'numeric' })
    : '';
  const lastAttendanceWasYesterday = recentAttendance
    ? recentAttendance.date === dateKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1))
    : false;
  const hoursRatio = recentAttendance
    ? Math.min(1, recentAttendance.paidMinutes / recentAttendance.scheduledPaidMinutes)
    : 0;

  const pendingCount = applications.filter((item) => item.status === 'Pending').length;
  const payday = nextPayday(today);
  const paydayText = payday.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const paydayCaption =
    payday.days === 0 ? 'Today' : payday.days === 1 ? 'Tomorrow' : `In ${payday.days} days`;
  const vacation = demoLeaveBalances.find((item) => item.type === 'Vacation Leave');
  const vacationLeft = vacation ? (Number(vacation.total) - Number(vacation.used)).toFixed(1) : '—';
  const lateSummary = getDemoMonthlyLateSummary(today);

  // Calendar: paydays and request activity
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => today);
  const paydays = paydaysAround(calendarMonth).map(dateKey);
  const holidayYears = Array.from(
    new Set(
      [-1, 0, 1].map((offset) => new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + offset, 1).getFullYear())
    )
  );
  const holidays = holidayYears.flatMap((year) => getHolidays(year));
  const markedDates = [
    ...paydays,
    ...holidays.map((holiday) => holiday.date),
    ...applications.map((item) => item.submittedAt),
  ];
  const selectedKey = selectedDate ? dateKey(selectedDate) : '';
  const todayKey = dateKey(today);
  const milestones = getDemoMilestones(today);
  // Events (holidays, payday, requests) for any date key
  const todayHolidays = [...getHolidays(today.getFullYear()), ...getHolidays(today.getFullYear() + 1)];
  const todayPaydays = paydaysAround(today).map(dateKey);
  const eventsFor = (key: string) => [
    ...[...holidays, ...todayHolidays]
      .filter((holiday, i, all) => holiday.date === key && all.findIndex((h) => h.date === holiday.date && h.name === holiday.name) === i)
      .map((holiday) => ({ label: holiday.name, note: `${holiday.scope} holiday` })),
    ...(paydays.includes(key) || todayPaydays.includes(key) ? [{ label: 'Payday', note: '' }] : []),
    ...applications
      .filter((item) => item.submittedAt === key)
      .map((item) => ({ label: `${item.type} request`, note: item.status })),
  ];
  const calendarEvents = eventsFor(selectedKey);
  const selectedIsToday = selectedKey === todayKey;

  const summaryLine = [
    pendingCount > 0
      ? `You have ${pendingCount} pending request${pendingCount === 1 ? '' : 's'} awaiting approval.`
      : 'You have no pending requests.',
    `Next payday is ${paydayText}.`,
  ].join(' ');

  const tiles = [
    { label: 'Pending requests', value: String(pendingCount), caption: 'Review applications', route: '/applications' },
    { label: 'Next payday', value: paydayText, caption: paydayCaption, route: '/inquiry/pay-slip' },
    { label: 'Vacation leave left', value: vacationLeft, caption: 'days this year', route: '/inquiry/leave-balances' },
    {
      label: 'Late this month',
      value: String(lateSummary.lateDays),
      caption: lateSummary.lateDays === 1 ? 'day' : 'days',
      route: '/attendance',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={[styles.content, isDesktop && styles.desktopContent]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.heroWrap, isDesktop && styles.desktopHeroWrap]}>
        <LinearGradient
          colors={[colors.yellow, '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, isDesktop && styles.desktopHero]}
        >
          <View style={styles.introMeta}>
            <Text style={styles.heroEyebrow}>{companyBranding.name.toUpperCase()} / EMPLOYEE PORTAL</Text>
            <Text style={styles.heroDate}>{formattedDate}</Text>
          </View>
          <Text style={[styles.heroTitle, isDesktop && styles.desktopHeroTitle]}>
            {firstName ? `${greeting}, ${firstName}` : greeting}
          </Text>
          <Text style={styles.heroSummary}>{summaryLine}</Text>
        </LinearGradient>
        <View style={styles.bellSlot}>
          <NotificationBell />
        </View>
        </View>

        {/* At a glance */}
        <View style={[styles.tiles, isMobile && styles.mobileTiles]}>
          {tiles.map((tile) => (
            <Pressable
              key={tile.label}
              accessibilityRole="button"
              accessibilityLabel={`${tile.label}: ${tile.value} ${tile.caption}`}
              onPress={() => router.push(tile.route as never)}
              style={({ pressed }) => [styles.tile, isMobile && styles.mobileTile, pressed && styles.pressed]}
            >
              <Text style={styles.tileLabel}>{tile.label}</Text>
              <Text style={styles.tileValue}>{tile.value}</Text>
              <Text style={styles.tileCaption}>{tile.caption}</Text>
            </Pressable>
          ))}
        </View>

        {/* Quick access */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDesktop && styles.desktopSectionTitle]}>Quick access</Text>
          <View style={[styles.quickGrid, isDesktop && styles.desktopQuickGrid]}>
            {workspace.links.map((item) => (
              <Pressable
                key={item.label}
                accessibilityRole="link"
                onPress={() => router.push(item.route as never)}
                style={({ pressed }) => [styles.quickCard, isDesktop && styles.desktopQuickCard, pressed && styles.pressed]}
              >
                <View style={styles.quickIcon}>
                  <Text style={styles.quickGlyph}>{routeGlyphs[item.route] ?? '•'}</Text>
                </View>
                <View style={styles.quickCopy}>
                  <Text style={styles.quickTitle}>{item.label}</Text>
                  <Text style={styles.quickDetail}>{item.detail}</Text>
                </View>
                <Text style={styles.quickArrow}>→</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Attendance | Announcements + calendar */}
        <View style={[styles.columns, isDesktop && styles.desktopColumns]}>
          <View style={[styles.column, isDesktop && styles.desktopColumn]}>
            <View style={styles.columnHeading}>
              <View>
                <Text style={styles.eyebrow}>ATTENDANCE</Text>
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
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.hoursValue}>{recentAttendance?.totalWorked ?? '—'}</Text>
                  <Text style={styles.hoursCaption}>
                    {recentAttendance
                      ? `of ${formatDemoDuration(recentAttendance.scheduledPaidMinutes)} scheduled`
                      : 'No record'}
                  </Text>
                </View>
                {recentAttendance?.status === 'Late' ? (
                  <View style={styles.lateBadge}>
                    <Text style={styles.lateText}>Late {recentAttendance.lateByMinutes} min</Text>
                  </View>
                ) : recentAttendance ? (
                  <View style={styles.onTimeBadge}>
                    <Text style={styles.onTimeText}>On time</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${hoursRatio * 100}%` }]} />
              </View>
              <View style={styles.punchList}>
                {recentAttendance?.punches.map((punch) => (
                  <PunchRow key={punch.label} label={punch.label} time={punch.time} />
                ))}
              </View>
              <View style={styles.cardAction}>
                <Text style={styles.cardActionText}>View attendance record</Text>
                <Text style={styles.cardActionArrow}>→</Text>
              </View>
            </Pressable>
          </View>

          <View style={[styles.column, isDesktop && styles.desktopColumn]}>
            <View style={styles.columnHeading}>
              <View>
                <Text style={styles.eyebrow}>NEWS</Text>
                <Text style={[styles.sectionTitle, isDesktop && styles.desktopSectionTitle]}>Announcements</Text>
              </View>
              <Pressable accessibilityRole="link" onPress={() => router.push('/announcements')} hitSlop={8}>
                <Text style={styles.linkText}>View all →</Text>
              </Pressable>
            </View>
            <View style={styles.card}>
              {demoAnnouncements.slice(0, 3).map((item, index) => (
                <View key={item.id} style={[styles.announcement, index > 0 && styles.announcementDivider]}>
                  <View style={styles.announcementMeta}>
                    <Text style={styles.announcementCategory}>{item.category}</Text>
                    <Text style={styles.announcementDate}>
                      {formatDemoDate(item.date, { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                  <Text style={styles.announcementTitle}>{item.title}</Text>
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel={`View details: ${item.title}`}
                    onPress={() => router.push('/announcements')}
                    hitSlop={8}
                    style={styles.viewDetails}
                  >
                    <Text style={styles.cardActionText}>View Details</Text>
                    <Text style={styles.cardActionArrow}>→</Text>
                  </Pressable>
                </View>
              ))}
            </View>

          </View>
        </View>

        {/* Calendar | Milestones */}
        <View style={[styles.columns, isDesktop && styles.desktopColumns]}>
          <View style={[styles.column, isDesktop && styles.desktopColumn]}>
            <View style={styles.columnHeading}>
              <View>
                <Text style={styles.eyebrow}>CALENDAR</Text>
                <Text style={[styles.sectionTitle, isDesktop && styles.desktopSectionTitle]}>Paydays & requests</Text>
              </View>
            </View>
            <PortalCalendar
              month={calendarMonth}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onChangeMonth={(amount, clearSelection = true) => {
                setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() + amount, 1));
                if (clearSelection) setSelectedDate(null);
              }}
              onGoToday={() => {
                setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                setSelectedDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
              }}
              markedDates={markedDates}
            />
            <View style={styles.eventsBox}>
              <Text style={styles.eventsDate}>
                {selectedDate
                  ? formatDemoDate(selectedKey, { weekday: 'long', month: 'long', day: 'numeric' })
                  : 'Select a date'}
              </Text>
              {selectedDate ? (
                <Text style={styles.eventsHeading}>{selectedIsToday ? "Today's Events" : 'Events'}</Text>
              ) : null}
              {selectedDate && !calendarEvents.length ? (
                <Text style={styles.eventsEmpty}>Nothing scheduled.</Text>
              ) : null}
              {calendarEvents.map((event, index) => (
                <View key={`${event.label}-${index}`} style={styles.eventRow}>
                  <View style={styles.eventDot} />
                  <Text style={styles.eventLabel}>{event.label}</Text>
                  {event.note ? <Text style={styles.eventNote}>{event.note}</Text> : null}
                </View>
              ))}
            </View>
        </View>

          <View style={[styles.column, isDesktop && styles.desktopColumn]}>
            <View style={styles.columnHeading}>
              <View>
                <Text style={styles.eyebrow}>PEOPLE</Text>
                <Text style={[styles.sectionTitle, isDesktop && styles.desktopSectionTitle]}>Employee milestones</Text>
              </View>
            </View>
            <View style={[styles.card, isDesktop && styles.fillCard, isWide && styles.milestonesCard]}>
              <View style={styles.milestoneCol}>
                <MilestoneGroup
                  title="Birthdays"
                  styles={styles}
                  items={milestones.birthdays.map((m) => ({ name: m.name, note: m.date, past: m.past }))}
                />
              </View>
              <View style={[styles.milestoneDivider, isWide && styles.milestoneDividerVertical]} />
              <View style={styles.milestoneCol}>
                <MilestoneGroup
                  title="Work Anniversaries"
                  styles={styles}
                  items={milestones.anniversaries.map((m) => ({
                    name: m.name,
                    note: `${m.years} yr${m.years === 1 ? '' : 's'} · ${m.date}`,
                    past: m.past,
                  }))}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Support */}
        <View style={[styles.support, isMobile && styles.mobileSupport]}>
          <View style={styles.supportCopy}>
            <Text style={styles.supportTitle}>Here when you need us</Text>
            <Text style={styles.supportDescription}>
              Find request instructions or send a question to the support team.
            </Text>
          </View>
          <View style={styles.supportActions}>
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
        </View>

        <Text style={styles.footer}>Sample information · Not connected to company systems</Text>
      </ScrollView>
    </SafeAreaView>
  );
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

function MilestoneGroup({
  title,
  items,
  styles,
}: {
  title: string;
  items: { name: string; note: string; past?: boolean }[];
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View>
      <Text style={styles.milestoneTitle}>{title}</Text>
      <ScrollView
        style={styles.milestoneScroll}
        nestedScrollEnabled
        showsVerticalScrollIndicator
      >
        {items.map((item) => (
          <View key={item.name} style={[styles.milestoneRow, item.past && styles.milestonePast]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(item.name)}</Text>
            </View>
            <Text style={styles.milestoneName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.milestoneNote}>{item.note}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof getPaletteForScheme>) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', padding: 20, paddingBottom: 40 },
  desktopContent: { alignSelf: 'center', maxWidth: 1320, padding: 42, paddingBottom: 60 },

  // Hero banner
  heroWrap: { marginBottom: 16, zIndex: 20, elevation: 20 },
  desktopHeroWrap: { marginBottom: 20 },
  bellSlot: { position: 'absolute', top: 20, right: 20, zIndex: 30, elevation: 30 },
  hero: { padding: 22, borderRadius: 6, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  desktopHero: { padding: 34 },
  introMeta: { paddingRight: 56, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  heroEyebrow: { color: '#7A2E24', fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  heroDate: { color: 'rgba(0, 0, 0, 1)', fontSize: 12, fontWeight: '700' },
  heroTitle: { marginTop: 18, color: '#2B2118', fontSize: 28, fontWeight: '700', letterSpacing: -0.6 },
  desktopHeroTitle: { fontSize: 38, letterSpacing: -1 },
  heroSummary: { maxWidth: 620, marginTop: 8, color: 'rgba(43,33,24,0.85)', fontSize: 14, lineHeight: 21 },

  // At-a-glance tiles
  tiles: { flexDirection: 'row', gap: 12, marginBottom: 30 },
  mobileTiles: { flexWrap: 'wrap' },
  tile: {
    flex: 1,
    minWidth: 0,
    padding: 16,
    borderRadius: 5,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mobileTile: { flexBasis: '47%' },
  tileLabel: { color: colors.grayMuted, fontSize: 11, fontWeight: '700' },
  tileValue: { marginTop: 8, color: colors.text, fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },
  tileCaption: { marginTop: 3, color: colors.grayMuted, fontSize: 11 },

  // Sections
  section: { marginBottom: 32 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '700', letterSpacing: -0.25 },
  desktopSectionTitle: { fontSize: 21 },
  eyebrow: { marginBottom: 5, color: colors.brown, fontSize: 9, fontWeight: '800', letterSpacing: 1 },

  // Quick access
  quickGrid: { marginTop: 14, gap: 10 },
  desktopQuickGrid: { flexDirection: 'row', gap: 14 },
  quickCard: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 5,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  desktopQuickCard: { flex: 1, minWidth: 0 },
  quickIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    backgroundColor: colors.yellowLight,
  },
  quickGlyph: { color: colors.brown, fontSize: 19, fontWeight: '700' },
  quickCopy: { flex: 1, minWidth: 0 },
  quickTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  quickDetail: { marginTop: 3, color: colors.grayMuted, fontSize: 12, lineHeight: 17 },
  quickArrow: { color: colors.brown, fontSize: 18 },

  // Attendance + milestones
  columns: { gap: 28, marginBottom: 32 },
  desktopColumns: { flexDirection: 'row', gap: 32 },
  column: { minWidth: 0 },
  desktopColumn: { flex: 1 },
  columnHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 },
  panelDate: { color: colors.grayMuted, fontSize: 12 },
  card: {
    padding: 18,
    borderRadius: 5,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  hoursValue: { color: colors.text, fontSize: 30, fontWeight: '700', letterSpacing: -0.6 },
  hoursCaption: { marginTop: 2, color: colors.grayMuted, fontSize: 12 },
  lateBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 3, backgroundColor: colors.grayLight },
  lateText: { color: colors.danger, fontSize: 11, fontWeight: '700' },
  onTimeBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 3, backgroundColor: colors.yellowLight },
  onTimeText: { color: colors.brownDark, fontSize: 11, fontWeight: '700' },
  progressTrack: { height: 8, marginTop: 14, borderRadius: 4, overflow: 'hidden', backgroundColor: colors.grayLight },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: colors.brown },
  punchList: { marginTop: 12 },
  punchRow: { minHeight: 34, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.grayLight },
  punchLabel: { flex: 1, color: colors.grayMuted, fontSize: 12, fontWeight: '600' },
  punchTime: { color: colors.text, fontSize: 13, fontWeight: '600' },
  cardAction: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  cardActionText: { color: colors.brown, fontSize: 13, fontWeight: '700' },
  cardActionArrow: { marginLeft: 7, color: colors.brown, fontSize: 15 },

  milestoneTitle: { marginBottom: 6, color: colors.text, fontSize: 13, fontWeight: '700' },
  milestoneScroll: { maxHeight: 400, paddingRight: 4 },
  milestoneRow: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.yellowLight },
  avatarText: { color: colors.brown, fontSize: 10, fontWeight: '800' },
  milestoneName: { flex: 1, minWidth: 0, color: colors.text, fontSize: 12, fontWeight: '600' },
  milestoneNote: { color: colors.grayMuted, fontSize: 11 },
  milestoneDivider: { height: 1, marginVertical: 14, backgroundColor: colors.border },
  milestoneDividerVertical: { width: 1, height: 'auto', marginVertical: 0, marginHorizontal: 22 },
  milestonesCard: { flexDirection: 'row', alignItems: 'stretch' },
  fillCard: { flex: 1 },
  milestonePast: { opacity: 0.55 },

  holidaysTitle: { marginTop: 16, marginBottom: 6, color: colors.text, fontSize: 13, fontWeight: '700' },
  holidayRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  holidayDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  holidayDate: {
    width: 42,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: colors.yellowLight,
  },
  holidayDay: { color: colors.brown, fontSize: 16, fontWeight: '800' },
  holidayMonth: { color: colors.brown, fontSize: 9, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  holidayCopy: { flex: 1, minWidth: 0 },
  holidayName: { color: colors.text, fontSize: 13, fontWeight: '600' },
  holidayKind: { marginTop: 2, color: colors.grayMuted, fontSize: 11 },
  milestoneCol: { flex: 1, minWidth: 0 },

  announcement: { paddingVertical: 4 },
  announcementDivider: { marginTop: 12, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border },
  announcementMeta: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  announcementCategory: { color: colors.brown, fontSize: 9, fontWeight: '800', letterSpacing: 0.9 },
  announcementDate: { color: colors.grayMuted, fontSize: 11 },
  announcementTitle: { marginTop: 6, color: colors.text, fontSize: 15, fontWeight: '700', lineHeight: 21 },
  viewDetails: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginTop: 8, minHeight: 28 },
  linkText: { color: colors.brown, fontSize: 12, fontWeight: '700' },
  eventsBox: {
    marginTop: 10,
    padding: 16,
    borderRadius: 5,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventsDate: { color: colors.text, fontSize: 13, fontWeight: '700' },
  eventsHeading: { marginTop: 4, color: colors.brown, fontSize: 10, fontWeight: '800', letterSpacing: 0.9, textTransform: 'uppercase' },
  eventsSpacer: { height: 24 },
  upcomingDay: { paddingVertical: 10 },
  upcomingHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  upcomingTitle: { color: colors.text, fontSize: 12, fontWeight: '700' },
  eventsEmpty: { marginTop: 6, color: colors.grayMuted, fontSize: 12 },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  eventDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brown },
  eventLabel: { flex: 1, color: colors.text, fontSize: 12, fontWeight: '600' },
  eventNote: { color: colors.grayMuted, fontSize: 11 },

  // Support
  support: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    padding: 20,
    borderRadius: 5,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mobileSupport: { flexWrap: 'wrap', alignItems: 'flex-start' },
  supportCopy: { flex: 1, minWidth: 210, gap: 4 },
  supportTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  supportDescription: { color: colors.grayMuted, fontSize: 12, lineHeight: 18 },
  supportActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  helpButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 4, backgroundColor: colors.yellowLight },
  helpButtonText: { color: colors.text, fontSize: 13, fontWeight: '700' },
  ticketButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 4, backgroundColor: colors.brown },
  ticketButtonText: { color: colors.white, fontSize: 13, fontWeight: '700' },

  pressed: { opacity: 0.8 },
  footer: { marginTop: 24, color: colors.grayMuted, fontSize: 10, lineHeight: 15 },
});
