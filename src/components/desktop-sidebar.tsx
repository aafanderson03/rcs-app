import { usePathname, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ResponsiveText as Text } from '@/components/responsive-text';
import { getCompanyBranding } from '@/constants/company-branding';
import { getPaletteForScheme } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';

type Route =
  | '/home'
  | '/dashboard'
  | '/announcements'
  | '/attendance'
  | '/applications'
  | '/ticket'
  | '/help'
/*  | '/other-urls' */
  | '/portal'
  | {
      pathname: '/records/[section]';
      params: { section: string };
    }
  | {
      pathname: '/inquiry/[section]';
      params: {
        section: 'basic-profile' | 'leave-balances' | 'loan-balance' | 'pay-slip';
      };
    };

type MenuLink = {
  label: string;
  route?: Route;
};

type MenuGroup = {
  label: string;
  links: MenuLink[];
};

type DesktopSidebarProps = {
  onNavigate?: () => void;
  fullScreen?: boolean;
  onClose?: () => void;
};

const menuGroups: MenuGroup[] = [
  {
    label: 'Employee Inquiry',
    links: [
      {
        label: 'Basic Profile',
        route: { pathname: '/inquiry/[section]', params: { section: 'basic-profile' } },
      },
      {
        label: 'Leave Balances',
        route: { pathname: '/inquiry/[section]', params: { section: 'leave-balances' } },
      },
      {
        label: 'Loan Balance',
        route: { pathname: '/inquiry/[section]', params: { section: 'loan-balance' } },
      },
      {
        label: 'Pay Slip',
        route: { pathname: '/inquiry/[section]', params: { section: 'pay-slip' } },
      },
    ],
  },
  {
    label: 'Employee Masterfile',
    links: [{ label: 'Personal Information' }, { label: 'Employment Information' }],
  },
  {
    label: 'Employee Other Information',
    links: [
      { label: 'Annual Physical Exams' },
      { label: 'Awards & Commendations' },
      { label: 'Bank Accounts' },
      { label: 'Disciplinary Cases' },
      { label: 'Disciplinary Remarks' },
      { label: 'Educational Background' },
      { label: 'Examination Result' },
      { label: 'Family Information' },
      { label: 'Forms Submitted to Government' },
      { label: 'Government Exams' },
      { label: 'Health Insurance' },
      { label: 'Health Record' },
      { label: 'Insurance Claims' },
      { label: 'Languages and Dialects' },
      { label: 'Licenses and Other Eligibility' },
      { label: 'Medical Cases' },
      { label: 'Medical Reimbursements' },
      { label: 'Narrative Report' },
      { label: 'Previous Employment' },
      { label: 'References' },
      { label: 'Seminars and Trainings' },
      { label: 'Skills' },
    ],
  },
];

const initialExpandedGroups: string[] = [];

