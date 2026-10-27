import { useMemo } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';

import { PageHeading, PortalPage, PreviewNotice } from '@/components/portal-ui';
import { ResponsiveText as Text } from '@/components/responsive-text';
import { getPaletteForScheme, type RcsPalette } from '@/constants/theme';
import { useAppTheme } from '@/contexts/theme-context';
import { demoAnnouncements, formatDemoDate } from '@/data/demo-data';

const NEW_WITHIN_DAYS = 2;

// Whole days between an announcement date (YYYY-MM-DD) and today.
function daysAgo(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((todayStart.getTime() - new Date(year, month - 1, day).getTime()) / 86400000);
}

export default function AnnouncementsScreen() {
  const { colorScheme } = useAppTheme();
  const palette = getPaletteForScheme(colorScheme);
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 960;

  const accentFor = (category: string) => {
    if (category === 'PAYROLL') return palette.brown;
    if (category === 'STORE OPERATIONS') return palette.yellowDeep;
    if (category === 'PEOPLE & CULTURE') return palette.brownLight;
    return palette.brown;
  };

  return (
    <PortalPage>
      <PageHeading
        title="Announcements"
        description="The latest updates for employees, newest first."
      />
      <PreviewNotice>
        Fictional sample notices for presentation only. These are not active company announcements.
      </PreviewNotice>

      <View style={[styles.list, isDesktop && styles.desktopList]}>
        {demoAnnouncements.map((item, index) => {
          const isFeatured = isDesktop && index === 0;
          const isNew = daysAgo(item.date) <= NEW_WITHIN_DAYS;
          return (
            <View
              key={item.id}
              style={[styles.card, isDesktop && styles.desktopCard, isFeatured && styles.featuredCard]}
            >
              <View style={[styles.accent, { backgroundColor: accentFor(item.category) }]} />
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <View style={styles.cardTags}>
                    <View style={styles.categoryChip}>
                      <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                    {isNew ? (
                      <View style={styles.newBadge}>
                        <Text style={styles.newText}>NEW</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.date}>{formatDemoDate(item.date)}</Text>
                </View>
                <Text style={[styles.cardTitle, isFeatured && styles.featuredTitle]}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </PortalPage>
  );
}

function createStyles(colors: Record<keyof RcsPalette, string>) {
  return StyleSheet.create({
    list: { gap: 12 },
    desktopList: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    card: {
      flexDirection: 'row',
      overflow: 'hidden',
      borderRadius: 5,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    desktopCard: { flexGrow: 1, flexBasis: '48%', minWidth: 0 },
    featuredCard: { flexBasis: '100%' },
    accent: { width: 4 },
    cardBody: { flex: 1, minWidth: 0, padding: 18 },
    cardTop: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    cardTags: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
    categoryChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 3, backgroundColor: colors.yellowLight },
    categoryText: { color: colors.brownDark, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
    newBadge: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 3, backgroundColor: colors.brown },
    newText: { color: colors.white, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
    date: { flexShrink: 0, color: colors.grayMuted, fontSize: 12 },
    cardTitle: { marginTop: 12, color: colors.text, fontSize: 17, lineHeight: 23, fontWeight: '700' },
    featuredTitle: { fontSize: 21, lineHeight: 28, letterSpacing: -0.3 },
    body: { marginTop: 8, color: colors.grayDark, fontSize: 14, lineHeight: 21 },
  });
}
