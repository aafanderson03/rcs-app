import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';

import { ChoicePicker, EmptyState, PageHeading, PortalPage, PreviewNotice } from '@/components/portal-ui';
import { ResponsiveText as Text } from '@/components/responsive-text';
import { getPaletteForScheme, type RcsPalette } from '@/constants/theme';
import { useAppTheme } from '@/contexts/theme-context';

const inquirySections = {
  'basic-profile': {
    title: 'Basic Profile',
    description: 'Review personal and employment information.',
  },
  'leave-balances': {
    title: 'Leave Balances',
    description: 'Review leave usage and available balances.',
  },
  'loan-balance': {
    title: 'Loan Balance',
    description: 'Review loan deductions and remaining balances.',
  },
  'pay-slip': {
    title: 'Pay Slip Viewer',
    description: 'Review payroll summaries and year-to-date totals.',
  },
} as const;

type InquirySection = keyof typeof inquirySections;

const profileFields = [
  'Employee name',
  'Employee code',
  'Contact number',
  'Email address',
  'Address',
  'Designation',
  'Department',
  'Date hired',
  'Tax status',
  'TIN',
  'SSS number',
  'Pag-IBIG number',
  'PhilHealth number',
  'GSIS number',
];
const leaveColumns = [
  'Leave type',
  'Used leave',
  'Total leave',
  'From',
  'To',
  'Last updated',
  'Charged to',
];
const leaveTypes = [
  'All',
  'Bereavement Leave',
  'Emergency Leave',
  'Leave Without Pay',
  'Maternity',
  'Magna Carta for Women',
  'Paternity Leave',
  'Special Emergency Leave',
  'Sick Leave',
  'Special Leave for Women',
  'Suspension',
  'Solo Parent Leave',
  'Service Incentive Leave',
  'Vacation Leave',
];
const loanColumns = [
  'Loan type',
  'Total amount',
  'Loan date',
  'Salary deduction',
  'Loan balance',
];
const loanTypes = [
  'All',
  'Accountability - Cashier Short/Over',
  'Pagibig 2 Savings',
  'SSS Calamity Loan',
  'SSS Salary Loan',
  'SSS SLERP Loan',
  'HDMF Multi-Purpose Loan',
  'HDMF Calamity Loan',
  'HDMF Housing Loan',
  'Loan 2',
  'Philam Ins',
  'SSS Emergency Loan',
  'Belt Bag - 120',
  'Pag-IBIG Safe Loan',
  'T Shirt S - 250',
  'Pants M- 325 F- 290 NOT IN USE',
  'Corpo - G',
  'Corpo - B',
  'Belt NOT IN USE',
  'Accountability Charges - Service',
  'Under Withheld of Tax',
  'T Shirt XS - 250',
  'T Shirt M - 250',
  'T Shirt L - 250',
  'T Shirt XL - 250',
  'Loan 3',
  'T Shirt XXL - 250',
  'Utilities Charge',
  'Accountability Charges - Items',
];
const payslipFields = [
  'Payroll date',
  'Pay period',
  'Total earnings',
  'Total deductions',
  'Net income',
  'YTD basic',
  'YTD taxable',
  'YTD tax withheld',
  'Tax status',
  'Position',
  'Department',
];

