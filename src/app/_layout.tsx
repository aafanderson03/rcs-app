import { DesktopSidebar } from '@/components/desktop-sidebar';
import { NotificationBell } from '@/components/notification-bell';
import { ResponsiveText as Text } from '@/components/responsive-text';
import { getCompanyBranding } from '@/constants/company-branding';
import { COLOR_THEMES, type ColorTheme, type RcsPalette } from '@/constants/theme';
import { AuthProvider, useAuth, type ProfilePictureSource } from '@/contexts/auth-context';
import { DemoSubmissionsProvider } from '@/contexts/demo-submissions-context';
import { AppThemeProvider, useAppTheme, type ThemeMode } from '@/contexts/theme-context';
import { version as appVersion } from '../../package.json';
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from '@expo-google-fonts/montserrat';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { Image } from 'expo-image';
import { DefaultTheme, Stack, ThemeProvider, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Modal, Platform, Pressable, StyleSheet, useWindowDimensions, View, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const SPLASH_HOLD_DURATION_MS = 3250;
const SPLASH_FADE_DURATION_MS = 250;
const DESKTOP_LAYOUT_BREAKPOINT = 1200;

const mobileTabs = [
  { label: 'Home', glyph: '⌂', route: '/home' },
  { label: 'Time', glyph: '◷', route: '/attendance' },
  { label: 'Requests', glyph: '▤', route: '/applications' },
  { label: 'Updates', glyph: '◉', route: '/announcements' },
] as const;

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch((error: unknown) => {
    console.error('Unable to keep the native splash screen visible.', error);
  });
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <DemoSubmissionsProvider>
          <RootLayoutContent />
        </DemoSubmissionsProvider>
      </AuthProvider>
    </AppThemeProvider>
  );
}