export function DesktopSidebar({
  onNavigate,
  fullScreen = false,
  onClose,
}: DesktopSidebarProps) {
  const { colorScheme } = useAppTheme();
  const { signOut, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(initialExpandedGroups);
  const styles = useMemo(() => createStyles(getPaletteForScheme(colorScheme)), [colorScheme]);
  const companyBranding = getCompanyBranding(user?.company.slug, user?.company.name);

  const navigate = (route: Route) => {
    router.replace(route);
    onNavigate?.();
  };

  const toggleGroup = (label: string) => {
    setExpandedGroups((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label]
    );
  };

  const renderLink = (item: MenuLink, compact = false) => {
    const route = item.route;
    const active =
      typeof route === 'string'
        ? route === pathname
        : route?.pathname === '/inquiry/[section]'
          ? pathname === `/inquiry/${route.params.section}`
          : route?.pathname === '/records/[section]' &&
            pathname === `/records/${route.params.section}`;

    return (
      <Pressable
        key={item.label}
        accessibilityRole={route ? 'link' : undefined}
        accessibilityState={route ? { selected: active } : { disabled: true }}
        disabled={!route}
        onPress={route ? () => navigate(route) : undefined}
        style={({ hovered, pressed }) => [
          compact ? styles.primaryLink : styles.childLink,
          active && styles.activeLink,
          hovered && route && styles.hoveredLink,
          pressed && styles.pressedLink,
        ]}
      >
        <Text
          style={[
            compact ? styles.primaryLinkText : styles.childLinkText,
            active && styles.activeLinkText,
            !route && styles.disabledLinkText,
          ]}
        >
          {item.label}
        </Text>
        {!item.route ? <Text style={styles.comingSoon}>Soon</Text> : null}
      </Pressable>
    );
  };

  return (
    <View style={[styles.sidebar, fullScreen && styles.fullScreenSidebar]}>
      <View style={styles.sidebarHeader}>
        <View>
          <Text style={styles.sidebarEyebrow} numberOfLines={1}>{companyBranding.name.toUpperCase()}</Text>
          <Text style={styles.sidebarTitle}>Navigation</Text>
        </View>
        {fullScreen && onClose ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close navigation menu"
            onPress={onClose}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView style={styles.menuScroll} contentContainerStyle={styles.menuContent}>
        <Text style={styles.sectionLabel}>WORKSPACE</Text>
        {renderLink({ label: 'Home', route: '/home' }, true)}
        {renderLink({ label: 'Announcement', route: '/announcements' }, true)}
        {renderLink({ label: 'Dashboard', route: '/dashboard' }, true)}
        {renderLink({ label: 'Attendance & DTR', route: '/attendance' }, true)}
        {renderLink({ label: 'Applications', route: '/applications' }, true)}

        <Text style={[styles.sectionLabel, styles.recordsLabel]}>EMPLOYEE RECORDS</Text>
        {menuGroups.map((group) => {
          const expanded = expandedGroups.includes(group.label);
          return (
            <View key={group.label} style={styles.group}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                onPress={() => toggleGroup(group.label)}
                style={({ hovered, pressed }) => [
                  styles.groupToggle,
                  hovered && styles.hoveredLink,
                  pressed && styles.pressedLink,
                ]}
              >
                <Text style={styles.groupLabel}>{group.label}</Text>
                <Text style={styles.groupChevron}>{expanded ? '⌄' : '›'}</Text>
              </Pressable>
              {expanded ? (
                <View style={styles.groupItems}>
              {group.links.map((link) =>
                renderLink({
                  ...link,
                  route:
                    link.route ??
                    ({ pathname: '/records/[section]', params: { section: toSectionKey(link.label) } } as const),
                })
              )}
                </View>
              ) : null}
            </View>
          );
        })}

        <Text style={[styles.sectionLabel, styles.recordsLabel]}>OTHER</Text>
        {renderLink({ label: 'Submit a ticket', route: '/ticket' }, true)}
        {/*renderLink({ label: 'Other URLs', route: '/other-urls' }, true)*/}
        {renderLink({ label: 'Help', route: '/help' }, true)}
        {renderLink({ label: 'Legacy Employee Portal', route: '/portal' }, true)}
      </ScrollView>

      <View style={styles.versionFooter}>
        <View style={styles.accountSummary}>
          <Text style={styles.accountName} numberOfLines={1}>{user?.displayName || 'Employee'}</Text>
          <Text style={styles.version} numberOfLines={1}>{companyBranding.name}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={async () => { await signOut(); router.replace('/'); }} style={({ pressed }) => [styles.signOutButton, pressed && styles.pressedLink]}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable> 
      </View>
    </View>
  );
}

function toSectionKey(label: string) {
  return label.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function createStyles(colors: ReturnType<typeof getPaletteForScheme>) {
  return StyleSheet.create({
  sidebar: {
    width: 288,
    height: '100%',
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  fullScreenSidebar: { width: '100%', maxWidth: '100%', borderRightWidth: 0 },
  sidebarHeader: {
    height: 84,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sidebarEyebrow: {
    color: colors.brownLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  sidebarTitle: { marginTop: 5, color: colors.text, fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeButtonText: { color: colors.brown, fontSize: 28, lineHeight: 30 },
  menuScroll: { flex: 1 },
  menuContent: { paddingHorizontal: 14, paddingTop: 22, paddingBottom: 20 },
  sectionLabel: {
    marginHorizontal: 12,
    marginBottom: 8,
    color: colors.grayMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  recordsLabel: { marginTop: 25 },
  primaryLink: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginBottom: 4,
    borderRadius: 4,
  },
  primaryLinkText: { color: colors.grayDark, fontSize: 13, fontWeight: '600' },
  group: { marginBottom: 4 },
  groupToggle: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderRadius: 4,
  },
  groupLabel: {
    flex: 1,
    color: colors.grayDark,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
  },
  groupChevron: { marginLeft: 8, color: colors.brownLight, fontSize: 22, lineHeight: 25 },
  groupItems: {
    paddingVertical: 5,
    marginTop: 3,
    marginLeft: 13,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  childLink: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 15,
    paddingRight: 12,
  },
  childLinkText: { flex: 1, color: colors.grayMuted, fontSize: 12, lineHeight: 17 },
  activeLink: { backgroundColor: colors.yellowLight },
  activeLinkText: { color: colors.brownDark, fontWeight: '700' },
  hoveredLink: { backgroundColor: colors.grayLight },
  pressedLink: { opacity: 0.75 },
  disabledLinkText: { color: '#A8A39A' },
  comingSoon: {
    marginLeft: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: colors.grayLight,
    color: colors.grayMuted,
    fontSize: 9,
    fontWeight: '700',
  },
  versionFooter: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  accountSummary: { flex: 1, minWidth: 0, gap: 3 },
  accountName: { color: colors.brownDark, fontSize: 11, fontWeight: '800' },
  signOutButton: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 10, borderRadius: 4, backgroundColor: colors.yellowLight },
  signOutText: { color: colors.brown, fontSize: 11, fontWeight: '800' },
  version: { color: colors.grayMuted, fontSize: 10, lineHeight: 15, fontWeight: '600' },
  });
}