export default function InquiryScreen() {
  const styles = useInquiryStyles();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 960;
  const { section: rawSection } = useLocalSearchParams<{ section: string }>();
  const section =
    rawSection && rawSection in inquirySections ? (rawSection as InquirySection) : undefined;
  const [typeFilter, setTypeFilter] = useState('All');

  if (!section) {
    return (
      <PortalPage>
        <PageHeading title="Employee Inquiry" description="Employee records and balances." />
        <EmptyState title="Select an inquiry" description="Choose an employee record from navigation." />
      </PortalPage>
    );
  }

  const page = inquirySections[section];
  return (
    <PortalPage>
      <PageHeading title={page.title} description={page.description} />
      <PreviewNotice>
        No employee data is loaded or stored in this prototype. Connect an approved secure employee
        system before showing personal, government-ID, leave, loan, or payroll information.
      </PreviewNotice>

      {section === 'basic-profile' ? (
        <View style={styles.profileCard}>
          <Text style={styles.cardTitle}>Employee information</Text>
          <View style={[styles.profileGrid, isDesktop && styles.desktopProfileGrid]}>
            {profileFields.map((field) => (
              <View key={field} style={[styles.profileItem, isDesktop && styles.desktopProfileItem]}>
                <Text style={styles.fieldLabel}>{field}</Text>
                <Text style={styles.unavailable}>Not connected</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {section === 'leave-balances' ? (
        <View>
          <View style={styles.filter}>
            <ChoicePicker
              label="Leave type"
              value={typeFilter}
              options={leaveTypes}
              onChange={setTypeFilter}
            />
          </View>
          <DataTable columns={leaveColumns} />
        </View>
      ) : null}

      {section === 'loan-balance' ? (
        <View>
          <View style={styles.filter}>
            <ChoicePicker
              label="Loan type"
              value={typeFilter}
              options={loanTypes}
              onChange={setTypeFilter}
            />
          </View>
          <DataTable columns={loanColumns} />
        </View>
      ) : null}

      {section === 'pay-slip' ? (
        <View>
          <View style={styles.payPeriod}>
            <Text style={styles.fieldLabel}>Payroll period</Text>
            <Text style={styles.unavailable}>No payroll periods available while disconnected</Text>
          </View>
          <View style={styles.payrollCard}>
            <Text style={styles.cardTitle}>Payroll summary</Text>
            <View style={[styles.profileGrid, isDesktop && styles.desktopProfileGrid]}>
              {payslipFields.map((field) => (
                <View key={field} style={[styles.profileItem, isDesktop && styles.desktopProfileItem]}>
                  <Text style={styles.fieldLabel}>{field}</Text>
                  <Text style={styles.unavailable}>Not connected</Text>
                </View>
              ))}
            </View>
          </View>
          <EmptyState
            title="Pay slip details unavailable"
            description="A payroll period and approved payroll data connection are required to display a pay slip."
          />
        </View>
      ) : null}
    </PortalPage>
  );
}

function DataTable({ columns }: { columns: string[] }) {
  const styles = useInquiryStyles();
  return (
    <View style={styles.tableCard}>
      <View style={styles.tableHeader}>
        {columns.map((column) => (
          <Text key={column} style={styles.tableHeading}>
            {column}
          </Text>
        ))}
      </View>
      <EmptyState
        title="No records to display"
        description="Balance records will appear here when an approved employee data source is connected."
      />
    </View>
  );
}

function useInquiryStyles() {
  const { colorScheme } = useAppTheme();
  const palette = getPaletteForScheme(colorScheme);
  return useMemo(() => createStyles(palette), [palette]);
}

function createStyles(RcsColors: Record<keyof RcsPalette, string>) {
  return StyleSheet.create({
  filter: { maxWidth: 380, marginBottom: 18, zIndex: 10, elevation: 10 },
  payPeriod: {
    maxWidth: 480,
    padding: 15,
    marginBottom: 18,
    borderRadius: 10,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  profileCard: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  payrollCard: {
    padding: 24,
    marginBottom: 18,
    borderRadius: 16,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  cardTitle: { marginBottom: 18, color: RcsColors.brownDark, fontSize: 18, fontWeight: '800' },
  profileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  desktopProfileGrid: { gap: 14 },
  profileItem: {
    flexGrow: 1,
    flexBasis: '100%',
    minWidth: 0,
    padding: 14,
    borderRadius: 10,
    backgroundColor: RcsColors.background,
  },
  desktopProfileItem: { flexBasis: '48%', minWidth: 200 },
  fieldLabel: { color: RcsColors.grayMuted, fontSize: 11, fontWeight: '700' },
  unavailable: { marginTop: 7, color: RcsColors.grayMuted, fontSize: 13 },
  tableCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  tableHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: RcsColors.border,
  },
  tableHeading: { flex: 1, minWidth: 100, color: RcsColors.grayDark, fontSize: 11, fontWeight: '800' },
  });
}
