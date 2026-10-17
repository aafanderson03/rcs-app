import { useMemo, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getPaletteForScheme, type RcsPalette } from '@/constants/theme';
import { ResponsiveText as Text } from '@/components/responsive-text';
import { useAppTheme } from '@/contexts/theme-context';

export function PortalPage({
  children,
  maxWidth = 1180,
}: {
  children: ReactNode;
  maxWidth?: number;
}) {
  const styles = usePortalStyles();
  const { width } = useWindowDimensions();
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={[styles.page, width < 600 && styles.mobilePage, width < 380 && styles.compactPage, { maxWidth }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function PageHeading({
  eyebrow = 'EMPLOYEE SELF-SERVICE',
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  const styles = usePortalStyles();
  return (
    <View style={styles.heading}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

export function PreviewNotice({ children }: { children: ReactNode }) {
  const styles = usePortalStyles();
  return (
    <View style={styles.notice}>
      <Text style={styles.noticeTitle}>Demo preview</Text>
      <Text style={styles.noticeText}>{children}</Text>
    </View>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const styles = usePortalStyles();
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconText}>—</Text>
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </View>
  );
}

export function ChoicePicker({
  label,
  value,
  placeholder,
  options,
  onChange,
  onOpenChange,
  open: controlledOpen,
}: {
  label: string;
  value: string;
  placeholder?: string;
  options: string[];
  onChange: (value: string) => void;
  onOpenChange?: (isOpen: boolean) => void;
  open?: boolean;
}) {
  const styles = usePortalStyles();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setPickerOpen = (isOpen: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(isOpen);
    onOpenChange?.(isOpen);
  };

  return (
    <View style={[styles.picker, open && styles.openPicker]}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setPickerOpen(!open)}
        style={({ pressed }) => [styles.pickerButton, pressed && styles.pressed]}
      >
        <Text style={[styles.pickerValue, !value && styles.pickerPlaceholder]}>
          {value || placeholder || 'Select'}
        </Text>
        <Text style={styles.pickerChevron}>{open ? '⌃' : '⌄'}</Text>
      </Pressable>
      {open ? (
        <ScrollView style={styles.options} nestedScrollEnabled keyboardShouldPersistTaps="handled">
          {options.map((option) => {
            const selected = option === value;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  onChange(option);
                  setPickerOpen(false);
                }}
                style={({ pressed }) => [
                  styles.option,
                  selected && styles.selectedOption,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.optionText, selected && styles.selectedOptionText]}>
                  {option}
                </Text>
                {selected ? <Text style={styles.check}>✓</Text> : null}
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
}

export function PortalCalendar({
  month,
  selectedDate,
  onSelectDate,
  onChangeMonth,
  onGoToday,
  markedDates = [],
}: {
  month: Date;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  onChangeMonth: (amount: number, clearSelection?: boolean) => void;
  onGoToday: () => void;
  markedDates?: string[];
}) {
  const styles = usePortalStyles();
  const { width } = useWindowDimensions();
  const compact = width < 600;
  const veryCompact = width < 380;
  const [view, setView] = useState<'days' | 'months' | 'years' | 'decades'>('days');
  const [pickerYear, setPickerYear] = useState(month.getFullYear());
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const decadeStart = Math.floor(pickerYear / 10) * 10;
  const centuryStart = Math.floor(pickerYear / 100) * 100;
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = Array.from({ length: 12 }, (_, index) => index);
  const years = Array.from({ length: 12 }, (_, index) => decadeStart - 1 + index);
  const decades = Array.from({ length: 12 }, (_, index) => centuryStart - 10 + index * 10);
  const heading =
    view === 'days'
      ? month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
      : view === 'months'
        ? String(year)
        : view === 'years'
          ? `${decadeStart}–${decadeStart + 9}`
          : `${centuryStart}–${centuryStart + 99}`;

  const changeRange = (amount: number) => {
    if (view === 'days') onChangeMonth(amount);
    else if (view === 'months') onChangeMonth(amount * 12);
    else if (view === 'years') setPickerYear((current) => current + amount * 100);
    else setPickerYear((current) => current + amount * 1000);
  };

  return (
    <View style={[styles.calendarCard, compact && styles.mobileCalendarCard, veryCompact && styles.compactCalendarCard]}>
      <View style={[styles.calendarHeader, compact && styles.mobileCalendarHeader, veryCompact && styles.compactCalendarHeader]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Previous ${view === 'days' ? 'month' : view === 'months' ? 'year' : view === 'years' ? 'decade' : 'century'}`}
          onPress={() => changeRange(-1)}
          style={[styles.monthButton, compact && styles.mobileMonthButton, veryCompact && styles.compactMonthButton]}
        >
          <Text style={styles.monthButtonText}>‹</Text>
        </Pressable>
        <View style={styles.monthHeading}>
          {view === 'decades' ? (
            <Text style={styles.monthTitle}>{heading}</Text>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Choose ${view === 'days' ? 'month' : view === 'months' ? 'year' : 'decade'}`}
              style={styles.headingButton}
              onPress={() => {
                if (view === 'days') setView('months');
                else if (view === 'months') {
                  setPickerYear(year);
                  setView('years');
                } else setView('decades');
              }}
            >
              <Text style={[styles.monthTitle, compact && styles.mobileMonthTitle, veryCompact && styles.compactMonthTitle]}>{heading}</Text>
              <Text style={styles.headingChevron}>⌄</Text>
            </Pressable>
          )}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Next ${view === 'days' ? 'month' : view === 'months' ? 'year' : view === 'years' ? 'decade' : 'century'}`}
          onPress={() => changeRange(1)}
          style={[styles.monthButton, compact && styles.mobileMonthButton, veryCompact && styles.compactMonthButton]}
        >
          <Text style={styles.monthButtonText}>›</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setView('days');
            setPickerYear(new Date().getFullYear());
            onGoToday();
          }}
          style={[styles.todayButton, compact && styles.mobileTodayButton, veryCompact && styles.compactTodayButton]}
        >
          <Text style={styles.todayButtonText}>Today</Text>
        </Pressable>
      </View>
      {view === 'days' ? (
        <View style={styles.calendarGrid}>
          {weekdays.map((day) => (
            <Text key={day} style={styles.weekday}>{day}</Text>
          ))}
          {cells.map((day, index) => {
            if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />;
            const date = new Date(year, monthIndex, day);
            const selected =
              selectedDate?.getFullYear() === year &&
              selectedDate.getMonth() === monthIndex &&
              selectedDate.getDate() === day;
            const marked = markedDates.includes(`${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
            return (
              <Pressable
                key={`${year}-${monthIndex}-${day}`}
                accessibilityRole="button"
                accessibilityLabel={`${date.toLocaleDateString()}${marked ? ', has sample record' : ''}`}
                accessibilityState={{ selected }}
                onPress={() => {
                  onSelectDate(date);
                  setView('days');
                }}
                style={[styles.dayCell, selected && styles.selectedDay]}
              >
                <Text style={[styles.dayText, selected && styles.selectedDayText]}>{day}</Text>
                {marked ? <View style={[styles.markedDayDot, selected && styles.selectedMarkedDayDot]} /> : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
      {view === 'months' ? (
        <View style={styles.calendarGrid}>
          {months.map((monthNumber) => {
            const date = new Date(year, monthNumber, 1);
            const selected = selectedDate
              ? selectedDate.getFullYear() === year && selectedDate.getMonth() === monthNumber
              : monthIndex === monthNumber;
            return (
              <Pressable
                key={monthNumber}
                accessibilityRole="button"
                accessibilityLabel={date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                accessibilityState={{ selected }}
                onPress={() => {
                  onChangeMonth(monthNumber - monthIndex, false);
                  setPickerYear(year);
                  setView('days');
                }}
                style={[styles.calendarChoice, selected && styles.selectedDay]}
              >
                <Text style={[styles.dayText, selected && styles.selectedDayText]}>
                  {date.toLocaleDateString(undefined, { month: 'short' })}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      {view === 'years' ? (
        <View style={styles.calendarGrid}>
          {years.map((choiceYear) => {
            const selected = selectedDate
              ? selectedDate.getFullYear() === choiceYear
              : year === choiceYear;
            const inDecade = choiceYear >= decadeStart && choiceYear < decadeStart + 10;
            return (
              <Pressable
                key={choiceYear}
                accessibilityRole="button"
                accessibilityLabel={String(choiceYear)}
                accessibilityState={{ selected }}
                onPress={() => {
                  onChangeMonth((choiceYear - year) * 12, false);
                  setPickerYear(choiceYear);
                  setView('months');
                }}
                style={[
                  styles.calendarChoice,
                  !inDecade && styles.adjacentChoice,
                  selected && styles.selectedDay,
                ]}
              >
                <Text style={[styles.dayText, !inDecade && styles.adjacentChoiceText, selected && styles.selectedDayText]}>
                  {choiceYear}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      {view === 'decades' ? (
        <View style={styles.calendarGrid}>
          {decades.map((startYear) => {
            const endYear = startYear + 9;
            const selected = year >= startYear && year <= endYear;
            const inCentury = startYear >= centuryStart && startYear < centuryStart + 100;
            return (
              <Pressable
                key={startYear}
                accessibilityRole="button"
                accessibilityLabel={`${startYear} to ${endYear}`}
                accessibilityState={{ selected }}
                onPress={() => {
                  setPickerYear(startYear);
                  setView('years');
                }}
                style={[
                  styles.calendarChoice,
                  !inCentury && styles.adjacentChoice,
                  selected && styles.selectedDay,
                ]}
              >
                <Text style={[styles.dayText, !inCentury && styles.adjacentChoiceText, selected && styles.selectedDayText]}>
                  {startYear}–{endYear}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function usePortalStyles() {
  const { colorScheme } = useAppTheme();
  const palette = getPaletteForScheme(colorScheme);
  return useMemo(() => createStyles(palette), [palette]);
}

function createStyles(RcsColors: Record<keyof RcsPalette, string>) {
  return StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: RcsColors.background },
  page: { width: '100%', alignSelf: 'center', padding: 28, paddingBottom: 48 },
  mobilePage: { padding: 20, paddingBottom: 36 },
  compactPage: { paddingHorizontal: 12, paddingTop: 16, paddingBottom: 26 },
  heading: { marginBottom: 24 },
  eyebrow: { color: RcsColors.brownLight, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  title: { marginTop: 6, color: RcsColors.brownDark, fontSize: 32, fontWeight: '800' },
  description: { marginTop: 6, color: RcsColors.grayMuted, fontSize: 14, lineHeight: 21 },
  notice: {
    padding: 16,
    marginBottom: 18,
    borderRadius: 12,
    backgroundColor: RcsColors.yellowLight,
    borderWidth: 1,
    borderColor: RcsColors.yellow,
  },
  noticeTitle: { color: RcsColors.brown, fontSize: 13, fontWeight: '800' },
  noticeText: { marginTop: 5, color: RcsColors.grayDark, fontSize: 12, lineHeight: 18 },
  empty: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 15,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  emptyIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: RcsColors.yellowLight,
  },
  emptyIconText: { color: RcsColors.brown, fontSize: 20, fontWeight: '700' },
  emptyTitle: { marginTop: 12, color: RcsColors.brownDark, fontSize: 15, fontWeight: '700' },
  emptyDescription: {
    maxWidth: 480,
    marginTop: 6,
    color: RcsColors.grayMuted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  picker: { minWidth: 0 },
  openPicker: { zIndex: 10, elevation: 10 },
  pickerLabel: { marginBottom: 7, color: RcsColors.grayDark, fontSize: 12, fontWeight: '700' },
  pickerButton: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 13,
    borderRadius: 10,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  pickerValue: { color: RcsColors.text, fontSize: 13 },
  pickerPlaceholder: { color: RcsColors.grayMuted },
  pickerChevron: { color: RcsColors.brownLight, fontSize: 19 },
  options: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 10,
    maxHeight: 280,
    marginTop: 4,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  option: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 13,
  },
  selectedOption: { backgroundColor: RcsColors.yellowLight },
  optionText: { color: RcsColors.grayDark, fontSize: 12 },
  selectedOptionText: { color: RcsColors.brownDark, fontWeight: '700' },
  check: { color: RcsColors.brown, fontWeight: '800' },
  pressed: { opacity: 0.75 },
  calendarCard: {
    maxWidth: 850,
    padding: 22,
    borderRadius: 16,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  mobileCalendarCard: { padding: 14, borderRadius: 13 },
  compactCalendarCard: { padding: 9 },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  mobileCalendarHeader: { gap: 6, marginBottom: 14 },
  compactCalendarHeader: { gap: 4, marginBottom: 12 },
  monthButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: RcsColors.yellowLight,
  },
  monthButtonText: { color: RcsColors.brown, fontSize: 26, lineHeight: 30 },
  mobileMonthButton: { width: 40, height: 44, borderRadius: 9 },
  compactMonthButton: { width: 38, height: 44 },
  monthHeading: { flex: 1 },
  headingButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  monthTitle: { color: RcsColors.brownDark, fontSize: 18, fontWeight: '800' },
  mobileMonthTitle: { fontSize: 14 },
  compactMonthTitle: { fontSize: 12 },
  headingChevron: { color: RcsColors.brownLight, fontSize: 18 },
  todayButton: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, backgroundColor: RcsColors.grayLight },
  mobileTodayButton: { minHeight: 44, paddingHorizontal: 8, paddingVertical: 9 },
  compactTodayButton: { minHeight: 44, paddingHorizontal: 6, paddingVertical: 8 },
  todayButtonText: { color: RcsColors.brown, fontSize: 12, fontWeight: '700' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { width: `${100 / 7}%`, paddingVertical: 10, color: RcsColors.grayMuted, fontSize: 11, fontWeight: '800', textAlign: 'center' },
  dayCell: { width: `${100 / 7}%`, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  calendarChoice: { width: '25%', height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  adjacentChoice: { opacity: 0.45 },
  adjacentChoiceText: { color: RcsColors.grayMuted },
  selectedDay: { backgroundColor: RcsColors.brownSurface },
  dayText: { color: RcsColors.grayDark, fontSize: 13 },
  markedDayDot: { width: 4, height: 4, marginTop: 2, borderRadius: 2, backgroundColor: RcsColors.brownLight },
  selectedMarkedDayDot: { backgroundColor: RcsColors.yellow },
  selectedDayText: { color: RcsColors.white, fontWeight: '800' },
  });
}
