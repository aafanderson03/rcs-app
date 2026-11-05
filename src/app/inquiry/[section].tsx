import { ChoicePicker, EmptyState, PageHeading, PortalPage, PreviewNotice } from '@/components/portal-ui';
import { ResponsiveText as Text } from '@/components/responsive-text';
import type { RcsPalette } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { demoLeaveBalances, demoLoans, demoPayslip, demoProfileValues, formatDemoDate } from '@/data/demo-data';
import { resolveIdentity, rcsDemoProfileValues } from '@/data/employee-records';
import { buildPayslipHtml, payslipFileName } from '@/data/payslip-html';
import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

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
  'Payroll Date', 'Pay Period', 'Total Earnings', 'Total Deductions', 'Net Income',
  'YTD Basic', 'YTD Taxable', 'YTD Tax Withheld', 'Tax Status', 'Position', 'Department',
];

const payslipKeys = {
  'Payroll Date': 'payrollDate',
  'Pay Period': 'payPeriod',
  'Total Earnings': 'totalEarnings',
  'Total Deductions': 'totalDeductions',
  'Net Income': 'netIncome',
  'YTD Basic': 'ytdBasic',
  'YTD Taxable': 'ytdTaxable',
  'YTD Tax Withheld': 'ytdTaxWithheld',
  'Tax Status': 'taxStatus',
  Position: 'position',
  Department: 'department',
} as const;

export default function InquiryScreen() {
  const { user, profilePicture, hasCustomProfilePicture, profilePictureError, setProfilePicture } = useAuth();
  const isRcsDemo = user?.company.slug === 'rcs-eastern-intertrade' && user.username === 'demo';
  const identity = resolveIdentity(user?.displayName, user?.company.slug, user?.username);
  const styles = useInquiryStyles();
  const { width } = useWindowDimensions();
  const wideBalanceCards = Platform.OS === 'web' && width >= 960;
  const isDesktop = Platform.OS === 'web' && width >= 960;
  const { section: rawSection } = useLocalSearchParams<{ section: string }>();
  const section =
    rawSection && rawSection in inquirySections ? (rawSection as InquirySection) : undefined;
  const payPeriods = demoPayslip.map((slip) => slip.payPeriod); // newest fsirst
const [payPeriod, setPayPeriod] = useState(payPeriods[0]);
const selectedPayslip = demoPayslip.find((slip) => slip.payPeriod === payPeriod) ?? demoPayslip[0];
const [printError, setPrintError] = useState('');
const [photoError, setPhotoError] = useState('');

const chooseProfilePicture = async () => {
  setPhotoError('');
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.72,
      base64: true,
    });
    if (result.canceled) return;
    const image = result.assets[0];
    const imageData = image?.base64;
    if (!imageData) throw new Error('The selected image could not be prepared.');
    await setProfilePicture(`data:${image.mimeType ?? 'image/jpeg'};base64,${imageData}`);
  } catch (error: unknown) {
    console.error('Unable to set the profile picture.', error);
    setPhotoError(error instanceof Error ? error.message : 'Unable to save the profile picture.');
  }
};

const removeProfilePicture = async () => {
  setPhotoError('');
  try {
    await setProfilePicture(null);
  } catch (error: unknown) {
    console.error('Unable to remove the profile picture.', error);
    setPhotoError(error instanceof Error ? error.message : 'Unable to remove the profile picture.');
  }
};

