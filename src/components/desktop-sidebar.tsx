import { Image } from 'expo-image';
import { usePathname, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ResponsiveText as Text } from '@/components/responsive-text';
import { getCompanyBranding } from '@/constants/company-branding';
import { getPaletteForScheme } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';

type Route =
  | '/home'
  | '/announcements'
  | '/attendance'
  | '/applications'
  | '/help'
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

export type MenuLink = {
  label: string;
  route?: Route;
  icon?: string;
};

type MenuGroup = {
  label: string;
  links: MenuLink[];
};

type DesktopSidebarProps = {
  onNavigate?: () => void;
  fullScreen?: boolean;
  onClose?: () => void;
  desktopRail?: boolean;
  collapsed?: boolean;
  companyName?: string;
  logo?: ReturnType<typeof getCompanyBranding>['logo'];
  onToggleCollapsed?: () => void;
};

const workspaceLinks: MenuLink[] = [
  { label: 'Home', route: '/home' },
  { label: 'Announcements', route: '/announcements' },
  { label: 'Attendance & DTR', route: '/attendance' },
  { label: 'Applications', route: '/applications' },
];

const supportLinks: MenuLink[] = [
  { label: 'Help', route: '/help', icon: '?' },
  { label: 'Other URLs', route: '/portal', icon: '↗' },
];

