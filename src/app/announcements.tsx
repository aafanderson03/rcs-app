import { useMemo, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { EmptyState, PageHeading, PortalPage, PreviewNotice } from '@/components/portal-ui';
import { ResponsiveText as Text, ResponsiveTextInput as TextInput } from '@/components/responsive-text';
import type { RcsPalette } from '@/constants/theme';
import { useAppTheme } from '@/contexts/theme-context';
import { demoAnnouncements, formatDemoDate } from '@/data/demo-data';

const NEW_WITHIN_DAYS = 2;

function daysAgo(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const noticeDate = new Date(year, month - 1, day);
  return Math.round((todayStart.getTime() - noticeDate.getTime()) / 86400000);
}

export default function AnnouncementsScreen() {
  const { palette } = useAppTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { width, height } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 960;
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('ALL');
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<(typeof demoAnnouncements)[number] | null>(null);
  const normalizedQuery = query.trim().toLowerCase();
  const categories = ['ALL', ...new Set(demoAnnouncements.map((item) => item.category))];
  const filteredAnnouncements = demoAnnouncements.filter((item) => {
    const matchesCategory = category === 'ALL' || item.category === category;
    const searchableText = `${item.title} ${item.category} ${item.body} ${item.content}`.toLowerCase();
    return matchesCategory && searchableText.includes(normalizedQuery);
  });

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

      <TextInput
        accessibilityLabel="Search announcements"
        placeholder="Search announcements"
        placeholderTextColor={palette.grayMuted}
        value={query}
        onChangeText={setQuery}
        style={styles.search}
      />

      <View style={styles.categoryFilters}>
        {categories.map((item) => {
          const isSelected = item === category;
          return (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => setCategory(item)}
              style={({ pressed }) => [
                styles.categoryFilter,
                isSelected && styles.selectedCategoryFilter,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.categoryFilterText, isSelected && styles.selectedCategoryFilterText]}>
                {item === 'ALL' ? 'All' : item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.list, isDesktop && styles.desktopList]}>
        {filteredAnnouncements.map((item, index) => {
          const isFeatured = isDesktop && index === 0;
          const ageInDays = daysAgo(item.date);
          const isNew = ageInDays >= 0 && ageInDays <= NEW_WITHIN_DAYS;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`View announcement: ${item.title}`}
              onPress={() => setSelectedAnnouncement(item)}
              style={({ pressed }) => [
                styles.card,
                isDesktop && styles.desktopCard,
                isFeatured && styles.featuredCard,
                pressed && styles.pressed,
              ]}
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
                <Text style={styles.readMore}>Read full announcement →</Text>
              </View>
            </Pressable>
          );
        })}
        {filteredAnnouncements.length === 0 ? (
          <EmptyState
            title="No matching announcements"
            description="Try another search term or category."
          />
        ) : null}
      </View>

      <Modal
        animationType="fade"
        onRequestClose={() => setSelectedAnnouncement(null)}
        presentationStyle="overFullScreen"
        statusBarTranslucent={Platform.OS === 'android'}
        transparent
        visible={selectedAnnouncement !== null}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close announcement"
            onPress={() => setSelectedAnnouncement(null)}
            style={StyleSheet.absoluteFill}
          />
          {selectedAnnouncement ? (
            <View
              accessibilityViewIsModal
              style={[styles.modalCard, { maxHeight: Math.max(height - 40, 260) }]}
            >
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleCopy}>
                  <Text style={styles.modalCategory}>{selectedAnnouncement.category}</Text>
                  <Text style={styles.modalTitle}>{selectedAnnouncement.title}</Text>
                  <Text style={styles.modalDate}>{formatDemoDate(selectedAnnouncement.date)}</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close announcement"
                  onPress={() => setSelectedAnnouncement(null)}
                  hitSlop={8}
                  style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </Pressable>
              </View>
              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={styles.modalContent}
                showsVerticalScrollIndicator
              >
                {selectedAnnouncement.content.split('\n\n').map((paragraph, index) => (
                  <Text key={index} style={styles.modalParagraph}>{paragraph}</Text>
                ))}
                <Text style={styles.demoDisclaimer}>
                  Fictional sample announcement for presentation only.
                </Text>
              </ScrollView>
            </View>
          ) : null}
        </View>
      </Modal>
    </PortalPage>
  );
}

function createStyles(colors: Record<keyof RcsPalette, string>) {
  return StyleSheet.create({
    search: {
      minHeight: 48,
      paddingHorizontal: 15,
      marginBottom: 12,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
      fontSize: 13,
    },
    categoryFilters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 16 },
    categoryFilter: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectedCategoryFilter: { backgroundColor: colors.brown, borderColor: colors.brown },
    categoryFilterText: { color: colors.grayDark, fontSize: 11, fontWeight: '700' },
    selectedCategoryFilterText: { color: colors.white },
    list: { gap: 12 },
    desktopList: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    card: {
      flexDirection: 'row',
      overflow: 'hidden',
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pressed: { opacity: 0.75 },
    desktopCard: { flexGrow: 1, flexBasis: '48%', minWidth: 0 },
    featuredCard: { flexBasis: '100%' },
    accent: { width: 4 },
    cardBody: { flex: 1, minWidth: 0, padding: 18 },
    cardTop: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    cardTags: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
    categoryChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: colors.yellowLight },
    categoryText: { color: colors.brownDark, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
    newBadge: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 8, backgroundColor: colors.brown },
    newText: { color: colors.white, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
    date: { flexShrink: 0, color: colors.grayMuted, fontSize: 12 },
    cardTitle: { marginTop: 12, color: colors.text, fontSize: 17, lineHeight: 23, fontWeight: '700' },
    featuredTitle: { fontSize: 21, lineHeight: 28, letterSpacing: -0.3 },
    body: { marginTop: 8, color: colors.grayDark, fontSize: 14, lineHeight: 21 },
    readMore: { marginTop: 12, color: colors.brown, fontSize: 12, fontWeight: '800' },
    modalBackdrop: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      backgroundColor: 'rgba(0,0,0,0.48)',
    },
    modalCard: {
      width: '100%',
      maxWidth: 760,
      flexShrink: 1,
      overflow: 'hidden',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      elevation: 16,
    },
    modalHeader: {
      minHeight: 88,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingLeft: 20,
      paddingRight: 12,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    modalTitleCopy: { flex: 1, minWidth: 0 },
    modalCategory: { color: colors.brown, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
    modalTitle: { marginTop: 4, color: colors.text, fontSize: 19, lineHeight: 25, fontWeight: '800' },
    modalDate: { marginTop: 4, color: colors.grayMuted, fontSize: 12 },
    closeButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      backgroundColor: colors.grayLight,
    },
    closeButtonText: { color: colors.text, fontSize: 28, lineHeight: 32 },
    modalScroll: { flexShrink: 1 },
    modalContent: { padding: 22, gap: 16 },
    modalParagraph: { color: colors.text, fontSize: 15, lineHeight: 24 },
    demoDisclaimer: {
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      color: colors.grayMuted,
      fontSize: 12,
      lineHeight: 18,
    },
  });
}
