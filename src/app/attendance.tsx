import { useMemo, useState } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';

import { EmptyState, PageHeading, PortalCalendar, PortalPage, PreviewNotice } from '@/components/portal-ui';
import { ResponsiveText as Text } from '@/components/responsive-text';
import { getPaletteForScheme, type RcsPalette } from '@/constants/theme';
import { useAppTheme } from '@/contexts/theme-context';

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

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
        Attendance punches and work schedules are not connected. Dates can be selected in this
        calendar, but no DTR record is being displayed or changed.
      </PreviewNotice>

      <View style={[styles.contentColumns, isDesktop && styles.desktopContentColumns]}>
        <View style={styles.calendarColumn}>
          <PortalCalendar
            month={visibleMonth}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onChangeMonth={changeMonth}
            onGoToday={goToday}
          />
        </View>
        <View style={styles.detailsColumn}>
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
          <EmptyState
            title="No attendance details available"
            description="Clock-in/out times, scheduled shift, and daily totals will appear here when the DTR service is connected."
          />
        </View>
      </View>
    </PortalPage>
  );
}

function createStyles(RcsColors: Record<keyof RcsPalette, string>) {
  return StyleSheet.create({
  contentColumns: { gap: 18 },
  desktopContentColumns: { flexDirection: 'row', alignItems: 'flex-start', gap: 22 },
  calendarColumn: { flex: 1.2, minWidth: 0 },
  detailsColumn: { flex: 0.8, minWidth: 0 },
  detailsTitle: {
    marginTop: 4,
    marginBottom: 13,
    color: RcsColors.brownDark,
    fontSize: 18,
    fontWeight: '800',
  },
  });
}