const menuGroups: MenuGroup[] = [
  {
    label: 'Pay & benefits',
    links: [
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
    label: 'Profile & employment',
    links: [
      {
        label: 'Basic Profile',
        route: { pathname: '/inquiry/[section]', params: { section: 'basic-profile' } },
      },
      { label: 'Personal Information' },
      { label: 'Employment Information' },
    ],
  },
  {
    label: 'Additional records',
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

const primaryIcons: Record<string, string> = {
  Home: '⌂',
  Announcements: '◉',
  'Attendance & DTR': '◷',
  Applications: '▤',
  'Pay & benefits': '₱',
  'Profile & employment': '◎',
  'Additional records': '⋯',
  Help: '?',
  'Sign out': '⇥',
};

export function DesktopSidebar({
  onNavigate,
  fullScreen = false,
  onClose,
  desktopRail = false,
  collapsed = false,
  companyName = '',
  logo,
  onToggleCollapsed,
}: DesktopSidebarProps) {
  const { colorScheme } = useAppTheme();
  const { signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const styles = useMemo(() => createStyles(getPaletteForScheme(colorScheme)), [colorScheme]);

  const activeGroupLabel =
    pathname === '/inquiry/basic-profile'
      ? 'Profile & employment'
      : pathname.startsWith('/inquiry/')
        ? 'Pay & benefits'
        : menuGroups.find((group) =>
            group.links.some((link) => pathname === `/records/${toSectionKey(link.label)}`)
          )?.label;

  const navigate = (route: Route) => {
    router.replace(route);
    onNavigate?.();
  };

  const renderLink = (item: MenuLink, compact = false, iconOnly = false) => {
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
        accessibilityLabel={iconOnly ? item.label : undefined}
        accessibilityState={route ? { selected: active } : { disabled: true }}
        disabled={!route}
        onPress={route ? () => navigate(route) : undefined}
        style={({ hovered, pressed }) => [
          iconOnly
            ? styles.railIconLink
            : compact
              ? styles.primaryLink
              : styles.childLink,
          hovered && route && styles.hoveredLink,
          active && styles.activeLink,
          pressed && styles.pressedLink,
        ]}
      >
        {compact ? (
          <View style={[styles.primaryIcon, active && styles.activePrimaryIcon]}>
            <Text style={[styles.primaryIconText, active && styles.activeLinkText]}>
              {item.icon ?? primaryIcons[item.label] ?? '•'}
            </Text>
          </View>
        ) : null}
        {!iconOnly ? <Text
          style={[
            compact ? styles.primaryLinkText : styles.childLinkText,
            active && styles.activeLinkText,
            !route && styles.disabledLinkText,
          ]}
        >
          {item.label}
        </Text> : null}
        {!item.route ? <Text style={styles.comingSoon}>Soon</Text> : null}
      </Pressable>
    );
  };

  if (desktopRail) {
    return (
      <View style={[styles.sidebar, styles.desktopRail, collapsed && styles.collapsedDesktopRail]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onPress={onToggleCollapsed}
          style={({ hovered, pressed }) => [
            styles.railBrand,
            collapsed && styles.collapsedRailBrand,
            hovered && styles.hoveredLink,
            pressed && styles.pressedLink,
          ]}
        >
          {logo ? (
            <Image
              source={logo}
              contentFit="contain"
              style={[styles.railLogo, collapsed && styles.collapsedRailLogo]}
              accessibilityLabel={`${companyName} logo`}
            />
          ) : null}
          {collapsed ? <Text style={styles.railCollapseIcon}>›</Text> : null}
          {!collapsed ? (
            <>
              <Text style={styles.railBrandName} numberOfLines={1}>{companyName}</Text>
              <Text style={styles.railCollapseIcon}>‹</Text>
            </>
          ) : null}
        </Pressable>

        <ScrollView
          style={styles.menuScroll}
          contentContainerStyle={[styles.menuContent, collapsed && styles.collapsedMenuContent]}
          showsVerticalScrollIndicator={false}
        >
          {!collapsed ? <Text style={styles.sectionLabel}>WORKSPACE</Text> : null}
          {workspaceLinks.map((link) => renderLink(link, true, collapsed))}

          {!collapsed ? (
            <Text style={[styles.sectionLabel, styles.recordsLabel]}>EMPLOYEE RECORDS</Text>
          ) : null}
          {menuGroups.map((group) => {
            return (
              <View key={group.label} style={styles.group}>
                {collapsed ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={group.label}
                    onPress={onToggleCollapsed}
                    style={({ hovered, pressed }) => [
                      styles.railIconLink,
                      activeGroupLabel === group.label && styles.activeGroupToggle,
                      hovered && styles.hoveredLink,
                      pressed && styles.pressedLink,
                    ]}
                  >
                    <Text style={styles.primaryIconText}>{primaryIcons[group.label]}</Text>
                  </Pressable>
                ) : (
                  <>
                    <View style={styles.groupHeading}>
                      <Text
                        style={[
                          styles.groupLabel,
                          activeGroupLabel === group.label && styles.activeGroupLabel,
                        ]}
                      >
                        {group.label}
                      </Text>
                    </View>
                      <View style={styles.groupItems}>
                        {group.links.map((link) => renderLink(withRecordRoute(link)))}
                      </View>
                  </>
                )}
              </View>
            );
          })}
        </ScrollView>

        <View style={[styles.railFooter, collapsed && styles.collapsedRailFooter]}>
          {!collapsed ? <Text style={styles.supportLabel}>SUPPORT</Text> : null}
          {supportLinks.map((link) => {
            const route = link.route;
            if (!route) return null;
            return (
              <Pressable
                key={link.label}
                accessibilityRole="link"
                accessibilityLabel={link.label}
                onPress={() => navigate(route)}
                style={({ hovered, pressed }) => [
                  collapsed ? styles.railIconLink : styles.railSupportLink,
                  hovered && styles.hoveredLink,
                  pressed && styles.pressedLink,
                ]}
              >
                <Text style={collapsed ? styles.primaryIconText : styles.railSupportIcon}>
                  {link.icon}
                </Text>
                {!collapsed ? <Text style={styles.railSupportText}>{link.label}</Text> : null}
              </Pressable>
            );
          })}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            onPress={async () => {
              await signOut();
              router.replace('/');
              onNavigate?.();
            }}
            style={({ hovered, pressed }) => [
              collapsed ? styles.railIconLink : styles.railSignOut,
              hovered && styles.hoveredLink,
              pressed && styles.pressedLink,
            ]}
          >
            <Text style={collapsed ? styles.primaryIconText : styles.railSignOutText}>
              {collapsed ? primaryIcons['Sign out'] : 'Sign out'}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.sidebar, fullScreen && styles.fullScreenSidebar]}>
      {fullScreen && onClose ? (
        <View style={styles.sidebarHeader}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close navigation menu"
            onPress={onClose}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </Pressable>
        </View>
      ) : null}

      <ScrollView style={styles.menuScroll} contentContainerStyle={styles.menuContent}>
        <Text style={styles.sectionLabel}>WORKSPACE</Text>
        {workspaceLinks.map((link) => renderLink(link, true))}

        <Text style={[styles.sectionLabel, styles.recordsLabel]}>EMPLOYEE RECORDS</Text>
        {menuGroups.map((group) => {
          return (
            <View key={group.label} style={styles.group}>
              <Text
                style={[
                  styles.groupLabel,
                  styles.groupHeading,
                  activeGroupLabel === group.label && styles.activeGroupLabel,
                ]}
              >
                {group.label}
              </Text>
              <View style={styles.groupItems}>
                {group.links.map((link) =>
                  renderLink({
                    ...link,
                    route:
                      link.route ??
                      ({
                        pathname: '/records/[section]',
                        params: { section: toSectionKey(link.label) },
                      } as const),
                  })
                )}
              </View>
            </View>
          );
        })}

        <Text style={[styles.sectionLabel, styles.recordsLabel]}>SUPPORT</Text>
        {supportLinks.map((link) => renderLink(link, true))}
      </ScrollView>

      <View style={styles.sidebarFooter}>
        <Pressable
          accessibilityRole="button"
          onPress={async () => {
            await signOut();
            router.replace('/');
            onNavigate?.();
          }}
          style={({ hovered, pressed }) => [
            styles.signOutButton,
            hovered && styles.hoveredLink,
            pressed && styles.pressedLink,
          ]}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>
    </View>
  );
}

function toSectionKey(label: string) {
  return label.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function withRecordRoute(link: MenuLink): MenuLink & { route: Route } {
  if (link.route) return { ...link, route: link.route };
  return {
    ...link,
    route: { pathname: '/records/[section]', params: { section: toSectionKey(link.label) } },
  };
}

function createStyles(colors: ReturnType<typeof getPaletteForScheme>) {
  return StyleSheet.create({
  sidebar: {
    width: 272,
    height: '100%',
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  desktopRail: { width: 260, flexShrink: 0 },
  collapsedDesktopRail: { width: 72 },
  fullScreenSidebar: { width: '100%', maxWidth: '100%', borderRightWidth: 0 },
  railBrand: {
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  collapsedRailBrand: { justifyContent: 'center', gap: 2, paddingHorizontal: 10 },
  railLogo: { width: 72, height: 54, flexShrink: 0 },
  collapsedRailLogo: { width: 48, height: 36 },
  railBrandName: { flex: 1, minWidth: 0, color: colors.brown, fontSize: 12, fontWeight: '800' },
  railCollapseIcon: {
    width: 28,
    height: 28,
    color: colors.grayMuted,
    fontSize: 20,
    lineHeight: 26,
    textAlign: 'center',
    borderRadius: 9,
    backgroundColor: colors.grayLight,
  },
  collapsedMenuContent: { alignItems: 'center' },
  railIconLink: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 4,
    borderRadius: 12,
  },
  activeGroupToggle: { backgroundColor: colors.yellowLight },
  railFooter: {
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  collapsedRailFooter: { alignItems: 'center', paddingHorizontal: 12 },
  supportLabel: {
    marginTop: 8,
    marginBottom: 2,
    paddingHorizontal: 12,
    color: colors.grayMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  railSupportLink: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 12,
    borderRadius: 9,
  },
  railSupportIcon: { width: 24, color: colors.brown, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  railSupportText: { flex: 1, minWidth: 0, color: colors.grayDark, fontSize: 12, fontWeight: '700' },
  railSignOut: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginTop: 5,
    paddingHorizontal: 8,
    borderRadius: 9,
    backgroundColor: colors.grayLight,
  },
  railSignOutText: { color: colors.brown, fontSize: 12, fontWeight: '800' },
  sidebarHeader: { minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 18, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeButtonText: { color: colors.brown, fontSize: 28, lineHeight: 30 },
  menuScroll: { flex: 1 },
  menuContent: { paddingHorizontal: 12, paddingTop: 18, paddingBottom: 20 },
  sectionLabel: {
    marginHorizontal: 10,
    marginBottom: 8,
    color: colors.grayMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  recordsLabel: { marginTop: 20 },
  primaryLink: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 10,
    marginBottom: 2,
    borderRadius: 10,
  },
  primaryLinkText: { flex: 1, color: colors.grayDark, fontSize: 12, fontWeight: '600' },
  primaryIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  primaryIconText: { color: colors.grayMuted, fontSize: 16, fontWeight: '700' },
  activePrimaryIcon: { backgroundColor: 'rgba(255,255,255,0.18)' },
  group: { marginBottom: 4 },
  groupHeading: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 9,
  },
  groupLabel: {
    flex: 1,
    color: colors.grayDark,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  activeGroupLabel: { color: colors.brown },
  groupItems: {
    paddingVertical: 4,
    marginTop: 3,
    marginLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  childLink: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 14,
    paddingRight: 10,
    marginLeft: 6,
    borderRadius: 8,
  },
  childLinkText: { flex: 1, color: colors.grayMuted, fontSize: 12, lineHeight: 17 },
  activeLink: { backgroundColor: colors.brown },
  activeLinkText: { color: colors.white, fontWeight: '800' },
  hoveredLink: { backgroundColor: colors.grayLight, borderRadius: 10 },
  pressedLink: { opacity: 0.75 },
  disabledLinkText: { color: colors.grayMuted },
  comingSoon: {
    marginLeft: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.grayLight,
    color: colors.grayMuted,
    fontSize: 9,
    fontWeight: '700',
  },
  sidebarFooter: {
    minHeight: 72,
    justifyContent: 'center',
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  signOutButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, borderRadius: 11, backgroundColor: colors.grayLight },
  signOutText: { color: colors.brown, fontSize: 11, fontWeight: '800' },
  });
}