const printPayslip = async () => {
  setPrintError('');
  const html = buildPayslipHtml(selectedPayslip, {
  employeeName: `${identity.listName} (${identity.employeeCode})`,
  employeeNameShort: identity.listName,
});
  const fileName = payslipFileName(selectedPayslip);
  try {
    if (Platform.OS === 'web') {

      const win = window.open('', '_blank');
      if (!win) throw new Error('Pop-up blocked');
      win.document.write(html);
      win.document.close();
      win.focus();
      win.print();
      return;
    }


    const { uri } = await Print.printToFileAsync({ html, width: 842, height: 595 });
    const named = new File(Paths.cache, `${fileName}.pdf`);
    if (named.exists) named.delete();
    new File(uri).move(named);
    await Sharing.shareAsync(named.uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: fileName,
    });
  } catch {
    setPrintError('Could not create the pay slip. Allow pop-ups (web) and try again.');
  }
};
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
        {isRcsDemo
          ? 'Career details are based on your resume. Contact, address, birth date, identifiers, scores, and compensation use altered synthetic demo values, not encrypted real data.'
          : 'Fictional demo information for presentation only. Sensitive identifiers are masked; this is not a live employee record.'}
      </PreviewNotice>

      {section === 'basic-profile' ? (
        <View style={[styles.profileCard, width < 600 && styles.mobileCard]}>
          <View style={styles.profilePictureRow}>
            <View style={styles.profilePictureFrame}>
              {profilePicture ? (
                <Image
                  source={profilePicture}
                  contentFit="cover"
                  style={styles.profilePicture}
                  accessibilityLabel="Your profile picture"
                />
              ) : (
                <Text style={styles.profilePictureInitials}>
                  {identity.firstName.charAt(0)}{identity.lastName.charAt(0)}
                </Text>
              )}
            </View>
            <View style={styles.profilePictureActions}>
              <Pressable
                accessibilityRole="button"
                onPress={chooseProfilePicture}
                style={({ pressed }) => [styles.profilePictureButton, pressed && { opacity: 0.75 }]}
              >
                <Text style={styles.profilePictureButtonText}>
                  {profilePicture ? 'Change photo' : 'Add profile picture'}
                </Text>
              </Pressable>
              {hasCustomProfilePicture ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={removeProfilePicture}
                  style={({ pressed }) => [styles.removeProfilePictureButton, pressed && { opacity: 0.75 }]}
                >
                  <Text style={styles.removeProfilePictureText}>Restore default photo</Text>
                </Pressable>
              ) : null}
              <Text style={styles.profilePictureHint}>Saved on this device only.</Text>
              {photoError || profilePictureError ? (
                <Text style={styles.photoError}>{photoError || profilePictureError}</Text>
              ) : null}
            </View>
          </View>
          <Text style={styles.cardTitle}>Employee information</Text>
          <View style={[styles.profileGrid, isDesktop && styles.desktopProfileGrid]}>
            {profileFields.map((field) => (
              <View key={field} style={[styles.profileItem, isDesktop && styles.desktopProfileItem]}>
                  <Text style={styles.fieldLabel}>{field}</Text>
                <Text style={styles.fieldValue}>
                  {field === 'Employee name'
                    ? identity.fullName
                  : field === 'Employee code'
                    ? identity.employeeCode
                  : isRcsDemo
                    ? rcsDemoProfileValues[field] ?? 'DEMO VALUE'
                    : demoProfileValues[field] ?? 'Sample record'}
                </Text>
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
          <BalanceCards
            kind="leave"
            wide={wideBalanceCards}
            rows={demoLeaveBalances
              .filter((row) => typeFilter === 'All' || row.type === typeFilter)
              .map((row) => [row.type, row.used, row.total, row.from, row.to, formatDemoDate(row.updated), row.chargedTo])}
          />
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
          <BalanceCards
            kind="loan"
            wide={wideBalanceCards}
            rows={demoLoans
              .filter((row) => typeFilter === 'All' || row.type === typeFilter)
              .map((row) => [row.type, row.total, formatDemoDate(row.date), row.deduction, row.balance])}
          />
        </View>
      ) : null}

{section === 'pay-slip' ? (
  <View>
    <View style={styles.filter}>
      <ChoicePicker
        label="Pay period"
        value={payPeriod}
        options={payPeriods}
        onChange={setPayPeriod}
      />
    </View>
    <Pressable
  accessibilityRole="button"
  accessibilityLabel="Print pay slip"
  onPress={printPayslip}
  style={({ pressed }) => [styles.printButton, pressed && { opacity: 0.75 }]}
>
  <Text style={styles.printButtonText}>Print pay slip</Text>
</Pressable>
{printError ? <Text style={styles.printError}>{printError}</Text> : null}

    <View style={[styles.payrollCard, width < 600 && styles.mobileCard]}>
      <Text style={styles.cardTitle}>Payroll summary</Text>
      <View style={[styles.profileGrid, isDesktop && styles.desktopProfileGrid]}>
        {payslipFields.map((field) => (
          <View key={field} style={[styles.profileItem, isDesktop && styles.desktopProfileItem]}>
            <Text style={styles.fieldLabel}>{field}</Text>
            <Text style={styles.fieldValue}>
              {selectedPayslip[payslipKeys[field as keyof typeof payslipKeys]] || '—'}
            </Text>
          </View>
        ))}
      </View>
    </View>
    <View style={[styles.payrollCard, width < 600 && styles.mobileCard]}>
      <Text style={styles.cardTitle}>Earnings</Text>
      <View style={[styles.profileGrid, isDesktop && styles.desktopProfileGrid]}>
        {selectedPayslip.earnings.map((row) => (
          <View key={row.description} style={[styles.profileItem, isDesktop && styles.desktopProfileItem]}>
            <Text style={styles.fieldLabel}>{row.description}</Text>
            <Text style={styles.fieldValue}>{row.amount}</Text>
            <Text style={styles.fieldSubtext}>{row.hours} hours</Text>
          </View>
        ))}
      </View>
    </View>

    <View style={[styles.payrollCard, width < 600 && styles.mobileCard]}>
      <Text style={styles.cardTitle}>Deductions</Text>
      <View style={[styles.profileGrid, isDesktop && styles.desktopProfileGrid]}>
        {selectedPayslip.deductions.map((row) => (
          <View key={row.description} style={[styles.profileItem, isDesktop && styles.desktopProfileItem]}>
            <Text style={styles.fieldLabel}>{row.description}</Text>
            <Text style={styles.fieldValue}>{row.amount}</Text>
            <Text style={styles.fieldSubtext}>Balance: {row.balance}</Text>
          </View>
        ))}
      </View>
    </View>
  </View>
) : null}
    </PortalPage>
  );
}

