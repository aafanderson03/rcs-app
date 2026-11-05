import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ResponsiveText as Text } from '@/components/responsive-text';
import type { RcsPalette } from '@/constants/theme';
import { useAppTheme } from '@/contexts/theme-context';

export const applicationGuide = [
  {
    title: 'Leave application',
    steps: [
      'Piliin ang Leave Application, then click “New.”',
      'Pumili ng Leave Type. Makikita ang Leave Balance pagkatapos makapili ng leave type.',
      'Without Pay: i-tick kung without pay ang leave; i-untick kung with pay.',
      'Date From & To: ilagay ang mga petsa ng pagliban.',
      'Time In & Time Out: ilagay ang aktwal na oras ng pagliban.',
      'Period: piliin ang naaangkop na period — Whole Day para sa buong araw; 1st Half kung tardiness ay ipa-file bilang leave mula sa scheduled time in; 2nd Half para sa undertime leave.',
      'Reason: ilagay ang dahilan ng pagliban.',
      'Gamitin ang attachment clip button upang maglakip ng katunayan ng pagliban.',
      'I-click ang Submit kapag kumpleto na ang mga detalye.',
    ],
  },
  {
    title: 'Attendance application',
    steps: [
      'Piliin ang Attendance Application, then click “New.”',
      'Pumili ng workshift schedule na nakatalaga sa iyo.',
      'Ilagay sa Date In & Date Out ang mga araw na walang transaksyon sa Face Device.',
      'Ilagay ang Date In, Date Out, Break 2 Out, Break 2 In, Time In, at Time Out ayon sa aktwal na araw at oras na kailangang i-file.',
      'Reason: ilagay ang dahilan ng attendance application.',
      'Gamitin ang attachment clip button upang maglakip ng screenshot ng Google Maps/Waze o iba pang patunay.',
      'I-click ang Submit kapag kumpleto na ang mga detalye.',
    ],
  },
  {
    title: 'DTR application',
    steps: [
      'Piliin ang DTR Application, then click “New.”',
      'DTR Type: piliin ang Field Duty No Time In kung Time In ang nawawala, o Field Duty No Time Out kung Time Out ang nawawala.',
      'Date From & To: ilagay ang aktwal na petsa na walang Time In o Time Out.',
      'Time In / Time Out: ilagay ang aktwal na oras na nawawala.',
      'Reason: ilagay ang dahilan ng DTR update application.',
      'Gamitin ang attachment clip button upang maglakip ng dokumentong patunay.',
      'I-click ang Submit kapag kumpleto na ang mga detalye.',
    ],
  },
  {
    title: 'Loan application · Tri-color uniform',
    steps: [
      'Piliin ang Loan Application, then click “New.”',
      'Piliin ang Loan Type ayon sa sukat: T Shirt XS (Extra Small), S (Small), M (Medium), L (Large), or XL (Extra Large).',
      'Particular: ilagay kung ilang set ng uniform ang bibilhin; bawat set ay 2 piraso.',
      'Principal, Principal + Interest, at Deduction Amount: ilagay ang kabuuang halaga ng uniform (₱380 kada set). Hindi maaaring partial payment; ang deduction amount ay kabuuang halaga ng bawat set.',
      'Payroll Period: piliin ang “Both.”',
      'Reason: ilagay ang dahilan ng pagkuha ng tri-color uniform.',
      'I-click ang Submit kapag kumpleto na ang mga detalye.',
    ],
  },
  {
    title: 'Loan application · Company loan',
    steps: [
      'Piliin ang Loan Application, then click “New.”',
      'Loan Type: piliin ang “Loan 2.”',
      'Particular: ilagay ang Terms of Payment — 6 Months - 6%, 12 Months - 12%, 18 Months - 18%, or 24 Months - 24%.',
      'Payroll Period: piliin ang “Both.”',
      'Principal, Principal + Interest, at Deduction Amount: ilagay ang halaga ng hinihiram.',
      'Reason: ilagay ang computed Financial Assistance, existing Loan Balances, at dahilan ng Company Loan.',
      'I-click ang Submit kapag kumpleto na ang mga detalye.',
    ],
  },
  {
    title: 'Overtime application',
    steps: [
      'Piliin ang Overtime Application, then click “New.”',
      'Applicable Date: ilagay ang petsa ng overtime.',
      'I-tick ang “On Call OT” kung may pagitan sa regular na Time Out at overtime Time In; i-untick kung wala.',
      'Ilagay ang Time In / start time ng overtime at Time Out / oras ng pagtatapos.',
      'Para sa Holiday OT, punan ang start time batay sa aktwal na Time In. Halimbawa: kung 8:30 AM–5:30 PM ang workshift, 9:00 AM ang aktwal na Time In, at 10:00 PM ang Time Out, ilagay ang 9:00 AM bilang Start Time of OT at 10:00 PM bilang Time Out.',
      'Ilagay ang dahilan ng overtime.',
      'Gamitin ang attachment clip button para sa kinakailangang dokumento, kung mayroon.',
      'I-click ang Submit kapag kumpleto na ang mga detalye.',
    ],
  },
  {
    title: 'Profile application',
    steps: [
      'Piliin ang Profile Application, then click “New.”',
      'I-update ang naaangkop na personal information: full name (First Name, Middle Name, Last Name, Suffix), present address, region, country, ZIP code, district, telephone number, mobile number, email, at civil status.',
      'Kapag nagbago ang civil status, kailangang i-update din ang SSS, PhilHealth, at Pag-IBIG records. Maaari ring magtalaga ng dependent.',
      'Gamitin ang attachment clip button para sa proof, kung mayroon.',
      'I-click ang Submit kapag pinal at kumpleto na ang profile details.',
    ],
  },
  {
    title: 'Rest day application · Additional rest day / assigning an RD',
    steps: [
      'Piliin ang Rest Day Application, then click “New.”',
      'Date From & To: ilagay ang araw na itatalaga bilang rest day.',
      'Rest Day 1: piliin ang araw batay sa itinakdang Date From & To.',
      'Reason: ilagay ang dahilan ng rest day.',
      'Gamitin ang attachment clip button kung may kalakip na patunay, then i-click ang Submit kapag kumpleto na ang detalye.',
    ],
  },
  {
    title: 'Rest day application · Change rest day',
    steps: [
      'Piliin ang Rest Day Application, then click “New.”',
      'Date From: ilagay ang petsa ng kasalukuyang rest day.',
      'Date To: ilagay ang bagong petsa na itatalaga bilang rest day.',
      'Rest Day 1: piliin ang araw batay sa bagong petsa ng rest day.',
      'Ilagay ang dahilan ng pagbabago.',
      'Gamitin ang attachment clip button kung may kalakip na patunay, then i-click ang Submit kapag kumpleto na ang detalye.',
    ],
  },
  {
    title: 'Rest day application · Cancel rest day',
    steps: [
      'Piliin ang Rest Day Application, then click “New.”',
      'Date From & Date To: ilagay ang petsa ng rest day na kailangang kanselahin.',
      'Rest Day 1: piliin ang araw batay sa petsa ng rest day na kakanselahin.',
      'I-tick ang kahon sa tabi ng “Cancel Day-Off.”',
      'Reason: ilagay ang dahilan ng pagkansela.',
      'Gamitin ang attachment clip button kung may kalakip na patunay, then i-click ang Submit kapag kumpleto na ang detalye.',
    ],
  },
  {
    title: 'Workshift application',
    steps: [
      'Piliin ang Workshift Application, then click “New.”',
      'Date From & To: ilagay ang mga araw na kailangang palitan o lagyan ng workshift schedule.',
      'Pindutin ang arrow dropdown sa ibaba ng workshift field, sa kanang bahagi.',
      'Piliin ang workshift schedule na pinakamalapit sa aktwal na oras ng pasok.',
      'Reason: ilagay ang dahilan ng workshift application.',
      'I-click ang Submit kapag kumpleto na ang mga detalye.',
    ],
  },
  {
    title: 'Additional reminder',
    steps: [
      'Ang aktwal na Time In ng empleyado ay hindi dapat lumampas sa apat (4) na oras na pagitan mula sa workshift schedule.',
      'Kung apat na oras o higit pa ang pagitan, pumili ng schedule na mas malapit sa aktwal na Time In.',
    ],
  },
];

