import { useMemo, useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RcsPalette } from '@/constants/theme';
import { ResponsiveText as Text } from '@/components/responsive-text';
import { useAppTheme } from '@/contexts/theme-context';

export function PortalPage({
  children,
  maxWidth = 1320,
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
      <View style={styles.headingAccent} />
      <View style={styles.headingCopy}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

export function PreviewNotice({ children }: { children: ReactNode }) {
  const styles = usePortalStyles();
  return (
    <View style={styles.notice}>
      <View style={styles.noticeAccent} />
      <View style={styles.noticeIcon}>
        <Text style={styles.noticeIconText}>i</Text>
      </View>
      <View style={styles.noticeCopy}>
        <Text style={styles.noticeTitle}>Demo preview</Text>
        <Text style={styles.noticeText}>{children}</Text>
      </View>
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

export function DateRangeFilter({
  from,
  to,
  onChangeFrom,
  onChangeTo,
  onClear,
}: {
  from: string;
  to: string;
  onChangeFrom: (value: string) => void;
  onChangeTo: (value: string) => void;
  onClear: () => void;
}) {
  const styles = usePortalStyles();
  const { height } = useWindowDimensions();
  const [activeField, setActiveField] = useState<'from' | 'to' | null>(null);
  const [draftDate, setDraftDate] = useState(() => new Date());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const invalidRange = Boolean(from && to && from > to);

  const openDatePicker = (field: 'from' | 'to') => {
    const selected = parseDateKey(field === 'from' ? from : to) ?? new Date();
    setDraftDate(selected);
    setCalendarMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    setActiveField(field);
  };

  const closeDatePicker = () => setActiveField(null);
  const applyDate = () => {
    const value = toDateKey(draftDate);
    if (activeField === 'from') onChangeFrom(value);
    else if (activeField === 'to') onChangeTo(value);
    closeDatePicker();
  };

  const renderDateButton = (field: 'from' | 'to', value: string) => (
    <View style={styles.dateRangeField}>
      <Text style={styles.pickerLabel}>{field === 'from' ? 'From' : 'To'}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${field === 'from' ? 'From' : 'To'} date${value ? `, ${formatFilterDate(value)}` : ''}`}
        accessibilityHint="Opens a calendar to choose a date"
        onPress={() => openDatePicker(field)}
        style={({ pressed }) => [styles.dateRangeButton, pressed && styles.pressed]}
      >
        <Text style={[styles.dateRangeValue, !value && styles.pickerPlaceholder]}>
          {value ? formatFilterDate(value) : 'Any date'}
        </Text>
        <Text style={styles.dateRangeIcon}>▦</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.dateRange}>
      {renderDateButton('from', from)}
      {renderDateButton('to', to)}
      {from || to ? (
        <Pressable
          accessibilityRole="button"
          onPress={onClear}
          style={({ pressed }) => [styles.clearDatesButton, pressed && styles.pressed]}
        >
          <Text style={styles.clearDatesText}>Clear dates</Text>
        </Pressable>
      ) : null}
      {invalidRange ? (
        <Text accessibilityLiveRegion="polite" style={styles.dateRangeError}>
          From date must be on or before To date.
        </Text>
      ) : null}

      <Modal
        animationType="fade"
        onRequestClose={closeDatePicker}
        statusBarTranslucent
        transparent
        visible={activeField !== null}
      >
        <View style={styles.dateModalBackdrop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close date picker"
            onPress={closeDatePicker}
            style={StyleSheet.absoluteFill}
          />
          <View
            accessibilityViewIsModal
            style={[styles.dateModalCard, { maxHeight: Math.max(height - 40, 280) }]}
          >
            <View style={styles.dateModalHeader}>
              <Text style={styles.dateModalTitle}>
                Choose {activeField === 'from' ? 'start' : 'end'} date
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close date picker"
                onPress={closeDatePicker}
                hitSlop={8}
                style={({ pressed }) => [styles.dateModalClose, pressed && styles.pressed]}
              >
                <Text style={styles.dateModalCloseText}>×</Text>
              </Pressable>
            </View>
            <ScrollView
              style={styles.dateModalScroll}
              showsVerticalScrollIndicator={false}
            >
              <PortalCalendar
                month={calendarMonth}
                selectedDate={draftDate}
                onSelectDate={(date) => {
                  setDraftDate(date);
                  setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                }}
                onChangeMonth={(amount) =>
                  setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() + amount, 1))
                }
                onGoToday={() => {
                  const today = new Date();
                  setDraftDate(today);
                  setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                }}
              />
            </ScrollView>
            <View style={styles.dateModalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={closeDatePicker}
                style={({ pressed }) => [styles.dateModalCancel, pressed && styles.pressed]}
              >
                <Text style={styles.dateModalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Apply ${activeField === 'from' ? 'start' : 'end'} date ${toDateKey(draftDate)}`}
                onPress={applyDate}
                style={({ pressed }) => [styles.dateModalApply, pressed && styles.pressed]}
              >
                <Text style={styles.dateModalApplyText}>Apply date</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatFilterDate(value: string) {
  const date = parseDateKey(value);
  return date
    ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : value;
}

export function PortalCalendar({
  month,
  selectedDate,
  onSelectDate,
  onChangeMonth,
  onGoToday,
  markedDates = [],
  getDayAnnotations,
  highlightDate,
  fillHeight = false,
  fullWidth = false,
}: {
  month: Date;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  onChangeMonth: (amount: number, clearSelection?: boolean) => void;
  onGoToday: () => void;
  markedDates?: string[];
  highlightDate?: string;
  getDayAnnotations?: (date: Date) => {
    label: string;
    compactLabel?: string;
    kind: 'dayType' | 'schedule' | 'holidayLabel' | 'holidayName';
  }[];
  fillHeight?: boolean;
  fullWidth?: boolean;
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
    <View style={[
      styles.calendarCard,
      fullWidth && styles.fullWidthCalendarCard,
      compact && styles.mobileCalendarCard,
      veryCompact && styles.compactCalendarCard,
      fillHeight && styles.fillHeightCalendarCard,
    ]}>
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
            const dayKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const visuallySelected = selected && !highlightDate;
            const highlighted = highlightDate === dayKey;
            const marked = markedDates.includes(dayKey);
            const annotations = getDayAnnotations?.(date) ?? [];
            return (
              <Pressable
                key={`${year}-${monthIndex}-${day}`}
                accessibilityRole="button"
                accessibilityLabel={[
                  date.toLocaleDateString(),
                  ...annotations.map((annotation) => annotation.label),
                  marked ? 'has sample record' : '',
                ].filter(Boolean).join(', ')}
                accessibilityState={{ selected }}
                onPress={() => {
                  onSelectDate(date);
                  setView('days');
                }}
                style={[
                  styles.dayCell,
                  fullWidth && styles.fullWidthDayCell,
                  compact && fullWidth && styles.mobileFullWidthDayCell,
                  veryCompact && fullWidth && styles.compactFullWidthDayCell,
                  visuallySelected && styles.selectedDay,
                  highlighted && styles.todayHighlightDay,
                ]}
              >
                {fullWidth ? (
                  <View style={styles.fullWidthDayContent}>
                    <View style={styles.fullWidthDayHeader}>
                      <Text style={[styles.dayText, visuallySelected && styles.selectedDayText, highlighted && styles.todayHighlightDayText]}>{day}</Text>
                      {marked ? (
                        <View style={[styles.markedDayDot, visuallySelected && styles.selectedMarkedDayDot]} />
                      ) : null}
                    </View>
                    <View style={styles.dayAnnotations}>
                      {annotations.map((annotation, annotationIndex) => (
                        <Text
                          key={`${annotation.kind}-${annotationIndex}`}
                          numberOfLines={1}
                          style={[
                            styles.dayAnnotation,
                            annotation.kind === 'dayType' && styles.dayTypeAnnotation,
                            annotation.kind === 'schedule' && styles.scheduleAnnotation,
                            annotation.kind === 'holidayName' && styles.holidayAnnotation,
                            annotation.kind === 'holidayLabel' && styles.holidayNameAnnotation,
                            compact && styles.compactDayAnnotation,
                            veryCompact && styles.veryCompactDayAnnotation,
                            highlighted && annotation.kind !== 'holidayName' && styles.todayHighlightAnnotation,
                            visuallySelected && annotation.kind !== 'holidayName' && styles.selectedDayAnnotation,
                            visuallySelected && annotation.kind === 'holidayName' && styles.selectedHolidayAnnotation,
                          ]}
                        >
                          {compact && annotation.compactLabel ? annotation.compactLabel : annotation.label}
                        </Text>
                      ))}
                    </View>
                  </View>
                ) : (
                  <>
                    <Text style={[styles.dayText, visuallySelected && styles.selectedDayText, highlighted && styles.todayHighlightDayText]}>{day}</Text>
                    {marked ? <View style={[styles.markedDayDot, visuallySelected && styles.selectedMarkedDayDot]} /> : null}
                  </>
                )}
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
  const { palette } = useAppTheme();
  return useMemo(() => createStyles(palette), [palette]);
}

function createStyles(RcsColors: Record<keyof RcsPalette, string>) {
  return StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: RcsColors.background },
  page: { width: '100%', alignSelf: 'center', paddingVertical: 36, paddingHorizontal: 24, paddingBottom: 56 },
  mobilePage: { padding: 18, paddingBottom: 36 },
  compactPage: { paddingHorizontal: 12, paddingTop: 16, paddingBottom: 28 },
  heading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 26,
    padding: 24,
    borderRadius: 22,
    backgroundColor: RcsColors.yellowLight,
    borderWidth: 1,
    borderColor: RcsColors.yellow,
  },
  headingAccent: {
    width: 4,
    minHeight: 40,
    alignSelf: 'stretch',
    borderRadius: 2,
    backgroundColor: RcsColors.yellowDeep,
  },
  headingCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: RcsColors.yellowDeep, fontSize: 10, fontWeight: '800', letterSpacing: 1.35 },
  title: { marginTop: 8, color: RcsColors.text, fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  description: { maxWidth: 680, marginTop: 7, color: RcsColors.grayMuted, fontSize: 14, lineHeight: 22 },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
    borderRadius: 14,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  noticeAccent: { width: 3, alignSelf: 'stretch', borderRadius: 2, backgroundColor: RcsColors.brown },
  noticeIcon: {
    width: 30,
    height: 30,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: RcsColors.yellowLight,
  },
  noticeIconText: { color: RcsColors.brown, fontSize: 14, fontWeight: '800' },
  noticeCopy: { flex: 1, minWidth: 0 },
  noticeTitle: { color: RcsColors.brownDark, fontSize: 12, fontWeight: '800' },
  noticeText: { marginTop: 3, color: RcsColors.grayDark, fontSize: 11, lineHeight: 17 },
  empty: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 20,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  emptyIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
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
    borderRadius: 13,
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
  dateRange: { flex: 1, minWidth: 0, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', gap: 10 },
  dateRangeField: { flexGrow: 1, flexBasis: 150, minWidth: 0 },
  dateRangeButton: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 13,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  dateRangeValue: { flex: 1, minWidth: 0, color: RcsColors.text, fontSize: 12 },
  dateRangeIcon: { color: RcsColors.brown, fontSize: 16 },
  clearDatesButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 6 },
  clearDatesText: { color: RcsColors.brown, fontSize: 12, fontWeight: '700' },
  dateRangeError: { flexBasis: '100%', color: RcsColors.danger, fontSize: 12 },
  dateModalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.48)',
  },
  dateModalCard: {
    width: '100%',
    maxWidth: 560,
    padding: 16,
    borderRadius: 18,
    backgroundColor: RcsColors.background,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  dateModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 },
  dateModalTitle: { flex: 1, color: RcsColors.text, fontSize: 16, fontWeight: '800' },
  dateModalClose: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: RcsColors.surface },
  dateModalCloseText: { color: RcsColors.brown, fontSize: 24, lineHeight: 28 },
  dateModalScroll: { flexShrink: 1 },
  dateModalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, paddingTop: 12 },
  dateModalCancel: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 10, backgroundColor: RcsColors.surface },
  dateModalCancelText: { color: RcsColors.grayDark, fontSize: 12, fontWeight: '700' },
  dateModalApply: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 10, backgroundColor: RcsColors.brown },
  dateModalApplyText: { color: RcsColors.white, fontSize: 12, fontWeight: '700' },
  calendarCard: {
    maxWidth: 850,
    padding: 24,
    borderRadius: 20,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  fillHeightCalendarCard: { flex: 1 },
  fullWidthCalendarCard: { width: '100%', maxWidth: '100%' },
  mobileCalendarCard: { padding: 14, borderRadius: 16 },
  compactCalendarCard: { padding: 9, borderRadius: 14 },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  mobileCalendarHeader: { gap: 6, marginBottom: 14 },
  compactCalendarHeader: { gap: 4, marginBottom: 12 },
  monthButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: RcsColors.yellowLight,
  },
  monthButtonText: { color: RcsColors.brown, fontSize: 26, lineHeight: 30 },
  mobileMonthButton: { width: 40, height: 44, borderRadius: 10 },
  compactMonthButton: { width: 38, height: 44 },
  monthHeading: { flex: 1 },
  headingButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  monthTitle: { color: RcsColors.brownDark, fontSize: 18, fontWeight: '800' },
  mobileMonthTitle: { fontSize: 14 },
  compactMonthTitle: { fontSize: 12 },
  headingChevron: { color: RcsColors.brownLight, fontSize: 18 },
  todayButton: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 9, backgroundColor: RcsColors.grayLight },
  mobileTodayButton: { minHeight: 44, paddingHorizontal: 8, paddingVertical: 9 },
  compactTodayButton: { minHeight: 44, paddingHorizontal: 6, paddingVertical: 8 },
  todayButtonText: { color: RcsColors.brown, fontSize: 12, fontWeight: '700' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { width: `${100 / 7}%`, paddingVertical: 10, color: RcsColors.grayMuted, fontSize: 11, fontWeight: '800', textAlign: 'center' },
  dayCell: { width: `${100 / 7}%`, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  fullWidthDayCell: { height: 88, alignItems: 'stretch', justifyContent: 'flex-start', padding: 8 },
  mobileFullWidthDayCell: { height: 64 },
  compactFullWidthDayCell: { height: 54 },
  fullWidthDayContent: { flex: 1, justifyContent: 'space-between' },
  fullWidthDayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dayAnnotations: { gap: 2 },
  dayAnnotation: { overflow: 'hidden', fontSize: 9, lineHeight: 12 },
  dayTypeAnnotation: { color: RcsColors.grayDark, fontWeight: '700' },
  scheduleAnnotation: { color: RcsColors.grayMuted, fontSize: 8, lineHeight: 10 },
  holidayAnnotation: {
    overflow: 'hidden',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    backgroundColor: RcsColors.holidayBackground,
    color: RcsColors.holidayForeground,
    fontSize: 8,
    lineHeight: 11,
    textAlign: 'center',
  },
  holidayNameAnnotation: { color: RcsColors.danger, fontSize: 8, fontWeight: '700' },
  todayHighlightAnnotation: { color: RcsColors.todayHighlightText },
  compactDayAnnotation: { fontSize: 7, lineHeight: 9 },
  veryCompactDayAnnotation: { fontSize: 6, lineHeight: 8 },
  selectedDayAnnotation: { color: RcsColors.white },
  selectedHolidayAnnotation: {
    backgroundColor: RcsColors.holidayBackground,
    color: RcsColors.holidayForeground,
  },
  calendarChoice: { width: '25%', height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  adjacentChoice: { opacity: 0.45 },
  adjacentChoiceText: { color: RcsColors.grayMuted },
  selectedDay: { backgroundColor: RcsColors.brownSurface },
  todayHighlightDay: { backgroundColor: '#FFF0CA' },
  todayHighlightDayText: { color: RcsColors.todayHighlightText, fontWeight: '800' },
  dayText: { color: RcsColors.grayDark, fontSize: 13 },
  markedDayDot: { width: 4, height: 4, marginTop: 2, borderRadius: 2, backgroundColor: RcsColors.brownLight },
  selectedMarkedDayDot: { backgroundColor: RcsColors.yellow },
  selectedDayText: { color: RcsColors.white, fontWeight: '800' },
  });
}
