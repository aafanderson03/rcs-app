import type { Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { applicationGuide, ApplicationGuideContent } from '@/components/application-guide';
import { ExternalLink } from '@/components/external-link';
import { EmptyState, PageHeading, PortalPage, PreviewNotice } from '@/components/portal-ui';
import { ResponsiveText as Text, ResponsiveTextInput as TextInput } from '@/components/responsive-text';
import type { RcsPalette } from '@/constants/theme';
import { useAppTheme } from '@/contexts/theme-context';

type FaqListItem = { text: string; details?: string[] };
type FaqBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'link'; label: string; href: Href & string }
  | { type: 'list'; marker: 'alpha' | 'bullet'; items: FaqListItem[] };
type FaqItem = { id: number; question: string; answer: FaqBlock[] };

const pagIbigFaq: FaqItem[] = [
  {
    id: 1,
    question: 'What is Virtual Pag-IBIG?',
    answer: [
      {
        type: 'paragraph',
        text: 'Virtual Pag-IBIG is Pag-IBIG Fund’s online service facility that allows you to safely and conveniently access Pag-IBIG Fund’s services anytime, anywhere using a smartphone or computer with an internet connection.',
      },
      {
        type: 'paragraph',
        text: 'It also provides a chat service with a Lingkod Pag-IBIG service officer ready to answer your inquiries or concerns.',
      },
      {
        type: 'paragraph',
        text: 'It’s like having your own Pag-IBIG Fund branch ready to serve you 24/7!',
      },
    ],
  },
  {
    id: 2,
    question: 'What services does Virtual Pag-IBIG provide?',
    answer: [
      { type: 'paragraph', text: 'By simply visiting this Virtual Pag-IBIG site, you can immediately enjoy the following services:' },
      {
        type: 'link',
        label: 'www.pagibigfundservices.com/virtualpagibig',
        href: 'https://pagibigfundservices.com/virtualpagibig/',
      },
      {
        type: 'list',
        marker: 'alpha',
        items: [
          { text: 'Register as a Pag-IBIG Fund member and get your permanent Membership ID (MID) Number' },
          { text: 'Open an MP2 Savings Account' },
          { text: 'Apply for a Pag-IBIG Multi-Purpose Loan (MPL)' },
          { text: 'Apply for a Pag-IBIG Calamity Loan if your area of residence is declared under a state of calamity' },
          { text: 'Take the first step in applying for a Pag-IBIG Housing Loan' },
          { text: 'Apply for a Pag-IBIG Home Equity Appreciation Loan (HEAL)' },
          { text: 'View the status of a Housing, Multi-Purpose, Calamity, or Home Equity Appreciation Loan' },
          { text: 'Top up your Pag-IBIG Regular Savings' },
          { text: 'Save in Pag-IBIG MP2 Savings' },
          { text: 'Pay your Housing, Multi-Purpose, Calamity, or Home Equity Appreciation Loan' },
          { text: 'Apply for interest-rate repricing on your Housing Loan' },
          { text: 'Claim your Pag-IBIG Savings due to membership maturity, optional withdrawal, retirement at age 65, or MP2 Savings maturity' },
          { text: 'Chat with a Lingkod Pag-IBIG, 24/7, to learn more about your Pag-IBIG Fund benefits' },
        ],
      },
    ],
  },
  {
    id: 3,
    question: 'What added services can I use with a Virtual Pag-IBIG account?',
    answer: [
      { type: 'paragraph', text: 'With a Virtual Pag-IBIG account, you can also use these services:' },
      {
        type: 'list',
        marker: 'alpha',
        items: [
          { text: 'View Pag-IBIG Regular Savings records, including annual dividends earned' },
          { text: 'View MP2 Savings records, including annual dividends earned' },
          { text: 'View loan records, including payments made and outstanding balances for Housing, Multi-Purpose, or Calamity Loans' },
          { text: 'View the account balance and transaction history of a Loyalty Card Plus currently available for cards issued by Asia United Bank' },
        ],
      },
    ],
  },
  {
    id: 4,
    question: 'How can I access Virtual Pag-IBIG?',
    answer: [
      { type: 'paragraph', text: 'Using a smartphone or computer with an internet connection, visit the Pag-IBIG Fund website:' },
      { type: 'link', label: 'www.pagibigfund.gov.ph', href: 'https://www.pagibigfund.gov.ph/' },
      { type: 'paragraph', text: 'Click the “Virtual Pag-IBIG, For Members” link on the main menu.' },
    ],
  },
  {
    id: 5,
    question: 'Can I use Pag-IBIG services without a Virtual Pag-IBIG account?',
    answer: [
      {
        type: 'paragraph',
        text: 'Yes. Many Pag-IBIG Fund services are available without a Virtual Pag-IBIG account. To use premium services, such as viewing your savings and loan records, you need to create an account to help keep your Pag-IBIG records safe.',
      },
    ],
  },
  {
    id: 6,
    question: 'How can I create a Virtual Pag-IBIG account?',
    answer: [
      {
        type: 'paragraph',
        text: 'Visit Virtual Pag-IBIG on the Pag-IBIG Fund website, select “Create Account,” and choose one of the available methods:',
      },
      {
        type: 'list',
        marker: 'alpha',
        items: [
          { text: 'Via your Pag-IBIG Loyalty Card Plus (see question 7)' },
          { text: 'Create and activate your account online without a Loyalty Card Plus (see question 8)' },
        ],
      },
    ],
  },
  {
    id: 7,
    question: 'How do I create an account using my Loyalty Card Plus?',
    answer: [
      {
        type: 'paragraph',
        text: 'If you have a Pag-IBIG Loyalty Card Plus, choose this option and enter the details found on your card.',
      },
      {
        type: 'list',
        marker: 'alpha',
        items: [
          {
            text: 'After choosing to create your account via your Pag-IBIG Loyalty Card Plus, enter:',
            details: [
              'Pag-IBIG Fund Membership ID (MID) Number',
              'The bank that issued your Loyalty Card Plus',
              'The last four digits of the card number on the reverse side of your Loyalty Card Plus',
            ],
          },
          { text: 'Enter the One-Time PIN (OTP) sent to your mobile phone' },
          {
            text: 'Enter the following:',
            details: [
              'Email address',
              'Three security questions and answers to help you retrieve your password if you forget it',
            ],
          },
          { text: 'Receive confirmation of account creation and a temporary password by email' },
          { text: 'Create a new password and log in to use Virtual Pag-IBIG services' },
        ],
      },
    ],
  },
  {
    id: 8,
    question: 'How do I create an account online without a Loyalty Card Plus?',
    answer: [
      {
        type: 'paragraph',
        text: 'Choose the “Create and Activate your account online” option, then follow these steps:',
      },
      {
        type: 'list',
        marker: 'alpha',
        items: [
          {
            text: 'Enter the following information:',
            details: [
              'Pag-IBIG Fund Membership ID (MID) Number',
              'Complete name',
              'Date of birth',
              'Mobile phone number',
            ],
          },
          { text: 'Enter the One-Time PIN (OTP) sent to your mobile phone' },
          {
            text: 'Enter the following information:',
            details: [
              'Email address',
              'Three security questions and answers to help you retrieve your password if you forget it',
              'Mother’s maiden name',
              'Place of birth',
            ],
          },
          { text: 'Upload a clear photo of your passport or two valid primary identification cards. Make sure the photo is clear and the information is readable.' },
          { text: 'Upload a selfie while holding your passport or the two valid identification cards you submitted. Make sure the photo is clear and the information is readable.' },
          { text: 'Receive an SMS confirming that you have successfully created your Virtual Pag-IBIG account' },
          { text: 'Over the next few days, receive another SMS informing you that your account has been activated and explaining how to access it' },
        ],
      },
    ],
  },
];

