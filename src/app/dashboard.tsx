import { useMemo, useState } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';

import { ChoicePicker, PageHeading, PortalPage, PreviewNotice } from '@/components/portal-ui';
import { ResponsiveText as Text, ResponsiveTextInput as TextInput } from '@/components/responsive-text';
import { getPaletteForScheme, type RcsPalette } from '@/constants/theme';
import { useAppTheme } from '@/contexts/theme-context';
import { useDemoSubmissions } from '@/contexts/demo-submissions-context';

const statusOptions = ['All statuses', 'Pending', 'Approved', 'Disapproved', 'Cancelled'];
const trackedStatuses = ['Pending', 'Approved', 'Disapproved', 'Cancelled'] as const;
type TrackedStatus = (typeof trackedStatuses)[number];

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
  const { styles, statusColors } = useDashboardStyles();
  const { applications } = useDemoSubmissions();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 960;
  const [status, setStatus] = useState(statusOptions[0]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  // Date filter only: used for the stat tiles so they always show the full status picture.
  const dateRows = applications.filter(
    (item) => (!from || item.submittedAt >= from) && (!to || item.submittedAt <= to)
  );
  // Date + status filter: used for the chart.
  const rows = dateRows.filter((item) => status === 'All statuses' || item.status === status);

  const statusTotals = trackedStatuses.map((name) => ({
    name,
    count: dateRows.filter((item) => item.status === name).length,
  }));

  const categoryCounts = transactionCategories
    .map((category) => {
      const categoryRows = rows.filter((item) => categoryMatches(category, item.type));
      const counts = {} as Record<TrackedStatus, number>;
      trackedStatuses.forEach((name) => {
        counts[name] = categoryRows.filter((item) => item.status === name).length;
      });
      return { category, counts, total: categoryRows.length };
    })
    .sort((a, b) => b.total - a.total || a.category.localeCompare(b.category));

  const maxCategoryCount = Math.max(1, ...categoryCounts.map((item) => item.total));
  const dateSummary = from || to ? ` · ${from || 'any date'} to ${to || 'today'}` : '';

  return (
    <PortalPage>
      <PageHeading
        title="Dashboard"
        description="A clear overview of requests and their current status."
      />
      <PreviewNotice>Fictional request activity for presentation only. These examples do not represent live employee records.</PreviewNotice>

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

      <View style={[styles.tiles, isDesktop && styles.desktopTiles]}>
        {statusTotals.map(({ name, count }) => (
          <View
            key={name}
            accessible
            accessibilityLabel={`${count} ${name.toLowerCase()} requests`}
            style={styles.tile}
          >
            <View style={[styles.tileAccent, { backgroundColor: statusColors[name] }]} />
            <Text style={styles.tileValue}>{count}</Text>
            <Text style={styles.tileLabel}>{name}</Text>
          </View>
        ))}
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Applications by transaction type</Text>
        <Text style={styles.cardDescription}>
          {rows.length} {rows.length === 1 ? 'request matches' : 'requests match'} · {status.toLowerCase()}
          {dateSummary}
        </Text>

        <View style={styles.chartLegend}>
          {trackedStatuses.map((name) => (
            <View key={name} style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: statusColors[name] }]} />
              <Text style={styles.legendLabel}>{name}</Text>
            </View>
          ))}
        </View>

        {rows.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No requests match these filters</Text>
            <Text style={styles.emptyText}>Widen the date range or choose All statuses.</Text>
          </View>
        ) : (
          <View style={styles.chartCategoryList}>
            {categoryCounts.map(({ category, counts, total }) => (
              <View
                key={category}
                style={[styles.chartCategoryRow, total === 0 && styles.chartRowEmpty]}
              >
                <Text style={styles.chartCategoryName} numberOfLines={1}>{category}</Text>
                <View
                  accessible
                  accessibilityLabel={`${category}: ${trackedStatuses
                    .map((name) => `${counts[name]} ${name.toLowerCase()}`)
                    .join(', ')}`}
                  style={styles.categoryBarTrack}
                >
                  {total > 0 ? (
                    <View
                      style={[styles.categoryBarFill, { width: `${(total / maxCategoryCount) * 100}%` }]}
                    >
                      {trackedStatuses.map((name) =>
                        counts[name] > 0 ? (
                          <View
                            key={name}
                            style={{ flex: counts[name], backgroundColor: statusColors[name] }}
                          />
                        ) : null
                      )}
                    </View>
                  ) : null}
                </View>
                <Text style={styles.chartValue}>{total}</Text>
              </View>
            ))}
          </View>
        )}
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
  // Pending and Approved reuse your theme colors. Disapproved uses a muted red and
  // Cancelled uses your muted gray. Swap in theme tokens if you have them.
  const statusColors: Record<TrackedStatus, string> = useMemo(
    () => ({
      Pending: palette.yellowDeep,
      Approved: palette.brown,
      Disapproved: '#B5483A',
      Cancelled: palette.grayMuted,
    }),
    [palette]
  );
  return { styles, palette, statusColors };
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

    tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 18 },
    desktopTiles: { flexWrap: 'nowrap', gap: 16, marginBottom: 22 },
    tile: {
      flexGrow: 1,
      flexBasis: 140,
      minWidth: 0,
      paddingVertical: 16,
      paddingHorizontal: 18,
      borderRadius: 4,
      backgroundColor: RcsColors.surface,
      borderWidth: 1,
      borderColor: RcsColors.border,
      overflow: 'hidden',
    },
    tileAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
    tileValue: { color: RcsColors.text, fontSize: 30, fontWeight: '700' },
    tileLabel: { marginTop: 2, color: RcsColors.grayMuted, fontSize: 13, fontWeight: '600' },

    chartCard: {
      minWidth: 0,
      padding: 22,
      borderRadius: 4,
      backgroundColor: RcsColors.surface,
      borderWidth: 1,
      borderColor: RcsColors.border,
    },
    cardTitle: { color: RcsColors.text, fontSize: 17, fontWeight: '700' },
    cardDescription: { marginTop: 5, color: RcsColors.grayMuted, fontSize: 12 },

    chartLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, marginTop: 14 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
    legendSwatch: { width: 12, height: 12, borderRadius: 3 },
    legendLabel: { color: RcsColors.grayDark, fontSize: 12, fontWeight: '600' },

    chartCategoryList: { marginTop: 14 },
    chartCategoryRow: { height: 36, flexDirection: 'row', alignItems: 'center', gap: 10 },
    chartRowEmpty: { opacity: 0.45 },
    chartCategoryName: { width: 118, color: RcsColors.grayDark, fontSize: 13 },
    categoryBarTrack: {
      height: 16,
      flex: 1,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: RcsColors.grayLight,
    },
    categoryBarFill: {
      height: '100%',
      flexDirection: 'row',
      gap: 2,
      borderRadius: 8,
      overflow: 'hidden',
    },
    chartValue: {
      width: 28,
      textAlign: 'right',
      color: RcsColors.text,
      fontSize: 13,
      fontWeight: '700',
    },

    emptyState: { paddingVertical: 28, alignItems: 'center' },
    emptyTitle: { color: RcsColors.text, fontSize: 14, fontWeight: '700' },
    emptyText: { marginTop: 4, color: RcsColors.grayMuted, fontSize: 12 },
  });
}
