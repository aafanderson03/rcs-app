import { useMemo, useState } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';

import { ChoicePicker, PageHeading, PortalPage, PreviewNotice } from '@/components/portal-ui';
import { ResponsiveText as Text, ResponsiveTextInput as TextInput } from '@/components/responsive-text';
import { getPaletteForScheme, type RcsPalette } from '@/constants/theme';
import { useAppTheme } from '@/contexts/theme-context';
import { useDemoSubmissions } from '@/contexts/demo-submissions-context';

const statusOptions = ['All statuses', 'Pending', 'Approved', 'Disapproved', 'Cancelled'];
const transactionCategories = [
  'Attendance',
  'DTR Update',
  'Leave',
  'Loan',
  'Other transactions',
  'Overtime',
  'Profile update',
  'Rest day',
  'Workshift',
];

export default function DashboardScreen() {
  const { styles } = useDashboardStyles();
  const { applications } = useDemoSubmissions();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 960;
  const [status, setStatus] = useState(statusOptions[0]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const rows = applications.filter((item) =>
    (status === 'All statuses' || item.status === status) &&
    (!from || item.submittedAt >= from) && (!to || item.submittedAt <= to)
  );
  const pendingCount = applications.filter((item) => item.status === 'Pending').length;
  const categoryCounts = transactionCategories.map((category) => {
    const categoryRows = rows.filter((item) => categoryMatches(category, item.type));
    const pending = categoryRows.filter((item) => item.status === 'Pending').length;
    return { category, pending, done: categoryRows.length - pending, total: categoryRows.length };
  });
  const maxCategoryCount = Math.max(1, ...categoryCounts.map((item) => item.total));

  return (
    <PortalPage>
      <PageHeading
        title="Dashboard"
        description="A clear overview of requests and their current status."
      />
      <PreviewNotice>Request totals are based on applications saved to your account.</PreviewNotice>

      <View style={styles.filters}>
        <DateField label="From" value={from} onChangeText={setFrom} />
        <DateField label="To" value={to} onChangeText={setTo} />
        <View style={styles.statusFilter}>
          <ChoicePicker
            label="Application status"
            value={status}
            options={statusOptions}
            onChange={setStatus}
          />
        </View>
      </View>

      <View style={[styles.contentColumns, isDesktop && styles.desktopContentColumns]}>
        <View style={[styles.summaryCard, isDesktop && styles.desktopSummaryCard]}>
            <Text style={styles.summaryEyebrow}>REQUEST OVERVIEW</Text>
            <Text style={styles.summaryTitle}>Pending applications</Text>
            <Text style={styles.summaryValue}>{pendingCount}</Text>
            <Text style={styles.summaryNote}>Applications awaiting review</Text>
            <Text style={styles.summaryNote}>{applications.length} applications in total</Text>
            <Text style={styles.chartTitle}>Applications by status</Text>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={styles.doneLegendSwatch} />
                <Text style={styles.legendLabel}>Done</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={styles.pendingLegendSwatch} />
                <Text style={styles.legendLabel}>Pending</Text>
              </View>
            </View>
            <View style={styles.chartCategoryList}>
              {categoryCounts.map(({ category, done, pending }) => (
                <View key={category} style={styles.chartCategoryRow}>
                  <Text style={styles.chartCategoryName} numberOfLines={1}>{category}</Text>
                  <View
                    accessible
                    accessibilityLabel={`${category}: ${done} done, ${pending} pending`}
                    style={styles.categoryBarTrack}
                  >
                    {done > 0 ? (
                      <View style={[styles.categoryBarDone, { width: `${(done / maxCategoryCount) * 100}%` }]} />
                    ) : null}
                    {pending > 0 ? (
                      <View style={[styles.categoryBarPending, { width: `${(pending / maxCategoryCount) * 100}%` }]} />
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
            <Text style={styles.chartNote}>Done includes approved, disapproved, or cancelled.</Text>
        </View>

        <View style={[styles.categoriesCard, isDesktop && styles.desktopCategoriesCard]}>
            <Text style={styles.cardTitle}>Applications by transaction</Text>
            <Text style={styles.cardDescription}>
              Filtered by {status.toLowerCase()}{from || to ? ` · ${from || 'any date'} to ${to || 'today'}` : ''}
            </Text>
            <View style={styles.categoryList}>
              {categoryCounts.map(({ category, total }) => (
                <View key={category} style={styles.categoryRow}>
                  <View style={styles.categoryDot} />
                  <Text style={styles.categoryName}>{category}</Text>
                  <Text style={styles.categoryValue}>{total}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.cardDescription}>{rows.length} requests match the current filters.</Text>
        </View>
      </View>
    </PortalPage>
  );
}

function categoryMatches(category: string, type: string) {
  const normalized = category.toLowerCase();
  const value = type.toLowerCase();
  if (normalized === 'profile update') return value === 'profile';
  if (normalized === 'rest day') return value === 'rest day';
  return normalized === value || normalized === `${value} transactions`;
}

function DateField({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  const { styles, palette } = useDashboardStyles();
  return (
    <View style={styles.dateField}>
      <Text style={styles.filterLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={`${label} date`}
        value={value}
        onChangeText={onChangeText}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={palette.grayMuted}
        style={styles.dateInput}
      />
    </View>
  );
}

function useDashboardStyles() {
  const { colorScheme } = useAppTheme();
  const palette = getPaletteForScheme(colorScheme);
  const styles = useMemo(() => createStyles(palette), [palette]);
  return { styles, palette };
}

function createStyles(RcsColors: Record<keyof RcsPalette, string>) {
  return StyleSheet.create({
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: 14,
    marginBottom: 20,
    zIndex: 10,
    elevation: 10,
  },
  contentColumns: { gap: 18 },
  desktopContentColumns: { flexDirection: 'row', alignItems: 'stretch', gap: 22 },
  dateField: { flexGrow: 1, flexBasis: 190 },
  filterLabel: { marginBottom: 7, color: RcsColors.grayDark, fontSize: 12, fontWeight: '700' },
  dateInput: {
    height: 46,
    paddingHorizontal: 13,
    borderRadius: 4,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
    color: RcsColors.text,
    fontSize: 13,
  },
  statusFilter: { flexGrow: 1, flexBasis: 230 },
  summaryCard: {
    minWidth: 0,
    padding: 21,
    borderRadius: 4,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  desktopSummaryCard: { flex: 1 },
  summaryEyebrow: { color: RcsColors.brown, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  summaryTitle: { marginTop: 10, color: RcsColors.text, fontSize: 16, fontWeight: '700' },
  summaryValue: { marginTop: 4, color: RcsColors.brown, fontSize: 38, fontWeight: '700' },
  summaryNote: { color: RcsColors.grayMuted, fontSize: 12 },
  chartTitle: { marginTop: 22, color: RcsColors.text, fontSize: 14, fontWeight: '700' },
  categoriesCard: {
    minWidth: 0,
    padding: 22,
    borderRadius: 4,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  desktopCategoriesCard: { flex: 1.25 },
  cardTitle: { color: RcsColors.text, fontSize: 17, fontWeight: '700' },
  cardDescription: { marginTop: 5, color: RcsColors.grayMuted, fontSize: 12 },
  chartLegend: { flexDirection: 'row', gap: 16, marginTop: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  doneLegendSwatch: { width: 9, height: 9, borderRadius: 3, backgroundColor: RcsColors.brown },
  pendingLegendSwatch: { width: 9, height: 9, borderRadius: 3, backgroundColor: RcsColors.yellowDeep },
  legendLabel: { color: RcsColors.grayMuted, fontSize: 11, fontWeight: '600' },
  chartCategoryList: { marginTop: 8 },
  chartCategoryRow: { height: 23, flexDirection: 'row', alignItems: 'center', gap: 8 },
  chartCategoryName: { width: 92, color: RcsColors.grayDark, fontSize: 10 },
  categoryBarTrack: { height: 9, flex: 1, flexDirection: 'row', overflow: 'hidden', borderRadius: 5, backgroundColor: RcsColors.grayLight },
  categoryBarDone: { height: '100%', backgroundColor: RcsColors.brown },
  categoryBarPending: { height: '100%', backgroundColor: RcsColors.yellowDeep },
  chartNote: { marginTop: 6, color: RcsColors.grayMuted, fontSize: 9, lineHeight: 13 },
  categoryList: { marginVertical: 17 },
  categoryRow: { minHeight: 40, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: RcsColors.grayLight },
  categoryDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: RcsColors.yellowDeep },
  categoryName: { flex: 1, marginLeft: 10, color: RcsColors.grayDark, fontSize: 13 },
  categoryValue: { color: RcsColors.grayMuted, fontSize: 14, fontWeight: '700' },
  });
}
