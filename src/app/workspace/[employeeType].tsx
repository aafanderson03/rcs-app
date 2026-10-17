import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ResponsiveText as Text } from '@/components/responsive-text';
import { getPaletteForScheme } from '@/constants/theme';
import { useAuth, type EmployeeType } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';

const workspaces: Record<EmployeeType, { title: string; summary: string; links: { label: string; detail: string; route: string }[] }> = {
  employee: {
    title: 'Employee workspace',
    summary: 'Your employee services and records, together in one place.',
    links: [
      { label: 'Attendance & DTR', detail: 'Review attendance and time records', route: '/attendance' },
      { label: 'Applications', detail: 'Submit or follow up on a request', route: '/applications' },
      { label: 'Employee inquiry', detail: 'Open your profile and balances', route: '/inquiry/basic-profile' },
    ],
  },
  merchandiser: {
    title: 'Merchandiser workspace',
    summary: 'Quick access to the employee services most useful to field teams.',
    links: [
      { label: 'Attendance & DTR', detail: 'Review your attendance record', route: '/attendance' },
      { label: 'Announcements', detail: 'Read the latest team updates', route: '/announcements' },
      { label: 'Help & guides', detail: 'Find instructions for common requests', route: '/help' },
    ],
  },
  guard: {
    title: 'Guard workspace',
    summary: 'Your employee services with attendance and important updates close at hand.',
    links: [
      { label: 'Attendance & DTR', detail: 'Review your attendance record', route: '/attendance' },
      { label: 'Announcements', detail: 'Read the latest team updates', route: '/announcements' },
      { label: 'Help & guides', detail: 'Find instructions for common requests', route: '/help' },
    ],
  },
  subcontractor: {
    title: 'Sub-contractor workspace',
    summary: 'Start with requests, updates, and practical employee support.',
    links: [
      { label: 'Applications', detail: 'Submit or follow up on a request', route: '/applications' },
      { label: 'Announcements', detail: 'Read the latest company updates', route: '/announcements' },
      { label: 'Help & guides', detail: 'Find instructions for common requests', route: '/help' },
    ],
  },
};

export default function EmployeeWorkspaceScreen() {
  const router = useRouter();
  const { employeeType: routeType } = useLocalSearchParams<{ employeeType: string }>();
  const { user } = useAuth();
  const { colorScheme } = useAppTheme();
  const colors = useMemo(() => getPaletteForScheme(colorScheme), [colorScheme]);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === 'web' && width >= 760;
  const type = user?.employeeType ?? (routeType as EmployeeType);
  const workspace = workspaces[type] ?? workspaces.employee;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={[styles.content, desktop && styles.desktopContent]}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>YOUR RCS WORKSPACE</Text>
          <Text style={[styles.title, desktop && styles.desktopTitle]}>{workspace.title}</Text>
          <Text style={styles.summary}>{workspace.summary}</Text>
          <View style={styles.identity}>
            <Text style={styles.identityText}>{user?.company.name}  ·  {user?.displayName}</Text>
          </View>
          <View style={styles.heroAccent} />
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Start here</Text>
          <Text style={styles.sectionHint}>A few useful places to begin</Text>
        </View>
        <View style={[styles.linkGrid, desktop && styles.desktopLinkGrid]}>
          {workspace.links.map((item, index) => (
            <Pressable
              key={item.label}
              accessibilityRole="link"
              onPress={() => router.push(item.route as never)}
              style={({ pressed }) => [styles.linkCard, desktop && styles.desktopLinkCard, pressed && styles.pressed]}
            >
              <Text style={styles.linkNumber}>0{index + 1}</Text>
              <Text style={styles.linkTitle}>{item.label}</Text>
              <Text style={styles.linkDetail}>{item.detail}</Text>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          ))}
        </View>

        <Pressable accessibilityRole="link" onPress={() => router.replace('/home')} style={styles.fullWorkspace}>
          <Text style={styles.fullWorkspaceText}>Open full employee portal  ›</Text>
        </Pressable>
        <Text style={styles.disclaimer}>Prototype workspace · Employee systems are not connected</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ReturnType<typeof getPaletteForScheme>) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    content: { width: '100%', padding: 20, paddingBottom: 42 },
    desktopContent: { alignSelf: 'flex-start', padding: 40, paddingBottom: 56 },
    hero: { position: 'relative', overflow: 'hidden', padding: 25, borderRadius: 12, backgroundColor: colors.brownSurface, borderTopWidth: 4, borderTopColor: colors.yellow },
    eyebrow: { color: colors.yellow, fontSize: 10, fontWeight: '800', letterSpacing: 1.7 },
    title: { maxWidth: 640, marginTop: 12, color: '#FFF9EF', fontFamily: 'Georgia', fontSize: 31, lineHeight: 38, fontWeight: '700' },
    desktopTitle: { fontSize: 40, lineHeight: 48 },
    summary: { maxWidth: 580, marginTop: 9, color: '#DED5C8', fontSize: 14, lineHeight: 22 },
    identity: { alignSelf: 'flex-start', marginTop: 20, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.1)' },
    identityText: { color: '#F4EDE1', fontSize: 11, fontWeight: '600' },
    heroAccent: { position: 'absolute', right: -70, bottom: -140, width: 230, height: 230, borderRadius: 120, borderWidth: 1, borderColor: 'rgba(229,182,56,0.45)' },
    sectionHeading: { marginTop: 28, marginBottom: 12 },
    sectionTitle: { color: colors.brownDark, fontSize: 17, fontWeight: '800' },
    sectionHint: { marginTop: 4, color: colors.grayMuted, fontSize: 12 },
    linkGrid: { gap: 10 },
    desktopLinkGrid: { flexDirection: 'row', gap: 14 },
    linkCard: { position: 'relative', minHeight: 126, padding: 17, paddingRight: 34, borderRadius: 9, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderTopWidth: 2, borderTopColor: colors.yellow },
    desktopLinkCard: { flex: 1, minHeight: 165, padding: 20 },
    linkNumber: { color: colors.brown, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
    linkTitle: { marginTop: 13, color: colors.brownDark, fontSize: 15, fontWeight: '800' },
    linkDetail: { marginTop: 5, color: colors.grayMuted, fontSize: 12, lineHeight: 18 },
    arrow: { position: 'absolute', right: 14, bottom: 12, color: colors.brown, fontSize: 23 },
    fullWorkspace: { alignSelf: 'flex-start', minHeight: 46, justifyContent: 'center', marginTop: 16, paddingHorizontal: 15, borderRadius: 6, backgroundColor: colors.yellowLight },
    fullWorkspaceText: { color: colors.brownDark, fontSize: 12, fontWeight: '800' },
    disclaimer: { marginTop: 20, color: colors.grayMuted, fontSize: 10 },
    pressed: { opacity: 0.75 },
  });
}
