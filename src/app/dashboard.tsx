import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { ChoicePicker, EmptyState, PageHeading, PortalPage, PreviewNotice } from '@/components/portal-ui';
import { RcsColors } from '@/constants/theme';

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
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 960;
  const [status, setStatus] = useState(statusOptions[0]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  return (
    <PortalPage>
      <PageHeading
        title="Dashboard"
        description="A clear overview of requests and their current status."
      />
      <PreviewNotice>
        Pending counts and application trends require live, authorized employee records. No
        employee-specific totals are shown in this preview.
      </PreviewNotice>

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
        <View style={styles.summaryCard}>
            <Text style={styles.summaryEyebrow}>REQUEST OVERVIEW</Text>
            <Text style={styles.summaryTitle}>Pending applications</Text>
            <Text style={styles.summaryValue}>—</Text>
            <Text style={styles.summaryNote}>Connect an approved data source to view totals.</Text>
        </View>

        <View style={styles.categoriesCard}>
            <Text style={styles.cardTitle}>Applications by transaction</Text>
            <Text style={styles.cardDescription}>
              Filtered by {status.toLowerCase()}{from || to ? ` · ${from || 'any date'} to ${to || 'today'}` : ''}
            </Text>
            <View style={styles.categoryList}>
              {transactionCategories.map((category) => (
                <View key={category} style={styles.categoryRow}>
                  <View style={styles.categoryDot} />
                  <Text style={styles.categoryName}>{category}</Text>
                  <Text style={styles.categoryValue}>—</Text>
                </View>
              ))}
            </View>
            <EmptyState
              title="Request data not connected"
              description="Application counts and charts will appear here once the app has a secure connection to the employee system."
            />
        </View>
      </View>
    </PortalPage>
  );
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
  return (
    <View style={styles.dateField}>
      <Text style={styles.filterLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={`${label} date`}
        value={value}
        onChangeText={onChangeText}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={RcsColors.grayMuted}
        style={styles.dateInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  desktopContentColumns: { flexDirection: 'row', alignItems: 'flex-start', gap: 22 },
  dateField: { flexGrow: 1, flexBasis: 190 },
  filterLabel: { marginBottom: 7, color: RcsColors.grayDark, fontSize: 12, fontWeight: '700' },
  dateInput: {
    height: 46,
    paddingHorizontal: 13,
    borderRadius: 10,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
    color: RcsColors.text,
    fontSize: 13,
  },
  statusFilter: { flexGrow: 1, flexBasis: 230 },
  summaryCard: {
    flex: 1,
    minWidth: 0,
    padding: 24,
    borderRadius: 16,
    backgroundColor: RcsColors.brown,
  },
  summaryEyebrow: { color: RcsColors.yellow, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  summaryTitle: { marginTop: 10, color: RcsColors.white, fontSize: 18, fontWeight: '700' },
  summaryValue: { marginTop: 4, color: RcsColors.white, fontSize: 42, fontWeight: '800' },
  summaryNote: { color: '#E4D9C9', fontSize: 12 },
  categoriesCard: {
    flex: 1.25,
    minWidth: 0,
    padding: 22,
    borderRadius: 16,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  cardTitle: { color: RcsColors.brownDark, fontSize: 18, fontWeight: '800' },
  cardDescription: { marginTop: 5, color: RcsColors.grayMuted, fontSize: 12 },
  categoryList: { marginVertical: 17 },
  categoryRow: { minHeight: 40, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: RcsColors.grayLight },
  categoryDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: RcsColors.yellowDeep },
  categoryName: { flex: 1, marginLeft: 10, color: RcsColors.grayDark, fontSize: 13 },
  categoryValue: { color: RcsColors.grayMuted, fontSize: 14, fontWeight: '700' },
});
