import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  getDemoAbsenceDates,
  getDemoAbsenceForKey,
  getDemoMonthlyLateSummary,
  getRecentDemoAttendance,
  isRestDay,
} from '@/data/demo-data';
import { getHolidays, type Holiday } from '@/data/holidays';
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
 
  const overByLabel: Record<string, number> = recentAttendance
    ? {
        'Check in': recentAttendance.lateByMinutes,
        'Lunch in': recentAttendance.lunchOverMinutes,
        'Afternoon break in': recentAttendance.breakOverMinutes,
      }
    : {};
  const lateParts = recentAttendance
    ? [
        { label: 'Arrival', mins: recentAttendance.lateByMinutes },
        { label: 'Lunch', mins: recentAttendance.lunchOverMinutes },
        { label: 'Break', mins: recentAttendance.breakOverMinutes },
      ].filter((part) => part.mins > 0)
    : [];

  const pendingCount = applications.filter((item) => item.status === 'Pending').length;
  const payday = nextPayday(today);
  const paydayText = payday.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const paydayCaption =
    payday.days === 0 ? 'Today' : payday.days === 1 ? 'Tomorrow' : `In ${payday.days} days`;
  const vacation = demoLeaveBalances.find((item) => item.type === 'Vacation Leave');
  const vacationLeft = vacation ? (Number(vacation.total) - Number(vacation.used)).toFixed(1) : '—';
  const lateSummary = getDemoMonthlyLateSummary(today);
  const absenceTotal = lateSummary.silDays + lateSummary.lwopDays;

  
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
    ...getDemoAbsenceDates(calendarMonth),
    ...applications.map((item) => item.submittedAt),
  ];
  const todayKey = dateKey(today);
  const milestones = getDemoMilestones(today);
  const milestoneCount = isWide ? 12 : isDesktop ? 6 : 5;

  
  const agendaYears = Array.from(new Set([...holidayYears, today.getFullYear(), today.getFullYear() + 1]));
  const holidayIndex = new Map<string, Holiday[]>();
  agendaYears
    .flatMap((year) => getHolidays(year))
    .forEach((holiday) => {
      holidayIndex.set(holiday.date, [...(holidayIndex.get(holiday.date) ?? []), holiday]);
    });
  const paydaySet = new Set([...paydaysAround(calendarMonth), ...paydaysAround(today)].map(dateKey));
  const eventsOn = (key: string): AgendaEvent[] => {
    const absence = getDemoAbsenceForKey(key);
    const [y, m, d] = key.split('-').map(Number);
    const restDay = isRestDay(new Date(y, m - 1, d));
    return [
   
      restDay
        ? { label: 'Rest day', note: 'No scheduled shift' }
        : { label: 'Work shift', note: '8:30 AM – 5:30 PM' },
      ...(holidayIndex.get(key) ?? []).map((holiday) => ({
        label: holiday.name,
        note: `${holiday.scope} · ${holiday.kind}`,
      })),
      ...(paydaySet.has(key) ? [{ label: 'Payday', note: '' }] : []),
      ...(absence
        ? [
            absence === 'SIL'
              ? { label: 'Absent · Service Incentive Leave', note: 'Paid absence' }
              : { label: 'Absent · Leave without pay', note: 'Unpaid absence', alert: true },
          ]
        : []),
      ...applications
        .filter((item) => item.submittedAt === key)
        .map((item) => ({ label: `${item.type} request`, note: item.status })),
    ];
  };
  // Upcoming follows the selected date: it shows the day after whatever is picked
  const upcomingBase = selectedDate ?? today;
  const upcomingIsToday = dateKey(upcomingBase) === todayKey;
  const upcomingLabels = [upcomingIsToday ? 'Tomorrow' : 'Next day'];
  const upcomingDays = upcomingLabels.map((label, index) => {
    const date = new Date(upcomingBase.getFullYear(), upcomingBase.getMonth(), upcomingBase.getDate() + index + 1);
    const key = dateKey(date);
    return { label, key, events: eventsOn(key) };
  });
  // The events box follows the selected date (today when nothing is selected)
  const shownKey = dateKey(upcomingBase);
  const shownIsToday = upcomingIsToday;
  const shownEvents = eventsOn(shownKey);

  const summaryLine = [
    pendingCount > 0
      ? `You have ${pendingCount} pending request${pendingCount === 1 ? '' : 's'} awaiting approval.`
      : 'You have no pending requests.',
    `Next payday is ${paydayText}.`,
    lateSummary.lateMinutes > 0
      ? `${lateSummary.lateMinutes} late minute${lateSummary.lateMinutes === 1 ? '' : 's'} so far this month.`
      : 'No late minutes this month.',
  ].join(' ');

  const tiles = [
    { label: 'Pending requests', value: String(pendingCount), caption: 'Review applications', route: '/applications', alert: false },
    { label: 'Next payday', value: paydayText, caption: paydayCaption, route: '/inquiry/pay-slip', alert: false },
    { label: 'Vacation leave left', value: vacationLeft, caption: 'days this year', route: '/inquiry/leave-balances', alert: false },
    {
      label: 'Late this month',
      value: String(lateSummary.lateDays),
      caption: `${lateSummary.lateDays === 1 ? 'day' : 'days'} · ${lateSummary.lateMinutes} min`,
      route: '/attendance',
      alert: lateSummary.sanctionThresholdReached,
    },
    {
      label: 'Absences this month',
      value: String(absenceTotal),
      caption: `${lateSummary.silDays} paid · ${lateSummary.lwopDays} unpaid`,
      route: '/attendance',
      alert: false,
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
        </View>

       
        {lateSummary.sanction ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open attendance and DTR"
            onPress={() => router.push('/attendance')}
            style={({ pressed }) => [styles.notice, pressed && styles.pressed]}
          >
            <View style={styles.noticeAccent} />
            <View style={styles.noticeCopy}>
              <Text style={styles.noticeTitle}>Attendance notice · {lateSummary.sanction}</Text>
              <Text style={styles.noticeText}>
                You passed the monthly lateness limit (12 late days or 120 minutes). Tap to review your record.
              </Text>
            </View>
            <Text style={styles.noticeArrow}>→</Text>
          </Pressable>
        ) : null}

     
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
              <Text style={[styles.tileValue, tile.alert && styles.tileValueAlert]}>{tile.value}</Text>
              <Text style={styles.tileCaption}>{tile.caption}</Text>
            </Pressable>
          ))}
        </View>

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
                    <Text style={styles.lateText}>Late {recentAttendance.totalLateMinutes} min</Text>
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
              {lateParts.length ? (
                <View style={styles.chipRow}>
                  {lateParts.map((part) => (
                    <View key={part.label} style={styles.chip}>
                      <Text style={styles.chipText}>{part.label} +{part.mins}m</Text>
                    </View>
                  ))}
                </View>
              ) : null}
              <View style={styles.punchList}>
                {recentAttendance?.punches.map((punch) => (
                  <PunchRow
                    key={punch.label}
                    label={punch.label}
                    time={punch.time}
                    over={overByLabel[punch.label] ?? 0}
                    styles={styles}
                  />
                ))}
              </View>

              <View style={styles.monthStrip}>
                <View style={styles.monthStat}>
                  <Text style={[styles.monthValue, lateSummary.sanctionThresholdReached && styles.monthValueAlert]}>
                    {lateSummary.lateMinutes}
                  </Text>
                  <Text style={styles.monthLabel}>Late min</Text>
                </View>
                <View style={styles.monthDivider} />
                <View style={styles.monthStat}>
                  <Text style={styles.monthValue}>{lateSummary.silDays}</Text>
                  <Text style={styles.monthLabel}>Paid leave</Text>
                </View>
                <View style={styles.monthDivider} />
                <View style={styles.monthStat}>
                  <Text style={[styles.monthValue, lateSummary.lwopDays > 0 && styles.monthValueAlert]}>
                    {lateSummary.lwopDays}
                  </Text>
                  <Text style={styles.monthLabel}>Unpaid</Text>
                </View>
              </View>
              <Text style={styles.monthCaption}>This month so far</Text>

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
                    <View style={styles.announcementChip}>
                      <Text style={styles.announcementCategory}>{item.category}</Text>
                    </View>
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

      
        <View style={[styles.columns, isDesktop && styles.desktopColumns]}>
          <View style={[styles.column, isDesktop && styles.desktopColumn]}>
            <View style={styles.columnHeading}>
              <View>
                <Text style={styles.eyebrow}>CALENDAR</Text>
                <Text style={[styles.sectionTitle, isDesktop && styles.desktopSectionTitle]}>Paydays, absences & requests</Text>
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
              <View style={styles.eventsSection}>
                <Text style={styles.eventsDate}>
                  {formatDemoDate(shownKey, { weekday: 'long', month: 'long', day: 'numeric' })}
                </Text>
                <Text style={styles.eventsTitle}>{shownIsToday ? 'Today’s events' : 'Events'}</Text>
                <EventList events={shownEvents} styles={styles} />
              </View>

              <View style={[styles.eventsSection, styles.upcomingSection]}>
                <Text style={styles.eyebrow}>UPCOMING</Text>
                {upcomingDays.map((day) => (
                  <View key={day.key} style={styles.upcomingDay}>
                    <View style={styles.upcomingHead}>
                      <Text style={styles.upcomingLabel}>{day.label}</Text>
                      <Text style={styles.upcomingDate}>
                        {formatDemoDate(day.key, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                    <EventList events={day.events} styles={styles} />
                  </View>
                ))}
              </View>
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
                  items={milestones.birthdays.slice(0, milestoneCount).map((m) => ({ name: m.name, note: m.date, past: m.past }))}
                />
              </View>
              <View style={[styles.milestoneDivider, isWide && styles.milestoneDividerVertical]} />
              <View style={styles.milestoneCol}>
                <MilestoneGroup
                  title="Work anniversaries"
                  styles={styles}
                  items={milestones.anniversaries.slice(0, milestoneCount).map((m) => ({
                    name: m.name,
                    note: `${m.years} yr${m.years === 1 ? '' : 's'} · ${m.date}`,
                    past: m.past,
                  }))}
                />
              </View>
            </View>
          </View>
        </View>

   
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

type AgendaEvent = { label: string; note: string; alert?: boolean };

function EventList({ events, styles }: { events: AgendaEvent[]; styles: ReturnType<typeof createStyles> }) {
  if (!events.length) return <Text style={styles.eventsEmpty}>Nothing scheduled.</Text>;
  return (
    <View>
      {events.map((event, index) => (
        <View key={`${event.label}-${index}`} style={styles.eventRow}>
          <View style={[styles.eventDot, event.alert && styles.eventDotAlert]} />
          <View style={styles.eventCopy}>
            <Text style={styles.eventLabel}>{event.label}</Text>
            {event.note ? <Text style={styles.eventNote}>{event.note}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

function PunchRow({
  label,
  time,
  over,
  styles,
}: {
  label: string;
  time: string;
  over: number;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.punchRow}>
      <Text style={styles.punchLabel}>{label}</Text>
      {over > 0 ? <Text style={styles.punchOver}>+{over}m</Text> : null}
      <Text style={[styles.punchTime, over > 0 && styles.punchTimeLate]}>{time}</Text>
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
      {items.map((item) => (
        <View key={item.name} style={[styles.milestoneRow, item.past && styles.milestonePast]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(item.name)}</Text>
          </View>
          <Text style={styles.milestoneName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.milestoneNote}>{item.note}</Text>
        </View>
      ))}
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof getPaletteForScheme>) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', padding: 20, paddingBottom: 40 },
  desktopContent: { alignSelf: 'center', maxWidth: 1320, padding: 42, paddingBottom: 60 },


  heroWrap: { marginBottom: 16, zIndex: 20, elevation: 20 },
  desktopHeroWrap: { marginBottom: 20 },
  hero: { padding: 22, borderRadius: 6, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  desktopHero: { padding: 34 },
  introMeta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  heroEyebrow: { color: '#7A2E24', fontSize: 11, fontWeight: '800', letterSpacing: 1.1 },
  heroDate: { color: 'rgba(43,33,24,0.7)', fontSize: 12, fontWeight: '600' },
  heroTitle: { marginTop: 18, color: '#2B2118', fontSize: 28, fontWeight: '700', letterSpacing: -0.6 },
  desktopHeroTitle: { fontSize: 38, letterSpacing: -1 },
  heroSummary: { maxWidth: 680, marginTop: 8, color: 'rgba(43,33,24,0.85)', fontSize: 14, lineHeight: 21 },


  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingVertical: 14,
    paddingRight: 16,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noticeAccent: { alignSelf: 'stretch', width: 4, backgroundColor: colors.danger },
  noticeCopy: { flex: 1, minWidth: 0 },
  noticeTitle: { color: colors.danger, fontSize: 13, fontWeight: '800' },
  noticeText: { marginTop: 3, color: colors.grayDark, fontSize: 12, lineHeight: 18 },
  noticeArrow: { color: colors.danger, fontSize: 18 },


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
  mobileTile: { flexBasis: '47%', flexGrow: 1 },
  tileLabel: { color: colors.grayMuted, fontSize: 11, fontWeight: '700' },
  tileValue: { marginTop: 8, color: colors.text, fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },
  tileValueAlert: { color: colors.danger },
  tileCaption: { marginTop: 3, color: colors.grayMuted, fontSize: 11 },


  section: { marginBottom: 32 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '700', letterSpacing: -0.25 },
  desktopSectionTitle: { fontSize: 21 },
  eyebrow: { marginBottom: 5, color: colors.brown, fontSize: 11, fontWeight: '800', letterSpacing: 1 },


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
  lateText: { color: colors.danger, fontSize: 12, fontWeight: '700' },
  onTimeBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 3, backgroundColor: colors.yellowLight },
  onTimeText: { color: colors.brownDark, fontSize: 12, fontWeight: '700' },
  progressTrack: { height: 8, marginTop: 14, borderRadius: 4, overflow: 'hidden', backgroundColor: colors.grayLight },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: colors.brown },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 3, backgroundColor: colors.grayLight },
  chipText: { color: colors.danger, fontSize: 11, fontWeight: '700' },
  punchList: { marginTop: 12 },
  punchRow: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: colors.grayLight },
  punchLabel: { flex: 1, color: colors.grayMuted, fontSize: 12, fontWeight: '600' },
  punchOver: { color: colors.danger, fontSize: 11, fontWeight: '700' },
  punchTime: { color: colors.text, fontSize: 13, fontWeight: '600' },
  punchTimeLate: { color: colors.danger },


  monthStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 4,
    backgroundColor: colors.background,
  },
  monthStat: { flex: 1, alignItems: 'center' },
  monthValue: { color: colors.text, fontSize: 20, fontWeight: '700' },
  monthValueAlert: { color: colors.danger },
  monthLabel: { marginTop: 2, color: colors.grayMuted, fontSize: 11, fontWeight: '600' },
  monthDivider: { width: 1, height: 28, backgroundColor: colors.border },
  monthCaption: { marginTop: 6, color: colors.grayMuted, fontSize: 11, textAlign: 'center' },

  cardAction: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  cardActionText: { color: colors.brown, fontSize: 13, fontWeight: '700' },
  cardActionArrow: { marginLeft: 7, color: colors.brown, fontSize: 15 },

  milestoneTitle: { marginBottom: 6, color: colors.text, fontSize: 13, fontWeight: '700' },
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

  milestoneCol: { flex: 1, minWidth: 0 },

  announcement: { paddingVertical: 4 },
  announcementDivider: { marginTop: 12, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border },
  announcementMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  announcementChip: { flexShrink: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 3, backgroundColor: colors.yellowLight },
  announcementCategory: { color: colors.brownDark, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  announcementDate: { color: colors.grayMuted, fontSize: 11 },
  announcementTitle: { marginTop: 8, color: colors.text, fontSize: 15, fontWeight: '700', lineHeight: 21 },
  viewDetails: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginTop: 8, minHeight: 28 },
  linkText: { color: colors.brown, fontSize: 12, fontWeight: '700' },
  eventsBox: {
    marginTop: 12,
    padding: 16,
    borderRadius: 5,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventsSection: { gap: 2 },
  eventsDate: { color: colors.grayMuted, fontSize: 11, fontWeight: '600' },
  eventsTitle: { marginTop: 2, marginBottom: 4, color: colors.text, fontSize: 16, fontWeight: '700' },
  eventsEmpty: { marginTop: 4, color: colors.grayMuted, fontSize: 12 },
  eventRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginTop: 8 },
  eventDot: { width: 8, height: 8, marginTop: 4, borderRadius: 4, backgroundColor: colors.brown },
  eventDotAlert: { backgroundColor: colors.danger },
  eventCopy: { flex: 1, minWidth: 0 },
  eventLabel: { color: colors.text, fontSize: 13, fontWeight: '600' },
  eventNote: { marginTop: 1, color: colors.grayMuted, fontSize: 11 },
  upcomingSection: { marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border },
  upcomingDay: { marginTop: 12 },
  upcomingHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  upcomingLabel: { color: colors.text, fontSize: 13, fontWeight: '700' },
  upcomingDate: { color: colors.grayMuted, fontSize: 11 },

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
  footer: { marginTop: 24, color: colors.grayMuted, fontSize: 11, lineHeight: 15 },
});