const faqSearchText = pagIbigFaq
  .map((faq) =>
    `${faq.question} ${faq.answer.map((block) =>
      block.type === 'list'
        ? block.items.map((item) => `${item.text} ${item.details?.join(' ') ?? ''}`).join(' ')
        : block.type === 'link'
          ? `${block.label} ${block.href}`
          : block.text
    ).join(' ')}`
  )
  .join(' ');

const guideSearchText = applicationGuide
  .map((section) => `${section.title} ${section.steps.join(' ')}`)
  .join(' ');

const sicknessFaqs = [
  {
    question: 'Kailan dapat i-submit ang sickness requirements?',
    answer:
      'For home confinement, submit the required documents within 5 calendar days from the start of the sickness or injury. For hospital confinement, file the claim within 1 year from the date of sickness or injury.',
  },
  {
    question: 'Naaksidente ako habang on duty. Ano ang maaari kong i-claim na benefit?',
    answer:
      'Kung naaksidente habang on duty o gumagawa ng work-related activity, maaaring magkaroon ng multiple benefit claims depende sa circumstances ng accident, severity ng injury, at eligibility.',
    details: [
      'SSS Sickness Benefit — Kung ang injury ay nagresulta sa pagiging unable to work for at least 4 days, maaaring mag-file ng SSS Sickness Benefit, subject to SSS eligibility and requirements.',
      'Employees’ Compensation (EC) Benefit — Kung work-related ang accident o injury, maaaring mag-file ng EC benefit. Para sa EC Sickness, maaaring maging applicable kahit 1 day or more na unable to work, subject to EC rules and evaluation.',
      'Philam Insurance medical reimbursement — Para sa qualified medical expenses related to the accident, subject to the insurance policy, coverage limit, exclusions, and required documents.',
    ],
  },
  {
    question: 'Puwede ba akong mag-file ng Sickness Benefit kahit check-up lang at hindi na-confine?',
    answer:
      'Yes. Hindi required na ma-confine sa hospital para makapag-file ng Sickness Benefit. Puwede kahit outpatient o check-up lang, basta unable to work ang employee for at least 4 days dahil sa illness or injury.',
  },
];

