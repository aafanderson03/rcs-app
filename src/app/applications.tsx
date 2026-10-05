import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ChoicePicker,
  EmptyState,
  PageHeading,
  PortalCalendar,
  PortalPage,
  PreviewNotice,
} from '@/components/portal-ui';
import { RcsColors } from '@/constants/theme';

const transactionTypes = [
  'Attendance',
  'DTR Update',
  'Leave',
  'Loan',
  'Other Transactions',
  'Overtime',
  'Profile',
  'Rest Day',
  'Workshift',
];
const typeFilters = ['All transaction types', ...transactionTypes];
const statusFilters = ['Pending', 'Approved', 'Disapproved', 'Cancelled'];

type RequestField = {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'time' | 'number' | 'email' | 'select' | 'combo' | 'checkbox' | 'textarea';
  required?: boolean;
  options?: string[];
  placeholder?: string;
};

type RequestSection = { title: string; fields: RequestField[]; repeatable?: boolean };

const legacyWorkshiftOptions = [
  '0100A1000A', '0100P0600P', '0100P0700P', '0100P1000P', '0130P0800P', '0200A1100A',
  '0200P1100P', '0210A1110A', '0300A1200P', '0310A1210P', '0400A0100P', '0400P0100A',
  '0410A0110P', '0500A0200P', '0510A0210P', '0600A0300P', '0600A0340P', '0600A0410P',
  '0610A0310P', '0630A0330P', '0630A0410P', '0630A0440P', '0630A1130A', '0630A1200P',
  '0700A0100P', '0700A0400P', '0700A0440P', '0700A0510P', '0700A1200P', '0710A0410P',
  '0730A0100P', '0730A0130P', 'REG0730A0430P', '0730A0510P', '0730A0540P', '0730A1230P',
  '0730A0430P', '0800A0100P', '0800A0500P', '0800A0540P', '0800A0610P', '0800P0500A',
  '0800P0610A', '0830A0530P', '0830A0610P', '0900A0600P', '0900A0640P', '0900A0710P',
  'REG0930A0630P', '0930A0710P', '0930A0740P', '1000A0700P', '1000A0740P', '1000A0810P',
  '1000P0700A', 'REG1030A0730P', '1030A0810P', '1030A0840P', '1030AM730PM',
  'REG1040A0740P', '1100A0800P', '1100A0840P', '1100A0910P', '1130A0430P', '1130A0830P',
  '1130A0910P', '1130A0940P', '1200A0900A', '1200P0500P', '1200P0530P', '1200P0600P',
  '1200P0900P', '1200P0940P', '1200P1010P', '1200P1040P', 'REG1200P0900P', '1210A0910A',
  '1230P0530P', '1230P0630P', '1230P1010P', '1230P1040P', '0100P1110P', '0200P1140P',
  '0130P1140P', '0100P1040P', 'REG630AM330PM', 'REG7AM4PM', 'REG800AM500PM', 'REG830AM530P',
];