function BalanceCards({ kind, rows, wide = false }: { kind: 'leave' | 'loan'; rows: string[][]; wide?: boolean }) {
  const styles = useInquiryStyles();
  const isLeave = kind === 'leave';

  return (
    <View style={[styles.balanceCards, wide && styles.wideBalanceCards]}>
      {rows.map((row, index) => {
        const remaining = isLeave ? Number(row[2]) - Number(row[1]) : 0;
        const balance = isLeave ? `${remaining.toFixed(1)} days` : row[4] || '—';
        const details = isLeave
          ? [
              ['Used', `${row[1]} of ${row[2]} days`],
              ['From', formatDemoDate(row[3])],
              ['To', formatDemoDate(row[4])],
              ['Updated', row[5]],
              ['Charged to', row[6]],
            ]
          : [
              ['Original amount', row[1]],
              ['Loan date', row[2]],
              ['Deduction', row[3]],
            ];

        return (
          <View key={`${row[0]}-${index}`} style={[styles.balanceCard, wide && styles.wideBalanceCard]}>
            <View style={styles.balanceCardHeading}>
              <Text style={styles.balanceCardTitle}>{row[0]}</Text>
              <View style={styles.balanceAmount}>
                <Text style={styles.balanceAmountLabel}>{isLeave ? 'Remaining' : 'Balance'}</Text>
                <Text style={styles.balanceAmountValue}>{balance}</Text>
              </View>
            </View>
            {details.map(([label, value]) => (
              <View key={label} style={styles.balanceDetail}>
                <Text style={styles.balanceDetailLabel}>{label}</Text>
                <Text style={styles.balanceDetailValue}>{value || '—'}</Text>
              </View>
            ))}
          </View>
        );
      })}
      {!rows.length ? (
        <Text style={styles.balanceEmpty}>No {isLeave ? 'leave' : 'loan'} balances match this type.</Text>
      ) : null}
    </View>
  );
}

