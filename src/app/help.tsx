import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { ApplicationGuideContent, applicationGuide } from '@/components/application-guide';
import { EmptyState, PageHeading, PortalPage, PreviewNotice } from '@/components/portal-ui';
import { ResponsiveText as Text, ResponsiveTextInput as TextInput } from '@/components/responsive-text';
import { getPaletteForScheme, type RcsPalette } from '@/constants/theme';
import { useAppTheme } from '@/contexts/theme-context';

const resources = [
  { title: 'PAG-IBIG FAQ', type: 'Frequently asked questions', content: 'Demo guidance: confirm your member information before making a request. Keep your membership number private and contact HR through approved channels if your record needs an update.' },
  { title: 'User Manual', type: 'Employee Online System guide', content: 'Demo quick start: sign in with your employee account, use the navigation menu to open a service, and review sample request details before continuing. This prototype does not submit or save forms.' },
  { title: 'Sickness · EC · Insurance', type: 'Frequently asked questions', content: 'Demo guidance: prepare the supporting documents requested for your case and check with HR for current eligibility, deadlines, and filing instructions. This sample page is not an active policy.' },
  { title: 'Employee Online Application Guide', type: 'Application instructions' },
];

export default function HelpScreen() {
  const { colorScheme } = useAppTheme();
  const palette = getPaletteForScheme(colorScheme);
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 960;
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('');
  const matches = useMemo(
    () =>
      resources.filter((item) =>
        `${item.title} ${item.type} ${
          item.title === 'Employee Online Application Guide'
            ? applicationGuide.map((section) => `${section.title} ${section.steps.join(' ')}`).join(' ')
            : 'content' in item ? item.content : ''
        }`
          .toLowerCase()
          .includes(query.trim().toLowerCase())
      ),
    [query]
  );

  return (
    <PortalPage>
      <PageHeading title="Help" description="Search employee FAQs, guides, and system instructions." />
      <PreviewNotice>
        The application instructions below are adapted from the legacy Employee Online Application
        Guide. Other entries are fictional sample articles for presentation. Confirm real policies with HR.
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
            accessibilityState={{ expanded: selected === resource.title }}
            onPress={() => setSelected((current) => (current === resource.title ? '' : resource.title))}
            style={({ pressed }) => [
              styles.resource,
              isDesktop && styles.desktopResource,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.resourceCopy}>
              <Text style={styles.resourceType}>{resource.type}</Text>
              <Text style={styles.resourceTitle}>{resource.title}</Text>
            </View>
            <Text style={styles.resourceArrow}>{selected === resource.title ? '⌃' : '›'}</Text>
            {selected === resource.title ? (
              resource.title === 'Employee Online Application Guide' ? (
                <View style={styles.guideContent}>
                  <ApplicationGuideContent />
                </View>
              ) : (
                <Text style={styles.resourceUnavailable}>{'content' in resource ? resource.content : ''}</Text>
              )
            ) : null}
          </Pressable>
        ))}
        {matches.length === 0 ? (
          <EmptyState
            title="No matching help articles"
            description="Try a different search term, or check back after the official help library is connected."
          />
        ) : null}
      </View>
    </PortalPage>
  );
}

function createStyles(RcsColors: Record<keyof RcsPalette, string>) {
  return StyleSheet.create({
  search: {
    minHeight: 48,
    paddingHorizontal: 15,
    marginBottom: 16,
    borderRadius: 11,
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
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 13,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  desktopResource: { flexGrow: 1, flexBasis: '48%', minWidth: 280 },
  resourceCopy: { flex: 1, minWidth: 0 },
  resourceType: { color: RcsColors.grayMuted, fontSize: 10, fontWeight: '700' },
  resourceTitle: { marginTop: 4, color: RcsColors.brownDark, fontSize: 15, fontWeight: '700' },
  resourceArrow: { marginLeft: 12, color: RcsColors.brownLight, fontSize: 22 },
  resourceUnavailable: { width: '100%', marginTop: 12, color: RcsColors.grayMuted, fontSize: 12, lineHeight: 18 },
  guideContent: { width: '100%', marginTop: 14 },
  pressed: { opacity: 0.75 },
  });
}