const requestForms: Record<string, RequestSection[]> = {
  Attendance: [
    {
      title: 'Attendance details',
      fields: [
        {
          key: 'shift',
          label: 'Shift',
          type: 'combo',
          options: legacyWorkshiftOptions,
          placeholder: 'Search available shift times',
          required: true,
        },
        { key: 'lateFiling', label: 'Late Filing', type: 'checkbox' },
        { key: 'dateIn', label: 'Date In', type: 'date', required: true },
        { key: 'timeIn', label: 'Time In', type: 'time', required: true },
        { key: 'break1Out', label: 'Break 1 Out', type: 'time' },
        { key: 'break1In', label: 'Break 1 In', type: 'time' },
        { key: 'break2Out', label: 'Break 2 Out', type: 'time' },
        { key: 'break2In', label: 'Break 2 In', type: 'time' },
        { key: 'break3Out', label: 'Break 3 Out', type: 'time' },
        { key: 'break3In', label: 'Break 3 In', type: 'time' },
        { key: 'dateOut', label: 'Date Out', type: 'date', required: true },
        { key: 'timeOut', label: 'Time Out', type: 'time', required: true },
        { key: 'reason', label: 'Reason', type: 'textarea', required: true },
      ],
    },
  ],
  'DTR Update': [
    {
      title: 'DTR update details',
      fields: [
        { key: 'type', label: 'Type', type: 'select', options: ['Personal', 'Business'] },
        {
          key: 'dtrType',
          label: 'DTR Type',
          type: 'select',
          options: ['FIELD DUTY NO TIME IN', 'FIELD DUTY NO TIME OUT'],
          required: true,
        },
        { key: 'oneDay', label: 'Apply as One Day', type: 'checkbox' },
        { key: 'from', label: 'From', type: 'date', required: true },
        { key: 'timeIn', label: 'Time In', type: 'time', required: true },
        { key: 'to', label: 'To', type: 'date', required: true },
        { key: 'timeOut', label: 'Time Out', type: 'time', required: true },
        { key: 'reason', label: 'Reason', type: 'textarea', required: true },
        { key: 'remark', label: 'Remark', type: 'textarea' },
      ],
    },
  ],
  Leave: [
    {
      title: 'Leave details',
      fields: [
        {
          key: 'leaveType',
          label: 'Leave Type',
          type: 'select',
          options: ['Leave Without Pay', 'Maternity', 'Paternity Leave', 'Suspension', 'Service Incentive Leave'],
          required: true,
        },
        { key: 'withoutPay', label: 'Without Pay', type: 'checkbox' },
        { key: 'dateFrom', label: 'Date From', type: 'date', required: true },
        { key: 'dateTo', label: 'Date To', type: 'date', required: true },
        { key: 'timeIn', label: 'Time In', type: 'time' },
        { key: 'appliedDays', label: 'Applied days', type: 'number', required: true },
        { key: 'timeOut', label: 'Time Out', type: 'time' },
        { key: 'approvedDays', label: 'Approved Days', type: 'number' },
        {
          key: 'period',
          label: 'Period',
          type: 'select',
          options: ['Whole Day', '1ST HALF (Tardiness Filed as Leave)', '2ND HALF (Undertime Filed as Leave)'],
          required: true,
        },
        { key: 'reason', label: 'Reason', type: 'textarea', required: true },
        { key: 'remark', label: 'Remark', type: 'textarea' },
      ],
    },
  ],
  Loan: [
    {
      title: 'Loan details',
      fields: [
        { key: 'transactionDate', label: 'Transaction Date', type: 'date', required: true },
        {
          key: 'loanType',
          label: 'Loan Type',
          type: 'select',
          options: [
            'Loan 2',
            'Belt Bag - 120',
            'T Shirt S - 250',
            'T Shirt XS - 250',
            'T Shirt M - 250',
            'T Shirt L - 250',
            'T Shirt XL - 250',
            'T Shirt XXL - 250',
          ],
          required: true,
        },
        { key: 'principal', label: 'Principal', type: 'number', required: true },
        { key: 'interest', label: 'Interest', type: 'number' },
        { key: 'principalInterest', label: 'Principal + Interest', type: 'number' },
        { key: 'payrollPeriod', label: 'Payroll Period', type: 'select', options: ['First', 'Second', 'Both'], required: true },
        { key: 'deductionAmount', label: 'Deduction Amount', type: 'number', required: true },
        { key: 'promissoryNo', label: 'Promissory No' },
        {
          key: 'terms',
          label: 'Terms of Payment',
          type: 'select',
          options: ['6 | 6%', '12 | 12%', '18 | 18%', '24 | 24%', '36 | 36%', '48 | 48%', '60 | 60%', '3 | 0%', '2 | 0%', '1 | 0%'],
          required: true,
        },
        { key: 'guarantor', label: 'With Guarantor', type: 'checkbox' },
        { key: 'particular', label: 'Particular', type: 'textarea' },
        { key: 'reason', label: 'Reason', type: 'textarea', required: true },
      ],
    },
  ],
  'Other Transactions': [
    {
      title: 'Other transaction details',
      fields: [
        {
          key: 'transactionType',
          label: 'Other Transaction Type',
          type: 'select',
          options: ['Paternity Notification'],
          required: true,
        },
        { key: 'reason', label: 'Reason', type: 'textarea', required: true },
      ],
    },
  ],
  Overtime: [
    {
      title: 'Overtime details',
      fields: [
        { key: 'applicableDate', label: 'Applicable Date', type: 'date', required: true },
        { key: 'onCall', label: 'On Call OT', type: 'checkbox' },
        { key: 'afterStart', label: 'OT After the Shift — Start Time', type: 'time' },
        { key: 'afterEnd', label: 'OT After the Shift — End Time', type: 'time' },
        { key: 'afterHours', label: 'OT After the Shift — Applied Hours', type: 'number' },
        { key: 'beforeStart', label: 'Over Time Before the Shift — Start Time', type: 'time' },
        { key: 'beforeEnd', label: 'Over Time Before the Shift — End Time', type: 'time' },
        { key: 'beforeHours', label: 'Over Time Before the Shift — Applied Hours', type: 'number' },
        { key: 'monthlyApproved', label: 'Total Hours Approved for the month', type: 'number' },
        { key: 'totalApplied', label: 'Total Applied Hours', type: 'number', required: true },
        { key: 'reason', label: 'Reason', type: 'textarea', required: true },
        { key: 'remark', label: 'Remark', type: 'textarea' },
      ],
    },
  ],
  Profile: [
    {
      title: 'Personal information',
      fields: [
        { key: 'firstName', label: 'First Name', required: true },
        { key: 'middleName', label: 'Middle Name' },
        { key: 'middleInitial', label: 'Middle Initial' },
        { key: 'lastName', label: 'Last Name', required: true },
        { key: 'suffix', label: 'Suffix' },
        { key: 'civilStatus', label: 'Civil Status', type: 'select', options: ['Separated', 'Married', 'Single', 'Widow'] },
        { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'] },
        { key: 'citizenship', label: 'Citizenship', type: 'select', options: ['CHINESE', 'FILIPINO', 'FILIPINO - AMERICAN'] },
        { key: 'birthDate', label: 'Birth Date', type: 'date' },
      ],
    },
    {
      title: 'Address and contact',
      fields: [
        { key: 'street', label: 'No and Street' },
        { key: 'barangay', label: 'Barangay/Subdivision' },
        { key: 'city', label: 'City/Municipality' },
        { key: 'province', label: 'Province' },
        {
          key: 'region',
          label: 'Region',
          type: 'select',
          options: [
            'Autonomous Region of Muslim Mindanao',
            'Cordillera Autnomous Region',
            'Region I',
            'Region II',
            'Region III',
            'Region IV-A',
            'Region IV-B',
            'Region IX',
            'National Capital Region',
            'Region V',
            'Region VI',
            'Region VII',
            'Region VIII',
            'Region X',
            'Region XI',
            'Region XII',
            'Region XIII',
          ],
        },
        { key: 'country', label: 'Country', type: 'combo', options: ['Philippines'] },
        { key: 'zipCode', label: 'Zip Code' },
        { key: 'district', label: 'District' },
        { key: 'telNo', label: 'Tel No' },
        { key: 'mobileNo', label: 'Mobile No' },
        { key: 'email', label: 'Email', type: 'email' },
      ],
    },
    {
      title: 'Government IDs and tax',
      fields: [
        { key: 'sss', label: 'SSS' },
        { key: 'tin', label: 'TIN' },
        { key: 'gsis', label: 'GSIS' },
        { key: 'pagIbig', label: 'Pag Ibig' },
        { key: 'pagIbigMode', label: 'Pag Ibig Mode', type: 'select', options: ['2% or 100 whichever is lower'] },
        { key: 'philhealth', label: 'Philhealth' },
        {
          key: 'taxStatus',
          label: 'Tax Status',
          type: 'select',
          options: [
            'Married, Only Spouse Employed',
            'Married with 1 Dependent',
            'Married with 2 Dependents',
            'Married with 3 Dependents',
            'Married with 4 Dependents',
            'Single',
            'Single with 1 Dependent',
            'Single with 2 Dependents',
            'Single with 3 Dependents',
            'Single with 4 Dependents',
            'SINGLE',
            'MARRIED',
            'YearlyTtax',
            'Zero Exemption',
          ],
        },
        { key: 'dependents', label: 'Dependents', type: 'number' },
      ],
    },
    {
      title: 'Dependent details',
      repeatable: true,
      fields: [
        { key: 'dependentFirstName', label: 'First Name' },
        { key: 'dependentMiddleName', label: 'Middle Name' },
        { key: 'dependentLastName', label: 'Last Name' },
        { key: 'dependentSuffix', label: 'Suffix' },
        {
          key: 'dependentRelationship',
          label: 'Relationship',
          type: 'select',
          options: ['Spouse', 'Father', 'Mother', 'Sister', 'Sibling', 'Others', 'Son', 'Daughter', 'Common Law Partner', 'Guardian', 'Brother'],
        },
        { key: 'dependentBirthDate', label: 'Birth Date', type: 'date' },
        { key: 'dependentRemarks', label: 'Remarks', type: 'textarea' },
        { key: 'dependent', label: 'Dependent', type: 'checkbox' },
        { key: 'beneficiary', label: 'Beneficiary', type: 'checkbox' },
        { key: 'insurance', label: 'Insurance', type: 'checkbox' },
        { key: 'incapacitated', label: 'Incapacitated', type: 'checkbox' },
      ],
    },
  ],
  'Rest Day': [
    {
      title: 'Rest day details',
      fields: [
        { key: 'dateFrom', label: 'Date From', type: 'date', required: true },
        { key: 'dateTo', label: 'Date To', type: 'date', required: true },
        { key: 'restDay1', label: 'Rest Day 1', type: 'select', options: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
        { key: 'restDay2', label: 'Rest Day 2', type: 'select', options: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
        { key: 'restDay3', label: 'Rest Day 3', type: 'select', options: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
        { key: 'cancelDayOff', label: 'Cancel Day-Off', type: 'checkbox' },
        { key: 'reason', label: 'Reason', type: 'textarea', required: true },
      ],
    },
  ],
  Workshift: [
    {
      title: 'Workshift details',
      fields: [
        { key: 'dateFrom', label: 'Date From', type: 'date', required: true },
        { key: 'dateTo', label: 'Date To', type: 'date', required: true },
        {
          key: 'workshift',
          label: 'WorkShift',
          type: 'combo',
          options: legacyWorkshiftOptions,
          placeholder: 'Search available workshifts',
          required: true,
        },
        { key: 'reason', label: 'Reason', type: 'textarea', required: true },
      ],
    },
  ],
};

export default function ApplicationsScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 960;
  const [selectedTransaction, setSelectedTransaction] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [openPagePicker, setOpenPagePicker] = useState<string | null>(null);
  const [transactionFilter, setTransactionFilter] = useState(typeFilters[0]);
  const [statusFilter, setStatusFilter] = useState(statusFilters[0]);
  const [notice, setNotice] = useState('');
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const continueToRequest = () => {
    if (!selectedTransaction) {
      setNotice('Choose a transaction type to continue.');
      return;
    }

    setShowRequestForm(true);
  };

  if (showRequestForm) {
    return (
      <RequestForm
        key={selectedTransaction}
        transaction={selectedTransaction}
        onBack={() => setShowRequestForm(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={[styles.content, isDesktop && styles.desktopContent]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>EMPLOYEE SELF-SERVICE</Text>
          <Text style={[styles.title, isDesktop && styles.desktopTitle]}>Applications</Text>
          <Text style={styles.subtitle}>
            Start a request or check the status of applications you have submitted.
          </Text>
        </View>

        <View style={[styles.contentColumns, isDesktop && styles.desktopContentColumns]}>
          <View style={[styles.startCard, openPagePicker === 'start-transaction' && styles.openPickerCard]}>
            <View style={styles.cardHeading}>
              <View style={styles.cardNumber}>
                <Text style={styles.cardNumberText}>1</Text>
              </View>
              <View style={styles.cardHeadingCopy}>
                <Text style={styles.cardTitle}>Start a request</Text>
                <Text style={styles.cardSubtitle}>Choose what you need to submit.</Text>
              </View>
            </View>

            <View style={styles.startRow}>
              <View style={styles.transactionPicker}>
                <OptionPicker
                  label="Transaction type"
                  value={selectedTransaction}
                  placeholder="Select a transaction"
                  options={transactionTypes}
                  open={openPagePicker === 'start-transaction'}
                  onOpenChange={(open) => setOpenPagePicker(open ? 'start-transaction' : null)}
                  onChange={(value) => {
                    setSelectedTransaction(value);
                    setNotice('');
                  }}
                />
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: !selectedTransaction }}
                onPress={continueToRequest}
                style={({ pressed }) => [
                  styles.continueButton,
                  isDesktop && styles.desktopContinueButton,
                  !selectedTransaction && styles.continueButtonDisabled,
                  pressed && selectedTransaction && styles.pressed,
                ]}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
                <Text style={styles.continueArrow}>›</Text>
              </Pressable>
            </View>
            {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          </View>

          <View style={[styles.listSection, isDesktop && styles.desktopListSection]}>
            <View style={styles.listHeading}>
              <View style={styles.listHeadingCopy}>
                <Text style={styles.listTitle}>Submitted applications</Text>
                <Text style={styles.listSubtitle}>Filter these results below.</Text>
              </View>
              <View style={styles.viewToggle}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: view === 'list' }}
                  onPress={() => setView('list')}
                  style={[styles.viewToggleOption, view === 'list' && styles.selectedView]}
                >
                  <Text style={[styles.viewToggleText, view === 'list' && styles.selectedViewText]}>
                    List
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: view === 'calendar' }}
                  onPress={() => setView('calendar')}
                  style={[styles.viewToggleOption, view === 'calendar' && styles.selectedView]}
                >
                  <Text style={[styles.viewToggleText, view === 'calendar' && styles.selectedViewText]}>
                    Calendar
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.filters}>
              <View
                style={[
                  styles.filterPicker,
                  openPagePicker === 'transaction-filter' && styles.activeFilterPicker,
                ]}
              >
                <OptionPicker
                  label="Filter by transaction"
                  value={transactionFilter}
                  options={typeFilters}
                  open={openPagePicker === 'transaction-filter'}
                  onOpenChange={(open) => setOpenPagePicker(open ? 'transaction-filter' : null)}
                  onChange={setTransactionFilter}
                />
              </View>
              <View
                style={[
                  styles.filterPicker,
                  openPagePicker === 'status-filter' && styles.activeFilterPicker,
                ]}
              >
                <OptionPicker
                  label="Filter by status"
                  value={statusFilter}
                  options={statusFilters}
                  open={openPagePicker === 'status-filter'}
                  onOpenChange={(open) => setOpenPagePicker(open ? 'status-filter' : null)}
                  onChange={setStatusFilter}
                />
              </View>
            </View>

            {view === 'list' ? (
              <EmptyState
                title="Applications will appear here"
                description="Submitted request history and filters will be available when the employee system is connected."
              />
            ) : (
              <View>
                <PortalCalendar
                  month={calendarMonth}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  onChangeMonth={(amount, clearSelection = true) => {
                    setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() + amount, 1));
                    if (clearSelection) setSelectedDate(null);
                  }}
                  onGoToday={() => {
                    const today = new Date();
                    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                    setSelectedDate(today);
                  }}
                />
                <Text style={styles.calendarNote}>
                  Request dates will appear here when application history is connected.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RequestForm({
  transaction,
  onBack,
}: {
  transaction: string;
  onBack: () => void;
}) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 960;
  const [values, setValues] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [dependentCount, setDependentCount] = useState(1);
  const [openPickerField, setOpenPickerField] = useState<string | null>(null);
  const sections = requestForms[transaction] ?? [];
  const fieldsForSection = (section: RequestSection) =>
    section.repeatable
      ? Array.from({ length: dependentCount }, (_, index) =>
          section.fields.map((field) => ({
            ...field,
            key: `${field.key}-${index + 1}`,
            label: `Dependent ${index + 1} · ${field.label}`,
          }))
        ).flat()
      : section.fields;
  const allFields = sections.flatMap(fieldsForSection);
  const missingFields = allFields
    .filter((field) => field.required && !values[field.key]?.trim())
    .map((field) => field.label);

  const updateValue = (key: string, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const reviewRequest = () => {
    setShowErrors(true);
    if (missingFields.length > 0) {
      setReviewing(false);
      return;
    }
    setReviewing(true);
  };

  return (
    <PortalPage>
      <Pressable accessibilityRole="button" onPress={onBack} style={styles.formBackButton}>
        <Text style={styles.formBackText}>‹  Back to applications</Text>
      </Pressable>
      <PageHeading
        title={`New ${transaction} Request`}
        description="Complete the request details below."
      />
      <PreviewNotice>
        Request forms are a preview and are not connected to the employee system. Your entries stay
        on this screen only; reviewing a request does not submit or save it.
      </PreviewNotice>

      {sections.map((section) => (
        <View
          key={section.title}
          style={[
            styles.formSection,
            section.repeatable && styles.repeatableSection,
            fieldsForSection(section).some((field) => field.key === openPickerField) &&
              styles.openFormSection,
          ]}
        >
          <Text style={styles.formSectionTitle}>{section.title}</Text>
          <View style={[styles.formGrid, isDesktop && styles.desktopFormGrid]}>
            {fieldsForSection(section).map((field) => {
              const value = values[field.key] ?? '';
              const hasError = showErrors && field.required && !value.trim();

              if (field.type === 'checkbox') {
                return (
                  <Pressable
                    key={field.key}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: value === 'true' }}
                    onPress={() => updateValue(field.key, value === 'true' ? '' : 'true')}
                    style={[styles.checkField, isDesktop && styles.desktopFormField]}
                  >
                    <View style={[styles.checkbox, value === 'true' && styles.checkboxChecked]}>
                      {value === 'true' ? <Text style={styles.checkboxMark}>✓</Text> : null}
                    </View>
                    <Text style={styles.formLabel}>{field.label}</Text>
                  </Pressable>
                );
              }

              return (
                <View
                  key={field.key}
                  style={[
                    styles.formField,
                    isDesktop && styles.desktopFormField,
                    field.type === 'textarea' && styles.fullWidthFormField,
                    (field.type === 'select' || field.type === 'date') && styles.selectFormField,
                    openPickerField === field.key && styles.openPickerFormField,
                    hasError && styles.formFieldError,
                  ]}
                >
                  <Text style={styles.formLabel}>
                    {field.label}
                    {field.required ? <Text style={styles.requiredMark}> *</Text> : null}
                  </Text>
                  {field.type === 'date' ? (
                    <RequestDatePicker
                      value={value}
                      open={openPickerField === field.key}
                      onChange={(date) => updateValue(field.key, date)}
                      onOpenChange={(isOpen) => setOpenPickerField(isOpen ? field.key : null)}
                    />
                  ) : field.type === 'combo' ? (
                    <RequestComboPicker
                      label={field.label}
                      value={value}
                      open={openPickerField === field.key}
                      placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}`}
                      options={field.options ?? []}
                      onChange={(selected) => updateValue(field.key, selected)}
                      onOpenChange={(isOpen) => setOpenPickerField(isOpen ? field.key : null)}
                    />
                  ) : field.type === 'select' && field.options ? (
                    <ChoicePicker
                      label=""
                      value={value}
                      placeholder="Select an option"
                      options={field.options}
                      open={openPickerField === field.key}
                      onChange={(selected) => updateValue(field.key, selected)}
                      onOpenChange={(isOpen) => setOpenPickerField(isOpen ? field.key : null)}
                    />
                  ) : (
                    <TextInput
                      accessibilityLabel={field.label}
                      value={value}
                      onChangeText={(text) => updateValue(field.key, text)}
                      placeholder={field.placeholder ?? placeholderFor(field)}
                      placeholderTextColor={RcsColors.grayMuted}
                      keyboardType={
                        field.type === 'number'
                          ? 'decimal-pad'
                          : field.type === 'email'
                            ? 'email-address'
                            : 'default'
                      }
                      autoCapitalize={field.type === 'email' ? 'none' : 'sentences'}
                      multiline={field.type === 'textarea'}
                      style={[
                        styles.formInput,
                        field.type === 'textarea' && styles.textAreaInput,
                      ]}
                    />
                  )}
                  {hasError ? <Text style={styles.fieldError}>This field is required.</Text> : null}
                </View>
              );
            })}
          </View>
          {section.repeatable ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setDependentCount((count) => count + 1)}
              style={({ pressed }) => [styles.addDependentButton, pressed && styles.pressed]}
            >
              <Text style={styles.addDependentButtonText}>+ Add dependent</Text>
            </Pressable>
          ) : null}
        </View>
      ))}

      {reviewing ? (
        <View style={styles.reviewCard}>
          <Text style={styles.reviewTitle}>Request review</Text>
          <Text style={styles.reviewDescription}>
            This preview contains your current entries only. Nothing has been sent or saved.
          </Text>
          {allFields
            .filter((field) => values[field.key]?.trim())
            .map((field) => (
              <View key={field.key} style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>{field.label}</Text>
                <Text style={styles.reviewValue}>
                  {field.type === 'checkbox' && values[field.key] === 'true' ? 'Yes' : values[field.key]}
                </Text>
              </View>
            ))}
        </View>
      ) : null}

      <View style={styles.formActions}>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setReviewing(false);
            onBack();
          }}
          style={({ pressed }) => [styles.secondaryFormButton, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryFormButtonText}>Cancel</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={reviewRequest}
          style={({ pressed }) => [styles.primaryFormButton, pressed && styles.pressed]}
        >
          <Text style={styles.primaryFormButtonText}>Review request</Text>
          <Text style={styles.continueArrow}>›</Text>
        </Pressable>
      </View>
      {showErrors && missingFields.length > 0 ? (
        <Text style={styles.formValidationMessage}>
          Complete required fields: {missingFields.join(', ')}.
        </Text>
      ) : null}
    </PortalPage>
  );
}

function RequestDatePicker({
  value,
  open,
  onChange,
  onOpenChange,
}: {
  value: string;
  open: boolean;
  onChange: (date: string) => void;
  onOpenChange: (isOpen: boolean) => void;
}) {
  const selectedDate = parseRequestDate(value);
  const [month, setMonth] = useState(() => selectedDate ?? new Date());

  return (
    <View style={styles.datePickerContainer}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={value ? `Selected date ${value}` : 'Choose date'}
        accessibilityState={{ expanded: open }}
        onPress={() => onOpenChange(!open)}
        style={({ pressed }) => [styles.formInput, styles.datePickerButton, pressed && styles.pressed]}
      >
        <Text style={[styles.datePickerText, !value && styles.datePickerPlaceholder]}>
          {value || 'Choose date'}
        </Text>
        <Text style={styles.datePickerIcon}>▦</Text>
      </Pressable>
      {open ? (
        <View style={styles.datePickerCalendar}>
          <PortalCalendar
            month={month}
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              const dateValue = [
                date.getFullYear(),
                String(date.getMonth() + 1).padStart(2, '0'),
                String(date.getDate()).padStart(2, '0'),
              ].join('-');
              onChange(dateValue);
              setMonth(date);
              onOpenChange(false);
            }}
            onChangeMonth={(amount) =>
              setMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1))
            }
            onGoToday={() => {
              const today = new Date();
              onChange([
                today.getFullYear(),
                String(today.getMonth() + 1).padStart(2, '0'),
                String(today.getDate()).padStart(2, '0'),
              ].join('-'));
              setMonth(today);
              onOpenChange(false);
            }}
          />
        </View>
      ) : null}
    </View>
  );
}

function RequestComboPicker({
  label,
  value,
  open,
  placeholder,
  options,
  onChange,
  onOpenChange,
}: {
  label: string;
  value: string;
  open: boolean;
  placeholder: string;
  options: string[];
  onChange: (value: string) => void;
  onOpenChange: (isOpen: boolean) => void;
}) {
  const matchingOptions = options.filter((option) =>
    option.toLowerCase().includes(value.trim().toLowerCase())
  );
  const visibleOptions =
    value.trim() && !options.some((option) => option.toLowerCase() === value.trim().toLowerCase())
      ? [`Use “${value.trim()}”`, ...matchingOptions]
      : matchingOptions;
  const setPickerOpen = (isOpen: boolean) => {
    onOpenChange(isOpen);
  };

  return (
    <View style={[styles.comboPicker, open && styles.openPicker]}>
      <View style={styles.comboInputRow}>
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={(text) => {
            onChange(text);
            if (!open) setPickerOpen(true);
          }}
          onFocus={() => setPickerOpen(true)}
          placeholder={placeholder}
          placeholderTextColor={RcsColors.grayMuted}
          style={styles.comboInput}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={open ? 'Close suggestions' : 'Show suggestions'}
          accessibilityState={{ expanded: open }}
          onPress={() => setPickerOpen(!open)}
          style={({ pressed }) => [styles.comboToggle, pressed && styles.pressed]}
        >
          <Text style={styles.pickerChevron}>{open ? '⌃' : '⌄'}</Text>
        </Pressable>
      </View>
      {open ? (
        <ScrollView style={styles.comboOptions} nestedScrollEnabled keyboardShouldPersistTaps="handled">
          {visibleOptions.length ? (
            visibleOptions.map((option) => {
              const isCustom = option.startsWith('Use “') && option.endsWith('”');
              const selected = isCustom ? value.trim() : option;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  onPress={() => {
                    onChange(selected);
                    setPickerOpen(false);
                  }}
                  style={({ pressed }) => [styles.option, pressed && styles.pressed]}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </Pressable>
              );
            })
          ) : (
            <Text style={styles.comboNoResults}>No matching options. You can enter a value above.</Text>
          )}
        </ScrollView>
      ) : null}
    </View>
  );
}

function parseRequestDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day
    ? date
    : null;
}

function placeholderFor(field: RequestField) {
  if (field.placeholder) return field.placeholder;
  if (field.type === 'date') return 'YYYY-MM-DD';
  if (field.type === 'time') return 'HH:MM';
  if (field.type === 'number') return 'Enter amount';
  if (field.type === 'textarea') return 'Type here';
  return `Enter ${field.label.toLowerCase()}`;
}

function OptionPicker({
  label,
  value,
  placeholder,
  options,
  onChange,
  open,
  onOpenChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  options: string[];
  onChange: (value: string) => void;
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  return (
    <View style={[styles.picker, open && styles.openPicker]}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => onOpenChange(!open)}
        style={({ pressed }) => [styles.pickerButton, pressed && styles.pressed]}
      >
        <Text style={[styles.pickerValue, !value && styles.pickerPlaceholder]}>
          {value || placeholder || 'Select'}
        </Text>
        <Text style={styles.pickerChevron}>{open ? '⌃' : '⌄'}</Text>
      </Pressable>
      {open ? (
        <ScrollView
          style={styles.options}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        >
          {options.map((option) => {
            const selected = option === value;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  onChange(option);
                  onOpenChange(false);
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
                {selected ? <Text style={styles.selectedMark}>✓</Text> : null}
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: RcsColors.background },
  content: { width: '100%', maxWidth: 1180, alignSelf: 'center', padding: 24, paddingBottom: 40 },
  desktopContent: { maxWidth: 1500, padding: 32, paddingBottom: 44 },
  heading: { marginBottom: 20 },
  eyebrow: { color: RcsColors.brownLight, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  title: { marginTop: 6, color: RcsColors.brownDark, fontSize: 30, fontWeight: '800' },
  desktopTitle: { fontSize: 32 },
  subtitle: { marginTop: 6, color: RcsColors.grayMuted, fontSize: 14, lineHeight: 21 },
  contentColumns: { gap: 18 },
  desktopContentColumns: { flexDirection: 'row', alignItems: 'flex-start', gap: 22 },
  startCard: {
    flex: 0.9,
    minWidth: 0,
    zIndex: 1,
    elevation: 1,
    padding: 24,
    borderRadius: 18,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  cardHeading: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  cardNumber: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: RcsColors.yellowLight,
  },
  cardNumberText: { color: RcsColors.brown, fontSize: 16, fontWeight: '800' },
  cardHeadingCopy: { marginLeft: 12 },
  cardTitle: { color: RcsColors.brownDark, fontSize: 18, fontWeight: '800' },
  cardSubtitle: { marginTop: 3, color: RcsColors.grayMuted, fontSize: 12 },
  startRow: { gap: 16 },
  desktopStartRow: { flexDirection: 'row', alignItems: 'flex-end' },
  transactionPicker: { flex: 1, minWidth: 0, zIndex: 20, elevation: 20 },
  picker: { minWidth: 0 },
  openPicker: { zIndex: 100, elevation: 100 },
  openPickerCard: { zIndex: 100, elevation: 100 },
  pickerLabel: { marginBottom: 8, color: RcsColors.grayDark, fontSize: 12, fontWeight: '700' },
  pickerButton: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    borderRadius: 11,
    backgroundColor: RcsColors.white,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  pickerValue: { color: RcsColors.text, fontSize: 14 },
  pickerPlaceholder: { color: RcsColors.grayMuted },
  pickerChevron: { color: RcsColors.brownLight, fontSize: 20 },
  options: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 10,
    maxHeight: 280,
    marginTop: 5,
    paddingVertical: 4,
    borderRadius: 11,
    backgroundColor: RcsColors.white,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  option: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  selectedOption: { backgroundColor: RcsColors.yellowLight },
  optionText: { color: RcsColors.grayDark, fontSize: 13 },
  selectedOptionText: { color: RcsColors.brownDark, fontWeight: '700' },
  selectedMark: { color: RcsColors.brown, fontWeight: '800' },
  continueButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
    paddingHorizontal: 18,
    borderRadius: 11,
    backgroundColor: RcsColors.brown,
  },
  desktopContinueButton: { width: '100%', marginTop: 12 },
  continueButtonDisabled: { opacity: 0.55 },
  continueButtonText: { color: RcsColors.white, fontSize: 14, fontWeight: '700' },
  continueArrow: { color: RcsColors.yellow, fontSize: 22, lineHeight: 25 },
  notice: { marginTop: 12, color: RcsColors.brown, fontSize: 12, lineHeight: 18 },
  listSection: { flex: 1.1, minWidth: 0, marginTop: 32, zIndex: 2, elevation: 2 },
  listHeading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 17 },
  listHeadingCopy: { flex: 1, minWidth: 160 },
  listTitle: { color: RcsColors.brownDark, fontSize: 20, fontWeight: '800' },
  listSubtitle: { marginTop: 4, color: RcsColors.grayMuted, fontSize: 12 },
  viewToggle: { flexDirection: 'row', gap: 4 },
  viewToggleOption: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 8, backgroundColor: RcsColors.grayLight },
  selectedView: { backgroundColor: RcsColors.brown },
  viewToggleText: { color: RcsColors.grayDark, fontSize: 12, fontWeight: '700' },
  selectedViewText: { color: RcsColors.white },
  filters: { gap: 12, marginBottom: 18, zIndex: 10, elevation: 10 },
  filterPicker: { flex: 1, minWidth: 0 },
  activeFilterPicker: { zIndex: 100, elevation: 100 },
  desktopListSection: { marginTop: 0 },
  calendarNote: { marginTop: 12, color: RcsColors.grayMuted, fontSize: 12 },
  pressed: { opacity: 0.75 },
  formBackButton: { alignSelf: 'flex-start', paddingVertical: 8, paddingRight: 12, marginBottom: 16 },
  formBackText: { color: RcsColors.brownLight, fontSize: 14, fontWeight: '700' },
  formSection: {
    padding: 22,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  repeatableSection: { zIndex: 1 },
  openFormSection: { zIndex: 100, elevation: 100 },
  addDependentButton: {
    alignSelf: 'flex-start',
    minHeight: 42,
    justifyContent: 'center',
    marginTop: 12,
    paddingHorizontal: 14,
    borderRadius: 9,
    backgroundColor: RcsColors.yellowLight,
  },
  addDependentButtonText: { color: RcsColors.brown, fontSize: 12, fontWeight: '700' },
  formSectionTitle: { marginBottom: 16, color: RcsColors.brownDark, fontSize: 17, fontWeight: '800' },
  formGrid: { gap: 14 },
  desktopFormGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  formField: { minWidth: 0, gap: 7 },
  desktopFormField: { flexGrow: 1, flexBasis: '48%', minWidth: 230 },
  selectFormField: { zIndex: 10, elevation: 10 },
  openPickerFormField: { zIndex: 50, elevation: 50 },
  datePickerContainer: { position: 'relative', zIndex: 1 },
  datePickerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  datePickerText: { color: RcsColors.grayDark, fontSize: 13 },
  datePickerPlaceholder: { color: RcsColors.grayMuted },
  datePickerIcon: { color: RcsColors.brown, fontSize: 17, fontWeight: '700' },
  datePickerCalendar: {
    position: 'absolute',
    top: '100%',
    left: 0,
    width: 360,
    maxWidth: '100%',
    zIndex: 30,
    elevation: 30,
  },
  comboPicker: { position: 'relative', zIndex: 1 },
  comboInputRow: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  comboInput: { flex: 1, minWidth: 0, height: 44, paddingHorizontal: 13, color: RcsColors.text, fontSize: 13 },
  comboToggle: { minWidth: 42, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  comboOptions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 30,
    elevation: 30,
    maxHeight: 220,
    marginTop: 4,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  comboNoResults: { padding: 12, color: RcsColors.grayMuted, fontSize: 12 },
  fullWidthFormField: { flexBasis: '100%' },
  formLabel: { color: RcsColors.grayDark, fontSize: 12, fontWeight: '700' },
  requiredMark: { color: '#B42318' },
  formInput: {
    minHeight: 46,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: RcsColors.white,
    borderWidth: 1,
    borderColor: RcsColors.border,
    color: RcsColors.text,
    fontSize: 13,
  },
  textAreaInput: { minHeight: 96, textAlignVertical: 'top' },
  formFieldError: { borderColor: '#B42318' },
  fieldError: { color: '#B42318', fontSize: 11 },
  checkField: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: RcsColors.border,
    borderRadius: 5,
    backgroundColor: RcsColors.white,
  },
  checkboxChecked: { backgroundColor: RcsColors.brown, borderColor: RcsColors.brown },
  checkboxMark: { color: RcsColors.white, fontSize: 13, fontWeight: '800' },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 4 },
  secondaryFormButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: RcsColors.grayLight,
  },
  secondaryFormButtonText: { color: RcsColors.brownDark, fontSize: 13, fontWeight: '700' },
  primaryFormButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: RcsColors.brown,
  },
  primaryFormButtonText: { color: RcsColors.white, fontSize: 13, fontWeight: '700' },
  formValidationMessage: { marginTop: 12, color: '#B42318', fontSize: 12, lineHeight: 18 },
  reviewCard: {
    padding: 20,
    marginTop: 18,
    borderRadius: 14,
    backgroundColor: RcsColors.yellowLight,
    borderWidth: 1,
    borderColor: RcsColors.yellow,
  },
  reviewTitle: { color: RcsColors.brownDark, fontSize: 17, fontWeight: '800' },
  reviewDescription: { marginTop: 5, marginBottom: 12, color: RcsColors.grayDark, fontSize: 12 },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingVertical: 8, borderTopWidth: 1, borderTopColor: RcsColors.border },
  reviewLabel: { flex: 1, color: RcsColors.grayDark, fontSize: 12, fontWeight: '700' },
  reviewValue: { flex: 1, color: RcsColors.text, fontSize: 12, textAlign: 'right' },
});
