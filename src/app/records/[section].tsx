import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState, PageHeading, PortalPage, PreviewNotice } from '@/components/portal-ui';
import { ResponsiveText as Text } from '@/components/responsive-text';
import { getPaletteForScheme, type RcsPalette } from '@/constants/theme';
import { useAppTheme } from '@/contexts/theme-context';
import { demoRecordValues } from '@/data/demo-data';

const sectionTitles: Record<string, string> = {
  'annual-physical-exams': 'Annual Physical Exams',
  'awards-commendations': 'Awards & Commendations',
  'bank-accounts': 'Bank Accounts',
  'disciplinary-cases': 'Disciplinary Cases',
  'disciplinary-remarks': 'Disciplinary Remarks',
  'educational-background': 'Educational Background',
  'examination-result': 'Examination Result',
  'family-information': 'Family Information',
  'forms-submitted-to-government': 'Forms Submitted to Government',
  'government-exams': 'Government Exams',
  'health-insurance': 'Health Insurance',
  'health-record': 'Health Record',
  'insurance-claims': 'Insurance Claims',
  'languages-and-dialects': 'Languages and Dialects',
  'licenses-and-other-eligibility': 'Licenses and Other Eligibility',
  'medical-cases': 'Medical Cases',
  'medical-reimbursements': 'Medical Reimbursements',
  'narrative-report': 'Narrative Report',
  'previous-employment': 'Previous Employment',
  references: 'References',
  'seminars-and-trainings': 'Seminars and Trainings',
  skills: 'Skills',
  'personal-information': 'Personal Information',
  'employment-information': 'Employment Information',
};

export default function EmployeeRecordScreen() {
  const { colorScheme } = useAppTheme();
  const palette = getPaletteForScheme(colorScheme);
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { section } = useLocalSearchParams<{ section: string }>();
  const title = section ? sectionTitles[section] : undefined;
  const rows = section ? demoRecordValues[section] : undefined;

  if (!title) {
    return (
      <PortalPage>
        <PageHeading title="Employee Records" description="Browse employee record sections." />
        <EmptyState
          title="Choose a record section"
          description="Select a section from Employee Records in the navigation menu."
        />
      </PortalPage>
    );
  }

  return (
    <PortalPage>
      <PageHeading title={title} description={`Review your ${title.toLowerCase()} information.`} />
      <PreviewNotice>
        Fictional sample content for presentation only. Sensitive identifiers are masked and no live employee system is connected.
      </PreviewNotice>
      <View style={styles.card}>{(rows ?? [{ label: 'Status', value: 'Sample section' }]).map((row, index) => <View key={`${row.label}-${index}`} style={styles.row}><Text style={styles.label}>{row.label}</Text><Text style={styles.value}>{row.value}</Text></View>)}</View>
    </PortalPage>
  );
}

function createStyles(colors: Record<keyof RcsPalette, string>) {
  return StyleSheet.create({
    card: { padding: 18, borderRadius: 4, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    row: { gap: 6, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    label: { color: colors.grayMuted, fontSize: 11, fontWeight: '700' },
    value: { color: colors.text, fontSize: 13, lineHeight: 19 },
  });
}
