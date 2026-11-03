import { useMemo, useState } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';

import { PageHeading, PortalCalendar, PortalPage, PreviewNotice } from '@/components/portal-ui';
import { ResponsiveText as Text } from '@/components/responsive-text';
import { getPaletteForScheme, type RcsPalette } from '@/constants/theme';
import { useAppTheme } from '@/contexts/theme-context';
import {
  formatDemoDuration,
  getDemoAttendance,
  getDemoAttendanceDates,
  getDemoMonthlyLateSummary,
  getRecentDemoAttendance,
  isRestDay,
} from '@/data/demo-data';

const LATE_DAYS_LIMIT = 12;
const LATE_MINUTES_LIMIT = 120;

export default function AttendanceScreen() {
  const { colorScheme } = useAppTheme();
  const palette = getPaletteForScheme(colorScheme);
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 960;
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const recentAttendance = getRecentDemoAttendance();
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => recentAttendance ? new Date(`${recentAttendance.date}T00:00:00`) : new Date());
  const markedDates = getDemoAttendanceDates(visibleMonth);
  const selectedRecord = selectedDate ? getDemoAttendance(selectedDate) : null;
  const selectedIsRestDay = selectedDate ? isRestDay(selectedDate) : false;
  const monthlyLateSummary = selectedDate ? getDemoMonthlyLateSummary(selectedDate) : null;

  const changeMonth = (amount: number) => {
    setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + amount, 1));
    setSelectedDate(null);
  };

  const goToday = () => {
    const today = new Date();
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };


  const renderLateBar = (label: string, value: number, limit: number, unit: string) => {
    const reached = value >= limit;
    return (
      <View style={styles.barBlock}>
        <View style={styles.barHeader}>
          <Text style={styles.barLabel}>{label}</Text>
          <Text style={[styles.barValue, reached && styles.barValueReached]}>
            {value} / {limit} {unit}
          </Text>
        </View>
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              reached && styles.barFillReached,
              { width: `${Math.min(1, value / limit) * 100}%` },
            ]}
          />
        </View>
      </View>
    );
  };

  const renderRecord = () => {
    if (!selectedRecord) return null;

    if (selectedRecord.status === 'SIL' || selectedRecord.status === 'LWOP') {
      const isPaid = selectedRecord.status === 'SIL';
      return (
        <View style={styles.recordCard}>
          <View style={styles.recordHeader}>
            <View style={styles.recordHeaderCopy}>
              <Text style={styles.absenceTitle}>{isPaid ? 'Paid absence' : 'Unpaid absence'}</Text>
              <Text style={styles.hoursCaption}>
                {isPaid ? 'Service Incentive Leave' : 'Leave without pay (LWOP)'} · {selectedRecord.scheduledShift}
              </Text>
            </View>
            <View style={isPaid ? styles.onTimeBadge : styles.lateBadge}>
              <Text style={isPaid ? styles.onTimeBadgeText : styles.lateBadgeText}>
                {isPaid ? 'SIL · Paid' : 'LWOP · Unpaid'}
              </Text>
            </View>
          </View>
          <Text style={styles.absenceNote}>
            {isPaid
              ? `${formatDemoDuration(selectedRecord.paidMinutes)} credited and charged to your Service Incentive Leave balance. No punches are expected.`
              : 'No punches and no pay for this day. It is deducted on your payslip as LWOP (Unpaid Absence).'}
          </Text>
        </View>
      );
    }

    const overByLabel: Record<string, number> = {
      'Check in': selectedRecord.lateByMinutes,
      'Lunch in': selectedRecord.lunchOverMinutes,
      'Afternoon break in': selectedRecord.breakOverMinutes,
    };
    const hoursRatio = Math.min(1, selectedRecord.paidMinutes / selectedRecord.scheduledPaidMinutes);
    const isLate = selectedRecord.status === 'Late';

    return (
      <View style={styles.recordCard}>
        <View style={styles.recordHeader}>
          <View style={styles.recordHeaderCopy}>
            <Text style={styles.hoursValue}>{selectedRecord.totalWorked}</Text>
            <Text style={styles.hoursCaption}>
              of {formatDemoDuration(selectedRecord.scheduledPaidMinutes)} scheduled · {selectedRecord.scheduledShift}
            </Text>
          </View>
          <View style={isLate ? styles.lateBadge : styles.onTimeBadge}>
            <Text style={isLate ? styles.lateBadgeText : styles.onTimeBadgeText}>
              {isLate ? `Late ${selectedRecord.totalLateMinutes} min` : 'On time'}
            </Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${hoursRatio * 100}%` }]} />
        </View>
        <View style={styles.hoursMath}>
          <Text style={styles.hoursMathText}>
            Standard paid day: {formatDemoDuration(selectedRecord.scheduledPaidMinutes)}. The {formatDemoDuration(selectedRecord.unpaidLunchMinutes)} lunch is unpaid and does not reduce the daily target.
          </Text>
          <Text style={styles.hoursMathText}>
            The {formatDemoDuration(selectedRecord.paidBreakMinutes)} rest break is paid and already included. {selectedRecord.totalLateMinutes > 0
              ? `Subtract ${formatDemoDuration(selectedRecord.totalLateMinutes)} in late time/overages = ${selectedRecord.totalWorked} paid today.`
              : `No late time/overages were deducted, so ${selectedRecord.totalWorked} is paid today.`}
          </Text>
        </View>

        <View style={styles.punchList}>
          {selectedRecord.punches.map((punch) => {
            const over = overByLabel[punch.label] ?? 0;
            return (
              <View key={punch.label} style={styles.punchRow}>
                <View style={[styles.directionTag, punch.direction === 'IN' ? styles.tagIn : styles.tagOut]}>
                  <Text style={[styles.directionText, punch.direction === 'IN' ? styles.tagInText : styles.tagOutText]}>
                    {punch.direction}
                  </Text>
                </View>
                <Text style={styles.punchLabel}>{punch.label}</Text>
                {over > 0 ? <Text style={styles.overNote}>+{over}m</Text> : null}
                <Text style={[styles.punchTime, over > 0 && styles.punchTimeLate]}>{punch.time}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderLateness = () => {
    if (!monthlyLateSummary || !selectedDate) return null;
    const monthName = selectedDate.toLocaleDateString(undefined, { month: 'long' });
    return (
      <View style={styles.lateCard}>
        <View style={styles.lateHeader}>
          <Text style={styles.lateTitle}>Lateness · {monthName}</Text>
          {monthlyLateSummary.sanction ? (
            <View style={styles.sanctionPill}>
              <Text style={styles.sanctionText}>{monthlyLateSummary.sanction}</Text>
            </View>
          ) : null}
        </View>
        {renderLateBar('Late days', monthlyLateSummary.lateDays, LATE_DAYS_LIMIT, 'days')}
        {renderLateBar('Late minutes', monthlyLateSummary.lateMinutes, LATE_MINUTES_LIMIT, 'min')}
        <Text style={styles.lateCaption}>
          {monthlyLateSummary.sanctionThresholdReached
            ? 'Sanction threshold reached. Each further late day moves to the next sanction.'
            : `Sanctions start at ${LATE_DAYS_LIMIT} late days or ${LATE_MINUTES_LIMIT} late minutes in a month.`}
        </Text>
      </View>
    );
  };

  return (
    <PortalPage>
      <PageHeading
        title="Attendance & DTR"
        description="Browse your daily time record and attendance details by date."
      />
      <PreviewNotice>
        Fictional sample punches for presentation only. No employee attendance system is connected.
      </PreviewNotice>

      <View style={[styles.contentColumns, isDesktop && styles.desktopContentColumns]}>
        <View style={[styles.calendarColumn, isDesktop && styles.desktopCalendarColumn]}>
          <PortalCalendar
            month={visibleMonth}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onChangeMonth={changeMonth}
            onGoToday={goToday}
            markedDates={markedDates}
          />
          {isDesktop ? renderLateness() : null}
        </View>
        <View style={[styles.detailsColumn, isDesktop && styles.desktopDetailsColumn]}>
          <Text style={styles.eyebrow}>DAILY TIME RECORD</Text>
          <Text style={styles.detailsTitle}>
            {selectedDate
              ? selectedDate.toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Select a date'}
          </Text>
          {selectedRecord ? (
            <View style={styles.stack}>
              {renderRecord()}
              {!isDesktop ? renderLateness() : null}
            </View>
          ) : selectedIsRestDay ? (
            <View style={styles.noRecord}>
              <Text style={styles.restDayLabel}>REST DAY</Text>
              <Text style={styles.noRecordTitle}>Sunday is your rest day</Text>
              <Text style={styles.noRecordCopy}>No punches are expected on rest days.</Text>
            </View>
          ) : (
            <View style={styles.noRecord}>
              <Text style={styles.noRecordTitle}>No sample DTR for this date</Text>
              <Text style={styles.noRecordCopy}>
                Sample entries cover recent workdays (Monday through Saturday). Select a marked day to view punches.
              </Text>
            </View>
          )}
        </View>
      </View>
    </PortalPage>
  );
}

function createStyles(RcsColors: Record<keyof RcsPalette, string>) {
  return StyleSheet.create({
    contentColumns: { gap: 18 },
    desktopContentColumns: { flexDirection: 'row', alignItems: 'stretch', gap: 22 },
    calendarColumn: { minWidth: 0, gap: 14 },
    desktopCalendarColumn: { flex: 1.2 },
    detailsColumn: { minWidth: 0 },
    desktopDetailsColumn: { flex: 0.8 },
    stack: { gap: 14 },
    eyebrow: { marginTop: 4, color: RcsColors.brown, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
    detailsTitle: {
      marginTop: 4,
      marginBottom: 13,
      color: RcsColors.brownDark,
      fontSize: 18,
      fontWeight: '800',
    },


    recordCard: { padding: 18, borderRadius: 5, backgroundColor: RcsColors.surface, borderWidth: 1, borderColor: RcsColors.border },
    recordHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
    recordHeaderCopy: { flex: 1, minWidth: 0 },
    hoursValue: { color: RcsColors.text, fontSize: 30, fontWeight: '700', letterSpacing: -0.6 },
    hoursCaption: { marginTop: 2, color: RcsColors.grayMuted, fontSize: 12, lineHeight: 17 },
    lateBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 3, backgroundColor: RcsColors.grayLight },
    lateBadgeText: { color: RcsColors.danger, fontSize: 12, fontWeight: '700' },
    onTimeBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 3, backgroundColor: RcsColors.yellowLight },
    onTimeBadgeText: { color: RcsColors.brownDark, fontSize: 12, fontWeight: '700' },
    progressTrack: { height: 8, marginTop: 14, borderRadius: 4, overflow: 'hidden', backgroundColor: RcsColors.grayLight },
    progressFill: { height: '100%', borderRadius: 4, backgroundColor: RcsColors.brown },
    hoursMath: { gap: 5, marginTop: 12, padding: 11, borderRadius: 4, backgroundColor: RcsColors.grayLight },
    hoursMathText: { color: RcsColors.grayDark, fontSize: 12, lineHeight: 18 },

    absenceTitle: { color: RcsColors.text, fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
    absenceNote: { marginTop: 14, color: RcsColors.grayDark, fontSize: 13, lineHeight: 20 },

 
    punchList: { marginTop: 12 },
    punchRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: RcsColors.border },
    directionTag: { width: 36, paddingVertical: 3, alignItems: 'center', borderRadius: 3 },
    tagIn: { backgroundColor: RcsColors.yellowLight },
    tagOut: { backgroundColor: RcsColors.grayLight },
    directionText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
    tagInText: { color: RcsColors.brownDark },
    tagOutText: { color: RcsColors.grayDark },
    punchLabel: { flex: 1, color: RcsColors.grayDark, fontSize: 13, fontWeight: '600' },
    overNote: { color: RcsColors.danger, fontSize: 12, fontWeight: '700' },
    punchTime: { minWidth: 76, textAlign: 'right', color: RcsColors.text, fontSize: 14, fontWeight: '700' },
    punchTimeLate: { color: RcsColors.danger },


    lateCard: { padding: 18, borderRadius: 5, backgroundColor: RcsColors.surface, borderWidth: 1, borderColor: RcsColors.border },
    lateHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 },
    lateTitle: { flexShrink: 1, color: RcsColors.brownDark, fontSize: 14, fontWeight: '800' },
    sanctionPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 3, backgroundColor: RcsColors.danger },
    sanctionText: { color: RcsColors.white, fontSize: 12, fontWeight: '800' },
    barBlock: { marginBottom: 12 },
    barHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    barLabel: { color: RcsColors.grayDark, fontSize: 12, fontWeight: '600' },
    barValue: { color: RcsColors.grayMuted, fontSize: 12, fontWeight: '700' },
    barValueReached: { color: RcsColors.danger },
    barTrack: { height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: RcsColors.grayLight },
    barFill: { height: '100%', borderRadius: 4, backgroundColor: RcsColors.brown },
    barFillReached: { backgroundColor: RcsColors.danger },
    lateCaption: { marginTop: 2, color: RcsColors.grayMuted, fontSize: 12, lineHeight: 18 },

    noRecord: { padding: 20, borderRadius: 5, backgroundColor: RcsColors.surface, borderWidth: 1, borderColor: RcsColors.border },
    restDayLabel: { marginBottom: 6, color: RcsColors.brown, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
    noRecordTitle: { color: RcsColors.brownDark, fontSize: 14, fontWeight: '800' },
    noRecordCopy: { marginTop: 6, color: RcsColors.grayMuted, fontSize: 12, lineHeight: 18 },
  });
}
