import { DefaultTheme, Stack, ThemeProvider, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image } from 'expo-image';
import { Animated, Easing, Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

import { DesktopSidebar } from '@/components/desktop-sidebar';
import { ResponsiveText as Text } from '@/components/responsive-text';
import { getPaletteForScheme } from '@/constants/theme';
import { AppThemeProvider, useAppTheme, type ThemeMode } from '@/contexts/theme-context';

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch((error: unknown) => {
    console.error('Unable to keep the native splash screen visible.', error);
  });
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <RootLayoutContent />
    </AppThemeProvider>
  );
}

function RootLayoutContent() {
  const { colorScheme, mode, setMode, storageError } = useAppTheme();
  const colors = useMemo(() => getPaletteForScheme(colorScheme), [colorScheme]);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopSidebarVisible, setDesktopSidebarVisible] = useState(true);
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashProgress] = useState(() => new Animated.Value(0));
  const [splashOpacity] = useState(() => new Animated.Value(1));
  const isDesktop = Platform.OS === 'web' && width >= 960;
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
    if (Platform.OS !== 'web') {
      SplashScreen.hideAsync().catch((error: unknown) => {
        console.error('Unable to hide the native splash screen.', error);
      });
    }

    const artworkAnimation = Animated.timing(splashProgress, {
      toValue: 1,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    const splashAnimation = Animated.sequence([
      Animated.delay(3000),
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 500,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    artworkAnimation.start();
    splashAnimation.start(({ finished }) => {
      if (finished) setSplashVisible(false);
    });
    return () => {
      artworkAnimation.stop();
      splashAnimation.stop();
    };
  }, [splashOpacity, splashProgress]);

  return (
    <ThemeProvider value={theme}>
      <SafeAreaProvider>
        <SafeAreaView style={[styles.root, isDesktop && styles.desktopRoot]} edges={['top']}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          {isDesktop && desktopSidebarVisible ? <DesktopSidebar /> : null}
          <View style={styles.mainColumn}>
            <View style={[styles.topBar, isDesktop && styles.desktopTopBar]}>
              <View style={styles.brandGroup}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    isDesktop
                      ? desktopSidebarVisible
                        ? 'Hide navigation sidebar'
                        : 'Show navigation sidebar'
                      : menuOpen
                        ? 'Close navigation menu'
                        : 'Open navigation menu'
                  }
                  accessibilityState={{
                    expanded: isDesktop ? desktopSidebarVisible : menuOpen,
                  }}
                  onPress={() => {
                    if (isDesktop) {
                      setDesktopSidebarVisible((visible) => !visible);
                    } else {
                      setMenuOpen((open) => !open);
                    }
                  }}
                  style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]}
                >
                  <View style={styles.hamburger}>
                    <View style={styles.hamburgerLine} />
                    <View style={styles.hamburgerLine} />
                    <View style={styles.hamburgerLine} />
                  </View>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Go to home"
                  onPress={() => {
                    setMenuOpen(false);
                    router.replace('/');
                  }}
                  style={({ pressed }) => [styles.brand, pressed && styles.brandPressed]}
                >
                  <Image
                    source={require('@/assets/images/rcs-supermarket-logo.png')}
                    contentFit="contain"
                    style={[styles.brandLogo, isDesktop && styles.desktopBrandLogo]}
                    accessibilityLabel="RCS Supermarket home"
                  />
                  {isDesktop ? <View style={styles.brandDivider} /> : null}
                  {isDesktop ? (
                    <View style={styles.brandCopy}>
                      <Text style={styles.brandTitle}>Employee Portal</Text>
                      <Text style={styles.brandSubtitle}>RCS Supermarket</Text>
                    </View>
                  ) : null}
                </Pressable>
              </View>
              <View style={styles.themeControl}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Switch to ${themeModeLabel(mode === 'light' ? 'dark' : 'light')} theme`}
                  accessibilityHint="Switches between Light and Dark themes"
                  onPress={() => setMode(mode === 'light' ? 'dark' : 'light')}
                  style={({ pressed }) => [styles.themeButton, pressed && styles.menuButtonPressed]}
                >
                  <Text style={styles.themeButtonText}>{mode === 'light' ? '☾' : '☀'}</Text>
                  {isDesktop ? (
                    <Text style={styles.themeButtonText}>{themeModeLabel(mode)}</Text>
                  ) : null}
                </Pressable>
              </View>
            </View>
            {storageError ? (
              <View style={styles.storageErrorBanner} accessibilityLiveRegion="polite">
                <Text style={styles.storageError}>{storageError}</Text>
              </View>
            ) : null}
            <View style={styles.routeContainer}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="portal" />
                <Stack.Screen name="announcements" />
                <Stack.Screen name="attendance" />
                <Stack.Screen name="applications" />
                <Stack.Screen name="dashboard" />
                <Stack.Screen name="dtr" />
                <Stack.Screen name="help" />
                <Stack.Screen name="other-urls" />
                <Stack.Screen name="inquiry/[section]" />
              </Stack>
            </View>
          </View>
          {!isDesktop && menuOpen ? (
            <View style={styles.drawerLayer}>
              <DesktopSidebar
                fullScreen
                onClose={() => setMenuOpen(false)}
                onNavigate={() => setMenuOpen(false)}
              />
            </View>
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

const createStyles = (colors: ReturnType<typeof getPaletteForScheme>) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  desktopRoot: { flexDirection: 'row' },
  mainColumn: { flex: 1, minWidth: 0 },
  topBar: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    zIndex: 2,
  },
  desktopTopBar: { height: 84, paddingHorizontal: 28 },
  brandGroup: { flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 0 },
  brand: { height: 68, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  brandLogo: { width: 116, height: 68 },
  desktopBrandLogo: { width: 148, height: 76 },
  brandDivider: { width: 1, height: 38, marginHorizontal: 18, backgroundColor: colors.border },
  brandCopy: { gap: 3 },
  brandTitle: { color: colors.brownDark, fontSize: 15, fontWeight: '800' },
  brandSubtitle: { color: colors.grayMuted, fontSize: 12 },
  brandPressed: { opacity: 0.75 },
  menuButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.yellowLight,
  },
  menuButtonPressed: { opacity: 0.7 },
  hamburger: { width: 19, gap: 4 },
  hamburgerLine: { height: 2, borderRadius: 2, backgroundColor: colors.brownDark },
  themeControl: { zIndex: 4 },
  themeButton: {
    minWidth: 42,
    height: 42,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 12,
    backgroundColor: colors.yellowLight,
  },
  themeButtonText: { color: colors.brownDark, fontSize: 14, fontWeight: '700' },
  storageErrorBanner: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.yellowLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  storageError: { color: colors.brownDark, fontSize: 12, lineHeight: 17 },
  routeContainer: { flex: 1, minWidth: 0 },
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