function useInquiryStyles() {
  const { palette } = useAppTheme();
  return useMemo(() => createStyles(palette), [palette]);
}

function createStyles(RcsColors: Record<keyof RcsPalette, string>) {
  return StyleSheet.create({
  filter: { maxWidth: 380, marginBottom: 18, zIndex: 10, elevation: 10 },
  profileCard: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  profilePictureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 22,
  },
  profilePictureFrame: {
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 42,
    backgroundColor: RcsColors.yellowLight,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  profilePicture: { width: '100%', height: '100%' },
  profilePictureInitials: { color: RcsColors.brown, fontSize: 24, fontWeight: '800' },
  profilePictureActions: { flex: 1, minWidth: 150, alignItems: 'flex-start', gap: 8 },
  profilePictureButton: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: RcsColors.brown,
  },
  profilePictureButtonText: { color: RcsColors.white, fontSize: 12, fontWeight: '700' },
  removeProfilePictureButton: { minHeight: 32, justifyContent: 'center', paddingHorizontal: 4 },
  removeProfilePictureText: { color: RcsColors.danger, fontSize: 12, fontWeight: '700' },
  profilePictureHint: { color: RcsColors.grayMuted, fontSize: 11 },
  photoError: { color: RcsColors.danger, fontSize: 12, lineHeight: 17 },
  payrollCard: {
    padding: 24,
    marginBottom: 18,
    borderRadius: 12,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  printButton: {
  alignSelf: 'flex-start',
  minHeight: 44,
  justifyContent: 'center',
  marginBottom: 18,
  paddingHorizontal: 18,
  borderRadius: 10,
  backgroundColor: RcsColors.brown,
},
printButtonText: { color: RcsColors.white, fontSize: 13, fontWeight: '700' },
printError: { marginTop: -8, marginBottom: 14, color: RcsColors.danger, fontSize: 12 },
  mobileCard: { padding: 16, borderRadius: 12 },
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
  desktopProfileItem: { flexBasis: '45%', minWidth: 200 },
  fieldLabel: { color: RcsColors.grayMuted, fontSize: 11, fontWeight: '700' },
  fieldValue: { marginTop: 7, color: RcsColors.text, fontSize: 13, fontWeight: '600' },
  
  balanceCards: { gap: 12 },
  wideBalanceCards: { flexDirection: 'row', flexWrap: 'wrap' },
  balanceCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  wideBalanceCard: { flexBasis: '48%', flexGrow: 0, minWidth: 300 },
  balanceCardHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 12,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: RcsColors.border,
  },
  balanceCardTitle: { flex: 1, color: RcsColors.text, fontSize: 15, lineHeight: 21, fontWeight: '800' },
  balanceAmount: { alignItems: 'flex-end' },
  balanceAmountLabel: { color: RcsColors.grayMuted, fontSize: 10, fontWeight: '700' },
  balanceAmountValue: { marginTop: 3, color: RcsColors.brown, fontSize: 16, fontWeight: '800' },
  balanceDetail: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 6 },
  balanceDetailLabel: { flex: 1, color: RcsColors.grayMuted, fontSize: 11, fontWeight: '600' },
  balanceDetailValue: { flex: 1, color: RcsColors.text, fontSize: 11, fontWeight: '600', textAlign: 'right' },
  balanceEmpty: { padding: 16, color: RcsColors.grayMuted, fontSize: 13 },
  fieldSubtext: { marginTop: 4, color: RcsColors.grayMuted, fontSize: 11 },  
  
});
}
