import { useMemo, useState } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';

import { PageHeading, PortalCalendar, PortalPage, PreviewNotice } from '@/components/portal-ui';
import { ResponsiveText as Text } from '@/components/responsive-text';
import { getPaletteForScheme, type RcsPalette } from '@/constants/theme';
import { useAppTheme } from '@/contexts/theme-context';
import { getDemoAttendance, getDemoAttendanceDates, getDemoMonthlyLateSummary, getRecentDemoAttendance } from '@/data/demo-data';

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
            fillHeight={isDesktop}
          />
        </View>
        <View style={[styles.detailsColumn, isDesktop && styles.desktopDetailsColumn]}>
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
          {selectedRecord ? <View style={styles.recordCard}>
            <View style={styles.recordTop}><Text style={[styles.recordStatus, selectedRecord.status === 'Late' && styles.lateStatus]}>{selectedRecord.status === 'Late' ? `LATE · ${selectedRecord.lateByMinutes} MIN` : 'PRESENT'}</Text><Text style={styles.recordShift}>Shift · {selectedRecord.scheduledShift}</Text></View>
            {selectedRecord.punches.map((punch) => <View key={punch.label} style={styles.punchRow}><Text style={styles.punchDirection}>{punch.label}</Text><Text style={styles.punchTime}>{punch.time}</Text></View>)}
            <View style={styles.totalRow}><Text style={styles.totalLabel}>Total hours</Text><Text style={styles.totalValue}>{selectedRecord.totalWorked}</Text></View>
          
            {monthlyLateSummary ? <View style={styles.lateSummary}>
              <Text style={styles.lateSummaryTitle}>Monthly lateness</Text>
              <Text style={styles.lateSummaryCopy}>{monthlyLateSummary.lateDays} late arrival{monthlyLateSummary.lateDays === 1 ? '' : 's'} · {monthlyLateSummary.lateMinutes} minute{monthlyLateSummary.lateMinutes === 1 ? '' : 's'} total</Text>
              <Text style={[styles.lateSummaryStatus, monthlyLateSummary.sanctionThresholdReached && styles.lateThresholdReached]}>
                {monthlyLateSummary.sanctionThresholdReached
                  ? 'Sanction threshold reached (12 late arrivals or 120 minutes)'
                  : 'Below sanction threshold (12 late arrivals or 120 minutes)'}
              </Text>
            </View> : null}
          </View> : <View style={styles.noRecord}><Text style={styles.noRecordTitle}>No sample DTR for this date</Text><Text style={styles.noRecordCopy}>Sample entries cover recent workdays (Monday through Saturday). Select a marked day to view punches.</Text></View>}
        </View>
      </View>
    </PortalPage>
  );
}

function createStyles(RcsColors: Record<keyof RcsPalette, string>) {
  return StyleSheet.create({
  contentColumns: { gap: 18 },
  desktopContentColumns: { flexDirection: 'row', alignItems: 'stretch', gap: 22 },
  calendarColumn: { minWidth: 0 },
  desktopCalendarColumn: { flex: 1.2 },
  detailsColumn: { minWidth: 0 },
  desktopDetailsColumn: { flex: 0.8 },
  detailsTitle: {
    marginTop: 4,
    marginBottom: 13,
    color: RcsColors.brownDark,
    fontSize: 18,
    fontWeight: '800',
  },
  recordCard: { padding: 18, borderRadius: 4, backgroundColor: RcsColors.surface, borderWidth: 1, borderColor: RcsColors.border },
  recordTop: { gap: 6, marginBottom: 12 },
  recordStatus: { color: RcsColors.brown, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  lateStatus: { color: RcsColors.danger },
  recordShift: { color: RcsColors.grayMuted, fontSize: 12 },
  punchRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 1, borderTopColor: RcsColors.border },
  punchDirection: { flex: 1, color: RcsColors.grayDark, fontSize: 12, fontWeight: '700' },
  punchTime: { color: RcsColors.text, fontSize: 13, fontWeight: '700' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 14, marginTop: 4, borderTopWidth: 1, borderTopColor: RcsColors.border },
  totalLabel: { color: RcsColors.grayMuted, fontSize: 12 },
  totalValue: { color: RcsColors.brown, fontSize: 13, fontWeight: '800' },
  hoursNote: { marginTop: 5, color: RcsColors.grayMuted, fontSize: 11 },
  lateSummary: { marginTop: 14, padding: 12, borderRadius: 4, backgroundColor: RcsColors.yellowLight },
  lateSummaryTitle: { color: RcsColors.brownDark, fontSize: 12, fontWeight: '800' },
  lateSummaryCopy: { marginTop: 4, color: RcsColors.grayDark, fontSize: 12 },
  lateSummaryStatus: { marginTop: 5, color: RcsColors.brown, fontSize: 11, fontWeight: '700' },
  lateThresholdReached: { color: RcsColors.danger },
  noRecord: { padding: 20, borderRadius: 4, backgroundColor: RcsColors.surface, borderWidth: 1, borderColor: RcsColors.border },
  noRecordTitle: { color: RcsColors.brownDark, fontSize: 14, fontWeight: '800' },
  noRecordCopy: { marginTop: 6, color: RcsColors.grayMuted, fontSize: 12, lineHeight: 18 },
  });
}
