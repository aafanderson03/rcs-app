import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { EmptyState, PageHeading, PortalPage, PreviewNotice } from '@/components/portal-ui';
import { RcsColors } from '@/constants/theme';

const resources = [
  { title: 'PAG-IBIG FAQ', type: 'Frequently asked questions' },
  { title: 'User Manual', type: 'Employee Online System guide' },
  { title: 'Sickness · EC · Insurance', type: 'Frequently asked questions' },
  { title: 'Employee Online Application Guide', type: 'Application instructions' },
];

export default function HelpScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 960;
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('');
  const matches = useMemo(
    () => resources.filter((item) => `${item.title} ${item.type}`.toLowerCase().includes(query.trim().toLowerCase())),
    [query]
  );

  return (
    <PortalPage>
      <PageHeading title="Help" description="Search employee FAQs, guides, and system instructions." />
      <PreviewNotice>
        The portal shows searchable FAQ and manual resources. Their full content is not copied into
        this preview; connect an approved help content source to show the official guidance.
      </PreviewNotice>

      <TextInput
        accessibilityLabel="Search help"
        placeholder="Search titles and topics"
        placeholderTextColor={RcsColors.grayMuted}
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
              <Text style={styles.resourceUnavailable}>
                Official article content will be available when the help library is connected.
              </Text>
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

const styles = StyleSheet.create({
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
    flexGrow: 1,
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
  desktopResource: { flexGrow: 0, flexBasis: '48%', minWidth: 280 },
  resourceCopy: { flex: 1 },
  resourceType: { color: RcsColors.grayMuted, fontSize: 10, fontWeight: '700' },
  resourceTitle: { marginTop: 4, color: RcsColors.brownDark, fontSize: 15, fontWeight: '700' },
  resourceArrow: { marginLeft: 12, color: RcsColors.brownLight, fontSize: 22 },
  resourceUnavailable: { width: '100%', marginTop: 12, color: RcsColors.grayMuted, fontSize: 12, lineHeight: 18 },
  pressed: { opacity: 0.75 },
});
