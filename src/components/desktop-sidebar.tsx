import { Image } from 'expo-image';
import { usePathname, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { ResponsiveText as Text } from '@/components/responsive-text';
import { getCompanyBranding } from '@/constants/company-branding';
import type { RcsPalette } from '@/constants/theme';
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
  icon?: SidebarIconName;
};

type MenuGroup = {
  label: string;
  links: MenuLink[];
};

type SidebarIconName =
  | 'home'
  | 'announcement'
  | 'clock'
  | 'file'
  | 'wallet'
  | 'person'
  | 'folder'
  | 'help'
  | 'external-link'
  | 'sign-out';

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
  { label: 'Help', route: '/help', icon: 'help' },
  { label: 'Other URLs', route: '/portal', icon: 'external-link' },
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

const primaryIcons: Record<string, SidebarIconName> = {
  Home: 'home',
  Announcements: 'announcement',
  'Attendance & DTR': 'clock',
  Applications: 'file',
  'Pay & benefits': 'wallet',
  'Profile & employment': 'person',
  'Additional records': 'folder',
  Help: 'help',
  'Sign out': 'sign-out',
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
  const { palette } = useAppTheme();
  const { signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const styles = useMemo(() => createStyles(palette), [palette]);

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
    const icon = item.icon ?? primaryIcons[item.label] ?? 'file';
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
            <SidebarIcon name={icon} color={active ? palette.white : palette.grayMuted} />
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
            <View style={[styles.railLogoFrame, collapsed && styles.collapsedRailLogoFrame]}>
              <Image
                source={logo}
                contentFit="contain"
                style={styles.railLogo}
                accessibilityLabel={`${companyName} logo`}
              />
            </View>
          ) : null}
          {collapsed ? <Text style={[styles.railCollapseIcon, styles.collapsedRailCollapseIcon]}>›</Text> : null}
          {!collapsed ? (
            <>
              <View style={styles.railBrandCopy}>
                <Text style={styles.railBrandName} numberOfLines={2}>{companyName}</Text>
                <Text style={styles.railBrandCaption} numberOfLines={1}>EMPLOYEE PORTAL</Text>
              </View>
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
                    <SidebarIcon
                      name={primaryIcons[group.label]}
                      color={activeGroupLabel === group.label ? palette.brown : palette.grayMuted}
                    />
                  </Pressable>
                ) : (
                  <>
                    <View style={styles.groupHeading}>
                      <SidebarIcon
                        name={primaryIcons[group.label]}
                        color={activeGroupLabel === group.label ? palette.brown : palette.grayMuted}
                        size={16}
                      />
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
                <View style={collapsed ? undefined : styles.railSupportIcon}>
                  <SidebarIcon name={link.icon ?? 'help'} color={palette.brown} size={16} />
                </View>
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
            {collapsed ? (
              <SidebarIcon name={primaryIcons['Sign out']} color={palette.grayMuted} />
            ) : (
              <>
                <View style={styles.railSupportIcon}>
                  <SidebarIcon name={primaryIcons['Sign out']} color={palette.brown} size={16} />
                </View>
                <Text style={styles.railSignOutText}>Sign out</Text>
              </>
            )}
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
              <View
                style={[
                  styles.groupHeading,
                ]}
              >
                <SidebarIcon
                  name={primaryIcons[group.label]}
                  color={activeGroupLabel === group.label ? palette.brown : palette.grayMuted}
                  size={16}
                />
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
          <SidebarIcon name={primaryIcons['Sign out']} color={palette.brown} size={16} />
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

const sidebarIconPaths: Record<SidebarIconName, string> = {
  home: 'M3 10.5 12 3l9 7.5M5 9v11h14V9M9 20v-6h6v6',
  announcement: 'M4 10v4h3l8 4V6l-8 4H4zM7 14l1.5 5h3L10 15M19 9a4 4 0 0 1 0 6',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  file: 'M6 3h8l4 4v14H6zM14 3v5h5M9 12h6M9 16h6',
  wallet: 'M4 6.5h15a2 2 0 0 1 2 2v10H5a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2h13v3M21 12h-5a2 2 0 0 0 0 4h5M16 14h.01',
  person: 'M20 21a8 8 0 0 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  folder: 'M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3zM3 9h18',
  help: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.5 9a2.5 2.5 0 1 1 4.1 1.9c-.9.8-1.6 1.1-1.6 2.6M12 17h.01',
  'external-link': 'M14 4h6v6M20 4l-9 9M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6',
  'sign-out': 'M10 17l5-5-5-5M15 12H3M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7',
};

function SidebarIcon({
  name,
  color,
  size = 18,
}: {
  name: SidebarIconName;
  color: string;
  size?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d={sidebarIconPaths[name]}
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function createStyles(colors: Record<keyof RcsPalette, string>) {
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
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  collapsedRailBrand: { minHeight: 76, justifyContent: 'center', gap: 0, paddingHorizontal: 10 },
  railLogoFrame: {
    width: 64,
    height: 58,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderRadius: 13,
    backgroundColor: colors.yellowLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  collapsedRailLogoFrame: { width: 48, height: 48, padding: 3 },
  railLogo: { width: '100%', height: '100%' },
  railBrandCopy: { flex: 1, minWidth: 0, gap: 4 },
  railBrandName: { color: colors.text, fontSize: 11, lineHeight: 14, fontWeight: '800' },
  railBrandCaption: { color: colors.brown, fontSize: 8, lineHeight: 11, fontWeight: '800', letterSpacing: 0.8 },
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
  collapsedRailCollapseIcon: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 20,
    height: 20,
    fontSize: 15,
    lineHeight: 18,
    borderWidth: 1,
    borderColor: colors.border,
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
  railSupportIcon: { width: 24, alignItems: 'center' },
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
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activePrimaryIcon: { backgroundColor: 'rgba(255,255,255,0.16)', borderColor: 'rgba(255,255,255,0.2)' },
  group: { marginBottom: 4 },
  groupHeading: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  signOutButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 12, borderRadius: 11, backgroundColor: colors.grayLight },
  signOutText: { color: colors.brown, fontSize: 11, fontWeight: '800' },
  });
}
