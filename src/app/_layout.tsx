import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image } from 'expo-image';
import { Platform, Pressable, StyleSheet, Text, useColorScheme, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { DesktopSidebar } from '@/components/desktop-sidebar';
import { RcsColors } from '@/constants/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopSidebarVisible, setDesktopSidebarVisible] = useState(true);
  const isDesktop = Platform.OS === 'web' && width >= 960;
  const baseTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: RcsColors.brown,
      background: RcsColors.background,
      card: RcsColors.surface,
      text: RcsColors.text,
      border: RcsColors.border,
      notification: RcsColors.yellowDeep,
    },
  };

  return (
    <ThemeProvider value={theme}>
      <SafeAreaProvider>
        <SafeAreaView style={[styles.root, isDesktop && styles.desktopRoot]} edges={['top']}>
          {isDesktop && desktopSidebarVisible ? <DesktopSidebar /> : null}
          <View style={styles.mainColumn}>
            <View style={[styles.topBar, isDesktop && styles.desktopTopBar]}>
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
        </SafeAreaView>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: RcsColors.background },
  desktopRoot: { flexDirection: 'row' },
  mainColumn: { flex: 1, minWidth: 0 },
  topBar: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
    backgroundColor: RcsColors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: RcsColors.border,
  },
  desktopTopBar: { height: 84, paddingHorizontal: 28 },
  brand: { height: 68, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  brandLogo: { width: 116, height: 68 },
  desktopBrandLogo: { width: 148, height: 76 },
  brandDivider: { width: 1, height: 38, marginHorizontal: 18, backgroundColor: RcsColors.border },
  brandCopy: { gap: 3 },
  brandTitle: { color: RcsColors.brownDark, fontSize: 15, fontWeight: '800' },
  brandSubtitle: { color: RcsColors.grayMuted, fontSize: 12 },
  brandPressed: { opacity: 0.75 },
  menuButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: RcsColors.yellowLight,
  },
  menuButtonPressed: { opacity: 0.7 },
  hamburger: { width: 19, gap: 4 },
  hamburgerLine: { height: 2, borderRadius: 2, backgroundColor: RcsColors.brown },
  routeContainer: { flex: 1, minWidth: 0 },
  drawerLayer: { ...StyleSheet.absoluteFill, zIndex: 3, backgroundColor: RcsColors.brown },
});
