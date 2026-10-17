import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ChoicePicker, PageHeading, PortalPage, PreviewNotice } from '@/components/portal-ui';
import { ResponsiveText as Text, ResponsiveTextInput as TextInput } from '@/components/responsive-text';
import { getPaletteForScheme, type RcsPalette } from '@/constants/theme';
import { useAppTheme } from '@/contexts/theme-context';

const categories = ['Account access', 'Payroll', 'Attendance & DTR', 'Applications', 'Other'];

type TicketReceipt = {
  id: string;
  category: string;
  subject: string;
};

export default function TicketScreen() {
  const { colorScheme } = useAppTheme();
  const palette = getPaletteForScheme(colorScheme);
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<TicketReceipt | null>(null);

  const submitTicket = () => {
    if (!category || !subject.trim() || !details.trim()) {
      setError('Choose a category and enter a subject and description.');
      return;
    }

    setReceipt({
      id: `DEMO-TKT-${Date.now().toString().slice(-8)}`,
      category,
      subject: subject.trim(),
    });
    setCategory('');
    setSubject('');
    setDetails('');
    setError('');
  };

  return (
    <PortalPage>
      <PageHeading
        title="Submit a ticket"
        description="Tell us what you need help with and include enough detail to understand the issue."
      />
      <PreviewNotice>
        Demo preview only. This form does not send a request to a support team or save ticket details.
      </PreviewNotice>

      {receipt ? (
        <View style={styles.receipt} accessibilityLiveRegion="polite">
          <Text style={styles.receiptTitle}>Sample ticket created</Text>
          <Text style={styles.receiptBody}>
            {receipt.id} · {receipt.category} · {receipt.subject}
          </Text>
          <Text style={styles.receiptNote}>This confirmation is for demonstration only; no ticket was sent.</Text>
        </View>
      ) : null}

      <View style={styles.form}>
        <View style={[styles.field, styles.categoryField]}>
          <ChoicePicker
            label="Category"
            value={category}
            placeholder="Choose a category"
            options={categories}
            onChange={(value) => {
              setCategory(value);
              setError('');
            }}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Subject</Text>
          <TextInput
            accessibilityLabel="Ticket subject"
            maxLength={120}
            onChangeText={(value) => {
              setSubject(value);
              setError('');
            }}
            placeholder="Briefly describe the issue"
            placeholderTextColor={palette.grayMuted}
            style={styles.input}
            value={subject}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            accessibilityLabel="Ticket description"
            maxLength={2000}
            multiline
            onChangeText={(value) => {
              setDetails(value);
              setError('');
            }}
            placeholder="What happened, and what have you tried?"
            placeholderTextColor={palette.grayMuted}
            style={[styles.input, styles.descriptionInput]}
            textAlignVertical="top"
            value={details}
          />
        </View>

        {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}

        <Pressable
          accessibilityRole="button"
          onPress={submitTicket}
          style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}
        >
          <Text style={styles.submitText}>Submit a ticket</Text>
        </Pressable>
      </View>
    </PortalPage>
  );
}

function createStyles(colors: Record<keyof RcsPalette, string>) {
  return StyleSheet.create({
    receipt: {
      padding: 16,
      marginBottom: 18,
      borderRadius: 12,
      backgroundColor: colors.yellowLight,
      borderWidth: 1,
      borderColor: colors.yellow,
    },
    receiptTitle: { color: colors.brownDark, fontSize: 15, fontWeight: '800' },
    receiptBody: { marginTop: 6, color: colors.text, fontSize: 13, lineHeight: 19 },
    receiptNote: { marginTop: 5, color: colors.grayMuted, fontSize: 11, lineHeight: 17 },
    form: {
      padding: 20,
      borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 16,
    },
    field: { gap: 7 },
    categoryField: { zIndex: 10, elevation: 10 },
    label: { color: colors.grayDark, fontSize: 12, fontWeight: '700' },
    input: {
      minHeight: 48,
      paddingHorizontal: 13,
      paddingVertical: 11,
      borderRadius: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
      fontSize: 13,
    },
    descriptionInput: { minHeight: 140 },
    error: { color: colors.danger, fontSize: 12, lineHeight: 18 },
    submitButton: {
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
      borderRadius: 10,
      backgroundColor: colors.brown,
    },
    submitText: { color: colors.white, fontSize: 14, fontWeight: '800' },
    pressed: { opacity: 0.75 },
  });
}
