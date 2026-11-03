import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { EmptyState, PageHeading, PortalPage, PreviewNotice } from '@/components/portal-ui';
import { ResponsiveText as Text, ResponsiveTextInput as TextInput } from '@/components/responsive-text';
import { getPaletteForScheme, type RcsPalette } from '@/constants/theme';
import { useAppTheme } from '@/contexts/theme-context';

const companyLinks = [
  { description: 'Employee workspace home', label: 'Home', route: '/home' },
  { description: 'Review sample time punches and daily totals', label: 'Attendance & DTR', route: '/attendance' },
  { description: 'Browse fictional request history and application forms', label: 'Applications', route: '/applications' },
  { description: 'Read employee guides and frequently asked questions', label: 'Help & guides', route: '/help' },
];

export default function OtherUrlsScreen() {
  const { colorScheme } = useAppTheme();
  const palette = getPaletteForScheme(colorScheme);
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const matchingLinks = companyLinks.filter((item) =>
    `${item.description} ${item.label}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <PortalPage>
      <PageHeading
        title="Other URLs"
        description="Find company-provided employee resources and external tools."
      />
      <PreviewNotice>
        Demo shortcuts to sections within this prototype. These are not official company systems.
      </PreviewNotice>
      <TextInput
        accessibilityLabel="Search company URLs"
        placeholder="Search company links"
        placeholderTextColor={palette.grayMuted}
        value={query}
        onChangeText={setQuery}
        style={styles.search}
      />
      <View style={styles.list}>{matchingLinks.map((item) => <Pressable key={item.route} accessibilityRole="link" onPress={() => router.push(item.route as never)} style={({ pressed }) => [styles.linkCard, pressed && styles.pressed]}><Text style={styles.linkTitle}>{item.label}</Text><Text style={styles.linkDescription}>{item.description}</Text><Text style={styles.linkArrow}>›</Text></Pressable>)}</View>
      {!matchingLinks.length ? <EmptyState title="No matching demo links" description="Try another search term." /> : null}
    </PortalPage>
  );
}

function createStyles(RcsColors: Record<keyof RcsPalette, string>) {
  return StyleSheet.create({
  search: {
    minHeight: 48,
    paddingHorizontal: 15,
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
    color: RcsColors.text,
    fontSize: 13,
  },
  list: { gap: 10 },
  linkCard: { position: 'relative', padding: 16, paddingRight: 38, borderRadius: 12, backgroundColor: RcsColors.surface, borderWidth: 1, borderColor: RcsColors.border },
  linkTitle: { color: RcsColors.text, fontSize: 14, fontWeight: '700' },
  linkDescription: { marginTop: 5, color: RcsColors.grayMuted, fontSize: 12, lineHeight: 18 },
  linkArrow: { position: 'absolute', right: 15, top: 15, color: RcsColors.brown, fontSize: 22 },
  pressed: { opacity: 0.75 },
  });
}
