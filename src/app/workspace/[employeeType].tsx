import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ResponsiveText as Text } from '@/components/responsive-text';
import { getCompanyBranding } from '@/constants/company-branding';
import type { RcsPalette } from '@/constants/theme';
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
  const { palette: colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === 'web' && width >= 760;
  const type = user?.employeeType ?? (routeType as EmployeeType);
  const workspace = workspaces[type] ?? workspaces.employee;
  const companyBranding = getCompanyBranding(user?.company.slug, user?.company.name);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={[styles.content, desktop && styles.desktopContent]}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>{companyBranding.name.toUpperCase()} / EMPLOYEE PORTAL</Text>
          <Text style={[styles.title, desktop && styles.desktopTitle]}>{workspace.title}</Text>
          <Text style={styles.summary}>{workspace.summary}</Text>
          <View style={styles.identity}>
            <Text style={styles.identityText}>{companyBranding.name}  ·  {user?.displayName}</Text>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Quick access</Text>
          <Text style={styles.sectionHint}>The services you use most</Text>
        </View>
        <View style={[styles.linkGrid, desktop && styles.desktopLinkGrid]}>
          {workspace.links.map((item, index) => (
            <Pressable
              key={item.label}
              accessibilityRole="link"
              onPress={() => router.push(item.route as never)}
              style={({ pressed }) => [
                styles.linkCard,
                desktop && styles.desktopLinkCard,
                desktop && index > 0 && styles.desktopLinkDivider,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.linkNumber}>0{index + 1}</Text>
              <View style={styles.linkCopy}>
                <Text style={styles.linkTitle}>{item.label}</Text>
                <Text style={styles.linkDetail}>{item.detail}</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </Pressable>
          ))}
        </View>

        <Pressable accessibilityRole="link" onPress={() => router.replace('/home')} style={styles.fullWorkspace}>
          <Text style={styles.fullWorkspaceText}>Open employee portal  →</Text>
        </Pressable>
        <Text style={styles.disclaimer}>Prototype workspace · Employee systems are not connected</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: Record<keyof RcsPalette, string>) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    content: { width: '100%', padding: 22, paddingBottom: 42 },
    desktopContent: { alignSelf: 'center', maxWidth: 1600, paddingVertical: 42, paddingHorizontal: 12, paddingBottom: 56 },
    hero: { paddingTop: 15, paddingBottom: 25, marginBottom: 28, borderBottomWidth: 1, borderBottomColor: colors.border },
    eyebrow: { color: colors.brown, fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
    title: { maxWidth: 640, marginTop: 18, color: colors.text, fontSize: 31, lineHeight: 38, fontWeight: '700', letterSpacing: -0.7 },
    desktopTitle: { fontSize: 40, lineHeight: 48 },
    summary: { maxWidth: 580, marginTop: 8, color: colors.mutedText, fontSize: 14, lineHeight: 22 },
    identity: { alignSelf: 'flex-start', marginTop: 15 },
    identityText: { color: colors.grayMuted, fontSize: 11, fontWeight: '600' },
    sectionHeading: { marginBottom: 13 },
    sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
    sectionHint: { marginTop: 4, color: colors.grayMuted, fontSize: 12 },
    linkGrid: { gap: 0 },
    desktopLinkGrid: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
    linkCard: { minHeight: 74, flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.border },
    desktopLinkCard: { flex: 1, minWidth: 0, minHeight: 96, paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 0 },
    desktopLinkDivider: { borderLeftWidth: 1, borderLeftColor: colors.border },
    linkNumber: { width: 24, color: colors.brown, fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
    linkCopy: { flex: 1, minWidth: 0 },
    linkTitle: { color: colors.text, fontSize: 13, fontWeight: '700' },
    linkDetail: { marginTop: 4, color: colors.grayMuted, fontSize: 11, lineHeight: 16 },
    arrow: { color: colors.brown, fontSize: 17 },
    fullWorkspace: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', marginTop: 16 },
    fullWorkspaceText: { color: colors.brown, fontSize: 12, fontWeight: '700' },
    disclaimer: { marginTop: 20, color: colors.grayMuted, fontSize: 10 },
    pressed: { opacity: 0.75 },
  });
}
