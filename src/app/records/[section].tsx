import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { EmptyState, PageHeading, PortalPage, PreviewNotice } from '@/components/portal-ui';
import { ResponsiveText as Text } from '@/components/responsive-text';
import { getPaletteForScheme, type RcsPalette } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { demoRecordValues } from '@/data/demo-data';
import { getEmployeeRecordGroups, resolveIdentity, type RecordGroup } from '@/data/employee-records';

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
  const { user } = useAuth();
  const { colorScheme } = useAppTheme();
  const palette = getPaletteForScheme(colorScheme);
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { width } = useWindowDimensions();
  const { section } = useLocalSearchParams<{ section: string }>();
  const title = section ? sectionTitles[section] : undefined;
  const identity = useMemo(() => resolveIdentity(user?.displayName), [user?.displayName]);
 
  const groups = useMemo<RecordGroup[]>(() => {
    const custom = getEmployeeRecordGroups(section, identity);
    if (custom) return custom;
    const sampleRows = (section ? demoRecordValues[section] : undefined) ?? [
      { label: 'Status', value: 'Sample section' },
    ];
    return [
      {
        kind: 'fields',
        columns: 3,
        fields: sampleRows.map((row) => ({
          label: row.label,
 
          value: row.label === 'Account name' || row.label === 'Name' ? identity.fullName : row.value,
        })),
      },
    ];
  }, [section, identity]);

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

      <View style={[styles.card, width < 600 && styles.mobileCard]}>
        {groups.map((group, index) => (
          <RecordGroupView key={`${group.kind}-${index}`} group={group} styles={styles} width={width} />
        ))}
      </View>
    </PortalPage>
  );
}

function columnsFor(width: number, wanted = 3) {
  if (width >= 960) return wanted;
  if (width >= 600) return Math.min(2, wanted);
  return 1;
}

function RecordGroupView({
  group,
  styles,
  width,
}: {
  group: RecordGroup;
  styles: ReturnType<typeof createStyles>;
  width: number;
}) {
  if (group.kind === 'text') {
    return (
      <View>
        <Text style={styles.groupTitle}>{group.title}</Text>
        <Text style={styles.value}>{group.text}</Text>
      </View>
    );
  }

  if (group.kind === 'table') {
    return (
      <View>
        <Text style={styles.groupTitle}>{group.title}</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            {group.columns.map((column) => (
              <Text key={column} style={styles.tableHeading}>{column}</Text>
            ))}
          </View>
          {group.rows.length ? (
            group.rows.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.tableRow}>
                {row.map((cell, cellIndex) => (
                  <Text key={cellIndex} style={styles.tableCell}>{cell}</Text>
                ))}
              </View>
            ))
          ) : (
            <Text style={styles.tableEmpty}>{group.emptyText}</Text>
          )}
        </View>
      </View>
    );
  }

  const columns = columnsFor(width, group.columns);
  const itemWidth = `${100 / columns}%` as `${number}%`;
  return (
    <View>
      {group.title ? <Text style={styles.groupTitle}>{group.title}</Text> : null}
      <View style={styles.fieldWrap}>
        {group.fields.map((field, index) => (
          <View key={`${field.label}-${index}`} style={[styles.fieldItem, { width: itemWidth }]}>
            {group.kind === 'flags' ? (
              <Text style={styles.flagText}>
                <Text style={styles.label}>{field.label}: </Text>
                <Text style={styles.value}>{field.value}</Text>
              </Text>
            ) : (
              <>
                <Text style={styles.label}>{field.label}</Text>
                <Text style={styles.value}>{field.value || '—'}</Text>
              </>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

function createStyles(colors: Record<keyof RcsPalette, string>) {
  return StyleSheet.create({
    card: { padding: 18, borderRadius: 4, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    mobileCard: { padding: 14 },
    row: { gap: 6, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    label: { color: colors.grayMuted, fontSize: 11, fontWeight: '700' },
    value: { color: colors.text, fontSize: 13, lineHeight: 19 },
    groupTitle: {
      marginTop: 22,
      marginBottom: 6,
      paddingBottom: 8,
      color: colors.brownDark,
      fontSize: 15,
      fontWeight: '800',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    fieldWrap: { flexDirection: 'row', flexWrap: 'wrap' },
    fieldItem: { minWidth: 0, paddingVertical: 8, paddingRight: 12, gap: 3 },
    flagText: { lineHeight: 20 },
    table: { marginTop: 6, borderWidth: 1, borderColor: colors.border, borderRadius: 4, overflow: 'hidden' },
    tableHeader: { flexDirection: 'row', backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border },
    tableHeading: { flex: 1, padding: 10, color: colors.grayDark, fontSize: 11, fontWeight: '800' },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
    tableCell: { flex: 1, padding: 10, color: colors.text, fontSize: 12 },
    tableEmpty: { padding: 14, color: colors.grayMuted, fontSize: 12, textAlign: 'center' },
  });
}