const sicknessSearchText = sicknessFaqs
  .map((faq) => `${faq.question} ${faq.answer} ${faq.details?.join(' ') ?? ''}`)
  .join(' ');

const resources = [
  { title: 'PAG-IBIG FAQ', type: 'Frequently asked questions', content: faqSearchText },
  { title: 'User Manual', type: 'Employee Online System guide', content: 'Demo quick start: sign in with your employee account, use the navigation menu to open a service, and review sample request details before continuing. This prototype does not submit or save forms.' },
  { title: 'Sickness · EC · Insurance', type: 'Frequently asked questions', content: sicknessSearchText },
  {
    title: 'Employee Online Application Guide',
    type: 'Application instructions',
    content: guideSearchText,
  },
];

function resourcePreview(content: string, query: string) {
  const normalizedContent = content.replace(/\s+/g, ' ').trim();
  const matchIndex = query ? normalizedContent.toLowerCase().indexOf(query) : 0;
  const start = matchIndex > 60 ? matchIndex - 45 : 0;
  const end = Math.min(start + 150, normalizedContent.length);
  return `${start > 0 ? '…' : ''}${normalizedContent.slice(start, end)}${end < normalizedContent.length ? '…' : ''}`;
}

export default function HelpScreen() {
  const { palette } = useAppTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { width, height } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 960;
  const [query, setQuery] = useState('');
  const [selectedTitle, setSelectedTitle] = useState('');
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);
  const selectedResource = resources.find((resource) => resource.title === selectedTitle);
  const normalizedQuery = query.trim().toLowerCase();
  const matches = useMemo(
    () =>
      resources.filter((item) =>
        `${item.title} ${item.type} ${item.content}`.toLowerCase().includes(normalizedQuery)
      ),
    [normalizedQuery]
  );
  const matchingFaqs = useMemo(
    () => pagIbigFaq.filter((faq) => !normalizedQuery || faqSearchTextForItem(faq).includes(normalizedQuery)),
    [normalizedQuery]
  );
  const matchingSicknessFaqs = useMemo(
    () => sicknessFaqs.filter((faq) =>
      !normalizedQuery || `${faq.question} ${faq.answer} ${faq.details?.join(' ') ?? ''}`.toLowerCase().includes(normalizedQuery)
    ),
    [normalizedQuery]
  );

  const closeResource = () => {
    setSelectedTitle('');
    setSelectedFaq(null);
  };

  return (
    <PortalPage>
      <PageHeading title="Help" description="Search employee FAQs, guides, and system instructions." />
      <PreviewNotice>
        This page includes Pag-IBIG reference information and sample employee resources. Pag-IBIG
        services and requirements can change; confirm current details directly with Pag-IBIG Fund.
      </PreviewNotice>

      <TextInput
        accessibilityLabel="Search help"
        placeholder="Search titles and topics"
        placeholderTextColor={palette.grayMuted}
        value={query}
        onChangeText={setQuery}
        style={styles.search}
      />

      <View style={[styles.resourceList, isDesktop && styles.desktopResourceList]}>
        {matches.map((resource) => (
          <Pressable
            key={resource.title}
            accessibilityRole="button"
            accessibilityLabel={`Open ${resource.title}`}
            onPress={() => {
              setSelectedTitle(resource.title);
              setSelectedFaq(null);
            }}
            style={({ pressed }) => [
              styles.resource,
              isDesktop && styles.desktopResource,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.resourceCopy}>
              <Text style={styles.resourceType}>{resource.type}</Text>
              <Text style={styles.resourceTitle}>{resource.title}</Text>
              <Text style={styles.resourcePreview}>{resourcePreview(resource.content, normalizedQuery)}</Text>
            </View>
            <Text style={styles.resourceArrow}>↗</Text>
          </Pressable>
        ))}
        {matches.length === 0 ? (
          <EmptyState
            title="No matching help articles"
            description="Try a different search term, or check back after the official help library is connected."
          />
        ) : null}
      </View>

      <Modal
        animationType="fade"
        onRequestClose={closeResource}
        presentationStyle="overFullScreen"
        statusBarTranslucent={Platform.OS === 'android'}
        transparent
        visible={Boolean(selectedResource)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close help article"
            onPress={closeResource}
            style={StyleSheet.absoluteFill}
          />
          {selectedResource ? (
            <View
              accessibilityViewIsModal
              style={[styles.modalCard, { maxHeight: Math.max(height - 40, 240) }]}
            >
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleCopy}>
                  <Text style={styles.resourceType}>{selectedResource.type}</Text>
                  <Text style={styles.modalTitle}>{selectedResource.title}</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close help article"
                  onPress={closeResource}
                  hitSlop={8}
                  style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </Pressable>
              </View>
              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={styles.modalContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator
              >
                {selectedResource.title === 'PAG-IBIG FAQ' ? (
                  matchingFaqs.map((faq) => {
                    const expanded = selectedFaq === faq.id;
                    return (
                      <View key={faq.id} style={styles.faqItem}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityState={{ expanded }}
                          onPress={() => setSelectedFaq(expanded ? null : faq.id)}
                          style={({ pressed }) => [styles.faqQuestion, pressed && styles.pressed]}
                        >
                          <Text style={styles.faqNumber}>{String(faq.id).padStart(2, '0')}</Text>
                          <Text style={styles.faqQuestionText}>{faq.question}</Text>
                          <Text style={styles.faqChevron}>{expanded ? '−' : '+'}</Text>
                        </Pressable>
                        {expanded ? (
                          <View style={styles.faqAnswer}>
                            {faq.answer.map((block, blockIndex) => {
                              if (block.type === 'paragraph') {
                                return <Text key={blockIndex} style={styles.faqParagraph}>{block.text}</Text>;
                              }
                              if (block.type === 'link') {
                                return (
                                  <ExternalLink key={blockIndex} href={block.href}>
                                    <Text style={styles.faqLink}>{block.label} ↗</Text>
                                  </ExternalLink>
                                );
                              }
                              return (
                                <View key={blockIndex} style={styles.faqList}>
                                  {block.items.map((item, itemIndex) => (
                                    <View key={itemIndex} style={styles.faqListItem}>
                                      <Text style={styles.faqListMarker}>
                                        {block.marker === 'alpha' ? `${String.fromCharCode(97 + itemIndex)}.` : '•'}
                                      </Text>
                                      <View style={styles.faqListCopy}>
                                        <Text style={styles.faqParagraph}>{item.text}</Text>
                                        {item.details?.map((detail, detailIndex) => (
                                          <View key={detailIndex} style={styles.faqDetailItem}>
                                            <Text style={styles.faqDetailMarker}>•</Text>
                                            <Text style={styles.faqDetailText}>{detail}</Text>
                                          </View>
                                        ))}
                                      </View>
                                    </View>
                                  ))}
                                </View>
                              );
                            })}
                          </View>
                        ) : null}
                      </View>
                    );
                  })
                ) : selectedResource.title === 'Sickness · EC · Insurance' ? (
                  matchingSicknessFaqs.map((faq, index) => {
                    const faqId = 100 + index;
                    const expanded = selectedFaq === faqId;
                    return (
                      <View key={faq.question} style={styles.faqItem}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityState={{ expanded }}
                          onPress={() => setSelectedFaq(expanded ? null : faqId)}
                          style={({ pressed }) => [styles.faqQuestion, pressed && styles.pressed]}
                        >
                          <Text style={styles.faqNumber}>{String(index + 1).padStart(2, '0')}</Text>
                          <Text style={styles.faqQuestionText}>{faq.question}</Text>
                          <Text style={styles.faqChevron}>{expanded ? '−' : '+'}</Text>
                        </Pressable>
                        {expanded ? (
                          <View style={styles.faqAnswer}>
                            <Text style={styles.faqParagraph}>{faq.answer}</Text>
                            {faq.details?.map((detail) => (
                              <View key={detail} style={styles.faqListItem}>
                                <Text style={styles.faqListMarker}>•</Text>
                                <Text style={styles.faqParagraph}>{detail}</Text>
                              </View>
                            ))}
                          </View>
                        ) : null}
                      </View>
                    );
                  })
                ) : selectedResource.title === 'Employee Online Application Guide' ? (
                  <ApplicationGuideContent searchQuery={query} />
                ) : (
                  <Text style={styles.articleText}>{selectedResource.content}</Text>
                )}
              </ScrollView>
            </View>
          ) : null}
        </View>
      </Modal>
    </PortalPage>
  );
}

function faqSearchTextForItem(faq: FaqItem) {
  return `${faq.question} ${faq.answer.map((block) =>
    block.type === 'list'
      ? block.items.map((item) => `${item.text} ${item.details?.join(' ') ?? ''}`).join(' ')
      : block.type === 'link'
        ? `${block.label} ${block.href}`
        : block.text
  ).join(' ')}`.toLowerCase();
}

function createStyles(RcsColors: Record<keyof RcsPalette, string>) {
  return StyleSheet.create({
    search: {
      minHeight: 48,
      paddingHorizontal: 15,
      marginBottom: 16,
      borderRadius: 12,
      backgroundColor: RcsColors.surface,
      borderWidth: 1,
      borderColor: RcsColors.border,
      color: RcsColors.text,
      fontSize: 13,
    },
    resourceList: { gap: 10 },
    desktopResourceList: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
    resource: {
      minWidth: 0,
      minHeight: 76,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: RcsColors.surface,
      borderWidth: 1,
      borderColor: RcsColors.border,
    },
    desktopResource: { flexGrow: 1, flexBasis: '48%', minWidth: 280 },
    resourceCopy: { flex: 1, minWidth: 0 },
    resourceType: { color: RcsColors.grayMuted, fontSize: 10, fontWeight: '700' },
    resourceTitle: { marginTop: 4, color: RcsColors.text, fontSize: 15, fontWeight: '700' },
    resourcePreview: { marginTop: 6, color: RcsColors.grayDark, fontSize: 12, lineHeight: 18 },
    resourceArrow: { marginLeft: 12, color: RcsColors.brown, fontSize: 18 },
    pressed: { opacity: 0.75 },
    modalBackdrop: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      backgroundColor: 'rgba(0,0,0,0.48)',
    },
    modalCard: {
      width: '100%',
      maxWidth: 860,
      flexShrink: 1,
      overflow: 'hidden',
      backgroundColor: RcsColors.background,
      borderWidth: 1,
      borderColor: RcsColors.border,
      borderRadius: 14,
      elevation: 16,
    },
    modalHeader: {
      minHeight: 76,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingLeft: 20,
      paddingRight: 12,
      borderBottomWidth: 1,
      borderBottomColor: RcsColors.border,
      backgroundColor: RcsColors.surface,
    },
    modalTitleCopy: { flex: 1, minWidth: 0 },
    modalTitle: { marginTop: 3, color: RcsColors.text, fontSize: 19, fontWeight: '700' },
    closeButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      backgroundColor: RcsColors.grayLight,
    },
    closeButtonText: { color: RcsColors.text, fontSize: 27, lineHeight: 30 },
    modalScroll: { flexShrink: 1 },
    modalContent: { padding: 20, paddingBottom: 28 },
    faqItem: { borderBottomWidth: 1, borderBottomColor: RcsColors.border },
    faqQuestion: {
      minHeight: 58,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 10,
    },
    faqNumber: { width: 25, color: RcsColors.brown, fontSize: 11, fontWeight: '700' },
    faqQuestionText: { flex: 1, color: RcsColors.text, fontSize: 14, lineHeight: 20, fontWeight: '700' },
    faqChevron: { width: 24, color: RcsColors.brown, fontSize: 20, textAlign: 'center' },
    faqAnswer: { gap: 12, paddingLeft: 37, paddingTop: 2, paddingBottom: 17, paddingRight: 8 },
    faqParagraph: { color: RcsColors.grayDark, fontSize: 13, lineHeight: 20 },
    faqLink: { alignSelf: 'flex-start', color: RcsColors.brown, fontSize: 13, lineHeight: 20, fontWeight: '700', textDecorationLine: 'underline' },
    faqList: { gap: 9 },
    faqListItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
    faqListMarker: { width: 19, color: RcsColors.brown, fontSize: 13, lineHeight: 20, fontWeight: '700' },
    faqListCopy: { flex: 1, gap: 6 },
    faqDetailItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingLeft: 5 },
    faqDetailMarker: { color: RcsColors.grayMuted, fontSize: 12, lineHeight: 18 },
    faqDetailText: { flex: 1, color: RcsColors.grayMuted, fontSize: 12, lineHeight: 18 },
    articleText: { color: RcsColors.grayDark, fontSize: 13, lineHeight: 20 },
  });
}
