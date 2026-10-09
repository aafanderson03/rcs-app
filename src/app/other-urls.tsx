import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { EmptyState, PageHeading, PortalPage, PreviewNotice } from '@/components/portal-ui';
import { ResponsiveTextInput as TextInput } from '@/components/responsive-text';
import { getPaletteForScheme, type RcsPalette } from '@/constants/theme';
import { useAppTheme } from '@/contexts/theme-context';

const companyLinks: { description: string; url: string }[] = [];

export default function OtherUrlsScreen() {
  const { colorScheme } = useAppTheme();
  const palette = getPaletteForScheme(colorScheme);
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [query, setQuery] = useState('');
  const matchingLinks = companyLinks.filter((item) =>
    `${item.description} ${item.url}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <PortalPage>
      <PageHeading
        title="Other URLs"
        description="Find company-provided employee resources and external tools."
      />
      <PreviewNotice>
        The signed-in portal had no company URLs available for this account when checked. This
        screen will show links only when an approved company source provides them.
      </PreviewNotice>
      <TextInput
        accessibilityLabel="Search company URLs"
        placeholder="Search company links"
        placeholderTextColor={palette.grayMuted}
        value={query}
        onChangeText={setQuery}
        style={styles.search}
      />
      <EmptyState
        title={matchingLinks.length ? 'Company links are ready' : 'No company links available'}
        description={
          matchingLinks.length
            ? `${matchingLinks.length} matching links.`
            : query
              ? 'No links match your search.'
              : 'Company-provided links will appear here when available.'
        }
      />
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
  });
}