function RootLayoutContent() {
  const { colorScheme, mode, setMode, colorTheme, setColorTheme, palette: colors, storageError } = useAppTheme();
  const { user, profilePicture } = useAuth();
  const companyBranding = getCompanyBranding(user?.company.slug, user?.company.name);
  const [fontsLoaded, fontError] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
  });
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [colorThemePickerOpen, setColorThemePickerOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashProgress] = useState(() => new Animated.Value(0));
  const [splashOpacity] = useState(() => new Animated.Value(1));
  const isDesktop = Platform.OS === 'web' && width >= DESKTOP_LAYOUT_BREAKPOINT;
  const fontReady = Platform.OS === 'web' || fontsLoaded || fontError !== null;
  const isPublicPage = pathname === '/' || pathname === '/login' || !user;
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.brown,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.yellowDeep,
    },
  };

  useEffect(() => {
    if (!user && pathname !== '/' && pathname !== '/login') {
      router.replace('/');
    } else if (user && pathname.startsWith('/workspace/')) {
      router.replace('/home');
    }
  }, [pathname, router, user]);

  useEffect(() => {
    if (!fontReady) return;

    if (fontError) {
      console.error('Unable to load the Montserrat fonts; using the platform fallback.', fontError);
    }

    if (Platform.OS !== 'web') {
      SplashScreen.hideAsync().catch((error: unknown) => {
        console.error('Unable to hide the native splash screen.', error);
      });
    }

    const artworkAnimation = Animated.timing(splashProgress, {
      toValue: 1,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    });
    const splashAnimation = Animated.timing(splashOpacity, {
      toValue: 0,
      duration: SPLASH_FADE_DURATION_MS,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    });
    artworkAnimation.start();
    const splashTimer = setTimeout(() => splashAnimation.start(({ finished }) => {
      if (finished) setSplashVisible(false);
    }), SPLASH_HOLD_DURATION_MS);
    return () => {
      clearTimeout(splashTimer);
      artworkAnimation.stop();
      splashAnimation.stop();
    };
  }, [fontError, fontReady, splashOpacity, splashProgress]);

  if (!fontReady) return null;

  return (
    <ThemeProvider value={theme}>
      <SafeAreaProvider>
        <SafeAreaView style={[styles.root, isDesktop && styles.desktopRoot]} edges={['top']}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <View style={[styles.workspaceBody, isDesktop && styles.desktopWorkspaceBody]}>
          {!isPublicPage && isDesktop ? (
            <DesktopSidebar
              desktopRail
              collapsed={desktopSidebarCollapsed}
              companyName={companyBranding.name}
              logo={companyBranding.logo}
              onToggleCollapsed={() => setDesktopSidebarCollapsed((collapsed) => !collapsed)}
            />
          ) : null}
          <View style={styles.mainColumn}>
            {!isPublicPage && isDesktop ? (
              <DesktopHeader
                mode={mode}
                displayName={user?.displayName ?? ''}
                employeeType={user?.employeeType ?? 'employee'}
                profilePicture={profilePicture}
                colorTheme={colorTheme}
                onOpenColorThemes={() => setColorThemePickerOpen(true)}
              />
            ) : null}
            {!isPublicPage && !isDesktop ? <View style={[styles.topBar, width < 380 && styles.compactTopBar]}>
              <View style={styles.brandGroup}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Go to home for ${companyBranding.name}`}
                  accessibilityHint="Opens the employee portal home page"
                  onPress={() => {
                    setMenuOpen(false);
                    router.replace('/home');
                  }}
                  style={({ pressed }) => [
                    styles.brand,
                    width < 380 && styles.compactBrand,
                    pressed && styles.brandPressed,
                  ]}
                >
                  <View style={[styles.mobileBrandLogoFrame, width < 380 && styles.compactBrandLogoFrame]}>
                    <Image
                      source={companyBranding.logo}
                      contentFit="contain"
                      style={styles.brandLogo}
                      accessibilityLabel={`${companyBranding.name} home`}
                    />
                  </View>
                  <Text style={[styles.mobileBrandName, width < 380 && styles.compactBrandName]}>
                    {companyBranding.name}
                  </Text>
                </Pressable>
              </View>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`Open Basic Profile for ${user?.displayName ?? 'employee'}`}
                accessibilityHint="Opens your basic employee profile"
                onPress={() => {
                  setMenuOpen(false);
                  router.push({ pathname: '/inquiry/[section]', params: { section: 'basic-profile' } });
                }}
                style={({ pressed }) => [styles.mobileProfileButton, pressed && styles.menuButtonPressed]}
              >
                <View style={styles.mobileProfileAvatar}>
                  {profilePicture ? (
                    <Image
                      source={profilePicture}
                      contentFit="cover"
                      style={styles.mobileProfileImage}
                      accessibilityLabel="Profile picture"
                    />
                  ) : (
                    <Text style={styles.mobileProfileInitials}>{getInitials(user?.displayName ?? '')}</Text>
                  )}
                </View>
              </Pressable>
              <View style={styles.themeControl}>
                <NotificationBell />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Theme settings"
                  accessibilityHint={`${getColorThemeLabel(colorTheme)}, ${themeModeLabel(mode)} mode`}
                  onPress={() => setColorThemePickerOpen(true)}
                  style={({ pressed }) => [styles.themeButton, pressed && styles.menuButtonPressed]}
                >
                  <View style={[styles.colorThemeSwatch, { backgroundColor: COLOR_THEMES.find((themeOption) => themeOption.id === colorTheme)?.primary }]} />
                  <Text style={styles.themeButtonText}>{mode === 'light' ? '☾' : '☀'}</Text>
                </Pressable>
              </View>
            </View> : null}
            {!isPublicPage && storageError ? (
              <View style={styles.storageErrorBanner} accessibilityLiveRegion="polite">
                <Text style={styles.storageError}>{storageError}</Text>
              </View>
            ) : null}
            <View style={styles.routeContainer}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="home" />
                <Stack.Screen name="workspace/[employeeType]" />
                <Stack.Screen name="login" />
                <Stack.Screen name="portal" />
                <Stack.Screen name="announcements" />
                <Stack.Screen name="attendance" />
                <Stack.Screen name="applications" />
                <Stack.Screen name="dtr" />
                <Stack.Screen name="help" />
                <Stack.Screen name="other-urls" />
                <Stack.Screen name="inquiry/[section]" />
                <Stack.Screen name="records/[section]" />
              </Stack>
            </View>
            {!isPublicPage && !isDesktop ? (
              <SafeAreaView style={styles.mobileNavSafeArea} edges={['bottom']}>
              <View style={styles.mobileNav} accessibilityRole="tablist">
                {mobileTabs.map((item) => {
                  const active = pathname === item.route;
                  return (
                    <Pressable
                      key={item.route}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: active }}
                      onPress={() => {
                        setMenuOpen(false);
                        router.replace(item.route);
                      }}
                      style={({ pressed }) => [
                        styles.mobileNavItem,
                        active && styles.mobileNavItemActive,
                        pressed && styles.menuButtonPressed,
                      ]}
                    >
                      <Text style={[styles.mobileNavGlyph, active && styles.mobileNavTextActive]}>{item.glyph}</Text>
                      <Text style={[styles.mobileNavText, active && styles.mobileNavTextActive]}>{item.label}</Text>
                    </Pressable>
                  );
                })}
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected: menuOpen }}
                  accessibilityLabel="More employee services"
                  onPress={() => setMenuOpen((open) => !open)}
                  style={({ pressed }) => [
                    styles.mobileNavItem,
                    menuOpen && styles.mobileNavItemActive,
                    pressed && styles.menuButtonPressed,
                  ]}
                >
                  <Text style={[styles.mobileNavGlyph, menuOpen && styles.mobileNavTextActive]}>•••</Text>
                  <Text style={[styles.mobileNavText, menuOpen && styles.mobileNavTextActive]}>More</Text>
                </Pressable>
              </View>
              </SafeAreaView>
            ) : null}
            {!isPublicPage && isDesktop ? <DesktopFooter companyName={companyBranding.name} /> : null}
          </View>
          </View>
          {!isPublicPage && !isDesktop && menuOpen ? (
            <View style={styles.drawerLayer}>
              <DesktopSidebar
                fullScreen
                onClose={() => setMenuOpen(false)}
                onNavigate={() => setMenuOpen(false)}
              />
            </View>
          ) : null}
          {!isPublicPage ? (
            <ColorThemePicker
              visible={colorThemePickerOpen}
              selectedTheme={colorTheme}
              mode={mode}
              onSelect={setColorTheme}
              onModeChange={setMode}
              onClose={() => setColorThemePickerOpen(false)}
              colors={colors}
            />
          ) : null}
          {splashVisible ? (
            <Animated.View
              accessible
              accessibilityLabel="RCS Employee Portal"
              accessibilityRole="image"
              style={[styles.startupSplash, { opacity: splashOpacity }]}
            >
              <Animated.View
                style={[
                  styles.startupArtworkFrame,
                  {
                    opacity: splashProgress.interpolate({
                      inputRange: [0, 0.28, 1],
                      outputRange: [0, 1, 1],
                    }),
                    transform: [
                      {
                        scale: splashProgress.interpolate({
                          inputRange: [0, 0.55, 1],
                          outputRange: [0.96, 1, 1.02],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Image
                  source={require('@/assets/images/rcs-splash-animation.gif')}
                  contentFit="contain"
                  autoplay
                  style={styles.startupArtwork}
                  accessibilityLabel="Animated RCS Supermarket logo"
                />
              </Animated.View>
            </Animated.View>

        
          ) : null}
        </SafeAreaView>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

function themeModeLabel(mode: ThemeMode) {
  return mode === 'light' ? 'Light' : 'Dark';
}

function getColorThemeLabel(theme: ColorTheme) {
  return COLOR_THEMES.find((option) => option.id === theme)?.label ?? 'RCS Classic';
}

function ColorThemePicker({
  visible,
  selectedTheme,
  mode,
  onSelect,
  onModeChange,
  onClose,
  colors,
}: {
  visible: boolean;
  selectedTheme: ColorTheme;
  mode: ThemeMode;
  onSelect: (theme: ColorTheme) => void;
  onModeChange: (mode: ThemeMode) => void;
  onClose: () => void;
  colors: Record<keyof RcsPalette, string>;
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.colorThemeBackdrop}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close color theme selector"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View accessibilityViewIsModal style={styles.colorThemeModal}>
          <View style={styles.colorThemeHeading}>
            <View style={styles.colorThemeHeadingCopy}>
              <Text style={styles.colorThemeTitle}>Theme settings</Text>
              <Text style={styles.colorThemeDescription}>Choose an accent color and light or dark mode. Your choices are saved on this device.</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close color theme selector"
              onPress={onClose}
              style={({ pressed }) => [styles.colorThemeClose, pressed && styles.menuButtonPressed]}
            >
              <Text style={styles.colorThemeCloseText}>×</Text>
            </Pressable>
          </View>
          <View accessibilityRole="radiogroup" accessibilityLabel="Appearance mode" style={styles.themeModeSwitch}>
            {(['light', 'dark'] as const).map((option) => {
              const selected = option === mode;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => onModeChange(option)}
                  style={({ pressed }) => [
                    styles.themeModeOption,
                    selected && styles.themeModeOptionSelected,
                    pressed && styles.menuButtonPressed,
                  ]}
                >
                  <Text style={[styles.themeModeOptionText, selected && styles.themeModeOptionTextSelected]}>
                    {themeModeLabel(option)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <ScrollView style={styles.colorThemeOptions} contentContainerStyle={styles.colorThemeOptionList}>
            {COLOR_THEMES.map((option) => {
              const selected = option.id === selectedTheme;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => onSelect(option.id)}
                  style={({ pressed }) => [
                    styles.colorThemeOption,
                    selected && styles.colorThemeOptionSelected,
                    pressed && styles.menuButtonPressed,
                  ]}
                >
                  <View style={styles.colorThemeSwatches}>
                    <View style={[styles.colorThemeOptionSwatch, { backgroundColor: option.primary }]} />
                    <View style={[styles.colorThemeOptionSwatch, styles.colorThemeSecondarySwatch, { backgroundColor: option.secondary }]} />
                  </View>
                  <Text style={styles.colorThemeOptionLabel}>{option.label}</Text>
                  {selected ? <Text style={styles.colorThemeCheck}>✓</Text> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function DesktopHeader({
  mode,
  displayName,
  employeeType,
  profilePicture,
  colorTheme,
  onOpenColorThemes,
}: {
  mode: ThemeMode;
  displayName: string;
  employeeType: string;
  profilePicture: ProfilePictureSource | null;
  colorTheme: ColorTheme;
  onOpenColorThemes: () => void;
}) {
  const { palette } = useAppTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const initials = getInitials(displayName);
  const employeeLabel = employeeType.replace(/([a-z])([A-Z])/g, '$1 $2');

  return (
    <LinearGradient
      colors={mode === 'dark' ? [palette.surface, palette.surface] : [palette.yellowLight, palette.yellow]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[
        styles.desktopHeader,
        mode === 'dark' && { borderBottomColor: palette.border },
      ]}
      accessibilityLabel="Page controls"
    >
      <View style={styles.desktopHeaderStart}>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`Open Basic Profile for ${displayName}`}
          onPress={() => router.push({ pathname: '/inquiry/[section]', params: { section: 'basic-profile' } })}
          style={({ hovered, pressed }) => [
            styles.desktopProfileButton,
            hovered && styles.desktopProfileButtonHovered,
            pressed && styles.menuButtonPressed,
          ]}
        >
          <View style={styles.desktopProfileAvatar}>
            {profilePicture ? (
              <Image
                source={profilePicture}
                contentFit="cover"
                style={styles.desktopProfileImage}
                accessibilityLabel="Profile picture"
              />
            ) : (
              <Text style={styles.desktopProfileInitials}>{initials}</Text>
            )}
          </View>
          <View style={styles.desktopProfileCopy}>
            <Text style={styles.desktopProfileName} numberOfLines={1}>{displayName}</Text>
            <Text style={styles.desktopProfileRole} numberOfLines={1}>{employeeLabel}</Text>
          </View>
        </Pressable>
      </View>
      <View style={styles.desktopHeaderActions}>
        <NotificationBell />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Theme settings"
          accessibilityHint={`${getColorThemeLabel(colorTheme)}, ${themeModeLabel(mode)} mode`}
          onPress={onOpenColorThemes}
          style={({ pressed }) => [styles.desktopThemeButton, pressed && styles.menuButtonPressed]}
        >
          <View style={[styles.colorThemeSwatch, { backgroundColor: COLOR_THEMES.find((option) => option.id === colorTheme)?.primary }]} />
          <Text style={styles.desktopThemeIcon}>{mode === 'light' ? '☾' : '☀'}</Text>
          <Text style={styles.desktopThemeLabel}>Theme</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

function getInitials(displayName: string) {
  return displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase() || '?';
}

function DesktopFooter({ companyName }: { companyName: string }) {
  const { palette } = useAppTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const currentDate = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <View style={styles.desktopFooter}>
      <Text style={styles.desktopFooterText}>© {new Date().getFullYear()} {companyName}</Text>
      <Text style={styles.desktopFooterText}>v{appVersion} · {currentDate} · Employee Self-Service Portal</Text>
    </View>
  );
}

const createStyles = (colors: Record<keyof RcsPalette, string>) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  desktopRoot: { flexDirection: 'row', alignItems: 'stretch' },
  workspaceBody: { flex: 1, minHeight: 0, minWidth: 0 },
  desktopWorkspaceBody: { flexDirection: 'row', alignItems: 'stretch' },
  desktopHeader: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 18,
    backgroundColor: colors.yellow,
    borderBottomWidth: 1,
    borderBottomColor: '#BD8D22',
    zIndex: 10,
  },
  desktopHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 0, zIndex: 11 },
  desktopHeaderStart: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center' },
  desktopProfileButton: {
    alignSelf: 'flex-start',
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 9,
    borderRadius: 12,
  },
  desktopProfileButtonHovered: { backgroundColor: 'rgba(255,255,255,0.14)' },
  desktopProfileAvatar: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 11,
    backgroundColor: colors.yellowLight,
  },
  desktopProfileImage: { width: '100%', height: '100%' },
  desktopProfileInitials: { color: colors.brown, fontSize: 12, fontWeight: '800' },
  desktopProfileCopy: { maxWidth: 150, gap: 2 },
  desktopProfileName: { color: colors.text, fontSize: 12, fontWeight: '800' },
  desktopProfileRole: { color: colors.mutedText, fontSize: 10, textTransform: 'capitalize' },
  desktopThemeButton: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 13,
    borderRadius: 12,
    backgroundColor: colors.grayLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  desktopThemeIcon: { color: colors.brownDark, fontSize: 18, fontWeight: '700' },
  desktopThemeLabel: { color: colors.brownDark, fontSize: 12, fontWeight: '700' },
  desktopFooter: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  desktopFooterText: { color: colors.grayMuted, fontSize: 11 },
  mainColumn: { flex: 1, minWidth: 0, minHeight: 0, backgroundColor: colors.background },
  topBar: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    zIndex: 2,
  },
  compactTopBar: { minHeight: 72, paddingHorizontal: 8, gap: 4 },
  brandGroup: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 0 },
  brand: { minHeight: 68, flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
  compactBrand: { minHeight: 64 },
  mobileBrandLogoFrame: {
    width: 60,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compactBrandLogoFrame: { width: 48, height: 42, flexShrink: 0 },
  brandLogo: { width: '100%', height: '100%' },
  mobileBrandName: { flex: 1, flexShrink: 1, minWidth: 0, marginLeft: 8, color: colors.text, fontSize: 13, fontWeight: '800' },
  compactBrandName: { marginLeft: 6, fontSize: 11 },
  brandPressed: { opacity: 0.75 },
  mobileProfileButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  mobileProfileAvatar: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 19,
    backgroundColor: colors.yellowLight,
  },
  mobileProfileInitials: { color: colors.brown, fontSize: 12, fontWeight: '800' },
  mobileProfileImage: { width: '100%', height: '100%' },
  menuButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.grayLight,
  },
  menuButtonPressed: { opacity: 0.7 },
  hamburger: { width: 19, gap: 4 },
  hamburgerLine: { height: 2, borderRadius: 2, backgroundColor: colors.brownDark },
  themeControl: { flexDirection: 'row', alignItems: 'center', gap: 5, zIndex: 4 },
  colorThemeSwatch: { width: 17, height: 17, borderRadius: 9, borderWidth: 2, borderColor: colors.surface },
  themeButton: {
    minWidth: 50,
    height: 44,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 14,
    backgroundColor: colors.grayLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  themeButtonText: { color: colors.brownDark, fontSize: 14, fontWeight: '700' },
  colorThemeBackdrop: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'rgba(20, 18, 15, 0.55)' },
  colorThemeModal: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    alignSelf: 'center',
    padding: 18,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorThemeHeading: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  colorThemeHeadingCopy: { flex: 1, gap: 4 },
  colorThemeTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  colorThemeDescription: { color: colors.grayMuted, fontSize: 11, lineHeight: 16 },
  colorThemeClose: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: colors.grayLight },
  colorThemeCloseText: { color: colors.brown, fontSize: 24, lineHeight: 28 },
  colorThemeOptions: { flexShrink: 1 },
  colorThemeOptionList: { gap: 8, paddingVertical: 4 },
  colorThemeOption: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    borderRadius: 11,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorThemeOptionSelected: { backgroundColor: colors.yellowLight, borderColor: colors.brown },
  themeModeSwitch: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 10,
    padding: 4,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  themeModeOption: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  themeModeOptionSelected: { backgroundColor: colors.yellowLight },
  themeModeOptionText: { color: colors.mutedText, fontSize: 13, fontWeight: '700' },
  themeModeOptionTextSelected: { color: colors.brown, fontWeight: '800' },
  colorThemeSwatches: { width: 42, flexDirection: 'row', alignItems: 'center' },
  colorThemeOptionSwatch: { width: 22, height: 22, borderWidth: 2, borderColor: colors.surface, borderRadius: 12 },
  colorThemeSecondarySwatch: { width: 18, height: 18, marginLeft: -5 },
  colorThemeOptionLabel: { flex: 1, color: colors.text, fontSize: 13, fontWeight: '700' },
  colorThemeCheck: { color: colors.brown, fontSize: 16, fontWeight: '800' },
  storageErrorBanner: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.yellowLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  storageError: { color: colors.brownDark, fontSize: 12, lineHeight: 17 },
  routeContainer: { flex: 1, minWidth: 0 },
  mobileNavSafeArea: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  mobileNav: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-around',
    paddingHorizontal: 7,
    paddingTop: 6,
  },
  mobileNavItem: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderRadius: 13,
  },
  mobileNavItemActive: { backgroundColor: colors.yellowLight },
  mobileNavGlyph: { color: colors.grayMuted, fontSize: 18, fontWeight: '700', lineHeight: 21 },
  mobileNavText: { color: colors.grayMuted, fontSize: 10, fontWeight: '700' },
  mobileNavTextActive: { color: colors.brown, fontWeight: '800' },
  drawerLayer: { ...StyleSheet.absoluteFill, zIndex: 3, backgroundColor: colors.brownSurface },
  startupSplash: {
    ...StyleSheet.absoluteFill,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#05040D',
  },
  startupArtworkFrame: { ...StyleSheet.absoluteFill },
  startupArtwork: { ...StyleSheet.absoluteFill },
});