export function ApplicationGuideContent({ searchQuery = '' }: { searchQuery?: string }) {
  const { palette } = useAppTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const matchingSections = applicationGuide
    .map((section) => {
      const titleMatches = section.title.toLowerCase().includes(normalizedQuery);
      const steps = normalizedQuery && !titleMatches
        ? section.steps.filter((step) => step.toLowerCase().includes(normalizedQuery))
        : section.steps;
      return { ...section, steps };
    })
    .filter((section) => !normalizedQuery || section.title.toLowerCase().includes(normalizedQuery) || section.steps.length > 0);

  return (
    <View style={styles.content}>
      <Text style={styles.notice}>
        Batay ito sa employee guide material. Maaaring magbago ang eligibility, deadlines, at requirements;
        kumpirmahin ang kasalukuyang detalye sa HR at sa naaangkop na ahensya o insurance provider.
        For a detailed application guide, piliin ang Help → User Manual sa menu at gamitin ang download button.
      </Text>

      {matchingSections.map((section, sectionIndex) => {
        const expanded = expandedSection === section.title;
        return (
        <View key={section.title} style={styles.section}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            onPress={() => setExpandedSection(expanded ? null : section.title)}
            style={({ pressed }) => [styles.sectionToggle, pressed && styles.pressed]}
          >
            <Text style={styles.sectionNumber}>{String(sectionIndex + 1).padStart(2, '0')}</Text>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionChevron}>{expanded ? '−' : '+'}</Text>
          </Pressable>
          {expanded ? (
            <View style={styles.steps}>
              {section.steps.map((step, index) => (
                <View key={`${section.title}-${index}`} style={styles.step}>
                  <Text style={styles.stepNumber}>{index + 1}.</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
        );
      })}
    </View>
  );
}

function createStyles(RcsColors: Record<keyof RcsPalette, string>) {
  return StyleSheet.create({
    content: { gap: 0 },
    notice: {
      padding: 12,
      borderRadius: 4,
      backgroundColor: RcsColors.yellowLight,
      color: RcsColors.grayDark,
      fontSize: 12,
      lineHeight: 18,
    },
    section: { borderBottomWidth: 1, borderBottomColor: RcsColors.border },
    sectionToggle: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 10,
    },
    sectionNumber: { width: 25, color: RcsColors.brown, fontSize: 11, fontWeight: '700' },
    sectionTitle: { flex: 1, color: RcsColors.text, fontSize: 14, fontWeight: '700' },
    sectionChevron: { width: 24, color: RcsColors.brown, fontSize: 20, textAlign: 'center' },
    steps: { gap: 9, paddingLeft: 37, paddingTop: 2, paddingBottom: 17, paddingRight: 8 },
    step: { flexDirection: 'row', alignItems: 'flex-start', gap: 7 },
    stepNumber: { minWidth: 20, color: RcsColors.brown, fontSize: 12, lineHeight: 19, fontWeight: '700' },
    stepText: { flex: 1, color: RcsColors.grayDark, fontSize: 12, lineHeight: 19 },
    pressed: { opacity: 0.75 },
  });
}
