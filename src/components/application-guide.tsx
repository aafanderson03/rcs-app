import { StyleSheet, Text, View } from 'react-native';

import { RcsColors } from '@/constants/theme';

export const applicationGuide = [
  {
    title: 'Leave',
    steps: [
      'Choose the leave type. The legacy portal displays the leave balance after a type is selected.',
      'Mark Without Pay only when the request is unpaid.',
      'Enter the absence dates, actual time away, and the applicable period: Whole Day, 1st Half for tardiness filed as leave, or 2nd Half for undertime leave.',
      'Enter the reason. Attach supporting proof if needed.',
    ],
  },
  {
    title: 'Attendance',
    steps: [
      'Choose the workshift schedule assigned to you.',
      'Enter the dates with missing Face Device transactions and the actual in/out and break times that need to be filed.',
      'Explain the reason and attach evidence such as a Google Maps/Waze screenshot or other supporting proof.',
    ],
  },
  {
    title: 'DTR update',
    steps: [
      'Choose Field Duty No Time In or Field Duty No Time Out.',
      'Enter the date range and actual time in or time out that is missing.',
      'Explain the reason and attach supporting proof.',
    ],
  },
  {
    title: 'Loan',
    steps: [
      'For tri-color uniforms, choose the shirt size. Enter the number of sets in Particular (2 pieces per set); the guide states ₱380 per set and says partial payment is not allowed. Set Payroll Period to Both.',
      'For a company loan, select Loan 2. Put the payment terms in Particular, set Payroll Period to Both, and enter the requested amount. Include computed financial assistance, existing loan balances, and the reason in the reason field.',
      'Attach any supporting document if required.',
    ],
  },
  {
    title: 'Overtime',
    steps: [
      'Enter the applicable overtime date.',
      'Mark On Call OT when there is a gap between the regular time-out and the overtime time-in.',
      'Enter the actual overtime start and end times and explain the reason. The legacy guide gives a holiday overtime example: use the employee’s actual time in as the OT start when it differs from the scheduled shift.',
      'Attach supporting documents if required.',
    ],
  },
  {
    title: 'Profile update',
    steps: [
      'Update the applicable personal details, including name, present address, region, country, ZIP code, district, telephone/mobile number, email, and civil status.',
      'The legacy guide notes that SSS, PhilHealth, and Pag-IBIG records must also be updated when civil status changes. Dependents may be added.',
      'Attach proof if needed.',
    ],
  },
  {
    title: 'Rest day',
    steps: [
      'For an additional/assigned rest day, enter the date range, choose Rest Day 1, and explain the reason.',
      'For a change of rest day, enter the current and new dates, choose the new rest day, and explain the change.',
      'To cancel a rest day, enter the relevant dates, choose Rest Day 1, mark Cancel Day-Off, and explain the reason.',
      'Attach supporting proof if needed.',
    ],
  },
  {
    title: 'Workshift',
    steps: [
      'Enter the date range that needs a workshift schedule change or assignment.',
      'Choose the schedule that matches the actual hours you will work.',
      'Explain the reason.',
    ],
  },
  {
    title: 'Reminder from the legacy guide',
    steps: [
      'The guide says actual time in should not be four hours or more apart from the assigned workshift start. If it is, choose a schedule closer to the actual time in.',
    ],
  },
];

export function ApplicationGuideContent() {
  return (
    <View style={styles.content}>
      <Text style={styles.notice}>
        This summarizes the guide in the legacy portal. To file a request, use the legacy system’s
        Help → User Manual for its downloadable detailed instructions. This prototype does not
        submit requests.
      </Text>
      {applicationGuide.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.steps.map((step, index) => (
            <View key={`${section.title}-${index}`} style={styles.step}>
              <Text style={styles.stepNumber}>{index + 1}.</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14 },
  notice: {
    padding: 12,
    borderRadius: 9,
    backgroundColor: RcsColors.yellowLight,
    color: RcsColors.grayDark,
    fontSize: 12,
    lineHeight: 18,
  },
  section: { gap: 7 },
  sectionTitle: { color: RcsColors.brownDark, fontSize: 14, fontWeight: '800' },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 7 },
  stepNumber: { color: RcsColors.brown, fontSize: 12, fontWeight: '700' },
  stepText: { flex: 1, color: RcsColors.grayDark, fontSize: 12, lineHeight: 18 },
});
