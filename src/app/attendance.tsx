import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { PageHeading, PortalCalendar, PortalPage, PreviewNotice } from '@/components/portal-ui';
import { ResponsiveText as Text } from '@/components/responsive-text';
import type { RcsPalette } from '@/constants/theme';
import { useAppTheme } from '@/contexts/theme-context';
import {
  dateKey,
  formatDemoDuration,
  getDemoAttendance,
  getDemoAttendanceDates,
  getDemoCurrentDayAttendance,
  getDemoMonthlyLateSummary,
  isRestDay,
} from '@/data/demo-data';
import { getHolidays } from '@/data/holidays';

const LATE_DAYS_LIMIT = 12;
const LATE_MINUTES_LIMIT = 120;

export default function AttendanceScreen() {
  const { palette } = useAppTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { height } = useWindowDimensions();
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const todayAttendance = getDemoCurrentDayAttendance(currentTime);
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => new Date());
  const selectedIsToday = selectedDate !== null && dateKey(selectedDate) === dateKey(currentTime);
  const markedDates = [
    ...getDemoAttendanceDates(visibleMonth),
    ...(todayAttendance.record?.date.startsWith(
      `${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, '0')}`,
    )
      ? [todayAttendance.record.date]
      : []),
  ];
  const holidaysByDate = useMemo(
    () => new Map(getHolidays(visibleMonth.getFullYear()).map((holiday) => [holiday.date, holiday])),
    [visibleMonth],
  );
  const selectedRecord = selectedDate
    ? selectedIsToday
      ? todayAttendance.record
      : getDemoAttendance(selectedDate)
    : null;
  const selectedIsRestDay = selectedDate ? isRestDay(selectedDate) : false;
  const monthlyLateSummary = selectedDate ? getDemoMonthlyLateSummary(selectedDate) : null;

  const changeMonth = (amount: number) => {
    setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + amount, 1));
    setSelectedDate(null);
    setRecordModalVisible(false);
  };

  const goToday = () => {
    const today = new Date();
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  const renderTodaySnapshot = () => {
    const { record, latestPunch } = todayAttendance;
    const isAbsence = record?.status === 'SIL' || record?.status === 'LWOP';
    const isLate = Boolean(record && latestPunch && record.lateByMinutes > 0);
    const statusLabel = !record
      ? 'No shift scheduled'
      : isAbsence
        ? 'No punches expected'
        : !latestPunch
          ? 'Waiting for first IN'
          : isLate
            ? `Late by ${record.lateByMinutes} min`
            : 'On time';
    const noPunchLabel = !record
      ? 'No scheduled sample shift today'
      : record.status === 'SIL'
        ? 'Service Incentive Leave · no punches expected'
        : record.status === 'LWOP'
          ? 'Unpaid leave · no punches expected'
          : 'No sample punch recorded yet';
    const statusStyle = isLate
      ? styles.lateBadge
      : latestPunch
        ? styles.onTimeBadge
        : styles.todayPendingBadge;
    const statusTextStyle = isLate
      ? styles.lateBadgeText
      : latestPunch
        ? styles.onTimeBadgeText
        : styles.todayPendingText;

    return (
      <View style={styles.todayCard}>
        <View style={styles.todayHeader}>
          <View style={styles.todayHeadingCopy}>
            <Text style={styles.eyebrow}>TODAY · {currentTime.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}</Text>
            <Text style={styles.todayTitle}>Latest punch</Text>
          </View>
          <View style={styles.todayDemoBadge}>
            <Text style={styles.todayDemoText}>SAMPLE</Text>
          </View>
        </View>

        <View style={styles.todayPunchRow}>
          {latestPunch ? (
            <View
              style={[
                styles.directionTag,
                latestPunch.direction === 'IN' ? styles.tagIn : styles.tagOut,
              ]}
            >
              <Text
                style={[
                  styles.directionText,
                  latestPunch.direction === 'IN' ? styles.tagInText : styles.tagOutText,
                ]}
              >
                {latestPunch.direction}
              </Text>
            </View>
          ) : null}
          <Text style={[styles.todayPunchLabel, !latestPunch && styles.todayNoPunch]}>
            {latestPunch?.label ?? noPunchLabel}
          </Text>
          {latestPunch ? (
            <Text style={styles.todayPunchTime}>{latestPunch.time}</Text>
          ) : null}
        </View>

        <View style={styles.todayFooter}>
          <Text style={styles.todayShift}>
            {record ? `Shift · ${record.scheduledShift}` : 'No scheduled shift today'}
          </Text>
          <View style={statusStyle}>
            <Text style={statusTextStyle}>{statusLabel}</Text>
          </View>
        </View>
        <Text style={styles.todayHint}>
          Late status is based on the sample shift schedule. This is not live attendance data.
        </Text>
      </View>
    );
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

  const renderCurrentDayRecord = () => {
    const record = todayAttendance.record;
    if (!record) return null;
    if (record.status === 'SIL' || record.status === 'LWOP') return renderRecord();

    const latestPunch = todayAttendance.latestPunch;
    const isLate = Boolean(latestPunch && record.lateByMinutes > 0);
    const badgeStyle = isLate
      ? styles.lateBadge
      : latestPunch
        ? styles.onTimeBadge
        : styles.todayPendingBadge;
    const badgeTextStyle = isLate
      ? styles.lateBadgeText
      : latestPunch
        ? styles.onTimeBadgeText
        : styles.todayPendingText;

    return (
      <View style={styles.recordCard}>
        <View style={styles.recordHeader}>
          <View style={styles.recordHeaderCopy}>
            <Text style={styles.todayTitle}>Punches recorded today</Text>
            <Text style={styles.hoursCaption}>Sample shift · {record.scheduledShift}</Text>
          </View>
          <View style={badgeStyle}>
            <Text style={badgeTextStyle}>
              {isLate ? `Late by ${record.lateByMinutes} min` : latestPunch ? 'On time' : 'Waiting for IN'}
            </Text>
          </View>
        </View>
        {record.punches.length ? (
          <View style={styles.punchList}>
            {record.punches.map((punch) => {
              const over = punch.label === 'Check in' ? record.lateByMinutes : 0;
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
        ) : (
          <Text style={styles.noRecordCopy}>No sample punch recorded yet.</Text>
        )}
        <Text style={styles.todayHint}>
          Fictional sample punches only · this is not live attendance data.
        </Text>
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
        description="Check today’s latest punch and browse daily time records by date."
      />
      <PreviewNotice>
        Fictional sample punches for presentation only. No employee attendance system is connected.
      </PreviewNotice>
      {renderTodaySnapshot()}

      <PortalCalendar
        month={visibleMonth}
        selectedDate={selectedDate}
        onSelectDate={(date) => {
          setSelectedDate(date);
          setRecordModalVisible(true);
        }}
        onChangeMonth={changeMonth}
        onGoToday={goToday}
        markedDates={markedDates}
        highlightDate={dateKey(currentTime)}
        getDayAnnotations={(date) => {
          const holiday = holidaysByDate.get(dateKey(date));
          const restDay = isRestDay(date);
          const weekend = date.getDay() === 0 || date.getDay() === 6;
          const holidayLabel = holiday
            ? holiday.kind === 'Regular holiday'
              ? 'Legal'
              : weekend
                ? 'SHFRD'
                : 'SPH'
            : null;
          return [
            ...(holiday && holidayLabel
              ? [{
                  label: holiday.name,
                  compactLabel: holiday.name,
                  kind: 'holidayName' as const,
                }, {
                  label: holidayLabel,
                  compactLabel: holidayLabel,
                  kind: 'holidayLabel' as const,
                }]
              : []),
            ...(!holiday
              ? [{
                  label: restDay ? 'Rest day' : 'Regular Day',
                  compactLabel: restDay ? 'Rest Day' : 'Regular Day',
                  kind: 'dayType' as const,
                }]
              : []),
            ...(!restDay && !(holiday && holiday.kind !== 'Regular holiday' && weekend)
              ? [{
                  label: 'Shift · 8:30 AM–5:30 PM',
                  compactLabel: '8:30–5:30',
                  kind: 'schedule' as const,
                }]
              : []),
          ];
        }}
        fullWidth
      />

      <Modal
        animationType="fade"
        onRequestClose={() => setRecordModalVisible(false)}
        presentationStyle="overFullScreen"
        statusBarTranslucent={Platform.OS === 'android'}
        transparent
        visible={recordModalVisible && selectedDate !== null}
      >
        <View style={styles.recordModalBackdrop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close attendance record"
            onPress={() => setRecordModalVisible(false)}
            style={StyleSheet.absoluteFill}
          />
          <View
            accessibilityViewIsModal
            style={[styles.recordModalCard, { maxHeight: Math.max(height - 36, 240) }]}
          >
            <View style={styles.recordModalHeader}>
              <View style={styles.recordModalTitleCopy}>
                <Text style={styles.eyebrow}>DAILY TIME RECORD</Text>
                <Text style={styles.recordModalTitle}>
                  {selectedDate?.toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close attendance record"
                onPress={() => setRecordModalVisible(false)}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.recordModalClose,
                  pressed && { opacity: 0.75 },
                ]}
              >
                <Text style={styles.recordModalCloseText}>×</Text>
              </Pressable>
            </View>
            <ScrollView
              style={styles.recordModalScroll}
              contentContainerStyle={styles.recordModalContent}
              showsVerticalScrollIndicator
            >
              {selectedRecord ? (
                selectedIsToday ? renderCurrentDayRecord() : renderRecord()
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
                    Sample entries cover recent workdays (Monday through Saturday).
                  </Text>
                </View>
              )}
              {renderLateness()}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </PortalPage>
  );
}

function createStyles(RcsColors: Record<keyof RcsPalette, string>) {
  return StyleSheet.create({
    recordModalBackdrop: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 18,
      backgroundColor: 'rgba(0,0,0,0.48)',
    },
    recordModalCard: {
      width: '100%',
      maxWidth: 620,
      padding: 16,
      borderRadius: 18,
      backgroundColor: RcsColors.background,
      borderWidth: 1,
      borderColor: RcsColors.border,
    },
    recordModalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 12,
    },
    recordModalTitleCopy: { flex: 1, minWidth: 0 },
    recordModalTitle: { color: RcsColors.text, fontSize: 16, fontWeight: '800' },
    recordModalClose: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 11,
      backgroundColor: RcsColors.surface,
    },
    recordModalCloseText: { color: RcsColors.brown, fontSize: 24, lineHeight: 28 },
    recordModalScroll: { flexShrink: 1 },
    recordModalContent: { gap: 14 },
    eyebrow: { marginTop: 4, color: RcsColors.brown, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
    recordCard: { padding: 18, borderRadius: 12, backgroundColor: RcsColors.surface, borderWidth: 1, borderColor: RcsColors.border },
    recordHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
    recordHeaderCopy: { flex: 1, minWidth: 0 },
    todayCard: {
      marginBottom: 18,
      padding: 16,
      borderRadius: 12,
      backgroundColor: RcsColors.surface,
      borderWidth: 1,
      borderColor: RcsColors.border,
      borderLeftWidth: 4,
      borderLeftColor: RcsColors.brown,
    },
    todayHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 10,
    },
    todayHeadingCopy: { flex: 1, minWidth: 0, gap: 4 },
    todayTitle: { color: RcsColors.brownDark, fontSize: 18, fontWeight: '800' },
    todayDemoBadge: {
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor: RcsColors.yellowLight,
    },
    todayDemoText: { color: RcsColors.brownDark, fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
    todayPunchRow: {
      minHeight: 48,
      marginTop: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderTopWidth: 1,
      borderTopColor: RcsColors.border,
    },
    todayPunchLabel: { flex: 1, minWidth: 0, color: RcsColors.text, fontSize: 14, fontWeight: '700' },
    todayNoPunch: { color: RcsColors.grayDark, fontWeight: '600' },
    todayPunchTime: { color: RcsColors.text, fontSize: 15, fontWeight: '800' },
    todayFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 8,
    },
    todayShift: { flex: 1, minWidth: 150, color: RcsColors.grayDark, fontSize: 12, fontWeight: '600' },
    todayPendingBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: RcsColors.grayLight },
    todayPendingText: { color: RcsColors.grayDark, fontSize: 12, fontWeight: '700' },
    todayHint: { marginTop: 8, color: RcsColors.grayMuted, fontSize: 11, lineHeight: 16 },
    hoursValue: { color: RcsColors.text, fontSize: 30, fontWeight: '700', letterSpacing: -0.6 },
    hoursCaption: { marginTop: 2, color: RcsColors.grayMuted, fontSize: 12, lineHeight: 17 },
    lateBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: RcsColors.grayLight },
    lateBadgeText: { color: RcsColors.danger, fontSize: 12, fontWeight: '700' },
    onTimeBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: RcsColors.yellowLight },
    onTimeBadgeText: { color: RcsColors.brownDark, fontSize: 12, fontWeight: '700' },
    progressTrack: { height: 8, marginTop: 14, borderRadius: 4, overflow: 'hidden', backgroundColor: RcsColors.grayLight },
    progressFill: { height: '100%', borderRadius: 4, backgroundColor: RcsColors.brown },
    hoursMath: { gap: 5, marginTop: 12, padding: 12, borderRadius: 10, backgroundColor: RcsColors.grayLight },
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


    lateCard: { padding: 18, borderRadius: 12, backgroundColor: RcsColors.surface, borderWidth: 1, borderColor: RcsColors.border },
    lateHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 },
    lateTitle: { flexShrink: 1, color: RcsColors.brownDark, fontSize: 14, fontWeight: '800' },
    sanctionPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: RcsColors.danger },
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

    noRecord: { padding: 20, borderRadius: 12, backgroundColor: RcsColors.surface, borderWidth: 1, borderColor: RcsColors.border },
    restDayLabel: { marginBottom: 6, color: RcsColors.brown, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
    noRecordTitle: { color: RcsColors.brownDark, fontSize: 14, fontWeight: '800' },
    noRecordCopy: { marginTop: 6, color: RcsColors.grayMuted, fontSize: 12, lineHeight: 18 },
  });
}
